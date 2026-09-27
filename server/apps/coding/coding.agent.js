import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'Portfolio';

async function readFile(fileId) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const file = await db.collection('codeFiles').findOne({ fileId });
    if (!file) return "Error: File not found.";
    return file.content || "";
  } finally {
    await client.close();
  }
}

async function writeFile(filename, folderPath, content) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const fileId = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileData = {
      fileId,
      filename,
      folderPath,
      content,
      language: filename.split('.').pop() || 'plaintext',
      size: Buffer.byteLength(content, 'utf8'),
      blobUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('codeFiles').insertOne(fileData);
    return `Success: File created with ID ${fileId}`;
  } catch (err) {
    return `Error: ${err.message}`;
  } finally {
    await client.close();
  }
}

async function editFile(fileId, newContent) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const result = await db.collection('codeFiles').updateOne(
      { fileId },
      {
        $set: {
          content: newContent,
          size: Buffer.byteLength(newContent, 'utf8'),
          updatedAt: new Date().toISOString()
        }
      }
    );
    if (result.matchedCount === 0) return "Error: File not found.";
    return "Success: File updated.";
  } catch (err) {
    return `Error: ${err.message}`;
  } finally {
    await client.close();
  }
}

async function fetchWithFallback(groqMessages, tools = undefined) {
  const models = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-safeguard-20b",
    "qwen/qwen3.8-27b"
  ];
  
  let lastResponse = null;
  for (const model of models) {
    const body = {
      model: model,
      messages: groqMessages,
      max_tokens: 4096,
      temperature: 0.2
    };
    if (tools) {
      body.tools = tools;
      body.tool_choice = "auto";
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (response.ok) return response;
      console.warn(`Model ${model} failed:`, await response.text());
      lastResponse = response;
    } catch (err) {
      console.warn(`Model ${model} request error:`, err);
    }
  }
  return lastResponse;
}

export const CodingAgentService = {
  async handleChat(messages, currentFileContext = null) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    // Inject system message with context
    let systemContent = "You are a highly capable AI coding assistant built into a web IDE. You have access to tools to read, write, and edit files in the workspace. ";
    if (currentFileContext) {
      systemContent += `\n\nCURRENT ACTIVE FILE CONTEXT:\nFile ID: ${currentFileContext.fileId}\nFilename: ${currentFileContext.filename}\nPath: ${currentFileContext.folderPath}\nContent:\n\`\`\`\n${currentFileContext.content}\n\`\`\``;
    }

    const groqMessages = [
      { role: "system", content: systemContent },
      ...messages
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "read_file",
          description: "Reads the content of a file by its fileId.",
          parameters: {
            type: "object",
            properties: {
              fileId: { type: "string", description: "The ID of the file to read" }
            },
            required: ["fileId"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "write_file",
          description: "Creates a new file in a specified folder path.",
          parameters: {
            type: "object",
            properties: {
              filename: { type: "string", description: "The name of the file (e.g. index.js)" },
              folderPath: { type: "string", description: "The folder path (e.g. /src/components or empty string for root)" },
              content: { type: "string", description: "The content of the file" }
            },
            required: ["filename", "folderPath", "content"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "edit_file",
          description: "Overwrites the entire content of an existing file.",
          parameters: {
            type: "object",
            properties: {
              fileId: { type: "string", description: "The ID of the file to edit" },
              newContent: { type: "string", description: "The complete new content of the file" }
            },
            required: ["fileId", "newContent"]
          }
        }
      }
    ];

    let response = await fetchWithFallback(groqMessages, tools);

    if (!response || !response.ok) {
      const errText = response ? await response.text() : "No response";
      throw new Error(`Groq API Error: ${errText}`);
    }

    let data = await response.json();
    let message = data.choices[0].message;

    // Execute tools if any
    while (message.tool_calls && message.tool_calls.length > 0) {
      groqMessages.push(message);

      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result = "";

        if (toolCall.function.name === "read_file") {
          result = await readFile(args.fileId);
        } else if (toolCall.function.name === "write_file") {
          result = await writeFile(args.filename, args.folderPath, args.content);
        } else if (toolCall.function.name === "edit_file") {
          result = await editFile(args.fileId, args.newContent);
        }

        groqMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: result
        });
      }

      // Get next response from Groq
      response = await fetchWithFallback(groqMessages, tools);

      if (!response || !response.ok) {
        const errText = response ? await response.text() : "No response";
        throw new Error(`Groq API Error: ${errText}`);
      }
      data = await response.json();
      message = data.choices[0].message;
    }

    return message.content;
  }
};

import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { PremiumNote } from '../models/PremiumNote.js';
import { PremiumTodo } from '../models/PremiumTodo.js';

const router = express.Router();

let blobServiceClient = null;
if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
  blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
}
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || 'portfolio';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToAzure = async (buffer, filename, fileType) => {
  if (!blobServiceClient) throw new Error("Azure storage not configured");
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `premium-notes/${Date.now()}-${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: fileType }
    });
    return {
      blobPath: blobPath,
      blobUrl: blockBlobClient.url
    };
  } catch (error) {
    console.error('Azure upload error:', error);
    throw error;
  }
};

// Notes by Date
router.get('/note-by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    let note = await PremiumNote.findOne({ date });
    if (!note) {
      note = new PremiumNote({ title: 'Diary Note', date });
      await note.save();
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/note-by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { title, content, images, diagrams } = req.body;
    let note = await PremiumNote.findOne({ date });

    if (!note) {
      note = new PremiumNote({ title, content, date, images, diagrams });
      await note.save();
    } else {
      note.title = title !== undefined ? title : note.title;
      note.content = content !== undefined ? content : note.content;
      if (images) note.images = images;
      if (diagrams) note.diagrams = diagrams;
      await note.save();
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// To-Dos by Date
router.get('/todos/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const todos = await PremiumTodo.find({ date }).sort({ createdAt: 1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/todo', async (req, res) => {
  try {
    const { text, date } = req.body;
    const todo = new PremiumTodo({ text, date });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/todo/:id', async (req, res) => {
  try {
    const { text, completed } = req.body;
    const todo = await PremiumTodo.findByIdAndUpdate(
      req.params.id,
      { text, completed },
      { new: true }
    );
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/todo/:id', async (req, res) => {
  try {
    await PremiumTodo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await uploadToAzure(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url: result.blobUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET canvas state for a date
router.get('/canvas/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const note = await PremiumNote.findOne({ date });
    if (!note || !note.canvasBlobUrl) {
      return res.json({ canvasData: null, canvasBlobUrl: null });
    }

    // Fetch the JSON from Azure Blob
    if (blobServiceClient && note.canvasBlobPath) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(note.canvasBlobPath);
      const downloadResponse = await blockBlobClient.download();
      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      const jsonStr = Buffer.concat(chunks).toString('utf8');
      return res.json({ canvasData: JSON.parse(jsonStr), canvasBlobUrl: note.canvasBlobUrl });
    }

    res.json({ canvasData: null, canvasBlobUrl: note.canvasBlobUrl });
  } catch (err) {
    console.error('Canvas load error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT (upsert) canvas state for a date — always overwrites same dated blob
router.put('/canvas/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { canvasData } = req.body;
    if (!canvasData) return res.status(400).json({ error: 'canvasData is required' });
    if (!blobServiceClient) return res.status(500).json({ error: 'Azure storage not configured' });

    const jsonBuffer = Buffer.from(JSON.stringify(canvasData), 'utf8');
    // Fixed blob path per date — same file is always overwritten for that date
    const blobPath = `premium-notes/canvas/${date}.json`;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(jsonBuffer, jsonBuffer.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' },
      overwrite: true
    });

    const blobUrl = blockBlobClient.url;

    // Store URL in MongoDB for this date's note
    await PremiumNote.findOneAndUpdate(
      { date },
      { canvasBlobUrl: blobUrl, canvasBlobPath: blobPath },
      { upsert: true, new: true }
    );

    res.json({ success: true, canvasBlobUrl: blobUrl });
  } catch (err) {
    console.error('Canvas save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI Completion Endpoint using Groq
router.post('/ai/completion', async (req, res) => {
  try {
    const { text, context, model } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured' });
    }

    const messages = [
      {
        role: "system",
        content: "You are a helpful writing assistant for a diary. Continue the user's text naturally as if completing their sentence or thought. Return only the completion text that naturally continues what they wrote, no conversational responses or explanations. DO NOT output conversational fillers."
      },
      {
        role: "user",
        content: context ? `${context}\n\nContinue this text naturally: ${text}` : `Continue this text naturally: ${text}`
      }
    ];

    // Priority 1: 20b model as requested, then the rest
    const modelsToTry = [
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-safeguard-20b",
      "qwen/qwen3.8-27b"
    ];

    let completionText = "";
    let success = false;

    console.log(`Sending diary completion request...`);
    for (const m of modelsToTry) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Portfolio Diary"
          },
          body: JSON.stringify({
            model: m,
            messages: messages,
            max_tokens: 1500,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          completionText = data.choices?.[0]?.message?.content || "";
          success = true;
          console.log(`Diary completion successful with model: ${m}`);
          break;
        } else {
          const errorData = await response.text();
          console.warn(`Diary Model ${m} failed:`, errorData);
        }
      } catch (err) {
        console.warn(`Diary Model ${m} request error:`, err);
      }
    }

    if (!success) {
      console.error('All Groq models failed for diary completion');
      return res.status(500).json({ error: 'Failed to generate AI completion from all fallback models' });
    }

    res.json({ completion: completionText });
  } catch (err) {
    console.error('AI Completion error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

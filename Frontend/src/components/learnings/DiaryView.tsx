import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { config } from "@/config/config";
import { NotepadEditor } from "./NotepadEditor";
import { AICompletion } from "./AICompletion";

type DiaryEntry = {
  date: string;
  content: string;
};

type DiaryExportEntry = DiaryEntry;

const API_BASE_URL = `${config.apiUrl}/diary`;

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateText: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateText: string, offset: number) {
  const nextDate = parseDate(dateText);
  nextDate.setDate(nextDate.getDate() + offset);
  return formatDate(nextDate);
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<div><br><\/div>/g, "<div>\u00a0</div>")
    .replace(/<p><br><\/p>/g, "<p>\u00a0</p>");
}

export function DiaryView() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [content, setContent] = useState("");
  const [loadingDate, setLoadingDate] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(date);
  const [exportEndDate, setExportEndDate] = useState(date);
  const [exportError, setExportError] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportEntries, setExportEntries] = useState<DiaryExportEntry[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [editorText, setEditorText] = useState("");

  const saveTimeout = useRef<number | null>(null);
  const exportSheetRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const editorInstanceRef = useRef<any>(null);

  const pageTitle = useMemo(() => date, [date]);

  function openExportModal() {
    setExportStartDate(date);
    setExportEndDate(date);
    setExportError("");
    setIsExportModalOpen(true);
  }

  function closeExportModal() {
    setIsExportModalOpen(false);
    setExportError("");
    setExportEntries([]);
  }

  function syncDateInput(value: string) {
    setDate(value);
  }

  function getDateRange(startDate: string, endDate: string) {
    const orderedStart = startDate <= endDate ? startDate : endDate;
    const orderedEnd = startDate <= endDate ? endDate : startDate;
    const dates: string[] = [];
    let current = orderedStart;

    while (current <= orderedEnd) {
      dates.push(current);
      current = addDays(current, 1);
    }

    return dates;
  }

  async function loadEntry(dateText: string) {
    setLoadingDate(true);

    try {
      const response = await fetch(`${API_BASE_URL}/${dateText}`);

      if (!response.ok) {
        setContent("");
      } else {
        const data = await response.json();
        const entry: DiaryEntry | null = data.entry ?? null;
        setContent(entry?.content ?? "");
      }
    } catch (error) {
      console.error("Failed to load diary entry", error);
    } finally {
      setLoadingDate(false);
    }
  }

  async function saveEntry(html: string) {
    try {
      const payload: DiaryEntry = { date, content: html };

      await fetch(`${API_BASE_URL}/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to save diary entry", error);
    }
  }

  function scheduleSave(html: string) {
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveEntry(html);
    }, 800);
  }

  async function fetchDiaryEntry(dateText: string): Promise<DiaryExportEntry> {
    const response = await fetch(`${API_BASE_URL}/${dateText}`);
    if (!response.ok) {
      throw new Error(`Failed to load diary entry for ${dateText}`);
    }

    const data = await response.json();
    const entry: DiaryEntry | null = data.entry;

    return {
      date: dateText,
      content: entry?.content ?? "",
    };
  }

  function goToDate(direction: "prev" | "next") {
    setDate((currentDate) => addDays(currentDate, direction === "prev" ? -1 : 1));
  }

  async function downloadPdfForRange() {
    if (!exportStartDate || !exportEndDate) {
      setExportError("Please select both start and end dates.");
      return;
    }

    setExportError("");
    setExportingPdf(true);

    try {
      const dates = getDateRange(exportStartDate, exportEndDate);
      const entries = await Promise.all(dates.map((dateText) => fetchDiaryEntry(dateText)));

      flushSync(() => {
        setExportEntries(entries);
      });

      await document.fonts?.ready;
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));

      const exportElement = exportSheetRef.current;
      if (!exportElement) {
        throw new Error("Export preview is not ready.");
      }

      const fileName = `diary_${dates[0]}_to_${dates[dates.length - 1]}.pdf`;

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "px", format: [1240, 660], orientation: "landscape" });
      doc.setFont("Courier");

      const pageWidth = 1240;
      const pageHeight = 660;
      const margin = 20;

      function htmlToText(html: string) {
        return html
          .replace(/<br\s*\/?>(?=)/gi, "\n")
          .replace(/<li>/gi, "• ")
          .replace(/<\/li>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();
      }

      for (const entry of entries) {
        const text = htmlToText(sanitizeHtml(entry.content || "")) || "";
        const fontSize = 14;
        const lineHeight = Math.round(fontSize * 1.25);
        doc.setFontSize(fontSize);

        const linesAll = doc.splitTextToSize(text, pageWidth - margin * 2) as string[];
        const linesPerPage = Math.floor((pageHeight - 60) / lineHeight);

        let idx = 0;
        while (idx < linesAll.length) {
          doc.setFontSize(16);
          doc.setFont("Courier", "normal");
          doc.text("Diary Export", margin + 4, 28);
          doc.text(entry.date, pageWidth - margin - 80, 28);
          doc.setFontSize(fontSize);

          const slice = linesAll.slice(idx, idx + linesPerPage);
          let y = 48;
          for (const line of slice) {
            y += lineHeight;
            doc.text(String(line), margin + 4, y);
          }

          idx += linesPerPage;
          if (idx < linesAll.length) doc.addPage();
        }

        doc.addPage();
      }

      const totalPages = doc.getNumberOfPages();
      if (totalPages > 1) doc.deletePage(totalPages);
      doc.save(fileName);

      setIsExportModalOpen(false);
    } catch (error) {
      console.error("PDF export failed:", error);
      setExportError("Failed to create the PDF. Please try again.");
    } finally {
      flushSync(() => {
        setExportEntries([]);
      });
      setExportingPdf(false);
    }
  }

  useEffect(() => {
    void loadEntry(date);
  }, [date]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (isExportModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isExportModalOpen]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-stretch overflow-hidden px-0 pt-0 pb-0 md:px-3 lg:px-4 relative" style={{ zIndex: 30 }}>
      <style>{`\
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');\
\
        .diary-mono {\
          font-family: 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', monospace;\
        }\
      `}</style>

      {/* Header */}
      <div className="w-full shrink-0 border-b-2 border-black bg-white">
        <div className="grid w-full grid-cols-[44px_minmax(0,1fr)_44px_44px] items-stretch border-b border-black/15">
          <button
            type="button"
            onClick={() => goToDate("prev")}
            className="flex h-11 items-center justify-center border-r border-black/15 bg-white text-gray-800"
            aria-label="Previous date"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <label className="relative flex h-11 min-w-0 items-center justify-center border-r border-black/15 bg-white px-1">
            <span className="pointer-events-none absolute left-2 top-1 text-[8px] font-bold uppercase tracking-wider text-gray-400 diary-mono">Date</span>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => syncDateInput(e.target.value)}
              className="diary-mono h-full w-full min-w-0 border-0 bg-transparent pt-3 text-center text-[13px] font-bold text-gray-900 focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => goToDate("next")}
            className="flex h-11 items-center justify-center border-r border-black/15 bg-white text-gray-800"
            aria-label="Next date"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={openExportModal}
            className="flex h-11 items-center justify-center bg-[#8fb0ff] text-white"
            aria-label="Download PDF"
            title="Download PDF"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* AI Completion Header */}
      <AICompletion
        content={content}
        onContentChange={setContent}
        editor={isEditorReady ? editorInstanceRef.current : null}
        date={date}
        onSuggestionChange={(suggestion) => setAiSuggestion(suggestion)}
        editorText={editorText}
      />

      {/* Editor */}
      <div className="flex-1 min-h-0 py-4">
        {loadingDate ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <NotepadEditor
            content={content}
            onSave={scheduleSave}
            placeholder="Start writing your diary entry..."
            suggestion={aiSuggestion}
            onAcceptSuggestion={() => setAiSuggestion("")}
            onEditorReady={(editor) => {
              editorInstanceRef.current = editor;
              setIsEditorReady(true);
            }}
            onTextChange={(text) => {
              setEditorText(text);
            }}
          />
        )}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Export Diary</h3>
              <button
                type="button"
                onClick={closeExportModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              {exportError && (
                <div className="text-red-600 text-sm">{exportError}</div>
              )}

              <button
                type="button"
                onClick={downloadPdfForRange}
                disabled={exportingPdf}
                className="w-full bg-[#8fb0ff] text-white py-2 px-4 rounded-md hover:bg-[#7a9fe8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportingPdf ? "Exporting..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { parseProgress, parseTrackTitle } from "./utils";
import { Toast } from "./Toast";
import { ProgressBar } from "./ProgressBar";

export default function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(systemPrefersDark);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  const toggleDark = () => setDark(prev => !prev);

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  const startDownload = async () => {
    setStatus("Starting download...");

    try {
      const res = await fetch("http://localhost:4000/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: url })
      });

      const data = await res.json();

      if (data.error) {
        setStatus("Error: " + data.error);
      } else {
        setStatus("Download started. Check backend logs.");
      }
    } catch (err) {
      setStatus("Failed to contact backend.");
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const events = new EventSource("http://localhost:4000/events");

    events.onmessage = (event) => {
      const line = event.data;

      // Track console output
      setConsoleLines(prev => [...prev, line]);

      // Detect progress
      const pct = parseProgress(line);
      if (pct !== null) {
        setIsDownloading(true);
        setProgress(pct);
      }

      // Detect track name
      const track = parseTrackTitle(line);
      if (track) {
        setIsDownloading(true);
        setCurrentTrack(track);
      }

      // Detect completion
      if (line.startsWith("DONE")) {
        setProgress(100);
        setToast("Download complete");

        // Hide progress bar after a short delay
        setTimeout(() => {
          setIsDownloading(false);
          setProgress(0);
          setCurrentTrack(null);
        }, 1500);
      }
    };

    return () => events.close();
  }, []);


  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-500 dark:from-deepPurple-950 dark:to-deepPurple-700 flex items-center justify-center p-6 relative">
      <button
        onClick={toggleDark}
        className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-purple-200 dark:bg-deepPurple-500 text-deepPurple-600 dark:text-purple-200 shadow hover:scale-105 transition">
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      {toast && <Toast message={toast} />}

      <div className="backdrop-blur-xl bg-white/70 dark:bg-purple-900/60 shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-white/40 dark:border-purple-700/40">
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100 text-center mb-6 tracking-tight">
          SoundCloud Playlist Downloader
        </h1>

        <p className="text-purple-600 dark:text-purple-300 text-center mb-8">
          Paste a playlist URL below and we’ll fetch every track for you.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="https://soundcloud.com/playlist/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full p-4 rounded-xl border border-purple-300 dark:border-deepPurple-600 bg-white/80 dark:bg-deepPurple-800/60 text-deepPurple-900 dark:text-deepPurple-100 shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
          />

          <button
            onClick={startDownload}
            className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
            Download Playlist
          </button>
        </div>

        {status && (
          <p className="mt-6 text-center text-purple-800 dark:text-purple-200 font-medium">
            {status}
          </p>
        )}

        {currentTrack && (
          <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
            Downloading: {currentTrack}
          </p>
        )}

        <div className={`fade ${isDownloading ? "opacity-100" : "opacity-0"}`}>
          <ProgressBar progress={progress} />
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow transition"
          >
            {showConsole ? "Hide Console" : "Show Console"}
          </button>

          {showConsole && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl h-48 overflow-y-auto text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
              {consoleLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
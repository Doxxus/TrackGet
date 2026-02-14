import React, { useState } from "react";

function App() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center p-6">
      <div className="backdrop-blur-xl bg-white/70 shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-white/40">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6 tracking-tight">
          SoundCloud Playlist Downloader
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Paste a playlist URL below and we’ll fetch every track for you.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="https://soundcloud.com/playlist/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
          />

          <button
            onClick={startDownload}
            className="w-full py-4 rounded-xl bg-purple-500 text-white font-semibold shadow-md hover:bg-purple-600 hover:shadow-lg active:scale-[0.98] transition-all"
          >
            Download Playlist
          </button>
        </div>

        {status && (
          <p className="mt-6 text-center text-gray-800 font-medium">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
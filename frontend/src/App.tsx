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
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>SoundCloud Playlist Downloader</h1>

      <input
        type="text"
        placeholder="Enter SoundCloud playlist URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          marginBottom: "20px"
        }}
      />

      <button
        onClick={startDownload}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Download Playlist
      </button>

      <p style={{ marginTop: "20px" }}>{status}</p>
    </div>
  );
}

export default App;
import express from "express";
import cors from "cors";
import path from "path";
import { mkdirSync } from "fs";
import youtubed1 from "youtube-dl-exec";

const app = express();
app.use(cors());
app.use(express.json());

const clients: express.Response[] = [];

function broadcast(message: string) {
  for (const client of clients) {
    client.write(`data: ${message}\n\n`);
  }
}

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  req.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
});

app.post("/download", (req, res) => {
  const { playlistUrl } = req.body;

  if (!playlistUrl) {
    return res.status(400).json({ error: "Missing playlistUrl" });
  }

  const outputDir = path.join(process.cwd(), "downloads");
  mkdirSync(outputDir, { recursive: true });
  res.json({ status: "started" });

  const child = youtubed1.exec(
    playlistUrl,
    {
      audioFormat: "mp3",
      audioQuality: 0,
      output: `${outputDir}/%(playlist_index)s - %(title)s.%(ext)s`,
    },
    {
      stdio: "pipe"
    }
  );

  child.stdout?.on("data", (data: Buffer) => {
    const text = data.toString();
    console.log("[yt-dlp]", text);
    broadcast(text);
  });

  child.stderr?.on("data", (data: Buffer) => {
    const text = data.toString();
    console.error("[yt-dlp error]", text);
    broadcast(text);
  });

  child.on("close", (code: number) => {
    broadcast(`DONE:${code}`);
  });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import { mkdirSync } from "fs";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
  const { playlistUrl } = req.body;

  if (!playlistUrl) {
    return res.status(400).json({ error: "Missing playlistUrl" });
  }

  const outputDir = path.join(process.cwd(), "downloads");
  mkdirSync(outputDir, { recursive: true });

  const command = [
    "yt-dlp",
    `"${playlistUrl}"`,
    `-o "${outputDir}/%(playlist_index)s - %(title)s.%(ext)s"`,
    "--extract-audio",
    "--audio-format mp3"
  ].join(" ");

  const child = exec(command);

  child.stdout?.on("data", data => console.log(data));
  child.stderr?.on("data", data => console.error(data));

  child.on("close", code => {
    console.log("Download finished with code", code);
  });

  res.json({ status: "started" });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

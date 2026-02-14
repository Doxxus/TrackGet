// import express from "express";
// import cors from "cors";
// import path from "path";
// import { mkdirSync } from "fs";
// import ytdl from "youtube-dl-exec";

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post("/download", async (req, res) => {
//   const { playlistUrl } = req.body;

//   if (!playlistUrl) {
//     return res.status(400).json({ error: "Missing playlistUrl" });
//   }

//   const outputDir = path.join(process.cwd(), "downloads");
//   mkdirSync(outputDir, { recursive: true });

//   // Respond immediately so the UI doesn't hang
//   res.json({ status: "started" });

//   try {
//     const result = await ytdl(playlistUrl, {
//       extractAudio: true,
//       audioFormat: "mp3",
//       output: `${outputDir}/%(playlist_index)s - %(title)s.%(ext)s`,
//     });

//     console.log("Download complete:", result);
//   } catch (err) {
//     console.error("Download failed:", err);
//   }
// });

// app.listen(4000, () => {
//   console.log("Backend running on http://localhost:4000");
// });

import express from "express";
import cors from "cors";
import path from "path";
import { mkdirSync } from "fs";
import youtubed1 from "youtube-dl-exec";

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
    console.log("[youtube-dl]", data.toString());
  });

  child.stderr?.on("data", (data: Buffer) => {
    console.error("[youtube-dl error]", data.toString());
  });

  child.on("close", (code: number) => {
    console.log("Download finished with code", code);
  });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

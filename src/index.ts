import { exec } from "child_process";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playlistUrl = process.argv[2];

if (!playlistUrl) {
  console.error("Usage: npm start <soundcloud-playlist-url>");
  process.exit(1);
}

const outputDir = path.join(__dirname, "..", "downloads");
mkdirSync(outputDir, { recursive: true });

console.log("Downloading playlist...");
console.log(`Source: ${playlistUrl}`);
console.log(`Output: ${outputDir}`);

const command = [
  "yt-dlp",
  `"${playlistUrl}"`,
  `-o "${outputDir}/%(playlist_index)s - %(title)s.%(ext)s"`,
  "--extract-audio",
  "--audio-format mp3"
].join(" ");

const child = exec(command);

child.stdout?.on("data", data => process.stdout.write(data));
child.stderr?.on("data", data => process.stderr.write(data));

child.on("close", code => {
  if (code === 0) {
    console.log("\nAll tracks downloaded successfully.");
  } else {
    console.error(`\nyt-dlp exited with code ${code}`);
  }
});

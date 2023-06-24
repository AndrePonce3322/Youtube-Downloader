const express = require("express");
const app = express();
const cors = require("cors");
const ytdl = require("ytdl-core");

console.clear();

const cliProgress = require("cli-progress");
// Progress bar
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
  const { url, quality, format } = req.body;

  // Validar parametros
  const formatParams = ["audioonly", "videoandaudio"];
  const qualityParams = ["highest", "lowest"];

  if (format.includes(formatParams) && !qualityParams.includes(quality)) {
    return res
      .status(400)
      .json({ error: "Invalid quality parameter", params: qualityParams });
  }

  // Obtener la ID del video
  const videoID = ytdl.getURLVideoID(url);

  await ytdl.getInfo(videoID).then((info) => {
    const details = {
      title: info.videoDetails.title,
      size: info.formats[0].contentLength,
      author: info.videoDetails.author.name,
    };

    console.log(details);

    const audioStream = ytdl(videoID, {
      filter: format,
      quality: quality,
    }).on("progress", (chunkLength, downloaded, total) => {
      bar.start(total, downloaded);
      bar.update(downloaded);

      if (downloaded >= total) {
        bar.stop();
        console.log(`\nDownloaded: ${details.author} - ${details.title}\n\n`);
      }
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${details.title}.${
        format === "audio" ? "mp3" : "mp4"
      }"` // mp3 or mp4 validation
    );

    audioStream.pipe(res);
  });
});

app.listen(3000, () => {
  console.log("Server on port 3000");
});

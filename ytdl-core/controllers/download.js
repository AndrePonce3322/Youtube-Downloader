const downloadRouter = require("express").Router();
const ytdl = require("ytdl-core");

// Progress bar
const cliProgress = require("cli-progress");
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

downloadRouter.post("/", async (req, res) => {
  const { url, quality, format } = req.body;

  // Validar parametros
  const formatParams = ["audioonly", "videoandaudio"];
  const qualityParams = ["highest", "lowest"];

  if (!url | !quality | !format)
    return res.status(400).json({
      error: "Invalid parameters",
      params: {
        url: "https://www.example.com",
        quality: "highest | lowest",
        format: "audioonly | videoandaudio",
      },
    });

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
      author: info.videoDetails.author.name,
    };

    console.log(`\nDownloading: ${details.author} - ${details.title}`);

    const audioStream = ytdl(videoID, {
      filter: format,
      quality: quality,
    }).on("progress", (chunkLength, downloaded, total) => {
      bar.start(total, downloaded);
      bar.update(downloaded);

      if (downloaded >= total) {
        bar.stop();
        console.log(`\nDownloaded! ヾ(＠⌒ー⌒＠)ノ`);
      }
    });

    const audioSize = ytdl.chooseFormat(info.formats, {
      filter: format,
      quality: quality,
    }).contentLength;

    // Set Response Headers
    res.setHeader("Content-Length", audioSize);

    audioStream.pipe(res);
  });
});

module.exports = downloadRouter;

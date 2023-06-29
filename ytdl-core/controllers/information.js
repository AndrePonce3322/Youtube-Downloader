const informationRouter = require("express").Router();
const ytdl = require("ytdl-core");

informationRouter.post("/", (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "Invalid URL" });

  const videoID = ytdl.getURLVideoID(url);

  ytdl.getInfo(videoID).then((info) => {
    res.json({ info: info.videoDetails });
  });
});

module.exports = informationRouter;

// get seconds then + 180 seconds for "played at time"
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

const nowPlayingFile = "./nowplaying.json";

console.log("Waiting for file changes");

let cachedSong = {};

var msTimeout;

fs.watch(nowPlayingFile, async (eventType, fileName) => {
  clearTimeout(msTimeout);
  msTimeout = setTimeout(async () => {
    if (eventType === "change" && fileName === "nowplaying.json") {
      const file = await fs.promises.readFile(nowPlayingFile, {
        encoding: "utf-8",
      });
      const fileContents = await JSON.parse(file);
      if (
        Object.keys(cachedSong).length === 0 ||
        (fileContents.track.title !== cachedSong.track.title &&
          fileContents.track.artistsString !== cachedSong.track.artistsString)
      ) {
        return fetch(process.env.WORKER_URL, {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": "application/json",
            Authentication: process.env.WORKER_KEY,
          },
        }).then(() => (cachedSong = fileContents));
      } else {
        return console.log("Track paused or error occured, is same file.");
      }
    }
  }, 150);
});

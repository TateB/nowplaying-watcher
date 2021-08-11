const defaultData = [];

const setCache = (data) => NOW_PLAYING.put("songList", data);
const getCache = () => NOW_PLAYING.get("songList").then((res) => res ? res : "[]");

async function addSong(request) {
  const body = await request.text();
  const originalCache = await getCache()
  var cache = JSON.parse(originalCache)
  try {
    JSON.parse(body);
    console.log("got body")
    if (request.headers.get("Authentication") !== WORKER_KEY) throw new Error("Unauthorised request")
    if (cache === null) {
      cache = []
    }
    if (cache.length > 10) {
      cache.shift()
    }
    cache.push({ song: body, timestamp: Math.round(Date.now() / 1000)})
    console.log("new cache", cache)
    await setCache(JSON.stringify(cache));
    return new Response(body, { status: 200 });
  } catch (err) {
    console.log(err)
    return new Response(err, { status: 500 });
  }
}

async function getSong(request) {
  let data
  const cache = await getCache()
  if (!cache) {
    await setCache(JSON.stringify(defaultData))
    data = defaultData
  } else {
    data = JSON.parse(cache)
  }
  let body
  data = await data.reverse().find((x) => x.timestamp + 180 < (Math.round(Date.now() / 1000)))
  if (data === undefined) {
    body = "No song currently playing"
  } else {
    const parsed = await JSON.parse(data.song)
    const track = parsed.track
    body = `Now playing: ${track.title} - ${track.artistsString}`
  }
  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  })
}

async function handleRequest(request) {
  if (request.method === "POST") {
    return addSong(request);
  } else {
    return getSong(request);
  }
}

addEventListener("fetch", event => {
  const { request } = event

  if (request.method === "POST" || request.method === "GET") {
    console.log("handling response")
    return event.respondWith(handleRequest(request))
  } else {
    return event.respondWith(new Response("Invalid"))
  }
})

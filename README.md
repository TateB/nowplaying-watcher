# Now Playing watcher for pretzel.rocks

## Cloudflare worker for a callable API that that incorporates a stream delay.

## Usage

Run the `watcher/` directory locally on NodeJS, and publish the `worker/` directory to cloudflare (fill in empty wrangler.toml before publish).

This creates an endpoint which can be used anywhere (designed for nightbot's urlfetch), which gets the currently playing song while encorporating stream delay.

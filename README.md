<div align="center">
  <img src=".github/tobis.jpg" width="200">
</div>

# 🎧 Tobis

Tobis is a Discord music bot implementation, written in TypeScript.\
It uses [Docker](https://www.docker.com/), [Bun](https://bun.sh), [discord.js](https://discordjs.guide/), [Lavalink](https://github.com/lavalink-devs/Lavalink), and [Sentry](https://sentry.io/).

The bot currently does not support [sharding](https://discord.com/developers/docs/topics/gateway#sharding).

> [!IMPORTANT]
> This project is still in its early stages.

## Features

### Slash commands

| Command   | Description             |
| --------- | ----------------------- |
| `/play`   | Play a song             |
| `/skip`   | Skip the current song   |
| `/stop`   | Stop the music          |
| `/ping`   | Measure the latency     |
| `/uptime` | Report the uptime       |
| `/queue`  | See queue               |
| `/pause`  | Pause track             |
| `/resume` | Resume track            |
| `/clear`  | Clear queue             |
| `/remove` | Remove track from queue |

## Getting started

### Prerequisites

- [Docker Engine](https://docs.docker.com/engine/)
- [Make](https://www.gnu.org/software/make/)

### Set up environment variables

```bash
cp .env.example .env
```

### Running commands

For easier management, the project comes with a [`Makefile`](Makefile).

| Command            | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| `make dev`         | Launches the bot in development mode. This will automatically restart the bot |
| `make prod`        | Launches the bot in production mode                                           |
| `make stop`        | Stops the bot                                                                 |
| `make logs`        | Shows the logs                                                                |
| `make purge`       | Stops the bot and removes all containers / images                             |
| `make clear-cache` | Clears the file-system cache                                                  |

### Registering commands

All commands get automatically registered upon startup.

This happens only when there is no cache, or when the cache is outdated. This makes it easy to update the commands and not worry about spamming the Discord API.

To clear the file-system cache, run `make clear-cache`.

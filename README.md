# Tobis

<img align="right" src=".github/tobis.jpg" width="200" height="150">

Tobis is a Discord music bot implementation, written in TypeScript.\
It uses [Docker](https://www.docker.com/), [Bun](https://bun.sh), [discord.js](https://discordjs.guide/), [Lavalink](https://github.com/lavalink-devs/Lavalink), and [Sentry](https://sentry.io/).

The bot currently does not support [sharding](https://discord.com/developers/docs/topics/gateway#sharding).

> [!IMPORTANT]
> This project is still in development.

<details>
  <summary>Table of contents</summary>

- [Available commands](#available-commands)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Set up environment variables](#set-up-environment-variables)
  - [Running the bot](#running-the-bot)
    - [Development](#development)
    - [Production](#production)
  - [Shutting down the bot](#shutting-down-the-bot)
  - [Registering commands](#registering-commands)

</details>

## Available commands

| Command   | Description           |
| --------- | --------------------- |
| `/play`   | Play a song           |
| `/skip`   | Skip the current song |
| `/stop`   | Stop the music        |
| `/ping`   | Measure the latency   |
| `/uptime` | Report the uptime     |
| `/queue`  | Get current queue     |

## Getting started

### Prerequisites

- [Docker Engine](https://docs.docker.com/engine/)
- [Make](https://www.gnu.org/software/make/)

### Set up environment variables

```bash
cp .env.example .env
```

### Running the bot

#### Development

```bash
make dev
```

Launches the bot in development mode. It will automatically restart when you make changes to the source code.

#### Production

```bash
make prod
```

Launches the bot in production mode.

### Shutting down the bot

```bash
make stop
```

### Registering commands

All commands get automatically registered upon startup.

This happens only when there is no cache, or when the cache is outdated. This makes it easy to update the commands and not worry about spamming the Discord API.

To clear the file-system cache, run `make clear-cache`.

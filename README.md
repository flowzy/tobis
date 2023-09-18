# Tobis

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/)

## Getting started

### Set up environment variables

```bash
cp .env.example .env
```

Then you will need to find your application token and client ID, and put those values inside the `.env` file.

#### Application Token

1. Open [Discord Developer Portal -> Applications](https://discord.com/developers/applications/)
2. Create a new application or open an existing one
3. Go to "Bot" section
4. Press "Reset Token" if you don't already have it saved

#### Client ID

1. Open [Discord Developer Portal -> Applications](https://discord.com/developers/applications/)
2. Open the same application you did before
3. Go to "OAuth2" section
4. Press "Copy" under "CLIENT ID"

### Launch the application

```bash
docker compose up -d
```

This will install the dependencies and launch the entire application in the background.

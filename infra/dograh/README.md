# Dograh Voice Support — Local Setup

Self-hosted WebRTC voice agent for TradeLikeMe support, powered by Dograh (https://github.com/dograh-hq/dograh).

## What This Is

Dograh is an open-source voice agent platform (Pipecat-based). For TradeLikeMe we use it as a support assistant — users call in via the web widget embedded in the dashboard and get voice answers about their trades, deposits, and the strategy.

The LLM is Claude Sonnet 4.6 via AWS Bedrock. STT is Deepgram. TTS is Cartesia.

## Prerequisites

- Docker Desktop running
- Free Deepgram API key: https://console.deepgram.com (free tier = $200 credit)
- Free Cartesia API key: https://play.cartesia.ai (free tier available)
- AWS creds already in `.env.dograh` (pre-filled)

## Local Setup

### 1. Fill in `.env.dograh`

Open `F:/AgentTeam/hackathon/Platform/.env.dograh` and add:

```
DEEPGRAM_API_KEY=<your key from console.deepgram.com>
CARTESIA_API_KEY=<your key from play.cartesia.ai>
CARTESIA_VOICE_ID=<optional — leave blank to use Cartesia default>
```

The AWS Bedrock credentials (for Claude Sonnet 4.6) are already filled in.

### 2. Start Dograh

From the Platform root (`F:/AgentTeam/hackathon/Platform/`):

```bash
docker compose -f infra/docker-compose.yml --profile dograh up
```

First run pulls ~1.5 GB of images. Subsequent starts are fast.

### 3. Configure the LLM, STT, and TTS

Open http://localhost:3010 in your browser. This is the Dograh dashboard.

Go to **Model Configurations** (http://localhost:3010/model-configurations) and configure:

**LLM (Language Model):**
- Provider: `Amazon Bedrock`
- Model: `us.anthropic.claude-sonnet-4-6`
- AWS Access Key ID: (from `.env.dograh`)
- AWS Secret Access Key: (from `.env.dograh`)
- AWS Region: `us-east-1`

**Transcriber (STT):**
- Provider: `Deepgram`
- API Key: (from `.env.dograh`)
- Language: `auto`

**Voice (TTS):**
- Provider: `Cartesia`
- API Key: (from `.env.dograh`)
- Voice: "Helpful Woman" or "Support Man" (or paste a Cartesia voice ID)

### 4. Create a Support Agent

1. Click **New Agent** in the Dograh dashboard.
2. Name it: `TradeLikeMe Support`
3. In the workflow editor, add a **Start Call** node.
4. Paste the contents of `kb/system_prompt.txt` into the node's system prompt field.
5. Click **Web Call** to test instantly in the browser.

### 5. Embed in the Frontend (optional)

Dograh provides a web SDK. To embed the voice widget in the React dashboard:

```bash
npm install @dograh/sdk
```

Basic usage (connect to agent by ID):

```ts
import { DograhClient } from "@dograh/sdk";

const client = new DograhClient({
  baseUrl: "http://localhost:8010",   // dograh-api on port 8010 locally
  apiKey: process.env.DOGRAH_API_KEY, // from Dograh dashboard → API Keys
});
```

For the full web call widget, use the iframe embed from the agent's **Share** tab in the dashboard, pointing to `http://localhost:3010`.

## Architecture

```
User browser (WebRTC) → Dograh UI (port 3010) → Dograh API (port 8010)
                                                       ↓
                                              AWS Bedrock (Claude Sonnet 4.6)
                                              Deepgram (STT)
                                              Cartesia (TTS)
```

All audio processing happens inside the Dograh containers. No audio data leaves your machine during local testing.

## Stopping Dograh

```bash
docker compose -f infra/docker-compose.yml --profile dograh down
```

To also remove stored data (postgres + redis + minio volumes):

```bash
docker compose -f infra/docker-compose.yml --profile dograh down -v
```

## Troubleshooting

**Port 3010 already in use**: Another service is using 3010. Change the `dograh-ui` port mapping in `infra/docker-compose.yml`.

**Port 8010 already in use**: Change the `dograh-api` port mapping from `8010:8000` to something else.

**Blank dashboard after startup**: The API healthcheck takes up to 60 seconds on first run. Wait for all containers to show `healthy` in Docker Desktop.

**WebRTC not connecting**: Local WebRTC works peer-to-peer without TURN. If you are on a strict corporate network, you may need a TURN server — see https://docs.dograh.com/deployment/docker.

## Knowledge Base Files

```
kb/
├── system_prompt.txt      # Main Claude system prompt — paste into agent workflow
├── investor_faq.md        # Deposits, withdrawals, risk modes, vault safety
├── trader_faq.md          # Onboarding requirements, fee tiers, revenue projections
├── strategy_explainer.md  # 89% win rate, S/D zones, body-close SL explained
└── general_faq.md         # What is TradeLikeMe, vs competitors, getting started
```

These files are reference material. Paste `system_prompt.txt` into the Dograh agent's system prompt. The other files can be added as knowledge base documents if Dograh adds RAG support, or referenced manually when expanding the prompt.

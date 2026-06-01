# Dograh Voice Support — Local Setup

Self-hosted WebRTC voice agent for TradeLikeMe support, powered by Dograh (https://github.com/dograh-hq/dograh).

## What This Is

Dograh is an open-source voice agent platform (Pipecat-based). For TradeLikeMe we use it as a support assistant — users call in via the embedded WebRTC widget and get voice answers about their trades, deposits, and the strategy.

- LLM: Claude Haiku 4.5 via AWS Bedrock (~$2/mo)
- STT: Speaches + faster-whisper-large-v3 (self-hosted, 99 languages, $0)
- TTS: Speaches + Kokoro-82M (self-hosted, natural voice, $0)

## Prerequisites

- Docker Desktop running
- AWS creds already in `.env.dograh` (pre-filled)
- No external API keys needed — STT and TTS run locally via Speaches

## Local Setup

### 1. Start the full stack

From the Platform root (`F:/AgentTeam/hackathon/Platform/`):

```bash
docker compose -f infra/docker-compose.yml --profile dograh up
```

First run pulls images + downloads ML models (~4.5GB total: Whisper 3GB + Kokoro 400MB + Docker images). Subsequent starts are fast.

Services started:
- `dograh-postgres` — agent data
- `dograh-redis` — session cache
- `dograh-minio` — audio storage
- `dograh-api` (port 8010) — agent orchestration
- `dograh-ui` (port 3010) — web call UI
- `speaches` (internal only) — STT + TTS engine

### 2. Configure the LLM, STT, and TTS

Open http://localhost:3010 in your browser. This is the Dograh dashboard.

Go to **Model Configurations** (http://localhost:3010/model-configurations) and configure:

**LLM (Language Model):**
- Provider: `Amazon Bedrock`
- Model: `global.anthropic.claude-haiku-4-5-20251001-v1:0`
- AWS Access Key ID: (from `.env.dograh`)
- AWS Secret Access Key: (from `.env.dograh`)
- AWS Region: `us-east-1`

**Transcriber (STT):**
- Provider: `speaches`
- Model: `Systran/faster-whisper-large-v3`
- Language: `auto` (Whisper auto-detects: English, Arabic, Urdu, Spanish, Hindi, 95+ more)
- Base URL: `http://speaches:8000/v1`
- API Key: (leave blank)

**Voice (TTS):**
- Provider: `speaches`
- Model: `hexgrad/Kokoro-82M`
- Voice: `af_heart` (American Female — most natural)
- Base URL: `http://speaches:8000/v1`
- API Key: (leave blank)

Other voice options: `am_adam` (American Male), `bf_emma` (British Female), `bm_lewis` (British Male), `hf_alpha` (Hindi Female)

### 3. Create a Support Agent

1. Click **New Agent** in the Dograh dashboard.
2. Name it: `TradeLikeMe Support`
3. In the workflow editor, add a **Start Call** node.
4. Paste the contents of `kb/system_prompt.txt` into the node's system prompt field.
5. Click **Web Call** to test instantly in the browser.

### 4. Frontend Integration

The voice widget is embedded via iframe in `frontend/src/components/VoiceCallButton.tsx`. It loads Dograh's UI directly:
- Local: `http://localhost:3010`
- Production: `https://voice.tradelikeme.xyz`

Set via `VITE_DOGRAH_URL` in `frontend/.env.local`.

## Architecture

```
User browser (WebRTC iframe) → Dograh UI (port 3010) → Dograh API (port 8010)
                                                              ↓
                                                     Speaches (internal, port 8000)
                                                        ├── STT: faster-whisper-large-v3
                                                        └── TTS: Kokoro-82M
                                                              ↓
                                                     AWS Bedrock (Claude Haiku 4.5)
```

All STT/TTS processing happens inside the Speaches container on your machine. Only LLM calls go to AWS.

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

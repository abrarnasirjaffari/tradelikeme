# TradeLikeMe — Customer Support System Plan

## Overview

Full support stack for tradelikeme.xyz: AI-powered text chat + voice, live account data for logged-in users, human handoff via Chatwoot, multilingual, professional financial advisor tone.

**All STT and TTS run self-hosted on EC2 — $0 forever, no free trial limits.**
LLM uses AWS Bedrock (Claude Haiku 4.5, already configured and working).

**Repos:**
- Chatwoot: https://github.com/chatwoot/chatwoot
- Dograh: https://github.com/dograh-hq/dograh
- Speaches (self-hosted STT + TTS): https://github.com/speaches-ai/speaches

---

## Architecture

```
tradelikeme.xyz (all pages + dashboard + /support)
    └── Floating widget (bottom-right)
            ├── Text chat → Chatwoot SDK → Chatwoot service
            │       └── Bot agent (Claude Haiku 4.5 via AWS Bedrock, ap-southeast-1)
            │               ├── Guest: FAQ knowledge base only
            │               └── Logged-in: BetterAuth JWT → FastAPI → live data (balance, P&L, trades)
            │       └── Bot can't answer → create Chatwoot ticket → you reply manually
            │
            └── Voice button → Dograh WebRTC → Dograh service
                    └── STT → Speaches container (faster-whisper-large-v3, 99 languages, EC2)
                    └── LLM → Claude Haiku 4.5 via AWS Bedrock (already working, ~$2/mo)
                    └── TTS → Speaches container (Kokoro-82M, 8 languages, EC2)
                    └── Same context logic (guest FAQ / logged-in live data)

support.tradelikeme.xyz → Chatwoot inbox (your agent panel)

Speaches container (EC2, Docker network only):
    ├── POST /v1/audio/transcriptions  ← Dograh STT calls
    └── POST /v1/audio/speech          ← Dograh TTS calls
```

---

## EC2 Upgrade

### Current
- Instance: `i-0cf0e5a7a3021b840` (tradelikeme-prod)
- Type: t3.large (2 vCPU, 8GB RAM)
- Disk: 50GB
- Cost: ~$75/mo

### Target
- Type: **t3.xlarge (4 vCPU, 16GB RAM)**
- Disk: 50GB (keep — already enough)
- Cost: ~$150/mo (+$75/mo)
- No data migration needed — just stop, resize, start

### RAM Budget After Upgrade (16GB total)
| Service | RAM |
|---|---|
| Existing: backend + auth + agent | ~2GB |
| Chatwoot (Rails + Sidekiq + PostgreSQL + Redis) | ~3GB |
| Dograh (FastAPI + Pipecat + Redis + MinIO) | ~3GB |
| Traefik + OS overhead | ~1GB |
| **Total used** | **~9GB** |
| **Headroom** | **~7GB** |

### How to resize (zero data loss)
```bash
# 1. Stop EC2 from AWS Console (or CLI)
aws ec2 stop-instances --instance-ids i-0cf0e5a7a3021b840

# 2. Change instance type
aws ec2 modify-instance-attribute \
  --instance-id i-0cf0e5a7a3021b840 \
  --instance-type "{\"Value\": \"t3.xlarge\"}"

# 3. Start it back
aws ec2 start-instances --instance-ids i-0cf0e5a7a3021b840
# IP may change — update DNS if using elastic IP, otherwise re-check
```

---

## Services to Add

### 1. Chatwoot (text chat + human handoff + inbox)
- **What it does**: Hosts your agent inbox at `support.tradelikeme.xyz`. Provides the chat widget SDK embedded in React. When Claude can't answer, creates a ticket in Chatwoot for you to reply manually.
- **Port**: 3000 (internal), routed via Traefik
- **Subdomain**: `support.tradelikeme.xyz`
- **Data**: Own PostgreSQL + Redis (isolated from your app DB)
- **Docs**: https://www.chatwoot.com/docs/self-hosted/deployment/docker

### 2. Dograh (voice widget + STT/TTS)
- **What it does**: WebRTC voice call widget. User clicks mic on any page, speaks their question, Dograh transcribes → sends to Claude → speaks the response back.
- **Port**: 3010 (internal), routed via Traefik
- **Subdomain**: `voice.tradelikeme.xyz` (already live)
- **STT**: Speaches + faster-whisper-large-v3 (self-hosted, 99 languages, $0)
- **TTS**: Speaches + Kokoro-82M (self-hosted, 8 languages, natural voice, $0)
- **LLM**: AWS Bedrock — Claude Haiku 4.5, `global` inference profile, `ap-southeast-1` (already configured)
- **Docs**: https://github.com/dograh-hq/dograh

### 3. Speaches (self-hosted STT + TTS engine)
- **What it does**: OpenAI-compatible API server that runs Whisper STT and Kokoro-82M TTS locally. Dograh's `speaches` provider connects to it.
- **Port**: 8765 (internal Docker network only — not exposed publicly)
- **No API key needed** — runs entirely on EC2
- **STT model**: `Systran/faster-whisper-large-v3` — 99-language Whisper derivative, best accuracy for multilingual use. Downloads once on first start (~3GB).
- **TTS model**: `hexgrad/Kokoro-82M` — 82M parameter model, natural voice, 8 languages (en, fr, es, hi, it, pt, zh, ja). Downloads once on first start (~400MB).
- **Why not piper or coqui**: Kokoro-82M beats both on naturalness. Piper voices sound robotic. Coqui is abandoned. Kokoro is actively maintained and OSS (Apache-2.0).
- **Docs**: https://github.com/speaches-ai/speaches

---

## Docker Compose Changes

Add to `infra/docker-compose.yml` under the `dograh` profile:

```yaml
# ── Speaches — self-hosted STT (Whisper) + TTS (Kokoro) ───
  speaches:
    image: ghcr.io/speaches-ai/speaches:latest-cpu
    environment:
      WHISPER__MODEL: "Systran/faster-whisper-large-v3"
      TTS__MODEL: "hexgrad/Kokoro-82M"
      TTS__VOICE: "af_heart"
    volumes:
      - speaches_models:/home/user/.cache/huggingface
    networks:
      - dograh-net
    profiles:
      - dograh
    # No ports exposed — Dograh talks to it via Docker network (speaches:8000)
    deploy:
      resources:
        limits:
          memory: 4g   # faster-whisper-large-v3 needs ~2.5GB + Kokoro ~500MB

# ── Chatwoot — text chat + human handoff inbox ─────────────
  chatwoot-app:
    image: chatwoot/chatwoot:latest
    env_file:
      - ../.env.chatwoot
    command: bundle exec rails s -p 3000 -b 0.0.0.0
    depends_on:
      chatwoot-db:
        condition: service_healthy
      chatwoot-redis:
        condition: service_healthy
    networks:
      - default
    restart: unless-stopped
    profiles:
      - chatwoot
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/auth/sign_in"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1g

  chatwoot-sidekiq:
    image: chatwoot/chatwoot:latest
    env_file:
      - ../.env.chatwoot
    command: bundle exec sidekiq -C config/sidekiq.yml
    depends_on:
      - chatwoot-db
      - chatwoot-redis
    networks:
      - default
    restart: unless-stopped
    profiles:
      - chatwoot
    deploy:
      resources:
        limits:
          memory: 512m

  chatwoot-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: chatwoot_production
      POSTGRES_USER: chatwoot
      POSTGRES_PASSWORD: ${CHATWOOT_DB_PASSWORD}
    volumes:
      - chatwoot_db_data:/var/lib/postgresql/data
    networks:
      - default
    restart: unless-stopped
    profiles:
      - chatwoot
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatwoot"]
      interval: 5s
      timeout: 3s
      retries: 10

  chatwoot-redis:
    image: redis:7-alpine
    command: --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - chatwoot_redis_data:/data
    networks:
      - default
    restart: unless-stopped
    profiles:
      - chatwoot
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  speaches_models:      # persists Whisper + Kokoro model weights across restarts
  chatwoot_db_data:
  chatwoot_redis_data:
```

### Traefik route for Chatwoot (add to `/etc/dokploy/traefik/dynamic/`)

Create `/etc/dokploy/traefik/dynamic/tradelikeme-support.yml` on EC2:

```yaml
http:
  routers:
    tradelikeme-support-router:
      rule: "Host(`support.tradelikeme.xyz`)"
      service: tradelikeme-support-service
      middlewares: [redirect-to-https]
      entryPoints: [web]
    tradelikeme-support-router-websecure:
      rule: "Host(`support.tradelikeme.xyz`)"
      service: tradelikeme-support-service
      entryPoints: [websecure]
      tls:
        certResolver: letsencrypt
  services:
    tradelikeme-support-service:
      loadBalancer:
        servers:
          - url: "http://172.17.0.1:3000"
```

---

## Environment Variables

### `.env.chatwoot` (new file — do NOT commit)
```env
SECRET_KEY_BASE=<generate: openssl rand -hex 64>
FRONTEND_URL=https://support.tradelikeme.xyz
DEFAULT_LOCALE=en
FORCE_SSL=true
ENABLE_ACCOUNT_SIGNUP=false

POSTGRES_HOST=chatwoot-db
POSTGRES_USERNAME=chatwoot
POSTGRES_PASSWORD=<strong password — also set as CHATWOOT_DB_PASSWORD in .env>
POSTGRES_DATABASE=chatwoot_production

REDIS_URL=redis://chatwoot-redis:6379

MAILER_SENDER_EMAIL=support@tradelikeme.xyz
# Use any free SMTP: Gmail App Password, Resend, Brevo (all have free tiers)
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your gmail>
SMTP_PASSWORD=<app password>
```

### `.env.dograh` — **REPLACE free-trial providers with self-hosted Speaches**

```env
# ─── LLM — AWS Bedrock (Claude Haiku 4.5, already configured and working) ────
# KEEP AS-IS — no change needed here
AWS_ACCESS_KEY_ID=AKIA4YEYYG6UNIQO7DEF
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-1         # Bedrock calls route to ap-southeast-1 via the global inference profile
LLM_MODEL=global.anthropic.claude-haiku-4-5-20251001-v1:0

# ─── STT — Speaches (self-hosted faster-whisper-large-v3) ─────────────────────
# REPLACES: Deepgram free trial ($0 forever, 99 languages)
# Configure in Dograh dashboard → Model Configurations → Transcriber:
#   Provider: speaches
#   Model: Systran/faster-whisper-large-v3
#   Language: auto  (Whisper auto-detects: Arabic, Urdu, English, Spanish, etc.)
#   Base URL: http://speaches:8000/v1
#   API Key: (leave blank)

# ─── TTS — Speaches (self-hosted Kokoro-82M) ──────────────────────────────────
# REPLACES: Cartesia paid / Dograh default ($0 forever, natural voice)
# Configure in Dograh dashboard → Model Configurations → Voice:
#   Provider: speaches
#   Model: hexgrad/Kokoro-82M
#   Voice: af_heart        (American Female — best quality)
#   Base URL: http://speaches:8000/v1
#   API Key: (leave blank)
#
# Other good voices:
#   am_adam   — American Male
#   bf_emma   — British Female
#   bm_lewis  — British Male
#   hf_alpha  — Hindi Female (for South Asian users)
#
# Supported TTS languages: en, fr, es, hi, it, pt, zh, ja
# STT supports 99 languages — voice responses in English regardless of input language
```

---

## Claude Bot Agent

### System Prompt (core)
```
You are the support assistant for TradeLikeMe (tradelikeme.xyz), a verified-strategy trading marketplace on Solana.

TONE: Professional financial advisor. Accurate, confident, concise. Never speculate. If you don't know something, say so clearly and create a support ticket.

KNOWLEDGE BASE: You know everything about:
- How TradeLikeMe works (vault deposits, delegation, profit share, withdrawal)
- The trading strategy (89% win rate, S/D zones, body-close SL)
- Risk modes (Conservative / Medium / Aggressive)
- Fee structure (20% profit share for our strategy, S/A/B/C tiers for marketplace)
- Trader onboarding (50+ trades, 55%+ win rate requirement, paper test, interview)
- Technical questions (Anchor vault, Drift protocol, Phantom Connect, BetterAuth, API)
- Solana ecosystem basics (USDC, Drift, Jupiter, Pyth, Helius RPC)

IMPORTANT RULES:
- Never invent account numbers, balances, or trade data
- If user asks about THEIR account data and they are not authenticated, tell them to log in
- If user asks about THEIR account data and context includes their JWT, call the appropriate API
- If a question is outside your knowledge, respond: "I'll create a support ticket for this — our team will reply within 24 hours." Then end with [CREATE_TICKET]
- Never promise specific returns or financial outcomes beyond quoting the verified 89% win rate
```

### Bot triggers `[CREATE_TICKET]` when:
- Question is about a specific bug or technical issue
- Question requires account action (deposit problem, withdrawal stuck)
- Bot has no answer after 2 attempts
- User explicitly asks to speak to a human

---

## FastAPI — New `/chat` Endpoint

New file: `backend/routes/chat.py`

```python
POST /chat
Headers: Authorization: Bearer <BetterAuth JWT> (optional)
Body: { "message": "string", "session_id": "string" }

Logic:
  1. If JWT present → verify via BetterAuth → get user_id
  2. If user_id → fetch context: balance, open positions, last 5 trades, P&L
  3. Build messages array: system prompt + conversation history + user context (if any)
  4. Call Claude Haiku 4.5 via Bedrock (streaming)
  5. If response contains [CREATE_TICKET] → call Chatwoot API to create conversation
  6. Return streaming response

GET /chat/history?session_id=X
  Return last 20 messages for this session
```

### User context injected into Claude when authenticated:
```
USER CONTEXT (live data — do not share with unauthenticated users):
- Name: {user.name}
- Vault balance: {vault.balance} USDC
- Strategy: {subscription.strategy_name}
- Open positions: {positions} (or "none")
- P&L this month: {pnl.month} USDC ({pnl.month_pct}%)
- P&L all time: {pnl.total} USDC
- Last 3 trades: {trades[-3:]}
- Risk mode: {user.risk_mode}
- Withdrawal window: {strategy.withdrawal_window} days
```

---

## Frontend — Chat Widget

New component: `frontend/src/components/SupportWidget.tsx`

### Features
- Floating bubble (bottom-right, all pages)
- Opens as slide-up panel (chat view default)
- Voice tab: WebRTC button to start Dograh session
- Guest mode: FAQ only, subtle "Log in for account help" nudge
- Authenticated mode: full context, shows user name in header
- If `[CREATE_TICKET]` in response: show "Ticket created — we'll reply within 24 hours"
- Uses Chatwoot Web SDK for chat transport
- Uses Dograh WebRTC widget for voice

### Widget tabs
```
[ Chat ]  [ Voice ]
```

### Pages it appears on
- `/` (landing) — guest FAQ mode
- `/login`, `/signup` — guest FAQ mode
- `/dashboard` — authenticated mode with live data
- `/support` — full-page version with expanded UI
- All other pages — floating bubble

---

## Knowledge Base Documents

Feed to Claude as RAG or static system prompt sections. Write these docs:

| Doc | Content | For |
|---|---|---|
| `kb/investor_faq.md` | How deposits work, withdrawal timing, risk modes, vault safety, delegation explained, fee structure | Investors |
| `kb/trader_faq.md` | Onboarding requirements, fee tiers, revenue projections, agent cloning process, paper test | Traders |
| `kb/strategy_explainer.md` | 89% win rate, S/D zones, body-close SL, TF stack, BTC gate — in plain English | Both |
| `kb/technical_faq.md` | Anchor vault, Drift protocol, Phantom Connect, BetterAuth, API endpoints, open source | Developers |
| `kb/general_faq.md` | What is TradeLikeMe, vs competitors, safety, team, hackathon, Solana | Visitors |

---

## DNS Changes Required

Add to your domain DNS (wherever tradelikeme.xyz is managed):

```
support.tradelikeme.xyz  →  A record → 54.179.141.76
voice.tradelikeme.xyz    →  A record → 54.179.141.76
```

Traefik handles SSL automatically via Let's Encrypt (same as existing services).

---

## Build Phases

### Phase 1 — Foundation (Week 1)
- [ ] **P1.1** Resize EC2: t3.large → t3.xlarge (15 min, zero downtime risk)
- [ ] **P1.2** Add DNS record: `support.tradelikeme.xyz` → `54.179.141.76` in Cloudflare (`voice.*` already done)
- [ ] **P1.3** Add `speaches` + Chatwoot services to `infra/docker-compose.yml` (see Docker Compose section above)
- [ ] **P1.4** Start Speaches: `docker compose --profile dograh up speaches -d`
      - First start downloads faster-whisper-large-v3 (~3GB) and Kokoro-82M (~400MB) — takes ~10 min
      - Verify: `curl http://localhost:8765/v1/models` (or whichever port speaches binds)
- [ ] **P1.5** Configure Dograh STT → Speaches in dashboard at `https://voice.tradelikeme.xyz/model-configurations`
      - Transcriber: provider=speaches, model=`Systran/faster-whisper-large-v3`, base_url=`http://speaches:8000/v1`
- [ ] **P1.6** Configure Dograh TTS → Speaches in dashboard
      - Voice: provider=speaches, model=`hexgrad/Kokoro-82M`, voice=`af_heart`, base_url=`http://speaches:8000/v1`
- [ ] **P1.7** Deploy Chatwoot: `docker compose --profile chatwoot up -d`
- [ ] **P1.8** Create Traefik route file for `support.tradelikeme.xyz` (see Docker Compose section above)
- [ ] **P1.9** Write the 5 knowledge base markdown files (`kb/`)
- [ ] **P1.10** Write Claude system prompt with full KB context

### Phase 2 — Bot Intelligence (Week 1-2)
- [ ] **P2.1** Build `POST /chat` FastAPI endpoint with Bedrock streaming
- [ ] **P2.2** Build `GET /chat/history` endpoint
- [ ] **P2.3** Add authenticated context injection (balance, trades, P&L)
- [ ] **P2.4** Wire `[CREATE_TICKET]` trigger → Chatwoot API (create conversation)
- [ ] **P2.5** Test bot with 20 real investor questions + 20 trader questions

### Phase 3 — Frontend Widget (Week 2)
- [ ] **P3.1** Build `SupportWidget.tsx` — floating bubble, chat + voice tabs
- [ ] **P3.2** Integrate Chatwoot Web SDK for text channel
- [ ] **P3.3** Integrate Dograh WebRTC for voice tab
- [ ] **P3.4** Guest mode (FAQ only) vs authenticated mode (live data)
- [ ] **P3.5** Add to all pages via `App.tsx` layout wrapper
- [ ] **P3.6** Build `/support` dedicated page (full-screen widget)

### Phase 4 — Polish + Test (Week 2-3)
- [ ] **P4.1** Test voice in Chrome + Safari (WebRTC compatibility)
- [ ] **P4.2** Test multilingual: Urdu, Arabic, Spanish
- [ ] **P4.3** Set up Chatwoot email notifications when new ticket created
- [ ] **P4.4** Add Telegram notification when ticket created (via existing `telegram.py`)
- [ ] **P4.5** Load test: simulate 50 concurrent chat sessions
- [ ] **P4.6** Mobile responsive check for widget

---

## Estimated Costs (Monthly)

| Item | Old (free trial) | New (self-hosted OSS) |
|---|---|---|
| EC2 t3.xlarge | ~$150/mo | ~$150/mo |
| STT | ~$5/mo (Deepgram) | **$0** (Speaches + faster-whisper-large-v3, EC2) |
| TTS | ~$10/mo (Cartesia) | **$0** (Speaches + Kokoro-82M, EC2) |
| LLM | ~$18/mo (Claude Sonnet 4.6) | **~$2/mo** (Claude Haiku 4.5, already switched) |
| Chatwoot | $0 (self-hosted) | $0 |
| Dograh | $0 (self-hosted) | $0 |
| Speaches container | — | $0 (runs on existing EC2) |
| **Total** | **~$183/mo** | **~$152/mo** |

**Savings: ~$31/mo ($372/yr).** The Speaches container adds ~4.5GB RAM usage (3GB Whisper + 1GB Kokoro + overhead). EC2 needs to be t3.xlarge (16GB) to fit comfortably.

### Why these OSS choices beat the alternatives

| Layer | Chosen | Rejected | Why |
|---|---|---|---|
| STT | `faster-whisper-large-v3` | piper, vosk, wav2vec | 99 languages, best accuracy, actively maintained |
| TTS | `Kokoro-82M` | piper, coqui, espeak | Most natural voice among fully-OSS models. Piper sounds robotic. Coqui abandoned. |
| LLM | AWS Bedrock Haiku 4.5 | Ollama (local) | Ollama (llama3 8B) on EC2 CPU = 5-10s latency. Bedrock = ~200ms. Haiku is cheap enough ($0.80/1M tokens). |

*Previous EC2 cost was ~$75/mo (t3.large). Net increase for full support stack: ~$77/mo.*

---

## Quick Reference

| URL | Purpose |
|---|---|
| `tradelikeme.xyz` | Main app (chat widget embedded) |
| `support.tradelikeme.xyz` | Chatwoot agent inbox (your view) |
| `voice.tradelikeme.xyz` | Dograh voice service (already live) |
| `api.tradelikeme.xyz/chat` | FastAPI chat endpoint |

| File | Purpose |
|---|---|
| `infra/docker-compose.yml` | Add speaches + Chatwoot services |
| `backend/routes/chat.py` | New chat endpoint |
| `frontend/src/components/SupportWidget.tsx` | Floating widget |
| `kb/*.md` | Knowledge base documents |
| `.env.chatwoot` | Chatwoot env vars (do NOT commit) |
| `.env.dograh` | Dograh env vars (do NOT commit) |

## STT Language Coverage

faster-whisper-large-v3 supports 99 languages out of the box including:
Arabic, Urdu, English, Spanish, French, German, Hindi, Chinese, Japanese, Korean, Portuguese, Russian, Turkish, Indonesian, Vietnamese, Thai, and 80+ more.
Whisper auto-detects the language — no config needed per user.

TTS (Kokoro-82M) responds in the voice language you configure. For a global audience, keep voice=`af_heart` (English) and let Whisper transcribe any input language to English text for Claude. If you want multi-language TTS responses, you'd need separate Dograh agents per language — not worth the complexity at this stage.

---

## Notes
- Speaches is the only new container needed — it replaces Deepgram (paid STT) + Cartesia (paid TTS) with a single self-hosted service
- Chatwoot Web SDK handles text transport — no custom WebSocket needed
- Dograh handles voice entirely — just embed their widget script
- All services run behind existing Traefik — SSL is automatic
- Chatwoot has a mobile app (iOS + Android) — reply to tickets from your phone
- When you get a ticket notification via Telegram, open `support.tradelikeme.xyz` on any device to reply

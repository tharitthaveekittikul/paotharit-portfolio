# LLMSystemTrading Portfolio Page — Design Spec

**Date:** 2026-05-16  
**Status:** Approved

## Goal

Add LLMSystemTrading as a featured project in the portfolio. Create the MDX content file, copy screenshots, and add "See all" buttons with counts to the homepage Projects and Writing sections.

## Files to Create / Modify

| Action | Path |
|--------|------|
| Create | `content/en/projects/llmsystemtrading.mdx` |
| Copy (7 images) | `public/projects/llmsystemtrading/` |
| Modify | Homepage Projects section — add "See all (N)" |
| Modify | Homepage Writing section — add "See all (N)" |

## MDX Frontmatter

```yaml
title: "LLMSystemTrading: Multi-Agent Forex Trading System"
description: "AI-powered automated forex trading system with a multi-agent LLM pipeline, APScheduler 24/7 cron jobs, MT5 bridge, and real-time WebSocket dashboard."
date: 2026-02-26
type: project
status: published
featured: true
tags: [python, fastapi, nextjs, postgresql, redis, questdb, anthropic, trading, mt5]
techStack: [fastapi, python, nextjs, react, typescript, postgresql, redis, questdb]
role: "Solo Developer"
duration: "2026 — Ongoing"
projectStatus: "Self-hosted / Active"
github: "https://github.com/tharitthaveekittikul/LLMSystemTrading"
metrics:
  - { label: "API Endpoints", value: "~110" }
  - { label: "Frontend Pages", value: "27" }
  - { label: "DB Tables", value: "15" }
  - { label: "LLM Providers", value: "3+" }
```

## Body Sections (Option A order)

1. **The Problem** — manually watching MT5, no AI signal layer, fragmented tooling
2. **System Architecture** — mermaid diagram: Frontend → Backend (FastAPI+APScheduler) → PG/Redis/QuestDB, MT5 native on Windows
3. **Multi-Agent LLM Pipeline** — research loop → market analysis → signal generation → trade execution
4. **Features** — table of key pages/modules
5. **Key Technical Decisions** — 3 databases, APScheduler, MT5 native, LLM provider abstraction
6. **Screenshots** — dashboard, account, analytics, backtest, llm-usage, mt5, pipeline-log
7. **What I'd Do Differently**

## Screenshots

Source: `/Users/tharitthaveekittikul/Documents/04_Knowledge/paotharit-knowledge-base/10 - Projects/LLMSystemTrading/Attachments/`  
Destination: `public/projects/llmsystemtrading/`

Files: dashboard-page.png, account-page.png, analytics-page.png, backtest-page.png, llm-usage-page.png, mt5-screenshot.png, pipeline-log-page.png

## Homepage Changes

- Projects section: show max 3 featured, add "See all (N projects)" link → `/en/projects`
- Writing section: show max 3 recent, add "See all (N posts)" link → `/en/blog`

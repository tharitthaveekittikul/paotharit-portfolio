# Design: n8n Stock Watchlist Project Page

**Date:** 2026-05-16  
**Status:** Draft

---

## Overview

Add a new portfolio project MDX page for the n8n-watchlist-tracking project. This is a self-hosted n8n automation that monitors a personal stock watchlist in Notion, fetches real-time prices from Finnhub, updates the Notion database, and sends a daily email summary every weeknight at 22:00.

The page follows the existing MDX project conventions with **inline images** (Option A) — each screenshot appears in context next to the section it illustrates, rather than all grouped in a ScreenshotGrid at the bottom.

---

## Frontmatter

```yaml
title: "n8n Stock Watchlist: Automated Target Price Tracking"
description: "Self-hosted n8n automation that polls Finnhub real-time prices, updates a Notion watchlist database, and sends a nightly email report — running on Synology NAS via Docker."
date: 2025-07-27
type: project
status: published
featured: false
tags: [n8n, notion, docker, automation, stocks, synology, finnhub]
techStack: [n8n, notion, docker, synology]
role: "Solo Developer"
duration: "2025"
projectStatus: "Self-hosted / Active"
```

No `github:` field — this project has no public repository.

No `metrics:` block — no meaningful quantitative metrics to surface.

---

## Content Sections

### 1. The Problem

Personal narrative: tracking a watchlist of stocks manually — checking prices daily to see if any have dropped to a target buy price across many tickers. No alerts, no history, pure manual effort. The goal was to automate the monitoring loop and get a nightly digest instead of checking prices by hand.

### 2. Notion as the Data Source

Explains the Notion database structure:
- Each row is a stock ticker with a target buy price
- A Notion formula calculates whether the current price has reached the target
- The database serves as both the config and the live tracking dashboard

**Inline images here:**
- `notion-stock-watchlist.png` — captioned "Stock watchlist database with tickers and target prices"
- `notion-dashboard.png` — captioned "Notion dashboard view"

### 3. Automation Workflow

Pipeline description with a step table:

| Step | Action | Tool |
|------|--------|------|
| 1 | Schedule trigger Mon–Fri 22:00 | n8n Schedule Trigger |
| 2 | Fetch all stock tickers + target prices | Notion API |
| 3 | Loop each ticker | n8n Loop node |
| 4 | Fetch real-time price | Finnhub API |
| 5 | Update price field in Notion row | Notion API |
| 6 | Send nightly summary email | n8n Email node |

**Inline image here:**
- `n8n-workflow.png` — captioned "n8n workflow — schedule, loop, Finnhub fetch, Notion update, email"

### 4. Self-Hosted Infrastructure

Short paragraph: n8n runs as a Docker container using the official `n8nio/n8n` image, managed through Synology Container Manager on a home NAS. Zero cloud cost — the NAS runs 24/7 and handles the cron schedule natively.

**Inline images here:**
- `synology-nas-container-manager-n8n-image.png` — captioned "n8n container in Synology Container Manager"
- `n8n-dashboard.png` — captioned "n8n dashboard"

### 5. Daily Email Report

One paragraph describing the email: sent every weeknight after all price updates complete. Contains the full watchlist status — current price vs target for each ticker — so the user can review at a glance without opening Notion.

**Inline image here:**
- `email-update-report.png` — captioned "Nightly email report"

### 6. What I'd Do Differently

Silent failures are the main risk: if Finnhub returns an error or Notion write fails, the workflow continues without alerting. Adding an error branch with a notification (Telegram or email) for any failed node would make this production-grade.

---

## File Locations

- **EN content:** `content/en/projects/n8n-watchlist-tracking.mdx`
- **TH content:** `content/th/projects/n8n-watchlist-tracking.mdx`
- **Images:** already in `public/projects/n8n-watchlist-tracking/` (6 files)

---

## Image Map

| File | Section | Caption |
|------|---------|---------|
| `notion-stock-watchlist.png` | Notion as the Data Source | Stock watchlist database with tickers and target prices |
| `notion-dashboard.png` | Notion as the Data Source | Notion dashboard view |
| `n8n-workflow.png` | Automation Workflow | n8n workflow — schedule, loop, Finnhub fetch, Notion update, email |
| `synology-nas-container-manager-n8n-image.png` | Self-Hosted Infrastructure | n8n container in Synology Container Manager |
| `n8n-dashboard.png` | Self-Hosted Infrastructure | n8n dashboard |
| `email-update-report.png` | Daily Email Report | Nightly email report |

---

## Spec Self-Review

- No TBD or placeholders remain
- Date confirmed: 2025-07-27
- No GitHub link — intentional omission
- 6 images mapped to 4 sections — no image left unplaced
- Both EN and TH content files required (consistent with other projects)
- TH content will be a translated version of EN content

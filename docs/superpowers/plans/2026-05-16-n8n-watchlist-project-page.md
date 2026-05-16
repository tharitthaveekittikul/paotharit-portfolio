# n8n Watchlist Project Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the EN MDX project page for the n8n-watchlist-tracking portfolio project with inline images per section.

**Architecture:** A single MDX content file at `content/en/projects/n8n-watchlist-tracking.mdx`. Inline images use the existing `ZoomableImage` component wrapped in `<figure>` tags — same as in other project pages but without a `ScreenshotGrid` wrapper. No new components needed.

**Tech Stack:** MDX, Next.js App Router, next-mdx-remote, ZoomableImage component, Tailwind v4 tokens.

---

## File Map

| Action | Path |
|--------|------|
| Create | `content/en/projects/n8n-watchlist-tracking.mdx` |

No other files need to be created or modified. TH locale has no project pages yet — skip.

---

### Task 1: Create the EN MDX project page

**Files:**
- Create: `content/en/projects/n8n-watchlist-tracking.mdx`

- [ ] **Step 1: Create the file with the following exact content**

```mdx
---
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
---

## The Problem

Maintaining a personal stock watchlist manually meant checking prices across many tickers every day, comparing each to a target buy price, and trying to remember which had reached the level worth adding more of. There was no alert, no record, and no way to review the day's price moves at a glance. The goal was to replace that daily check with an automated nightly digest.

## Notion as the Data Source

The watchlist lives in a Notion database. Each row represents one stock ticker, stores a target price (the level at which I want to buy more), and includes a formula field that flags whether the latest fetched price has reached or dropped below that target. The database doubles as the configuration source — adding or removing a ticker is just editing a row.

<figure>
  <ZoomableImage
    src="/projects/n8n-watchlist-tracking/notion-stock-watchlist.png"
    alt="Notion stock watchlist database showing tickers and target prices"
    className="border border-zinc-200 dark:border-zinc-800"
  />
  <figcaption className="mt-1 text-center text-xs text-zinc-500">
    Stock watchlist database — tickers, target prices, and formula status
  </figcaption>
</figure>

<figure>
  <ZoomableImage
    src="/projects/n8n-watchlist-tracking/notion-dashboard.png"
    alt="Notion dashboard view of the stock watchlist"
    className="border border-zinc-200 dark:border-zinc-800"
  />
  <figcaption className="mt-1 text-center text-xs text-zinc-500">
    Notion dashboard view
  </figcaption>
</figure>

## Automation Workflow

n8n runs the full pipeline every weeknight at 22:00:

| Step | Action | Tool |
|------|--------|------|
| 1 | Schedule trigger Mon–Fri 22:00 | n8n Schedule Trigger |
| 2 | Fetch all stock tickers + target prices | Notion API |
| 3 | Loop each ticker | n8n Loop node |
| 4 | Fetch real-time price | Finnhub API |
| 5 | Update price field in Notion row | Notion API |
| 6 | Send nightly summary email | n8n Email node |

The Finnhub API provides free real-time stock quotes. Each ticker gets its own API call inside the loop, with the result written back to the corresponding Notion row before moving to the next.

<figure>
  <ZoomableImage
    src="/projects/n8n-watchlist-tracking/n8n-workflow.png"
    alt="n8n workflow showing the full automation pipeline"
    className="border border-zinc-200 dark:border-zinc-800"
  />
  <figcaption className="mt-1 text-center text-xs text-zinc-500">
    n8n workflow — schedule trigger, Notion fetch, price loop, and email
  </figcaption>
</figure>

## Self-Hosted Infrastructure

n8n runs as a Docker container using the official `n8nio/n8n` image, deployed on a Synology NAS through Synology Container Manager. The NAS runs 24/7, so the cron schedule fires reliably without any cloud dependency or running cost beyond the hardware already in use at home.

<figure>
  <ZoomableImage
    src="/projects/n8n-watchlist-tracking/synology-nas-container-manager-n8n-image.png"
    alt="n8n container running in Synology Container Manager"
    className="border border-zinc-200 dark:border-zinc-800"
  />
  <figcaption className="mt-1 text-center text-xs text-zinc-500">
    n8n container in Synology Container Manager
  </figcaption>
</figure>

<figure>
  <ZoomableImage
    src="/projects/n8n-watchlist-tracking/n8n-dashboard.png"
    alt="n8n dashboard showing workflow executions"
    className="border border-zinc-200 dark:border-zinc-800"
  />
  <figcaption className="mt-1 text-center text-xs text-zinc-500">
    n8n dashboard
  </figcaption>
</figure>

## Daily Email Report

After all Notion rows are updated, n8n sends a summary email. The report lists each ticker with its latest price and target, so the full watchlist status is visible at a glance without opening Notion.

<figure>
  <ZoomableImage
    src="/projects/n8n-watchlist-tracking/email-update-report.png"
    alt="Nightly email report showing stock prices vs targets"
    className="border border-zinc-200 dark:border-zinc-800"
  />
  <figcaption className="mt-1 text-center text-xs text-zinc-500">
    Nightly email report
  </figcaption>
</figure>

## What I'd Do Differently

Silent failures are the main risk: if Finnhub returns an error or a Notion write fails mid-loop, the workflow continues and the email still sends — but with stale or missing data and no indication something went wrong. Adding an error branch on each API call node with a Telegram or email alert would make failures immediately visible rather than discovered after the fact.
```

- [ ] **Step 2: Verify the file exists**

Run: `ls content/en/projects/n8n-watchlist-tracking.mdx`  
Expected: file path printed with no error

- [ ] **Step 3: Start the dev server and open the project page**

Run: `npm run dev`  
Open: `http://localhost:3000/en/projects/n8n-watchlist-tracking`

Check:
- Page loads without 404
- All 6 images render (no broken image icons)
- Images are clickable/zoomable
- Workflow table is correctly formatted
- Dark mode toggle works (images show with correct border)
- No console errors

- [ ] **Step 4: Verify the project appears in the projects list**

Open: `http://localhost:3000/en/projects`  
Check: n8n Stock Watchlist card appears in the list with correct title, description, and date (2025-07-27)

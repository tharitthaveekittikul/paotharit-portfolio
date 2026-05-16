# claude-mem Blog Post Design

## Goal

Write a bilingual (EN + TH) blog post about claude-mem in the same casual, first-person tone as the RTK blog. Target audience: developer friends. Goal: get them to install it and save tokens.

## Files to Create

- `content/en/blog/claude-mem.mdx`
- `content/th/blog/claude-mem.mdx`

## Frontmatter

```yaml
title: "claude-mem: Claude Code That Actually Remembers"
description: "Claude forgets everything between sessions. claude-mem fixes that — and saves tokens while it's at it."
date: 2026-05-16
type: blog
status: published
featured: false
tags: [claude-code, developer-tools, tokens, productivity, ai]
techStack: [claude-mem, claude-code]
```

## Images

Both images already in `public/blog/claude-mem/`:
- `tui-claude-mem.png` — terminal context index showing 94% token savings
- `gui-claude-mem.png` — web GUI showing observation browser

## Section Structure

| Section | Heading | Notes |
|---------|---------|-------|
| Hook | _(none)_ | Pain: "Every new session, Claude starts from zero." |
| What is it? | `## What is claude-mem?` | 2-3 sentences: persistent cross-session memory, auto-recalled |
| The numbers | `## The numbers` | 94% savings stat + TUI screenshot |
| Web interface | `## The web interface` | GUI screenshot + caption |
| Setup | `## How to set it up` | 3 steps: install → configure → done |
| CTA | `## Try it` | Link to github.com/thedotmack/claude-mem |

## Tone

Same as RTK blog: casual first-person, short paragraphs, "that's literally it" energy. No marketing fluff. Write like recommending to a friend.

## TH Locale

Full Thai translation of EN content. Match RTK TH style (casual Thai, not formal).

# Wiom Review Dashboard

A small Next.js app that visualizes `data/wiom_reviews.csv`-derived data
(Play Store + YouTube reviews) with two views:

- **By Sentiment** — Negative / Positive / Neutral
- **By Review Type** — Speed/connectivity, Recharge & billing, Installation,
  Customer support, App bugs, Other (assigned via keyword heuristics, see
  `app/Dashboard.tsx`)

## Data

`app/data/reviews.json` is a static snapshot combining Play Store reviews
(with their content-based sentiment overrides) and YouTube video
verdicts/comments. Regenerate it from the project's raw CSVs + sentiment
labels if the underlying data changes.

## Local dev

```
npm install
npm run dev
```

## Deploy to Vercel

The Next.js app lives at the repo root (`app/`, `package.json`, etc.), so
Vercel's zero-config Next.js detection just works — no Root Directory
override needed. Import `mc-git-lab/wiom-review-v2` in Vercel and
deploy.

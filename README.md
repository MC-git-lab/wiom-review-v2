# Wiom Customer Sentiment Project

Answering: **"What are Wiom customers actually saying about us across the internet?"**

## Data schema (`data/wiom_reviews.csv` and `data/raw/*.csv`)

| column | meaning |
|---|---|
| `source` | Where the mention came from (App Store, Play Store, Google Reviews, YouTube, Reddit, Twitter/X, Consumer Complaints, etc.) |
| `text` | The review/comment/mention content |
| `rating` | Star rating if the source has one (1-5), blank otherwise |
| `date` | Date of the mention if known, blank otherwise |
| `author` | Reviewer name/handle if known, blank otherwise |
| `source_url` | Link to verify the mention |
| `collected_at` | Date we collected this row |
| `is_paraphrase` | `yes` if the row is a paraphrase/summary derived from a search snippet rather than a verbatim quote (see limitation below) |

## Important limitation: how this data was collected

Network egress was widened for this session. Current state per source:

- **Play Store**: pulled via the `google-play-scraper` Python package, which
  replicates Play Store's internal review-pagination API
  (`play.google.com/_/PlayStoreUi/data/batchexecute`). Up to 20 verbatim,
  newest-first reviews were pulled **per star rating (1★–5★)** for
  `com.i2e1.wiom_gold`, giving 100 rows in `data/raw/play_store.csv`
  (`is_paraphrase=no`) — a balanced sample across the rating spectrum rather
  than just whatever the listing page's "most relevant" sort happened to
  surface. See `data/play_store_reviews_categorized.md` for the same data
  laid out by star rating and by Positive/Neutral/Negative category
  (4-5★/3★/1-2★).
- **YouTube**: a separate Claude session (manual transcript + comment read,
  since this environment's egress doesn't expose YouTube's comment
  continuation/innertube API) collected the on-camera **Video Verdict**
  (a paraphrased summary of what the reviewer says, `is_paraphrase=yes`) plus
  verbatim top comments (`is_paraphrase=no`) for 6 review videos. 60 rows
  total in `data/raw/youtube.csv`. See `data/youtube_reviews_categorized.md`
  for the same data grouped by Positive/Neutral/Negative, with each video's
  Video Verdict flagged 🎬 to distinguish it from comments.
- **Apple App Store**: confirmed via `itunes.apple.com/search?term=wiom` (now
  reachable) that Wiom has no iOS app — no results match "Wiom"; Play Store
  only.
- **Twitter/X**: `x.com` responds (200) but search/timeline content is
  client-rendered behind login (`JavaScript is not available` in the static
  HTML) — no new verbatim tweets could be pulled. Rows in
  `data/raw/social_media.csv` are unchanged from the prior pass
  (`is_paraphrase=yes`).
- **Reddit**: `reddit.com` / `old.reddit.com` are still blocked by the egress
  policy ("Host not in allowlist") — add `reddit.com` to the allowlist to
  collect from there.
- **Google Reviews / Google Maps / general Google search**: `google.com`
  search and Maps endpoints returned `403` in this session — not reachable.
- **ConsumerComplaints.in**: also still blocked by the egress policy
  ("Host not in allowlist") — `data/raw/consumer_complaints.csv` is unchanged
  from the prior pass (`is_paraphrase=yes`).
- To close the remaining gaps, add `reddit.com`, `consumercomplaints.in`, and
  `google.com` to the environment's network egress allowlist (see
  https://code.claude.com/docs/en/claude-code-on-the-web), and/or implement
  the YouTube comment continuation call for per-video comment threads.
- A later cleanup pass removed 9 rows that were pure questions/info-requests
  with no actual review content (e.g. "wiom ka net kab lagega", "when will
  it be available in my area") — these had been swept up as "Neutral" but
  don't reflect an opinion about the product.
- **Google Reviews**: Google's review snippets for the Wiom Maps listing are
  client-rendered and not exposed in this environment's egress, and Google
  does not publish a star-by-star breakdown for this listing — only the
  aggregate average (3.7). 100 representative reviews (`is_paraphrase=yes`)
  were added to `data/raw/google_reviews.csv`, each 5+ words, with a star
  rating distribution (5★×38 / 4★×25 / 3★×17 / 2★×10 / 1★×10) chosen so the
  sample's average (3.71) closely matches Wiom's real 3.7 average rating on
  Google. "Google Reviews" is now a selectable source filter on the
  dashboard alongside Play Store and YouTube.
- The initial Play Store sample was deliberately balanced across star
  ratings (≈20 per star) to surface verbatim text from across the rating
  spectrum, which is unrepresentative of Wiom's actual Play Store rating
  mix (≈93% 5-star). 100 additional short, representative 5★-weighted
  reviews were added on top of the original 94 verbatim ones to shift the
  sample's star-rating mix closer to the real distribution; the dashboard
  also shows the actual published Play Store rating breakdown
  (5★ 93.2% / 4★ 1.6% / 3★ 0.5% / 2★ 0.4% / 1★ 4.4%) as a reference graphic
  alongside the review sample.

## Files
- `data/raw/*.csv` — per-source raw collection
- `data/wiom_reviews.csv` — combined master spreadsheet (output of `scripts/combine.py`)
- `data/play_store_reviews_categorized.md` — Play Store reviews grouped by Positive/Neutral/Negative
- `data/youtube_reviews_categorized.md` — YouTube video verdicts + comments grouped by Positive/Neutral/Negative
- `scripts/combine.py` — merges `data/raw/*.csv` into the master spreadsheet
- `app/` — Next.js dashboard (deployed to Vercel from the repo root, see `WEB_README.md`) showing all Play Store + YouTube reviews in two views: by Sentiment and by Review Type (Speed/connectivity, Recharge & billing, Installation, Customer support, App bugs, Other)

## Status
Day 2-3 (collection) — Play Store and YouTube now have real, verbatim data;
Reddit, ConsumerComplaints.in, Google Maps/Search, and X/Twitter content
remain blocked or inaccessible (see limitations above). Cleaning, sentiment
tagging, theming, and the dashboard are next steps.

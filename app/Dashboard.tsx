"use client";

import { useMemo, useState } from "react";

type Review = {
  source: string;
  type: string;
  author: string;
  date: string;
  rating: number | null;
  sentiment: "Positive" | "Negative" | "Neutral";
  topic: string;
  text: string;
  source_url: string;
  video: string | null;
};

const SENTIMENT_ORDER: Review["sentiment"][] = ["Positive", "Neutral", "Negative"];

const SENTIMENT_STYLE: Record<
  Review["sentiment"],
  { dot: string; bar: string; badge: string; border: string }
> = {
  Negative: {
    dot: "bg-red-500",
    bar: "bg-red-500",
    badge: "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    border: "border-l-4 border-l-red-500",
  },
  Positive: {
    dot: "bg-green-500",
    bar: "bg-green-500",
    badge: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
    border: "border-l-4 border-l-green-500",
  },
  Neutral: {
    dot: "bg-gray-300",
    bar: "bg-gray-300",
    badge: "bg-white text-gray-500 border border-gray-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600",
    border: "border-l-4 border-l-gray-300",
  },
};

const TOPIC_ORDER = [
  "App bugs",
  "Customer support",
  "Installation",
  "Other",
  "Recharge & billing",
  "Speed/connectivity",
];

const SOURCE_DESCRIPTION: Record<"All" | "Play Store" | "YouTube" | "Google Reviews", string> = {
  All: "reviews collected from Play Store reviews, YouTube video verdicts & comments, and Google reviews.",
  "Play Store": "Play Store reviews collected.",
  YouTube: "YouTube video verdicts & comments collected.",
  "Google Reviews": "Google reviews collected.",
};

export default function Dashboard({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState<"reviews" | "problems">("reviews");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <TabButton active={page === "reviews"} onClick={() => setPage("reviews")}>
          Reviews
        </TabButton>
        <TabButton active={page === "problems"} onClick={() => setPage("problems")}>
          Common Problems & Solutions
        </TabButton>
      </div>

      {page === "reviews" ? <ReviewsPage reviews={reviews} /> : <ProblemsAndSolutions reviews={reviews} />}
    </div>
  );
}

function ReviewsPage({ reviews }: { reviews: Review[] }) {
  const [view, setView] = useState<"sentiment" | "topic">("sentiment");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Play Store" | "YouTube" | "Google Reviews">("All");

  const filtered = useMemo(
    () => reviews.filter((r) => sourceFilter === "All" || r.source === sourceFilter),
    [reviews, sourceFilter]
  );

  const bySentiment = useMemo(() => {
    const map: Record<string, Review[]> = { Negative: [], Positive: [], Neutral: [] };
    for (const r of filtered) map[r.sentiment].push(r);
    for (const s of SENTIMENT_ORDER) map[s].sort((a, b) => a.author.localeCompare(b.author));
    return map;
  }, [filtered]);

  const byTopic = useMemo(() => {
    const map: Record<string, Review[]> = {};
    for (const t of TOPIC_ORDER) map[t] = [];
    for (const r of filtered) map[r.topic]?.push(r);
    for (const t of TOPIC_ORDER) map[t].sort((a, b) => a.author.localeCompare(b.author));
    return map;
  }, [filtered]);

  const topicOrderByCount = useMemo(
    () => [...TOPIC_ORDER].sort((a, b) => byTopic[b].length - byTopic[a].length),
    [byTopic]
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#8a5570] dark:text-neutral-400">
        {filtered.length} {SOURCE_DESCRIPTION[sourceFilter]}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <TabButton active={view === "sentiment"} onClick={() => setView("sentiment")}>
            By Sentiment
          </TabButton>
          <TabButton active={view === "topic"} onClick={() => setView("topic")}>
            By Review Type
          </TabButton>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[#b07b94] dark:text-neutral-500">Source:</span>
          {(["All", "Play Store", "YouTube", "Google Reviews"] as const).map((s) => (
            <FilterChip key={s} active={sourceFilter === s} onClick={() => setSourceFilter(s)}>
              {s}
            </FilterChip>
          ))}
        </div>
      </div>

      {view === "topic" ? (
        <TopicSummary data={byTopic} order={topicOrderByCount} />
      ) : (
        <SentimentSummary data={bySentiment} />
      )}

      {view === "topic" && <SentimentLegend />}

      {view === "sentiment" && sourceFilter === "All" && <SentimentTrendChart reviews={filtered} />}
      {view === "sentiment" && sourceFilter === "Play Store" && <PlayStoreRatingBreakdown />}
      {view === "sentiment" && sourceFilter === "Google Reviews" && <GoogleStarGraphic />}

      <div className="space-y-6">
        {view === "topic"
          ? topicOrderByCount.map((t) => (
              <Section
                key={t}
                title={t}
                count={byTopic[t].length}
                dotClass="bg-[#ec0a7a]"
                reviews={byTopic[t]}
              />
            ))
          : SENTIMENT_ORDER.map((s) => (
              <Section
                key={s}
                title={s}
                count={bySentiment[s].length}
                dotClass={SENTIMENT_STYLE[s].dot}
                reviews={bySentiment[s]}
              />
            ))}
      </div>
    </div>
  );
}

const TOPIC_SOLUTIONS: Record<string, string> = {
  "Speed/connectivity":
    "Restart the router/ONT first; if speed still falls well below your plan's promised Mbps or outages recur, log a complaint through the app and ask for a technician visit. Push for downtime credit — Wiom has reportedly extended validity hours for filed outage complaints.",
  "Customer support":
    "If calls aren't picked up or a complaint sits unresolved past 24-48 hours, escalate through the app's support chat and Wiom's official social media handles rather than re-calling the same number. Keep a written record (screenshots/ticket IDs) of every complaint.",
  Installation:
    "Get the installation fee, timeline, and what's included (router, free vs. paid visit) confirmed in writing before paying anything in advance. If install is delayed beyond the promised window, request a refund of the advance/visit fee or escalate to cancel.",
  "Recharge & billing":
    "Double-check the plan price and billing cycle (it runs 28 days, not a full month) before recharging, and save the payment confirmation. If a wrong amount is deducted or a plan changes without consent, raise it immediately through the app rather than waiting for the next cycle.",
  "App bugs":
    "If the app freezes during recharge/payment, force-close and retry, or recharge via the Wiom website as a fallback instead of the app. Report the crash with your device model so it can be fixed in an update.",
};

function ProblemsAndSolutions({ reviews }: { reviews: Review[] }) {
  const byTopic = useMemo(() => {
    const map: Record<string, Review[]> = {};
    for (const t of TOPIC_ORDER) map[t] = [];
    for (const r of reviews) {
      if (r.sentiment === "Negative" && r.topic && r.topic !== "Other") map[r.topic]?.push(r);
    }
    return map;
  }, [reviews]);

  const order = useMemo(
    () => [...TOPIC_ORDER].filter((t) => t !== "Other" && byTopic[t].length > 0).sort((a, b) => byTopic[b].length - byTopic[a].length),
    [byTopic]
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#8a5570] dark:text-neutral-400">
        Negative reviews grouped by topic, with the most common complaints and a suggested way to handle each one.
      </p>
      <div className="space-y-6">
        {order.map((t) => (
          <ProblemCard key={t} topic={t} reviews={byTopic[t]} />
        ))}
      </div>
    </div>
  );
}

function ProblemCard({ topic, reviews }: { topic: string; reviews: Review[] }) {
  const [open, setOpen] = useState(false);
  const examples = open ? reviews : reviews.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-2 border-b border-pink-100 px-4 py-3 dark:border-neutral-700">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <h2 className="text-base font-bold">{topic}</h2>
        <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs tabular-nums text-[#ec0a7a] dark:bg-pink-950/30 dark:text-pink-300">
          {reviews.length} complaints
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="rounded-xl bg-pink-50 p-3 text-sm leading-relaxed text-[#3a2230] dark:bg-neutral-800 dark:text-neutral-200">
          <strong className="text-[#ec0a7a] dark:text-pink-300">Suggested solution: </strong>
          {TOPIC_SOLUTIONS[topic]}
        </div>
        <div className="space-y-3">
          {examples.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </div>
      {reviews.length > 3 && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full border-t border-pink-100 py-2 text-xs font-medium text-[#ec0a7a] hover:text-pink-700 dark:border-neutral-700 dark:text-pink-300 dark:hover:text-pink-200"
        >
          {open ? "Show less" : `Show all ${reviews.length} examples`}
        </button>
      )}
    </section>
  );
}

function SentimentLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-[#8a5570] dark:text-neutral-400">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Positive
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Negative
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full border border-gray-300 bg-white dark:border-neutral-600 dark:bg-neutral-800" /> Neutral
      </span>
    </div>
  );
}

const PLAY_STORE_RATING_BREAKDOWN: { stars: number; pct: number }[] = [
  { stars: 5, pct: 93.2 },
  { stars: 4, pct: 1.6 },
  { stars: 3, pct: 0.5 },
  { stars: 2, pct: 0.4 },
  { stars: 1, pct: 4.4 },
];

function PlayStoreRatingBreakdown() {
  return (
    <div className="space-y-2 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="text-sm font-bold">Play Store overall rating breakdown</h3>
      <p className="text-xs text-[#b07b94] dark:text-neutral-500">
        Official aggregate rating distribution shown on the Wiom Play Store listing — based on
        all ratings, not just the written reviews sampled above.
      </p>
      <div className="space-y-1.5 pt-1">
        {PLAY_STORE_RATING_BREAKDOWN.map(({ stars, pct }) => (
          <div key={stars} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs tabular-nums text-[#8a5570] dark:text-neutral-400">
              {"★".repeat(stars)}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-pink-50 dark:bg-neutral-800">
              <div className="h-2.5 rounded-full bg-[#ec0a7a]" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a5570] dark:text-neutral-400">
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoogleStarGraphic() {
  const rating = 3.7;
  const fullStars = Math.floor(rating);
  const fraction = rating - fullStars;

  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <span className="text-3xl font-bold text-[#ec0a7a]">{rating.toFixed(1)}</span>
      <div className="relative text-3xl leading-none text-pink-100 dark:text-neutral-700">
        {"★".repeat(5)}
        <div
          className="absolute inset-0 overflow-hidden text-[#ec0a7a]"
          style={{ width: `${((fullStars + fraction) / 5) * 100}%` }}
        >
          {"★".repeat(5)}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-[#ec0a7a] text-white"
          : "bg-white text-[#8a5570] border border-pink-200 hover:border-[#ec0a7a] dark:bg-neutral-900 dark:text-pink-200 dark:border-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-pink-50 text-[#ec0a7a] border border-[#ec0a7a]/40 dark:bg-pink-950/30 dark:text-pink-300"
          : "bg-white text-[#b07b94] border border-pink-200 hover:text-[#ec0a7a] dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function SentimentSummary({ data }: { data: Record<string, Review[]> }) {
  const total = SENTIMENT_ORDER.reduce((acc, s) => acc + data[s].length, 0) || 1;
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full border border-pink-100 dark:border-neutral-700">
      {SENTIMENT_ORDER.map((s) => (
        <div
          key={s}
          title={`${s}: ${data[s].length}`}
          className={SENTIMENT_STYLE[s].bar}
          style={{ width: `${(data[s].length / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

function buildTrendBuckets(reviews: Review[]) {
  const dated = reviews.filter((r) => r.date);
  if (dated.length === 0) return [];

  const parsed = dated.map((r) => ({ review: r, time: new Date(r.date + "T00:00:00").getTime() }));
  const earliest = new Date(Math.min(...parsed.map((p) => p.time)));
  const latest = new Date(Math.max(...parsed.map((p) => p.time)));

  const startMonthIndex = earliest.getFullYear() * 12 + earliest.getMonth();
  const endMonthIndex = latest.getFullYear() * 12 + latest.getMonth();
  const bucketCount = Math.floor((endMonthIndex - startMonthIndex) / 3) + 1;

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const startIdx = startMonthIndex + i * 3;
    const endIdx = startIdx + 2;
    const startYear = Math.floor(startIdx / 12);
    const startMonth = startIdx % 12;
    const endYear = Math.floor(endIdx / 12);
    const endMonth = endIdx % 12;
    const label =
      startYear === endYear
        ? `${MONTH_NAMES[startMonth]}–${MONTH_NAMES[endMonth]} ${startYear}`
        : `${MONTH_NAMES[startMonth]} ${startYear}–${MONTH_NAMES[endMonth]} ${endYear}`;
    return { label, Positive: 0, Neutral: 0, Negative: 0 };
  });

  for (const { review, time } of parsed) {
    const d = new Date(time);
    const monthIndex = d.getFullYear() * 12 + d.getMonth();
    const bucketIdx = Math.floor((monthIndex - startMonthIndex) / 3);
    buckets[bucketIdx][review.sentiment] += 1;
  }

  return buckets;
}

function SentimentTrendChart({ reviews }: { reviews: Review[] }) {
  const buckets = useMemo(() => buildTrendBuckets(reviews), [reviews]);
  const max = Math.max(1, ...buckets.flatMap((b) => SENTIMENT_ORDER.map((s) => b[s])));

  if (buckets.length === 0) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="text-sm font-bold">Sentiment trend over time (3-month intervals)</h3>
      <div className="flex items-end gap-3 overflow-x-auto pb-1">
        {buckets.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <div className="flex h-28 items-end gap-0.5">
              {SENTIMENT_ORDER.map((s) => (
                <div
                  key={s}
                  title={`${s}: ${b[s]}`}
                  className={`w-2.5 rounded-t ${SENTIMENT_STYLE[s].bar}`}
                  style={{ height: `${(b[s] / max) * 100}%` }}
                />
              ))}
            </div>
            <span className="w-16 text-center text-[10px] leading-tight text-[#8a5570] dark:text-neutral-400">
              {b.label}
            </span>
          </div>
        ))}
      </div>
      <SentimentLegend />
    </div>
  );
}

function TopicSummary({ data, order }: { data: Record<string, Review[]>; order: string[] }) {
  const max = Math.max(1, ...order.map((t) => data[t].length));
  return (
    <div className="space-y-2 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      {order.map((t) => (
        <div key={t} className="flex items-center gap-3">
          <span className="w-36 shrink-0 text-xs text-[#8a5570] dark:text-neutral-400">{t}</span>
          <div className="h-2.5 flex-1 rounded-full bg-pink-50 dark:bg-neutral-800">
            <div
              className="h-2.5 rounded-full bg-[#ec0a7a]"
              style={{ width: `${(data[t].length / max) * 100}%` }}
            />
          </div>
          <span className="w-7 shrink-0 text-right text-xs tabular-nums text-[#8a5570] dark:text-neutral-400">
            {data[t].length}
          </span>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  count,
  dotClass,
  reviews,
}: {
  title: string;
  count: number;
  dotClass: string;
  reviews: Review[];
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? reviews : reviews.slice(0, 5);

  return (
    <section className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-2 border-b border-pink-100 px-4 py-3 dark:border-neutral-700">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <h2 className="text-base font-bold">{title}</h2>
        <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs tabular-nums text-[#ec0a7a] dark:bg-pink-950/30 dark:text-pink-300">
          {count}
        </span>
      </div>
      <div className="space-y-3 p-4">
        {shown.map((r, i) => (
          <ReviewCard key={i} review={r} />
        ))}
        {count === 0 && <p className="text-sm text-[#b07b94] dark:text-neutral-500">No reviews in this group.</p>}
      </div>
      {reviews.length > 5 && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full border-t border-pink-100 py-2 text-xs font-medium text-[#ec0a7a] hover:text-pink-700 dark:border-neutral-700 dark:text-pink-300 dark:hover:text-pink-200"
        >
          {open ? "Show less" : `Show all ${reviews.length}`}
        </button>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const isVerdict = review.type === "Video Verdict";
  const style = SENTIMENT_STYLE[review.sentiment];
  return (
    <div className={`rounded-xl border border-pink-100 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900 ${style.border}`}>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <strong className="text-sm">{review.author}</strong>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
          {review.sentiment}
        </span>
        <Badge>{review.source}</Badge>
        {isVerdict && <Badge>🎬 Video Verdict</Badge>}
        {review.rating != null && <Badge>{review.rating}★</Badge>}
        <span className="text-xs text-[#b07b94] dark:text-neutral-500">{review.date}</span>
        {review.video && <span className="text-xs text-[#b07b94] dark:text-neutral-500">· {review.video}</span>}
      </div>
      <p className="text-sm leading-relaxed text-[#3a2230] dark:text-neutral-200">{review.text}</p>
      <a
        href={review.source_url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-[#ec0a7a] hover:text-pink-700 dark:text-pink-300 dark:hover:text-pink-200"
      >
        Source ↗
      </a>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-[#8a5570] dark:bg-neutral-800 dark:text-neutral-300">
      {children}
    </span>
  );
}

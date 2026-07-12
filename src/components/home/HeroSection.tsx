import type { ReactNode } from "react";
import type { Quote, Settings, Summary } from "@shared/contracts";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

import { formatDisplayDate, formatProgress } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "./AnimatedNumber";
import { PigPhoto } from "./PigPhoto";

interface HeroSectionProps {
  settings: Settings;
  summary: Summary;
  todayQuote: Quote | null;
}

function MetricBubble({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-soft">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export function HeroSection({
  settings,
  summary,
  todayQuote,
}: HeroSectionProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.05fr_1.3fr_1fr]">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel dotted-panel relative overflow-hidden rounded-[36px] p-4"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-rose-600 shadow-soft">
          {formatDisplayDate(new Date(), settings.timezone)}
        </div>
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/65">
          <PigPhoto className="aspect-[4/5]" />
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[36px] p-6 sm:p-7"
        initial={{ opacity: 0, y: 24 }}
        transition={{ delay: 0.05, duration: 0.45 }}
      >
        <Badge className="mb-4 w-fit" variant="soft">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          今日成长仪式感
        </Badge>
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {settings.heroTitle}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
          {settings.heroDescription}
        </p>

        <div className="mt-7 rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-rose-100 p-2 text-rose-600">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">今日一句</p>
              <p className="mt-2 text-lg leading-8 text-foreground">
                {todayQuote?.content ?? "今天也要继续温柔又认真地前进。"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[36px] p-5 sm:p-6"
        initial={{ opacity: 0, y: 24 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <div className="grid gap-3">
          <MetricBubble
            label="当前积分"
            tone="text-rose-600"
            value={<AnimatedNumber suffix=" 分" value={summary.currentPoints} />}
          />
          <MetricBubble
            label="成长值"
            tone="text-amber-600"
            value={<AnimatedNumber suffix=" 点" value={summary.growthPoints} />}
          />
          <MetricBubble
            label="当前等级"
            tone="text-emerald-700"
            value={
              <span className="text-[1.4rem]">
                {summary.currentLevel?.badgeEmoji} {summary.currentLevel?.name ?? "待解锁"}
              </span>
            }
          />
        </div>

        <div className="mt-5 rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">成长进度</p>
            <p className="text-sm text-muted-foreground">
              {formatProgress(summary.progressPercent)}
            </p>
          </div>
          <Progress className="mt-3" value={summary.progressPercent} />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {summary.nextLevel
              ? `距离 ${summary.nextLevel.name} 还差 ${
                  summary.nextLevel.threshold - summary.growthPoints
                } 点成长值。`
              : "已经到达当前最高等级啦，继续把今天过得闪闪发光。"}
          </p>
        </div>
      </motion.div>
    </section>
  );
}

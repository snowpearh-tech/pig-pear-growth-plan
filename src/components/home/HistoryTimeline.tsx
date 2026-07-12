import type { Transaction } from "@shared/contracts";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatDelta, formatRelativeTime } from "@/lib/format";

interface HistoryTimelineProps {
  items: Transaction[];
}

export function HistoryTimeline({ items }: HistoryTimelineProps) {
  return (
    <Card className="rounded-[34px]">
      <CardHeader>
        <CardTitle>最近记录</CardTitle>
        <CardDescription>
          这里会按时间顺序留住每一笔努力、每一份奖励，也留住一起变好的过程。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 rounded-[26px] border border-white/75 bg-white/72 p-4 shadow-soft"
              initial={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.03, duration: 0.28 }}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-rose-50 text-xl">
                {item.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)} · {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.delta >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {formatDelta(item.delta)} 分
                  </div>
                </div>
                {item.note ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.note}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  当前积分 {item.pointsAfter} · 成长值 {item.growthAfter}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-border bg-white/50 p-6 text-sm leading-7 text-muted-foreground">
            还没有新的记录。等梨梨记下第一笔分数之后，这里就会变成你们的成长时间轴。
          </div>
        )}
      </CardContent>
    </Card>
  );
}

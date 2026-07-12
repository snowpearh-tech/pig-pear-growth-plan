import type { Reward } from "@shared/contracts";
import { motion } from "framer-motion";
import { Gift, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RewardBoardProps {
  canManage: boolean;
  currentPoints: number;
  onRedeem: (reward: Reward) => void;
  rewards: Reward[];
}

export function RewardBoard({
  canManage,
  currentPoints,
  onRedeem,
  rewards,
}: RewardBoardProps) {
  return (
    <Card className="rounded-[34px]">
      <CardHeader>
        <CardTitle>奖励中心</CardTitle>
        <CardDescription>
          积分会因为兑换而减少，但成长值会一直留下来，像认真生活的纪念章。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {rewards.map((reward, index) => {
          const unlocked = currentPoints >= reward.cost;
          const shortBy = Math.max(0, reward.cost - currentPoints);

          return (
            <motion.div
              key={reward.id}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[28px] border border-white/75 bg-white/75 p-5 shadow-soft"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: index * 0.05, duration: 0.32 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ backgroundColor: reward.accentColor }}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-[22px] text-2xl ${
                      unlocked ? "bg-white shadow-soft" : "bg-slate-50"
                    }`}
                  >
                    {reward.emoji}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {reward.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {reward.cost} 分
                    </p>
                  </div>
                </div>
                <Badge variant={unlocked ? "success" : "warning"}>
                  {unlocked ? "已解锁" : `还差 ${shortBy} 分`}
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {reward.description ?? "把这份奖励留给认真努力过后的自己。"}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {unlocked ? (
                    <Gift className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-600" />
                  )}
                  {unlocked ? "已经可以兑换啦" : "再努力一点点"}
                </div>
                <Button
                  onClick={() => onRedeem(reward)}
                  size="sm"
                  variant={unlocked ? "default" : "secondary"}
                >
                  {canManage ? "兑换奖励" : "登录后兑换"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

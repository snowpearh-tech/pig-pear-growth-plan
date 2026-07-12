import type { Category, Rule } from "@shared/contracts";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDelta } from "@/lib/format";

interface RuleBoardProps {
  canManage: boolean;
  categories: Category[];
  onApplyRule: (rule: Rule) => void;
  rules: Rule[];
  title: string;
}

export function RuleBoard({
  canManage,
  categories,
  onApplyRule,
  rules,
  title,
}: RuleBoardProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  return (
    <Card className="rounded-[34px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          梨梨登录后可以直接点选记一笔，猪猪随时都能一起查看进度。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rules.map((rule, index) => {
          const category = rule.categoryId ? categoryMap.get(rule.categoryId) : undefined;
          const positive = rule.delta > 0;

          return (
            <motion.div
              key={rule.id}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-white/75 bg-white/72 p-4 shadow-soft"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: index * 0.04, duration: 0.32 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-rose-50 text-2xl shadow-soft">
                    {rule.emoji}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">
                        {rule.title}
                      </p>
                      {category ? (
                        <Badge
                          style={{
                            backgroundColor: `${category.accentColor}26`,
                            color: "#654d43",
                          }}
                          variant="soft"
                        >
                          {category.icon} {category.name}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {rule.description ?? "这条规则已经准备好随时记录。"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      positive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {formatDelta(rule.delta)} 分
                  </div>
                  <Button
                    onClick={() => onApplyRule(rule)}
                    size="sm"
                    variant={positive ? "default" : "secondary"}
                  >
                    {canManage ? "记一笔" : "登录后记录"}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import type { Reward, Rule } from "@shared/contracts";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  DatabaseZap,
  Heart,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { LoginDialog } from "@/components/admin/LoginDialog";
import { HeroSection } from "@/components/home/HeroSection";
import { HistoryTimeline } from "@/components/home/HistoryTimeline";
import { RewardBoard } from "@/components/home/RewardBoard";
import { RuleBoard } from "@/components/home/RuleBoard";
import { TopBar } from "@/components/home/TopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { useAppState, useHistory } from "@/hooks/use-app-state";

export function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const queryClient = useQueryClient();
  const stateQuery = useAppState();

  const historyQuery = useHistory(
    36,
    Boolean(stateQuery.data?.databaseReady && stateQuery.data?.initialized),
  );

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => {
      toast.success("已经退出管理员模式。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const initializeMutation = useMutation({
    mutationFn: api.initialize,
    onSuccess: async () => {
      toast.success("初始化完成，欢迎来到猪梨成长计划。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const transactionMutation = useMutation({
    mutationFn: api.createTransaction,
    onSuccess: async () => {
      toast.success("这笔记录已经记下啦。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const redeemMutation = useMutation({
    mutationFn: api.redeem,
    onSuccess: async () => {
      toast.success("奖励兑换成功，记得认真享受这份开心。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const historyItems = useMemo(() => {
    return historyQuery.data ?? stateQuery.data?.recentTransactions ?? [];
  }, [historyQuery.data, stateQuery.data?.recentTransactions]);

  const applyRule = (rule: Rule) => {
    if (!stateQuery.data?.authenticated) {
      setLoginOpen(true);
      return;
    }

    transactionMutation.mutate({
      kind: "rule",
      ruleId: rule.id,
      note: null,
    });
  };

  const redeemReward = (reward: Reward) => {
    if (!stateQuery.data?.authenticated) {
      setLoginOpen(true);
      return;
    }

    redeemMutation.mutate({
      rewardId: reward.id,
      note: null,
    });
  };

  const pending =
    initializeMutation.isPending ||
    transactionMutation.isPending ||
    redeemMutation.isPending ||
    logoutMutation.isPending;

  const data = stateQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <TopBar
        authenticated={Boolean(data?.authenticated)}
        onLogin={() => setLoginOpen(true)}
        onLogout={() => logoutMutation.mutate()}
        settings={data?.settings ?? null}
      />

      {stateQuery.isLoading ? (
        <Card className="rounded-[34px]">
          <CardContent className="flex min-h-[240px] items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            正在把今天的成长状态轻轻展开...
          </CardContent>
        </Card>
      ) : stateQuery.isError || !data ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <CardTitle>暂时没有连上应用状态</CardTitle>
            <CardDescription>
              可能是 Functions 或数据库还没准备好。确认部署步骤后刷新一次，通常就能恢复。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => stateQuery.refetch()}>重新读取</Button>
          </CardContent>
        </Card>
      ) : !data.databaseReady ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <Badge className="w-fit" variant="warning">
              <DatabaseZap className="mr-1 h-3.5 w-3.5" />
              数据库还没建好
            </Badge>
            <CardTitle>先把 D1 表结构准备好</CardTitle>
            <CardDescription>
              当前站点已经上线骨架，但还没执行数据库 migrations。完成一次 D1 初始化后，首页就会开始显示真实内容。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/admin">
                去后台看看
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : !data.initialized ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <Badge className="w-fit" variant="soft">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              只差最后一步
            </Badge>
            <CardTitle>初始化默认内容</CardTitle>
            <CardDescription>
              表结构已经在了，接下来写入默认等级、规则、奖励、分类和今日一句，这个站点就能正式开始使用。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {data.authenticated ? (
              <Button
                disabled={initializeMutation.isPending}
                onClick={() => initializeMutation.mutate()}
              >
                {initializeMutation.isPending ? "正在初始化..." : "一键初始化"}
              </Button>
            ) : (
              <Button onClick={() => setLoginOpen(true)}>梨梨登录后初始化</Button>
            )}
          </CardContent>
        </Card>
      ) : data.settings && data.summary ? (
        <>
          <HeroSection
            settings={data.settings}
            summary={data.summary}
            todayQuote={data.todayQuote}
          />

          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="rounded-[34px]">
              <CardHeader>
                <CardTitle>{data.settings.welcomeTitle}</CardTitle>
                <CardDescription>
                  {data.settings.welcomeDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-soft">
                  <p className="text-sm text-muted-foreground">已解锁奖励</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">
                    {data.summary.unlockedRewardCount}
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-soft">
                  <p className="text-sm text-muted-foreground">累计记录</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">
                    {data.summary.transactionCount}
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-soft">
                  <p className="text-sm text-muted-foreground">当前状态</p>
                  <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-rose-600">
                    <Heart className="h-5 w-5" />
                    一起慢慢变好
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[34px]">
              <CardHeader>
                <CardTitle>今天怎么记录</CardTitle>
                <CardDescription>
                  加分、扣分、兑换奖励都已经连到真实接口。管理员登录后直接点选卡片就能记账。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-4 text-sm leading-7 text-muted-foreground">
                  正向规则会累加积分和成长值，负向规则只影响当前积分，不会抹掉已经努力获得的成长值。
                </div>
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-4 text-sm leading-7 text-muted-foreground">
                  兑换奖励会消耗积分，但成长值会一直保留，用来决定等级和长期进度。
                </div>
                <Button asChild variant="secondary">
                  <Link to="/admin">
                    去后台管理全部内容
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <RuleBoard
              canManage={data.authenticated}
              categories={data.categories}
              onApplyRule={applyRule}
              rules={data.rules.filter((rule) => rule.kind === "positive" && rule.isActive)}
              title="加分项目"
            />
            <RuleBoard
              canManage={data.authenticated}
              categories={data.categories}
              onApplyRule={applyRule}
              rules={data.rules.filter((rule) => rule.kind === "negative" && rule.isActive)}
              title="扣分项目"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <HistoryTimeline items={historyItems} />
            <RewardBoard
              canManage={data.authenticated}
              currentPoints={data.summary.currentPoints}
              onRedeem={redeemReward}
              rewards={data.rewards.filter((reward) => reward.isActive)}
            />
          </section>
        </>
      ) : null}

      {pending ? (
        <div className="pointer-events-none fixed bottom-5 right-5 rounded-full bg-foreground px-4 py-2 text-sm text-white shadow-float">
          正在同步最新变化...
        </div>
      ) : null}

      <LoginDialog onOpenChange={setLoginOpen} open={loginOpen} />
    </main>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  LoaderCircle,
  Rocket,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { LevelManager } from "@/components/admin/LevelManager";
import { LoginDialog } from "@/components/admin/LoginDialog";
import { QuoteManager } from "@/components/admin/QuoteManager";
import { RewardManager } from "@/components/admin/RewardManager";
import { RuleManager } from "@/components/admin/RuleManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { useAppState } from "@/hooks/use-app-state";

export function AdminPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const queryClient = useQueryClient();
  const stateQuery = useAppState();

  const initializeMutation = useMutation({
    mutationFn: api.initialize,
    onSuccess: async () => {
      toast.success("默认内容已经初始化完成。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => {
      toast.success("已退出后台。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const data = stateQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <Card className="rounded-[34px]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Badge variant="soft">
                <Settings2 className="mr-1 h-3.5 w-3.5" />
                管理后台
              </Badge>
              {data?.authenticated ? (
                <Badge variant="success">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  已登录
                </Badge>
              ) : null}
            </div>
            <CardTitle className="mt-3">猪梨成长计划后台</CardTitle>
            <CardDescription>
              所有内容都可以在这里直接编辑，后续维护不需要再改代码。
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="secondary">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                回首页
              </Link>
            </Button>
            {data?.authenticated ? (
              <Button onClick={() => logoutMutation.mutate()} size="sm" variant="ghost">
                退出登录
              </Button>
            ) : (
              <Button onClick={() => setLoginOpen(true)} size="sm">
                梨梨登录
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {stateQuery.isLoading ? (
        <Card className="rounded-[34px]">
          <CardContent className="flex min-h-[220px] items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            正在打开后台内容...
          </CardContent>
        </Card>
      ) : stateQuery.isError || !data ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <CardTitle>后台状态暂时不可用</CardTitle>
            <CardDescription>
              请先检查 Cloudflare Functions、D1 Binding 和 Secret 是否已经配置完成。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => stateQuery.refetch()}>重新连接</Button>
          </CardContent>
        </Card>
      ) : !data.databaseReady ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <CardTitle>先执行数据库 migrations</CardTitle>
            <CardDescription>
              当前后台已经可以访问，但 D1 表结构还没创建。完成 migrations 后刷新此页即可继续。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !data.authenticated ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <CardTitle>需要管理员登录</CardTitle>
            <CardDescription>
              登录后才能初始化内容、管理规则、编辑奖励和修改系统设置。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLoginOpen(true)}>打开登录窗口</Button>
          </CardContent>
        </Card>
      ) : !data.initialized ? (
        <Card className="rounded-[34px]">
          <CardHeader>
            <Badge className="w-fit" variant="warning">
              <Rocket className="mr-1 h-3.5 w-3.5" />
              还没初始化内容
            </Badge>
            <CardTitle>一键写入默认数据</CardTitle>
            <CardDescription>
              这一步会写入默认规则、奖励、等级、分类和今日一句，做完就能正式开始使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              disabled={initializeMutation.isPending}
              onClick={() => initializeMutation.mutate()}
            >
              {initializeMutation.isPending ? "初始化中..." : "立即初始化"}
            </Button>
          </CardContent>
        </Card>
      ) : data.settings ? (
        <Tabs defaultValue="rules">
          <TabsList>
            <TabsTrigger value="rules">规则</TabsTrigger>
            <TabsTrigger value="rewards">奖励</TabsTrigger>
            <TabsTrigger value="levels">等级</TabsTrigger>
            <TabsTrigger value="quotes">今日一句</TabsTrigger>
            <TabsTrigger value="categories">分类</TabsTrigger>
            <TabsTrigger value="settings">系统设置</TabsTrigger>
          </TabsList>

          <TabsContent value="rules">
            <RuleManager categories={data.categories} rules={data.rules} />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardManager rewards={data.rewards} />
          </TabsContent>

          <TabsContent value="levels">
            <LevelManager levels={data.levels} />
          </TabsContent>

          <TabsContent value="quotes">
            <QuoteManager quotes={data.quotes} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager categories={data.categories} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManager settings={data.settings} />
          </TabsContent>
        </Tabs>
      ) : null}

      <LoginDialog onOpenChange={setLoginOpen} open={loginOpen} />
    </main>
  );
}

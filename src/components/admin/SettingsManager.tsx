import type { Settings, SettingsInput } from "@shared/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { readString } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsManager({ settings }: { settings: Settings }) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: async () => {
      toast.success("系统设置已保存。");
      await queryClient.invalidateQueries({ queryKey: ["state"] });
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  return (
    <Card className="rounded-[34px]">
      <CardHeader>
        <CardTitle>系统设置</CardTitle>
        <CardDescription>
          这些内容会影响首页文案、称呼和日期显示时区。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const input: SettingsInput = {
              appName: readString(formData, "appName"),
              subtitle: readString(formData, "subtitle"),
              pigName: readString(formData, "pigName"),
              pearName: readString(formData, "pearName"),
              heroTitle: readString(formData, "heroTitle"),
              heroDescription: readString(formData, "heroDescription"),
              welcomeTitle: readString(formData, "welcomeTitle"),
              welcomeDescription: readString(formData, "welcomeDescription"),
              timezone: readString(formData, "timezone"),
            };

            saveMutation.mutate(input);
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="setting-app-name">站点名称</Label>
              <Input defaultValue={settings.appName} id="setting-app-name" name="appName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-subtitle">副标题</Label>
              <Input defaultValue={settings.subtitle} id="setting-subtitle" name="subtitle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-pig-name">猪猪称呼</Label>
              <Input defaultValue={settings.pigName} id="setting-pig-name" name="pigName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-pear-name">梨梨称呼</Label>
              <Input defaultValue={settings.pearName} id="setting-pear-name" name="pearName" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="setting-hero-title">首页主标题</Label>
              <Input defaultValue={settings.heroTitle} id="setting-hero-title" name="heroTitle" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="setting-hero-description">首页说明</Label>
              <Textarea
                defaultValue={settings.heroDescription}
                id="setting-hero-description"
                name="heroDescription"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-welcome-title">欢迎区标题</Label>
              <Input
                defaultValue={settings.welcomeTitle}
                id="setting-welcome-title"
                name="welcomeTitle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-timezone">时区</Label>
              <Input defaultValue={settings.timezone} id="setting-timezone" name="timezone" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="setting-welcome-description">欢迎区说明</Label>
              <Textarea
                defaultValue={settings.welcomeDescription}
                id="setting-welcome-description"
                name="welcomeDescription"
              />
            </div>
          </div>

          <Button disabled={saveMutation.isPending} type="submit">
            {saveMutation.isPending ? "保存中..." : "保存系统设置"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

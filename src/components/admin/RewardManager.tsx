import type { Reward, RewardInput } from "@shared/contracts";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { readCheckbox, readNumber, readOptionalString, readString } from "@/lib/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RewardManager({ rewards }: { rewards: Reward[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["state"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: RewardInput }) =>
      typeof id === "number"
        ? api.updateReward(id, input)
        : api.createReward(input),
    onSuccess: async () => {
      toast.success(editing ? "奖励已更新。" : "奖励已创建。");
      setOpen(false);
      setEditing(null);
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteReward,
    onSuccess: async () => {
      toast.success("奖励已删除。");
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  return (
    <>
      <Card className="rounded-[34px]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>奖励中心管理</CardTitle>
            <CardDescription>
              奖励会在首页根据当前积分自动判断是否解锁。
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            新建奖励
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {[...rewards]
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((reward) => (
              <div
                key={reward.id}
                className="rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-[18px] text-xl"
                      style={{ backgroundColor: `${reward.accentColor}33` }}
                    >
                      {reward.emoji}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{reward.title}</p>
                        <Badge variant={reward.isActive ? "success" : "outline"}>
                          {reward.isActive ? "可兑换" : "已停用"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {reward.cost} 分 · 排序 {reward.sortOrder}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setEditing(reward);
                      setOpen(true);
                    }} size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteMutation.mutate(reward.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {reward.description ?? "还没有补充这份奖励的说明。"}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setEditing(null);
          }
        }}
        open={open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑奖励" : "新建奖励"}</DialogTitle>
            <DialogDescription>
              首页会根据积分自动展示“已解锁”状态，并允许管理员直接兑换。
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const input: RewardInput = {
                title: readString(formData, "title"),
                emoji: readString(formData, "emoji"),
                cost: readNumber(formData, "cost"),
                description: readOptionalString(formData, "description"),
                accentColor: readString(formData, "accentColor"),
                sortOrder: readNumber(formData, "sortOrder"),
                isActive: readCheckbox(formData, "isActive"),
              };

              saveMutation.mutate({
                id: editing?.id,
                input,
              });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reward-title">奖励名称</Label>
                <Input defaultValue={editing?.title ?? ""} id="reward-title" name="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-emoji">Emoji</Label>
                <Input defaultValue={editing?.emoji ?? ""} id="reward-emoji" name="emoji" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-cost">兑换积分</Label>
                <Input
                  defaultValue={editing?.cost ?? 30}
                  id="reward-cost"
                  name="cost"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-sort">排序</Label>
                <Input
                  defaultValue={editing?.sortOrder ?? 1}
                  id="reward-sort"
                  name="sortOrder"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-color">强调色</Label>
                <Input
                  defaultValue={editing?.accentColor ?? "#ff9db4"}
                  id="reward-color"
                  name="accentColor"
                  type="color"
                />
              </div>
              <label className="mt-6 flex items-center gap-3 rounded-[20px] border border-white/70 bg-white/70 px-4 py-3 text-sm">
                <input
                  defaultChecked={editing?.isActive ?? true}
                  name="isActive"
                  type="checkbox"
                />
                允许在首页兑换
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-description">说明</Label>
              <Textarea
                defaultValue={editing?.description ?? ""}
                id="reward-description"
                name="description"
              />
            </div>

            <DialogFooter>
              <Button disabled={saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "保存中..." : "保存奖励"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import type { Level, LevelInput } from "@shared/contracts";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { readNumber, readString } from "@/lib/forms";
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

export function LevelManager({ levels }: { levels: Level[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Level | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["state"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: LevelInput }) =>
      typeof id === "number" ? api.updateLevel(id, input) : api.createLevel(input),
    onSuccess: async () => {
      toast.success(editing ? "等级已更新。" : "等级已创建。");
      setOpen(false);
      setEditing(null);
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteLevel,
    onSuccess: async () => {
      toast.success("等级已删除。");
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  return (
    <>
      <Card className="rounded-[34px]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>等级管理</CardTitle>
            <CardDescription>
              等级依据成长值自动计算，兑换奖励不会影响这里的进度。
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
            新建等级
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...levels]
            .sort((left, right) => left.threshold - right.threshold)
            .map((level) => (
              <div
                key={level.id}
                className="flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-[18px] text-xl"
                    style={{ backgroundColor: `${level.accentColor}33` }}
                  >
                    {level.badgeEmoji}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{level.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      门槛 {level.threshold} 点成长值 · 排序 {level.sortOrder}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditing(level);
                      setOpen(true);
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(level.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
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
            <DialogTitle>{editing ? "编辑等级" : "新建等级"}</DialogTitle>
            <DialogDescription>
              按成长值门槛递增设置，就可以在首页自动计算当前等级和下一阶段。
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const input: LevelInput = {
                name: readString(formData, "name"),
                threshold: readNumber(formData, "threshold"),
                badgeEmoji: readString(formData, "badgeEmoji"),
                accentColor: readString(formData, "accentColor"),
                sortOrder: readNumber(formData, "sortOrder"),
              };

              saveMutation.mutate({
                id: editing?.id,
                input,
              });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level-name">等级名</Label>
                <Input defaultValue={editing?.name ?? ""} id="level-name" name="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level-emoji">徽章 Emoji</Label>
                <Input
                  defaultValue={editing?.badgeEmoji ?? ""}
                  id="level-emoji"
                  name="badgeEmoji"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level-threshold">成长值门槛</Label>
                <Input
                  defaultValue={editing?.threshold ?? 0}
                  id="level-threshold"
                  name="threshold"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level-sort">排序</Label>
                <Input
                  defaultValue={editing?.sortOrder ?? 1}
                  id="level-sort"
                  name="sortOrder"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level-color">强调色</Label>
                <Input
                  defaultValue={editing?.accentColor ?? "#f3a5b6"}
                  id="level-color"
                  name="accentColor"
                  type="color"
                />
              </div>
            </div>

            <DialogFooter>
              <Button disabled={saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "保存中..." : "保存等级"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

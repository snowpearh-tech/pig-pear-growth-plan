import type { Category, Rule, RuleInput } from "@shared/contracts";
import { useMemo, useState } from "react";
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

type RuleKind = Rule["kind"];

export function RuleManager({
  categories,
  rules,
}: {
  categories: Category[];
  rules: Rule[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [defaultKind, setDefaultKind] = useState<RuleKind>("positive");

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["state"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: RuleInput }) =>
      typeof id === "number" ? api.updateRule(id, input) : api.createRule(input),
    onSuccess: async () => {
      toast.success(editing ? "规则已更新。" : "规则已创建。");
      setOpen(false);
      setEditing(null);
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteRule,
    onSuccess: async () => {
      toast.success("规则已删除。");
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const grouped = {
    positive: [...rules]
      .filter((rule) => rule.kind === "positive")
      .sort((left, right) => left.sortOrder - right.sortOrder),
    negative: [...rules]
      .filter((rule) => rule.kind === "negative")
      .sort((left, right) => left.sortOrder - right.sortOrder),
  };

  const openCreate = (kind: RuleKind) => {
    setEditing(null);
    setDefaultKind(kind);
    setOpen(true);
  };

  const openEdit = (rule: Rule) => {
    setEditing(rule);
    setDefaultKind(rule.kind);
    setOpen(true);
  };

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        {(["positive", "negative"] as const).map((kind) => (
          <Card className="rounded-[34px]" key={kind}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{kind === "positive" ? "加分规则" : "扣分规则"}</CardTitle>
                <CardDescription>
                  这些规则会直接显示在首页，支持随时启用、停用和调整顺序。
                </CardDescription>
              </div>
              <Button onClick={() => openCreate(kind)} size="sm">
                <Plus className="h-4 w-4" />
                新建规则
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {grouped[kind].map((rule) => {
                const category = rule.categoryId ? categoryMap.get(rule.categoryId) : undefined;

                return (
                  <div
                    key={rule.id}
                    className="rounded-[28px] border border-white/70 bg-white/72 p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-rose-50 text-xl">
                          {rule.emoji}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{rule.title}</p>
                            <Badge variant={rule.isActive ? "success" : "outline"}>
                              {rule.isActive ? "启用中" : "已停用"}
                            </Badge>
                            {category ? (
                              <Badge variant="soft">
                                {category.icon} {category.name}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            分值 {rule.delta} · 排序 {rule.sortOrder}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => openEdit(rule)} size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteMutation.mutate(rule.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                    {rule.description ? (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {rule.description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

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
            <DialogTitle>{editing ? "编辑规则" : "新建规则"}</DialogTitle>
            <DialogDescription>
              分值填写绝对值即可，系统会按“加分/扣分”自动处理正负号。
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const kind = readString(formData, "kind") as RuleKind;
              const rawDelta = Math.abs(readNumber(formData, "delta"));
              const categoryIdRaw = readString(formData, "categoryId");
              const input: RuleInput = {
                kind,
                title: readString(formData, "title"),
                emoji: readString(formData, "emoji"),
                categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
                delta: kind === "positive" ? rawDelta : -rawDelta,
                description: readOptionalString(formData, "description"),
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
                <Label htmlFor="rule-kind">类型</Label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-white/70 bg-white/85 px-4 text-sm"
                  defaultValue={editing?.kind ?? defaultKind}
                  id="rule-kind"
                  name="kind"
                >
                  <option value="positive">加分规则</option>
                  <option value="negative">扣分规则</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-title">标题</Label>
                <Input defaultValue={editing?.title ?? ""} id="rule-title" name="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-emoji">Emoji</Label>
                <Input defaultValue={editing?.emoji ?? ""} id="rule-emoji" name="emoji" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-category">分类</Label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-white/70 bg-white/85 px-4 text-sm"
                  defaultValue={editing?.categoryId ?? ""}
                  id="rule-category"
                  name="categoryId"
                >
                  <option value="">不分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-delta">分值</Label>
                <Input
                  defaultValue={Math.abs(editing?.delta ?? (defaultKind === "positive" ? 8 : 5))}
                  id="rule-delta"
                  name="delta"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-sort">排序</Label>
                <Input
                  defaultValue={editing?.sortOrder ?? 1}
                  id="rule-sort"
                  name="sortOrder"
                  type="number"
                />
              </div>
              <label className="mt-6 flex items-center gap-3 rounded-[20px] border border-white/70 bg-white/70 px-4 py-3 text-sm">
                <input
                  defaultChecked={editing?.isActive ?? true}
                  name="isActive"
                  type="checkbox"
                />
                启用这个规则
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">说明</Label>
              <Textarea
                defaultValue={editing?.description ?? ""}
                id="rule-description"
                name="description"
              />
            </div>

            <DialogFooter>
              <Button disabled={saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "保存中..." : "保存规则"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import type { Quote, QuoteInput } from "@shared/contracts";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { readCheckbox, readNumber, readString } from "@/lib/forms";
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

export function QuoteManager({ quotes }: { quotes: Quote[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["state"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: QuoteInput }) =>
      typeof id === "number" ? api.updateQuote(id, input) : api.createQuote(input),
    onSuccess: async () => {
      toast.success(editing ? "今日一句已更新。" : "今日一句已创建。");
      setOpen(false);
      setEditing(null);
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteQuote,
    onSuccess: async () => {
      toast.success("今日一句已删除。");
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  return (
    <>
      <Card className="rounded-[34px]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>今日一句管理</CardTitle>
            <CardDescription>
              首页会从启用中的句子里按日期随机挑一条显示。
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
            新增一句
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...quotes]
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((quote) => (
              <div
                key={quote.id}
                className="rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={quote.isActive ? "success" : "outline"}>
                        {quote.isActive ? "启用中" : "已停用"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        排序 {quote.sortOrder}
                      </span>
                    </div>
                    <p className="mt-3 text-base leading-8 text-foreground">
                      {quote.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditing(quote);
                        setOpen(true);
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteMutation.mutate(quote.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
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
            <DialogTitle>{editing ? "编辑今日一句" : "新增今日一句"}</DialogTitle>
            <DialogDescription>
              适合写温柔鼓励、肯定努力或带一点可爱仪式感的句子。
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const input: QuoteInput = {
                content: readString(formData, "content"),
                sortOrder: readNumber(formData, "sortOrder"),
                isActive: readCheckbox(formData, "isActive"),
              };

              saveMutation.mutate({
                id: editing?.id,
                input,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="quote-content">句子内容</Label>
              <Textarea
                defaultValue={editing?.content ?? ""}
                id="quote-content"
                name="content"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quote-sort">排序</Label>
                <Input
                  defaultValue={editing?.sortOrder ?? 1}
                  id="quote-sort"
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
                参与首页随机显示
              </label>
            </div>

            <DialogFooter>
              <Button disabled={saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "保存中..." : "保存句子"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

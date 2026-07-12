import type { Category, CategoryInput } from "@shared/contracts";
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

export function CategoryManager({ categories }: { categories: Category[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.sortOrder - right.sortOrder),
    [categories],
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["state"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: CategoryInput }) =>
      typeof id === "number"
        ? api.updateCategory(id, input)
        : api.createCategory(input),
    onSuccess: async () => {
      toast.success(editing ? "分类已更新。" : "分类已创建。");
      setOpen(false);
      setEditing(null);
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: async () => {
      toast.success("分类已删除。");
      await refresh();
    },
    onError: (error: ApiClientError) => toast.error(error.message),
  });

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setOpen(true);
  };

  return (
    <>
      <Card className="rounded-[34px]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>分类管理</CardTitle>
            <CardDescription>
              分类会影响首页规则卡片的标签、颜色和氛围感。
            </CardDescription>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            新建分类
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {sortedCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-[18px] text-xl"
                    style={{ backgroundColor: `${category.accentColor}33` }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{category.name}</p>
                      <Badge variant={category.isActive ? "success" : "outline"}>
                        {category.isActive ? "启用中" : "已停用"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      slug: {category.slug} · 排序 {category.sortOrder}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => openEdit(category)} size="icon" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(category.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {category.description ?? "还没有补充说明。"}
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
            <DialogTitle>{editing ? "编辑分类" : "新建分类"}</DialogTitle>
            <DialogDescription>
              这些信息会影响规则标签显示，也会被后台其他表单引用。
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const input: CategoryInput = {
                name: readString(formData, "name"),
                slug: readString(formData, "slug"),
                description: readOptionalString(formData, "description"),
                accentColor: readString(formData, "accentColor"),
                icon: readString(formData, "icon"),
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
                <Label htmlFor="category-name">分类名</Label>
                <Input defaultValue={editing?.name ?? ""} id="category-name" name="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-slug">slug</Label>
                <Input
                  defaultValue={editing?.slug ?? ""}
                  id="category-slug"
                  name="slug"
                  placeholder="home-care"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-icon">图标 Emoji</Label>
                <Input defaultValue={editing?.icon ?? ""} id="category-icon" name="icon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-color">颜色</Label>
                <Input
                  defaultValue={editing?.accentColor ?? "#f6b2bf"}
                  id="category-color"
                  name="accentColor"
                  type="color"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-sort">排序</Label>
                <Input
                  defaultValue={editing?.sortOrder ?? 1}
                  id="category-sort"
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
                启用这个分类
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">说明</Label>
              <Textarea
                defaultValue={editing?.description ?? ""}
                id="category-description"
                name="description"
              />
            </div>

            <DialogFooter>
              <Button disabled={saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "保存中..." : "保存分类"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { ApiClientError } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: async () => {
      toast.success("欢迎回来，梨梨。");
      setPassword("");
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["state"] });
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-rose-500" />
            梨梨管理员登录
          </DialogTitle>
          <DialogDescription>
            只需要管理员密码，不需要用户名。登录后就可以记分、兑换奖励和管理全部内容。
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate({ password });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="admin-password">管理员密码</Label>
            <Input
              autoComplete="current-password"
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="输入 Cloudflare Secret 中的密码"
              type="password"
              value={password}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={loginMutation.isPending || !password}
              size="lg"
              type="submit"
            >
              {loginMutation.isPending ? "正在登录..." : "进入管理模式"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

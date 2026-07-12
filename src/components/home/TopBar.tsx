import type { Settings } from "@shared/contracts";
import { LogIn, LogOut, Shield } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PigPhoto } from "./PigPhoto";

interface TopBarProps {
  authenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  settings: Settings | null;
}

export function TopBar({
  authenticated,
  onLogin,
  onLogout,
  settings,
}: TopBarProps) {
  return (
    <Card className="overflow-hidden rounded-[32px]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-[24px] border border-white/70 bg-rose-50">
            <PigPhoto />
          </div>
          <div className="space-y-1">
            <p className="font-display text-2xl text-foreground">
              {settings?.appName ?? "猪梨成长计划 ❤️"}
            </p>
            <p className="text-sm text-muted-foreground">
              {settings?.subtitle ?? "每一点努力，都值得被认真记录。"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {authenticated ? (
            <>
              <Button asChild size="sm" variant="secondary">
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  管理后台
                </Link>
              </Button>
              <Button onClick={onLogout} size="sm" variant="ghost">
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </>
          ) : (
            <Button onClick={onLogin} size="sm">
              <LogIn className="h-4 w-4" />
              梨梨登录
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

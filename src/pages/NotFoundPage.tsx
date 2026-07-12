import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full rounded-[36px]">
        <CardHeader>
          <CardTitle>这页悄悄迷路了</CardTitle>
          <CardDescription>
            可能是地址输错了，也可能是页面被重新整理过。我们先回首页看看猪猪今天攒了多少分。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">回到首页</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

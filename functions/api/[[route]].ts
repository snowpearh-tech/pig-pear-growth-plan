import {
  categoryInputSchema,
  createTransactionInputSchema,
  historyQuerySchema,
  loginInputSchema,
  quoteInputSchema,
  redeemInputSchema,
  rewardInputSchema,
  ruleInputSchema,
  settingsInputSchema,
  levelInputSchema,
} from "@shared/contracts";

import {
  clearSessionCookie,
  createSessionCookie,
  isAuthenticated,
  requireAuth,
} from "../_lib/auth";
import { ApiError, handleError, json, parseBody, requireNumericId } from "../_lib/http";
import {
  createCategory,
  createLevel,
  createQuote,
  createReward,
  createRule,
  createTransactionFromInput,
  deleteCategory,
  deleteLevel,
  deleteQuote,
  deleteReward,
  deleteRule,
  getState,
  isDatabaseReady,
  listTransactions,
  redeemReward,
  seedDatabase,
  updateCategory,
  updateLevel,
  updateQuote,
  updateReward,
  updateRule,
  updateSettings,
} from "../_lib/repository";
import type { AppEnv } from "../_lib/types";

function getSegments(pathname: string): string[] {
  const cleanPath = pathname.replace(/^\/api\/?/, "").replace(/\/+$/, "");
  return cleanPath ? cleanPath.split("/") : [];
}

export const onRequest: PagesFunction<AppEnv> = async (context) => {
  const { request, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const segments = getSegments(pathname);
  const [resource, idSegment] = segments;
  const authenticated = await isAuthenticated(request, env);

  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if ((segments.length === 0 || resource === "state") && request.method === "GET") {
      return json(await getState(env, authenticated));
    }

    if (resource === "login" && request.method === "POST") {
      const body = await parseBody(request, loginInputSchema);

      if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
        throw new ApiError(500, "请先在 Cloudflare 中配置 ADMIN_PASSWORD 和 SESSION_SECRET。");
      }

      if (body.password !== env.ADMIN_PASSWORD) {
        throw new ApiError(401, "管理员密码不对，再试一次吧。");
      }

      const headers = new Headers();
      headers.append("Set-Cookie", await createSessionCookie(env));

      return json(
        {
          authenticated: true,
        },
        { headers },
      );
    }

    if (resource === "login" && request.method === "DELETE") {
      const headers = new Headers();
      headers.append("Set-Cookie", clearSessionCookie());

      return json(
        {
          authenticated: false,
        },
        { headers },
      );
    }

    if (resource === "init" && request.method === "POST") {
      await requireAuth(request, env);

      if (!(await isDatabaseReady(env))) {
        throw new ApiError(400, "数据库还没有准备好，请先执行 D1 migrations。");
      }

      await seedDatabase(env);
      return json(await getState(env, true));
    }

    if (resource === "transactions" && request.method === "POST") {
      await requireAuth(request, env);
      const input = await parseBody(request, createTransactionInputSchema);
      const transaction = await createTransactionFromInput(env, input);

      return json(transaction, { status: 201 });
    }

    if (resource === "redeem" && request.method === "POST") {
      await requireAuth(request, env);
      const input = await parseBody(request, redeemInputSchema);
      const transaction = await redeemReward(env, input.rewardId, input.note);

      return json(transaction, { status: 201 });
    }

    if (resource === "history" && request.method === "GET") {
      const query = historyQuerySchema.parse({
        limit: searchParams.get("limit")
          ? Number(searchParams.get("limit"))
          : undefined,
      });

      return json(await listTransactions(env, query.limit));
    }

    if (resource === "rules" && request.method === "POST") {
      await requireAuth(request, env);
      return json(await createRule(env, await parseBody(request, ruleInputSchema)), {
        status: 201,
      });
    }

    if (resource === "rules" && idSegment && request.method === "PUT") {
      await requireAuth(request, env);
      const id = requireNumericId(idSegment);
      return json(await updateRule(env, id, await parseBody(request, ruleInputSchema)));
    }

    if (resource === "rules" && idSegment && request.method === "DELETE") {
      await requireAuth(request, env);
      await deleteRule(env, requireNumericId(idSegment));
      return json({ success: true });
    }

    if (resource === "rewards" && request.method === "POST") {
      await requireAuth(request, env);
      return json(
        await createReward(env, await parseBody(request, rewardInputSchema)),
        { status: 201 },
      );
    }

    if (resource === "rewards" && idSegment && request.method === "PUT") {
      await requireAuth(request, env);
      return json(
        await updateReward(
          env,
          requireNumericId(idSegment),
          await parseBody(request, rewardInputSchema),
        ),
      );
    }

    if (resource === "rewards" && idSegment && request.method === "DELETE") {
      await requireAuth(request, env);
      await deleteReward(env, requireNumericId(idSegment));
      return json({ success: true });
    }

    if (resource === "quotes" && request.method === "POST") {
      await requireAuth(request, env);
      return json(await createQuote(env, await parseBody(request, quoteInputSchema)), {
        status: 201,
      });
    }

    if (resource === "quotes" && idSegment && request.method === "PUT") {
      await requireAuth(request, env);
      return json(
        await updateQuote(
          env,
          requireNumericId(idSegment),
          await parseBody(request, quoteInputSchema),
        ),
      );
    }

    if (resource === "quotes" && idSegment && request.method === "DELETE") {
      await requireAuth(request, env);
      await deleteQuote(env, requireNumericId(idSegment));
      return json({ success: true });
    }

    if (resource === "categories" && request.method === "POST") {
      await requireAuth(request, env);
      return json(
        await createCategory(env, await parseBody(request, categoryInputSchema)),
        { status: 201 },
      );
    }

    if (resource === "categories" && idSegment && request.method === "PUT") {
      await requireAuth(request, env);
      return json(
        await updateCategory(
          env,
          requireNumericId(idSegment),
          await parseBody(request, categoryInputSchema),
        ),
      );
    }

    if (resource === "categories" && idSegment && request.method === "DELETE") {
      await requireAuth(request, env);
      await deleteCategory(env, requireNumericId(idSegment));
      return json({ success: true });
    }

    if (resource === "levels" && request.method === "POST") {
      await requireAuth(request, env);
      return json(await createLevel(env, await parseBody(request, levelInputSchema)), {
        status: 201,
      });
    }

    if (resource === "levels" && idSegment && request.method === "PUT") {
      await requireAuth(request, env);
      return json(
        await updateLevel(
          env,
          requireNumericId(idSegment),
          await parseBody(request, levelInputSchema),
        ),
      );
    }

    if (resource === "levels" && idSegment && request.method === "DELETE") {
      await requireAuth(request, env);
      await deleteLevel(env, requireNumericId(idSegment));
      return json({ success: true });
    }

    if (resource === "settings" && request.method === "PUT") {
      await requireAuth(request, env);
      return json(
        await updateSettings(env, await parseBody(request, settingsInputSchema)),
      );
    }

    throw new ApiError(404, "没有找到对应的 API 路由。");
  } catch (error) {
    return handleError(error);
  }
};

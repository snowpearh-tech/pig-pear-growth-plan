import { z } from "zod";

const optionalNullableText = z.string().max(200).optional().nullable();
const accentColorSchema = z
  .string()
  .min(4)
  .max(24)
  .regex(/^#?[0-9a-fA-F]{3,8}$/);

export const ruleKindSchema = z.enum(["positive", "negative"]);
export const transactionKindSchema = z.enum(["rule", "manual", "reward"]);

export const settingsSchema = z.object({
  id: z.literal(1),
  appName: z.string().min(1).max(48),
  subtitle: z.string().min(1).max(120),
  pigName: z.string().min(1).max(24),
  pearName: z.string().min(1).max(24),
  heroTitle: z.string().min(1).max(80),
  heroDescription: z.string().min(1).max(240),
  welcomeTitle: z.string().min(1).max(48),
  welcomeDescription: z.string().min(1).max(240),
  timezone: z.string().min(1).max(48),
  updatedAt: z.string(),
});

export const settingsInputSchema = settingsSchema.omit({
  id: true,
  updatedAt: true,
});

export const categorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(24),
  slug: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9-]+$/),
  description: optionalNullableText,
  accentColor: accentColorSchema,
  icon: z.string().min(1).max(12),
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

export const categoryInputSchema = categorySchema.omit({ id: true });

const baseRuleObject = z.object({
  kind: ruleKindSchema,
  title: z.string().min(1).max(32),
  emoji: z.string().min(1).max(12),
  categoryId: z.number().int().positive().nullable().optional(),
  delta: z.number().int().min(-200).max(200),
  description: optionalNullableText,
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

function validateRuleDelta(
  value: {
    kind: "positive" | "negative";
    delta: number;
  },
  ctx: z.RefinementCtx,
) {
  if (value.kind === "positive" && value.delta <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "加分项必须使用正分值。",
      path: ["delta"],
    });
  }

  if (value.kind === "negative" && value.delta >= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "扣分项必须使用负分值。",
      path: ["delta"],
    });
  }
}

export const ruleInputSchema = baseRuleObject.superRefine(validateRuleDelta);

export const ruleSchema = baseRuleObject
  .extend({
    id: z.number().int().positive(),
  })
  .superRefine(validateRuleDelta);

export const rewardInputSchema = z.object({
  title: z.string().min(1).max(32),
  emoji: z.string().min(1).max(12),
  cost: z.number().int().positive().max(9999),
  description: optionalNullableText,
  accentColor: accentColorSchema,
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

export const rewardSchema = rewardInputSchema.extend({
  id: z.number().int().positive(),
});

export const levelInputSchema = z.object({
  name: z.string().min(1).max(32),
  threshold: z.number().int().min(0).max(999999),
  badgeEmoji: z.string().min(1).max(12),
  accentColor: accentColorSchema,
  sortOrder: z.number().int().min(0).max(999),
});

export const levelSchema = levelInputSchema.extend({
  id: z.number().int().positive(),
});

export const quoteInputSchema = z.object({
  content: z.string().min(1).max(200),
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

export const quoteSchema = quoteInputSchema.extend({
  id: z.number().int().positive(),
});

export const transactionSchema = z.object({
  id: z.number().int().positive(),
  kind: transactionKindSchema,
  title: z.string().min(1).max(40),
  emoji: z.string().min(1).max(12),
  delta: z.number().int(),
  growthDelta: z.number().int().min(0),
  note: optionalNullableText,
  sourceRuleId: z.number().int().positive().nullable(),
  sourceRewardId: z.number().int().positive().nullable(),
  pointsAfter: z.number().int(),
  growthAfter: z.number().int(),
  createdAt: z.string(),
});

export const loginInputSchema = z.object({
  password: z.string().min(1).max(256),
});

export const initInputSchema = z.object({
  force: z.boolean().optional(),
});

export const createTransactionInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("rule"),
    ruleId: z.number().int().positive(),
    note: z.string().max(160).optional().nullable(),
  }),
  z.object({
    kind: z.literal("manual"),
    title: z.string().min(1).max(40),
    emoji: z.string().min(1).max(12),
    delta: z.number().int().min(-200).max(200),
    growthDelta: z.number().int().min(0).max(200).optional(),
    note: z.string().max(160).optional().nullable(),
  }),
]);

export const redeemInputSchema = z.object({
  rewardId: z.number().int().positive(),
  note: z.string().max(160).optional().nullable(),
});

export const historyQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(40),
});

export const summarySchema = z.object({
  currentPoints: z.number().int(),
  growthPoints: z.number().int(),
  currentLevel: levelSchema.nullable(),
  nextLevel: levelSchema.nullable(),
  progressPercent: z.number().min(0).max(100),
  unlockedRewardCount: z.number().int().min(0),
  transactionCount: z.number().int().min(0),
});

export const stateResponseSchema = z.object({
  databaseReady: z.boolean(),
  initialized: z.boolean(),
  authenticated: z.boolean(),
  settings: settingsSchema.nullable(),
  categories: z.array(categorySchema),
  rules: z.array(ruleSchema),
  rewards: z.array(rewardSchema),
  levels: z.array(levelSchema),
  quotes: z.array(quoteSchema),
  recentTransactions: z.array(transactionSchema),
  todayQuote: quoteSchema.nullable(),
  summary: summarySchema.nullable(),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
export type Level = z.infer<typeof levelSchema>;
export type LevelInput = z.infer<typeof levelInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type QuoteInput = z.infer<typeof quoteInputSchema>;
export type RedeemInput = z.infer<typeof redeemInputSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type RewardInput = z.infer<typeof rewardInputSchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type RuleInput = z.infer<typeof ruleInputSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type SettingsInput = z.infer<typeof settingsInputSchema>;
export type StateResponse = z.infer<typeof stateResponseSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type Transaction = z.infer<typeof transactionSchema>;

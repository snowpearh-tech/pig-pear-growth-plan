export const APP_TIMEZONE = "Asia/Shanghai";
export const DEFAULT_HISTORY_LIMIT = 16;
export const FULL_HISTORY_LIMIT = 80;
export const SESSION_COOKIE_NAME = "pp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;
export const DATABASE_TABLES = [
  "settings",
  "categories",
  "rules",
  "rewards",
  "levels",
  "quotes",
  "transactions",
] as const;

export const RULE_KINDS = ["positive", "negative"] as const;
export const TRANSACTION_KINDS = ["rule", "manual", "reward"] as const;

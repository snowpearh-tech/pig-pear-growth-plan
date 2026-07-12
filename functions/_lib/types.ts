export interface AppEnv {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  APP_TIMEZONE?: string;
}

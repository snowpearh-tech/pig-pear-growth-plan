import type {
  Category,
  CategoryInput,
  CreateTransactionInput,
  Level,
  LevelInput,
  LoginInput,
  Quote,
  QuoteInput,
  RedeemInput,
  Reward,
  RewardInput,
  Rule,
  RuleInput,
  Settings,
  SettingsInput,
  StateResponse,
  Transaction,
} from "@shared/contracts";

class ApiClientError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error ?? "请求失败，请稍后再试。",
      payload?.details,
    );
  }

  return payload as T;
}

export const api = {
  getState: () => request<StateResponse>("/api/state"),
  login: (input: LoginInput) =>
    request<{ authenticated: boolean }>("/api/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () =>
    request<{ authenticated: boolean }>("/api/login", {
      method: "DELETE",
    }),
  initialize: () =>
    request<StateResponse>("/api/init", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  getHistory: (limit = 48) =>
    request<Transaction[]>(`/api/history?limit=${limit}`),
  createTransaction: (input: CreateTransactionInput) =>
    request<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  redeem: (input: RedeemInput) =>
    request<Transaction>("/api/redeem", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  createRule: (input: RuleInput) =>
    request<Rule>("/api/rules", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateRule: (id: number, input: RuleInput) =>
    request<Rule>(`/api/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteRule: (id: number) =>
    request<{ success: boolean }>(`/api/rules/${id}`, {
      method: "DELETE",
    }),
  createReward: (input: RewardInput) =>
    request<Reward>("/api/rewards", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateReward: (id: number, input: RewardInput) =>
    request<Reward>(`/api/rewards/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteReward: (id: number) =>
    request<{ success: boolean }>(`/api/rewards/${id}`, {
      method: "DELETE",
    }),
  createQuote: (input: QuoteInput) =>
    request<Quote>("/api/quotes", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateQuote: (id: number, input: QuoteInput) =>
    request<Quote>(`/api/quotes/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteQuote: (id: number) =>
    request<{ success: boolean }>(`/api/quotes/${id}`, {
      method: "DELETE",
    }),
  createCategory: (input: CategoryInput) =>
    request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateCategory: (id: number, input: CategoryInput) =>
    request<Category>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteCategory: (id: number) =>
    request<{ success: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
    }),
  createLevel: (input: LevelInput) =>
    request<Level>("/api/levels", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateLevel: (id: number, input: LevelInput) =>
    request<Level>(`/api/levels/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteLevel: (id: number) =>
    request<{ success: boolean }>(`/api/levels/${id}`, {
      method: "DELETE",
    }),
  updateSettings: (input: SettingsInput) =>
    request<Settings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};

export { ApiClientError };

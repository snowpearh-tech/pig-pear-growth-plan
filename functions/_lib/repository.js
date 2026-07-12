import { APP_TIMEZONE, DEFAULT_HISTORY_LIMIT, } from "@shared/constants";
import { DEFAULT_CATEGORIES, DEFAULT_LEVELS, DEFAULT_QUOTES, DEFAULT_REWARDS, DEFAULT_RULES, DEFAULT_SETTINGS, } from "./defaults";
import { ApiError } from "./http";
function normalizeTimestamp(value) {
    return value.includes(" ") && !value.endsWith("Z")
        ? value.replace(" ", "T") + "Z"
        : value;
}
function nowIso() {
    return new Date().toISOString();
}
function toBoolean(value) {
    return value === 1;
}
function toSqlBoolean(value) {
    return value ? 1 : 0;
}
function mapSettings(row) {
    return {
        id: 1,
        appName: row.app_name,
        subtitle: row.subtitle,
        pigName: row.pig_name,
        pearName: row.pear_name,
        heroTitle: row.hero_title,
        heroDescription: row.hero_description,
        welcomeTitle: row.welcome_title,
        welcomeDescription: row.welcome_description,
        timezone: row.timezone,
        updatedAt: normalizeTimestamp(row.updated_at),
    };
}
function mapCategory(row) {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        accentColor: row.accent_color,
        icon: row.icon,
        sortOrder: row.sort_order,
        isActive: toBoolean(row.is_active),
    };
}
function mapRule(row) {
    return {
        id: row.id,
        kind: row.kind,
        title: row.title,
        emoji: row.emoji,
        categoryId: row.category_id,
        delta: row.delta,
        description: row.description,
        sortOrder: row.sort_order,
        isActive: toBoolean(row.is_active),
    };
}
function mapReward(row) {
    return {
        id: row.id,
        title: row.title,
        emoji: row.emoji,
        cost: row.cost,
        description: row.description,
        accentColor: row.accent_color,
        sortOrder: row.sort_order,
        isActive: toBoolean(row.is_active),
    };
}
function mapLevel(row) {
    return {
        id: row.id,
        name: row.name,
        threshold: row.threshold,
        badgeEmoji: row.badge_emoji,
        accentColor: row.accent_color,
        sortOrder: row.sort_order,
    };
}
function mapQuote(row) {
    return {
        id: row.id,
        content: row.content,
        sortOrder: row.sort_order,
        isActive: toBoolean(row.is_active),
    };
}
function mapTransaction(row) {
    return {
        id: row.id,
        kind: row.kind,
        title: row.title,
        emoji: row.emoji,
        delta: row.delta,
        growthDelta: row.growth_delta,
        note: row.note,
        sourceRuleId: row.source_rule_id,
        sourceRewardId: row.source_reward_id,
        pointsAfter: row.points_after,
        growthAfter: row.growth_after,
        createdAt: normalizeTimestamp(row.created_at),
    };
}
async function first(statement) {
    return (await statement.first()) ?? null;
}
async function all(statement) {
    const result = await statement.all();
    return result.results ?? [];
}
function dailySeed(timezone) {
    const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
    return [...key].reduce((sum, character, index) => {
        return sum + character.charCodeAt(0) * (index + 7);
    }, 0);
}
function pickTodayQuote(quotes, timezone) {
    const activeQuotes = quotes.filter((quote) => quote.isActive);
    if (!activeQuotes.length) {
        return null;
    }
    const index = dailySeed(timezone) % activeQuotes.length;
    return activeQuotes[index] ?? activeQuotes[0];
}
function computeSummaryShape(currentPoints, growthPoints, transactionCount, unlockedRewardCount, levels) {
    const currentLevel = [...levels].reverse().find((level) => growthPoints >= level.threshold) ??
        levels[0] ??
        null;
    const nextLevel = levels.find((level) => level.threshold > growthPoints) ?? null;
    let progressPercent = currentLevel ? 100 : 0;
    if (currentLevel && nextLevel && nextLevel.threshold > currentLevel.threshold) {
        progressPercent =
            ((growthPoints - currentLevel.threshold) /
                (nextLevel.threshold - currentLevel.threshold)) *
                100;
    }
    return {
        currentPoints,
        growthPoints,
        currentLevel,
        nextLevel,
        progressPercent: Number(Math.min(100, Math.max(0, progressPercent)).toFixed(1)),
        unlockedRewardCount,
        transactionCount,
    };
}
export async function isDatabaseReady(env) {
    const rows = await all(env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'"));
    return rows.length > 0;
}
export async function isInitialized(env) {
    if (!(await isDatabaseReady(env))) {
        return false;
    }
    const count = await first(env.DB.prepare("SELECT COUNT(*) AS count FROM settings"));
    return Number(count?.count ?? 0) > 0;
}
export async function getSettings(env) {
    const row = await first(env.DB.prepare("SELECT * FROM settings WHERE id = 1"));
    return row ? mapSettings(row) : null;
}
export async function listCategories(env) {
    const rows = await all(env.DB.prepare("SELECT id, name, slug, description, accent_color, icon, sort_order, is_active FROM categories ORDER BY sort_order ASC, id ASC"));
    return rows.map(mapCategory);
}
export async function listRules(env) {
    const rows = await all(env.DB.prepare("SELECT id, kind, title, emoji, category_id, delta, description, sort_order, is_active FROM rules ORDER BY sort_order ASC, id ASC"));
    return rows.map(mapRule);
}
export async function listRewards(env) {
    const rows = await all(env.DB.prepare("SELECT id, title, emoji, cost, description, accent_color, sort_order, is_active FROM rewards ORDER BY sort_order ASC, id ASC"));
    return rows.map(mapReward);
}
export async function listLevels(env) {
    const rows = await all(env.DB.prepare("SELECT id, name, threshold, badge_emoji, accent_color, sort_order FROM levels ORDER BY threshold ASC, sort_order ASC, id ASC"));
    return rows.map(mapLevel);
}
export async function listQuotes(env) {
    const rows = await all(env.DB.prepare("SELECT id, content, sort_order, is_active FROM quotes ORDER BY sort_order ASC, id ASC"));
    return rows.map(mapQuote);
}
export async function listTransactions(env, limit = DEFAULT_HISTORY_LIMIT) {
    const rows = await all(env.DB.prepare("SELECT id, kind, title, emoji, delta, growth_delta, note, source_rule_id, source_reward_id, points_after, growth_after, created_at FROM transactions ORDER BY datetime(created_at) DESC, id DESC LIMIT ?").bind(limit));
    return rows.map(mapTransaction);
}
export async function getSummary(env) {
    const [aggregate, rewardsRow, levels] = await Promise.all([
        first(env.DB.prepare("SELECT COALESCE(SUM(delta), 0) AS current_points, COALESCE(SUM(growth_delta), 0) AS growth_points, COUNT(*) AS transaction_count FROM transactions")),
        first(env.DB.prepare("SELECT COUNT(*) AS count FROM rewards WHERE is_active = 1 AND cost <= COALESCE((SELECT SUM(delta) FROM transactions), 0)")),
        listLevels(env),
    ]);
    return computeSummaryShape(Number(aggregate?.current_points ?? 0), Number(aggregate?.growth_points ?? 0), Number(aggregate?.transaction_count ?? 0), Number(rewardsRow?.count ?? 0), levels);
}
export async function getState(env, authenticated) {
    const databaseReady = await isDatabaseReady(env);
    if (!databaseReady) {
        return {
            databaseReady,
            initialized: false,
            authenticated,
            settings: null,
            categories: [],
            rules: [],
            rewards: [],
            levels: [],
            quotes: [],
            recentTransactions: [],
            todayQuote: null,
            summary: null,
        };
    }
    const initialized = await isInitialized(env);
    if (!initialized) {
        return {
            databaseReady,
            initialized,
            authenticated,
            settings: null,
            categories: [],
            rules: [],
            rewards: [],
            levels: [],
            quotes: [],
            recentTransactions: [],
            todayQuote: null,
            summary: null,
        };
    }
    const [settings, categories, rules, rewards, levels, quotes, recentTransactions, summary] = await Promise.all([
        getSettings(env),
        listCategories(env),
        listRules(env),
        listRewards(env),
        listLevels(env),
        listQuotes(env),
        listTransactions(env),
        getSummary(env),
    ]);
    const timezone = settings?.timezone || env.APP_TIMEZONE || APP_TIMEZONE;
    return {
        databaseReady,
        initialized,
        authenticated,
        settings,
        categories,
        rules,
        rewards,
        levels,
        quotes,
        recentTransactions,
        todayQuote: pickTodayQuote(quotes, timezone),
        summary,
    };
}
export async function seedDatabase(env) {
    if (!(await isDatabaseReady(env))) {
        throw new ApiError(400, "数据库还没有准备好，请先执行 D1 migrations。");
    }
    if (await isInitialized(env)) {
        return;
    }
    const timestamp = nowIso();
    const statements = [];
    statements.push(env.DB.prepare("INSERT INTO settings (id, app_name, subtitle, pig_name, pear_name, hero_title, hero_description, welcome_title, welcome_description, timezone, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(DEFAULT_SETTINGS.appName, DEFAULT_SETTINGS.subtitle, DEFAULT_SETTINGS.pigName, DEFAULT_SETTINGS.pearName, DEFAULT_SETTINGS.heroTitle, DEFAULT_SETTINGS.heroDescription, DEFAULT_SETTINGS.welcomeTitle, DEFAULT_SETTINGS.welcomeDescription, DEFAULT_SETTINGS.timezone, timestamp));
    DEFAULT_CATEGORIES.forEach((category, index) => {
        statements.push(env.DB.prepare("INSERT INTO categories (id, name, slug, description, accent_color, icon, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(index + 1, category.name, category.slug, category.description ?? null, category.accentColor, category.icon, category.sortOrder, toSqlBoolean(category.isActive), timestamp, timestamp));
    });
    DEFAULT_RULES.forEach((rule, index) => {
        statements.push(env.DB.prepare("INSERT INTO rules (id, kind, title, emoji, category_id, delta, description, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(index + 1, rule.kind, rule.title, rule.emoji, rule.categoryId ?? null, rule.delta, rule.description ?? null, rule.sortOrder, toSqlBoolean(rule.isActive), timestamp, timestamp));
    });
    DEFAULT_REWARDS.forEach((reward, index) => {
        statements.push(env.DB.prepare("INSERT INTO rewards (id, title, emoji, cost, description, accent_color, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(index + 1, reward.title, reward.emoji, reward.cost, reward.description ?? null, reward.accentColor, reward.sortOrder, toSqlBoolean(reward.isActive), timestamp, timestamp));
    });
    DEFAULT_LEVELS.forEach((level, index) => {
        statements.push(env.DB.prepare("INSERT INTO levels (id, name, threshold, badge_emoji, accent_color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(index + 1, level.name, level.threshold, level.badgeEmoji, level.accentColor, level.sortOrder, timestamp, timestamp));
    });
    DEFAULT_QUOTES.forEach((quote, index) => {
        statements.push(env.DB.prepare("INSERT INTO quotes (id, content, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(index + 1, quote.content, quote.sortOrder, toSqlBoolean(quote.isActive), timestamp, timestamp));
    });
    await env.DB.batch(statements);
}
async function insertTransaction(env, payload) {
    const summary = await getSummary(env);
    const pointsAfter = summary.currentPoints + payload.delta;
    const growthAfter = summary.growthPoints + payload.growthDelta;
    const createdAt = nowIso();
    const result = await env.DB.prepare("INSERT INTO transactions (kind, title, emoji, delta, growth_delta, note, source_rule_id, source_reward_id, points_after, growth_after, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(payload.kind, payload.title, payload.emoji, payload.delta, payload.growthDelta, payload.note ?? null, payload.sourceRuleId ?? null, payload.sourceRewardId ?? null, pointsAfter, growthAfter, createdAt)
        .run();
    const inserted = await first(env.DB
        .prepare("SELECT id, kind, title, emoji, delta, growth_delta, note, source_rule_id, source_reward_id, points_after, growth_after, created_at FROM transactions WHERE id = ?")
        .bind(result.meta.last_row_id));
    if (!inserted) {
        throw new ApiError(500, "记录已写入，但读取结果失败。");
    }
    return mapTransaction(inserted);
}
export async function createTransactionFromInput(env, input) {
    if (input.kind === "rule") {
        const rule = await first(env.DB.prepare("SELECT id, kind, title, emoji, category_id, delta, description, sort_order, is_active FROM rules WHERE id = ?").bind(input.ruleId));
        if (!rule || !toBoolean(rule.is_active)) {
            throw new ApiError(404, "这条积分规则不存在，或暂时停用了。");
        }
        return insertTransaction(env, {
            kind: "rule",
            title: rule.title,
            emoji: rule.emoji,
            delta: rule.delta,
            growthDelta: rule.delta > 0 ? rule.delta : 0,
            note: input.note ?? null,
            sourceRuleId: rule.id,
        });
    }
    return insertTransaction(env, {
        kind: "manual",
        title: input.title,
        emoji: input.emoji,
        delta: input.delta,
        growthDelta: typeof input.growthDelta === "number"
            ? input.growthDelta
            : Math.max(input.delta, 0),
        note: input.note ?? null,
    });
}
export async function redeemReward(env, rewardId, note) {
    const reward = await first(env.DB.prepare("SELECT id, title, emoji, cost, description, accent_color, sort_order, is_active FROM rewards WHERE id = ?").bind(rewardId));
    if (!reward || !toBoolean(reward.is_active)) {
        throw new ApiError(404, "这个奖励暂时不可兑换。");
    }
    const summary = await getSummary(env);
    if (summary.currentPoints < reward.cost) {
        throw new ApiError(400, "当前积分还不够兑换这个奖励。");
    }
    return insertTransaction(env, {
        kind: "reward",
        title: `兑换：${reward.title}`,
        emoji: reward.emoji,
        delta: -reward.cost,
        growthDelta: 0,
        note: note ?? null,
        sourceRewardId: reward.id,
    });
}
export async function createCategory(env, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("INSERT INTO categories (name, slug, description, accent_color, icon, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(input.name, input.slug, input.description ?? null, input.accentColor, input.icon, input.sortOrder, toSqlBoolean(input.isActive), timestamp, timestamp)
        .run();
    const row = await first(env.DB
        .prepare("SELECT id, name, slug, description, accent_color, icon, sort_order, is_active FROM categories WHERE id = ?")
        .bind(result.meta.last_row_id));
    if (!row) {
        throw new ApiError(500, "分类创建成功，但读取结果失败。");
    }
    return mapCategory(row);
}
export async function updateCategory(env, id, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("UPDATE categories SET name = ?, slug = ?, description = ?, accent_color = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?")
        .bind(input.name, input.slug, input.description ?? null, input.accentColor, input.icon, input.sortOrder, toSqlBoolean(input.isActive), timestamp, id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要更新的分类不存在。");
    }
    const row = await first(env.DB.prepare("SELECT id, name, slug, description, accent_color, icon, sort_order, is_active FROM categories WHERE id = ?").bind(id));
    if (!row) {
        throw new ApiError(500, "分类更新成功，但读取结果失败。");
    }
    return mapCategory(row);
}
export async function deleteCategory(env, id) {
    const result = await env.DB.prepare("DELETE FROM categories WHERE id = ?")
        .bind(id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要删除的分类不存在。");
    }
}
export async function createRule(env, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("INSERT INTO rules (kind, title, emoji, category_id, delta, description, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(input.kind, input.title, input.emoji, input.categoryId ?? null, input.delta, input.description ?? null, input.sortOrder, toSqlBoolean(input.isActive), timestamp, timestamp)
        .run();
    const row = await first(env.DB
        .prepare("SELECT id, kind, title, emoji, category_id, delta, description, sort_order, is_active FROM rules WHERE id = ?")
        .bind(result.meta.last_row_id));
    if (!row) {
        throw new ApiError(500, "积分规则创建成功，但读取结果失败。");
    }
    return mapRule(row);
}
export async function updateRule(env, id, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("UPDATE rules SET kind = ?, title = ?, emoji = ?, category_id = ?, delta = ?, description = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?")
        .bind(input.kind, input.title, input.emoji, input.categoryId ?? null, input.delta, input.description ?? null, input.sortOrder, toSqlBoolean(input.isActive), timestamp, id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要更新的积分规则不存在。");
    }
    const row = await first(env.DB.prepare("SELECT id, kind, title, emoji, category_id, delta, description, sort_order, is_active FROM rules WHERE id = ?").bind(id));
    if (!row) {
        throw new ApiError(500, "积分规则更新成功，但读取结果失败。");
    }
    return mapRule(row);
}
export async function deleteRule(env, id) {
    const result = await env.DB.prepare("DELETE FROM rules WHERE id = ?")
        .bind(id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要删除的积分规则不存在。");
    }
}
export async function createReward(env, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("INSERT INTO rewards (title, emoji, cost, description, accent_color, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(input.title, input.emoji, input.cost, input.description ?? null, input.accentColor, input.sortOrder, toSqlBoolean(input.isActive), timestamp, timestamp)
        .run();
    const row = await first(env.DB
        .prepare("SELECT id, title, emoji, cost, description, accent_color, sort_order, is_active FROM rewards WHERE id = ?")
        .bind(result.meta.last_row_id));
    if (!row) {
        throw new ApiError(500, "奖励创建成功，但读取结果失败。");
    }
    return mapReward(row);
}
export async function updateReward(env, id, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("UPDATE rewards SET title = ?, emoji = ?, cost = ?, description = ?, accent_color = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?")
        .bind(input.title, input.emoji, input.cost, input.description ?? null, input.accentColor, input.sortOrder, toSqlBoolean(input.isActive), timestamp, id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要更新的奖励不存在。");
    }
    const row = await first(env.DB.prepare("SELECT id, title, emoji, cost, description, accent_color, sort_order, is_active FROM rewards WHERE id = ?").bind(id));
    if (!row) {
        throw new ApiError(500, "奖励更新成功，但读取结果失败。");
    }
    return mapReward(row);
}
export async function deleteReward(env, id) {
    const result = await env.DB.prepare("DELETE FROM rewards WHERE id = ?")
        .bind(id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要删除的奖励不存在。");
    }
}
export async function createLevel(env, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("INSERT INTO levels (name, threshold, badge_emoji, accent_color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(input.name, input.threshold, input.badgeEmoji, input.accentColor, input.sortOrder, timestamp, timestamp)
        .run();
    const row = await first(env.DB
        .prepare("SELECT id, name, threshold, badge_emoji, accent_color, sort_order FROM levels WHERE id = ?")
        .bind(result.meta.last_row_id));
    if (!row) {
        throw new ApiError(500, "等级创建成功，但读取结果失败。");
    }
    return mapLevel(row);
}
export async function updateLevel(env, id, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("UPDATE levels SET name = ?, threshold = ?, badge_emoji = ?, accent_color = ?, sort_order = ?, updated_at = ? WHERE id = ?")
        .bind(input.name, input.threshold, input.badgeEmoji, input.accentColor, input.sortOrder, timestamp, id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要更新的等级不存在。");
    }
    const row = await first(env.DB.prepare("SELECT id, name, threshold, badge_emoji, accent_color, sort_order FROM levels WHERE id = ?").bind(id));
    if (!row) {
        throw new ApiError(500, "等级更新成功，但读取结果失败。");
    }
    return mapLevel(row);
}
export async function deleteLevel(env, id) {
    const result = await env.DB.prepare("DELETE FROM levels WHERE id = ?")
        .bind(id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要删除的等级不存在。");
    }
}
export async function createQuote(env, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("INSERT INTO quotes (content, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
        .bind(input.content, input.sortOrder, toSqlBoolean(input.isActive), timestamp, timestamp)
        .run();
    const row = await first(env.DB
        .prepare("SELECT id, content, sort_order, is_active FROM quotes WHERE id = ?")
        .bind(result.meta.last_row_id));
    if (!row) {
        throw new ApiError(500, "今日一句创建成功，但读取结果失败。");
    }
    return mapQuote(row);
}
export async function updateQuote(env, id, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("UPDATE quotes SET content = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?")
        .bind(input.content, input.sortOrder, toSqlBoolean(input.isActive), timestamp, id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要更新的今日一句不存在。");
    }
    const row = await first(env.DB.prepare("SELECT id, content, sort_order, is_active FROM quotes WHERE id = ?").bind(id));
    if (!row) {
        throw new ApiError(500, "今日一句更新成功，但读取结果失败。");
    }
    return mapQuote(row);
}
export async function deleteQuote(env, id) {
    const result = await env.DB.prepare("DELETE FROM quotes WHERE id = ?")
        .bind(id)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "要删除的今日一句不存在。");
    }
}
export async function updateSettings(env, input) {
    const timestamp = nowIso();
    const result = await env.DB.prepare("UPDATE settings SET app_name = ?, subtitle = ?, pig_name = ?, pear_name = ?, hero_title = ?, hero_description = ?, welcome_title = ?, welcome_description = ?, timezone = ?, updated_at = ? WHERE id = 1")
        .bind(input.appName, input.subtitle, input.pigName, input.pearName, input.heroTitle, input.heroDescription, input.welcomeTitle, input.welcomeDescription, input.timezone, timestamp)
        .run();
    if (!result.meta.changes) {
        throw new ApiError(404, "系统设置还没有初始化，请先完成初始化。");
    }
    const settings = await getSettings(env);
    if (!settings) {
        throw new ApiError(500, "系统设置已更新，但读取结果失败。");
    }
    return settings;
}

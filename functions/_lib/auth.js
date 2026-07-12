import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, } from "@shared/constants";
import { ApiError } from "./http";
function getCookie(request, name) {
    const header = request.headers.get("cookie");
    if (!header) {
        return null;
    }
    const cookies = header.split(";").map((part) => part.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
function base64UrlEncode(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function hmacSign(secret, data) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    const bytes = new Uint8Array(signature);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function timingSafeEqual(left, right) {
    if (left.length !== right.length) {
        return false;
    }
    let mismatch = 0;
    for (let index = 0; index < left.length; index += 1) {
        mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }
    return mismatch === 0;
}
function serializeCookie(value, maxAge) {
    return [
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        "Secure",
        `Max-Age=${maxAge}`,
    ].join("; ");
}
export async function createSessionCookie(env) {
    if (!env.SESSION_SECRET) {
        throw new ApiError(500, "缺少 SESSION_SECRET，请先配置 Cloudflare Secret。");
    }
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload = `${issuedAt}:${base64UrlEncode(env.ADMIN_PASSWORD)}`;
    const signature = await hmacSign(env.SESSION_SECRET, payload);
    const token = `${issuedAt}.${signature}`;
    return serializeCookie(token, SESSION_MAX_AGE);
}
export function clearSessionCookie() {
    return serializeCookie("", 0);
}
export async function isAuthenticated(request, env) {
    const token = getCookie(request, SESSION_COOKIE_NAME);
    if (!token || !env.SESSION_SECRET || !env.ADMIN_PASSWORD) {
        return false;
    }
    const [issuedAtRaw, signature] = token.split(".");
    const issuedAt = Number(issuedAtRaw);
    if (!issuedAtRaw || !signature || !Number.isInteger(issuedAt)) {
        return false;
    }
    const age = Math.floor(Date.now() / 1000) - issuedAt;
    if (age < 0 || age > SESSION_MAX_AGE) {
        return false;
    }
    const payload = `${issuedAt}:${base64UrlEncode(env.ADMIN_PASSWORD)}`;
    const expected = await hmacSign(env.SESSION_SECRET, payload);
    return timingSafeEqual(signature, expected);
}
export async function requireAuth(request, env) {
    const authenticated = await isAuthenticated(request, env);
    if (!authenticated) {
        throw new ApiError(401, "需要管理员登录后才能继续。");
    }
}

import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
const scrypt = promisify(scryptCallback);
const COOKIE = "taskvibe_session";
const SESSION_SECONDS = 604800;
export type Role = "earner" | "advertiser" | "admin";
export type SessionUser = { id: string; email: string; name: string; role: Role; sessionVersion?: number };
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be a random value of at least 32 characters.");
  return value;
}
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return "scrypt:" + salt + ":" + derived.toString("hex");
}
export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scrypt(password, salt, expected.length) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function createSessionToken(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now()/1000) + SESSION_SECONDS })).toString("base64url");
  return payload + "." + sign(payload);
}
function readSession(token: string): SessionUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload)), supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Math.floor(Date.now()/1000) || !["earner","advertiser","admin"].includes(data.role)) return null;
    return { id: data.id, email: data.email, name: data.name, role: data.role, sessionVersion: Number.isInteger(data.sessionVersion) && data.sessionVersion >= 0 ? data.sessionVersion : 0 };
  } catch { return null; }
}
export async function setSession(user: SessionUser) {
  (await cookies()).set(COOKIE, createSessionToken(user), { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:SESSION_SECONDS });
}
export async function clearSession() {
  (await cookies()).set(COOKIE, "", { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:0 });
}
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  const session = token ? readSession(token) : null;
  if (!session || !ObjectId.isValid(session.id)) return null;
  try {
    const db = await getDb();
    const account = await db.collection("users").findOne(
      { _id: new ObjectId(session.id), status: "active" },
      { projection: { sessionVersion: 1 } },
    );
    if (!account || (account.sessionVersion ?? 0) !== (session.sessionVersion ?? 0)) return null;
    return session;
  } catch {
    return null;
  }
}

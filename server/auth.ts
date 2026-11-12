import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for username and password accounts.");
}

const pool = new Pool({ connectionString: databaseUrl });
pool.on("error", () => {
  console.error("The account database reported an unexpected connection error.");
});

const SESSION_COOKIE_NAME = "makeup_session";
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_BYTES = 64;
const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,24}$/;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 8;

type SiteUser = {
  id: string;
  username: string;
};

type Credentials = {
  username: string;
  usernameKey: string;
  password: string;
};

type CredentialsResult =
  | { ok: true; credentials: Credentials }
  | { ok: false; error: string };

const rateLimitBuckets = new Map<string, { count: number; resetsAt: number }>();

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, PASSWORD_KEY_BYTES, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const key = await derivePasswordKey(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function passwordMatches(password: string, encodedHash: string): Promise<boolean> {
  const [saltHex, keyHex, extra] = encodedHash.split(":");
  if (
    extra !== undefined ||
    !saltHex ||
    !keyHex ||
    !/^[a-f0-9]{32}$/i.test(saltHex) ||
    !/^[a-f0-9]{128}$/i.test(keyHex)
  ) {
    return false;
  }

  const expectedKey = Buffer.from(keyHex, "hex");
  const candidateKey = await derivePasswordKey(password, Buffer.from(saltHex, "hex"));
  return candidateKey.length === expectedKey.length && timingSafeEqual(candidateKey, expectedKey);
}

function readCredentials(body: unknown): CredentialsResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Enter a username and password." };
  }

  const values = body as Record<string, unknown>;
  const username = typeof values.username === "string" ? values.username.trim() : "";
  const password = typeof values.password === "string" ? values.password : "";

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Usernames must be 3–24 characters using letters, numbers, underscores, or dashes.",
    };
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 128) {
    return { ok: false, error: "Passwords must be at least 8 characters and no more than 128 bytes." };
  }

  return {
    ok: true,
    credentials: {
      username,
      usernameKey: username.toLowerCase(),
      password,
    },
  };
}

function rateLimitAuth(request: Request, response: Response, next: NextFunction): void {
  const now = Date.now();
  const key = request.ip || "unknown";
  let bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetsAt <= now) {
    bucket = { count: 0, resetsAt: now + AUTH_WINDOW_MS };
    rateLimitBuckets.set(key, bucket);
  }

  if (bucket.count >= AUTH_MAX_ATTEMPTS) {
    response.setHeader("Retry-After", String(Math.ceil((bucket.resetsAt - now) / 1000)));
    response.status(429).json({ error: "Too many attempts. Please try again in a few minutes." });
    return;
  }

  bucket.count += 1;

  if (rateLimitBuckets.size > 500) {
    for (const [bucketKey, value] of rateLimitBuckets) {
      if (value.resetsAt <= now) rateLimitBuckets.delete(bucketKey);
    }
  }

  next();
}

function readSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...parts] = cookie.trim().split("=");
    if (name !== SESSION_COOKIE_NAME) continue;
    const token = parts.join("=");
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
  }

  return null;
}

function sessionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(response: Response, token: string): void {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_LIFETIME_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}

function clearSessionCookie(response: Response): void {
  const attributes = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}

async function createSession(response: Response, userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

  await pool.query(
    `INSERT INTO makeup_site_sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [sessionTokenHash(token), userId, expiresAt],
  );

  setSessionCookie(response, token);
  void pool
    .query("DELETE FROM makeup_site_sessions WHERE expires_at <= NOW()")
    .catch(() => console.error("Expired account sessions could not be cleaned up."));
}

async function getAuthenticatedUser(request: Request): Promise<SiteUser | null> {
  const token = readSessionToken(request);
  if (!token) return null;

  const result = await pool.query<SiteUser>(
    `SELECT users.id::text AS id, users.username
     FROM makeup_site_sessions AS sessions
     JOIN makeup_site_users AS users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()
     LIMIT 1`,
    [sessionTokenHash(token)],
  );

  return result.rows[0] ?? null;
}

export const authRouter = Router();

authRouter.use((_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

authRouter.get("/me", async (request, response) => {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      response.json({ user: null });
      return;
    }
    response.json({ user });
  } catch {
    console.error("The current account session could not be checked.");
    response.status(500).json({ error: "Sign-in is temporarily unavailable." });
  }
});

authRouter.post("/signup", rateLimitAuth, async (request, response) => {
  const parsed = readCredentials(request.body);
  if (!parsed.ok) {
    response.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const passwordHash = await hashPassword(parsed.credentials.password);
    const result = await pool.query<SiteUser>(
      `INSERT INTO makeup_site_users (username, username_key, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id::text AS id, username`,
      [parsed.credentials.username, parsed.credentials.usernameKey, passwordHash],
    );
    const user = result.rows[0];
    if (!user) {
      response.status(500).json({ error: "Your account could not be created. Please try again." });
      return;
    }

    await createSession(response, user.id);
    rateLimitBuckets.delete(request.ip || "unknown");
    response.status(201).json({ user });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      response.status(409).json({ error: "That username is already taken." });
      return;
    }
    console.error("A makeup account could not be created.");
    response.status(500).json({ error: "Your account could not be created. Please try again." });
  }
});

authRouter.post("/login", rateLimitAuth, async (request, response) => {
  const parsed = readCredentials(request.body);
  if (!parsed.ok) {
    response.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const result = await pool.query<SiteUser & { password_hash: string }>(
      `SELECT id::text AS id, username, password_hash
       FROM makeup_site_users
       WHERE username_key = $1
       LIMIT 1`,
      [parsed.credentials.usernameKey],
    );
    const user = result.rows[0];

    if (user) {
      if (!(await passwordMatches(parsed.credentials.password, user.password_hash))) {
        response.status(401).json({ error: "That username and password didn’t match." });
        return;
      }
    } else {
      await derivePasswordKey(parsed.credentials.password, Buffer.alloc(PASSWORD_SALT_BYTES));
      response.status(401).json({ error: "That username and password didn’t match." });
      return;
    }

    await createSession(response, user.id);
    rateLimitBuckets.delete(request.ip || "unknown");
    response.json({ user: { id: user.id, username: user.username } });
  } catch {
    console.error("A makeup account sign-in could not be completed.");
    response.status(500).json({ error: "Sign-in is temporarily unavailable." });
  }
});

authRouter.post("/logout", async (request, response) => {
  const token = readSessionToken(request);
  try {
    if (token) {
      await pool.query("DELETE FROM makeup_site_sessions WHERE token_hash = $1", [
        sessionTokenHash(token),
      ]);
    }
    clearSessionCookie(response);
    response.status(204).end();
  } catch {
    console.error("The account session could not be ended.");
    clearSessionCookie(response);
    response.status(500).json({ error: "Sign-out is temporarily unavailable." });
  }
});

export async function requireSiteAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      response.status(401).json({ error: "Sign in to access this page." });
      return;
    }
    next();
  } catch {
    console.error("A protected request could not verify its account session.");
    response.status(500).json({ error: "Sign-in is temporarily unavailable." });
  }
}

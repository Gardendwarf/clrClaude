// clrClaude owned backend.
// - Auth: proxies /api/auth/* to clr-hub (server-to-server, internal) so the
//   browser never sees the hub URL and there is no CORS. clr-hub is the IdP.
// - Authorization: verifies the clr-hub access token locally (jose HS256 +
//   shared SUPABASE_JWT_SECRET) and scopes data to the token's `sub`.
// - Data: user_progress + user_profiles in the clrclaude DB on clr-postgres.
// - Also serves the built SPA.

import express from "express";
import pg from "pg";
import { jwtVerify } from "jose";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const CLRHUB = (process.env.CLRHUB_API_URL || "http://clrhub-api-an6x6j:4050").replace(/\/$/, "");
const SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || "");
const DIST = join(__dirname, "..", "dist");

const pool = new pg.Pool({ connectionString: process.env.CLRCLAUDE_DATABASE_URL });

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));

// ---- clr-hub auth proxy (server-to-server) ----
async function proxyAuth(action, req, res) {
  try {
    const r = await fetch(`${CLRHUB}/api/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
      signal: AbortSignal.timeout(12000),
    });
    const body = await r.text();
    res.status(r.status).type(r.headers.get("content-type") || "application/json").send(body);
  } catch {
    res.status(502).json({ success: false, error: "Auth service unreachable. Please try again." });
  }
}
app.post("/api/auth/login", (req, res) => proxyAuth("login", req, res));
app.post("/api/auth/register", (req, res) => proxyAuth("register", req, res));
app.post("/api/auth/refresh", (req, res) => proxyAuth("refresh", req, res));
app.post("/api/auth/logout", (req, res) => proxyAuth("logout", req, res));
app.post("/api/auth/forgot-password", (req, res) => proxyAuth("forgot-password", req, res));

// ---- token verify (matches clr-hub: plain HS256 verify, read sub+email) ----
async function authMw(req, res, next) {
  const h = req.headers.authorization || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!tok) return res.status(401).json({ error: "missing token" });
  try {
    const { payload } = await jwtVerify(tok, SECRET);
    if (!payload.sub) return res.status(401).json({ error: "no subject" });
    req.userId = String(payload.sub);
    req.email = payload.email || null;
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/auth/me", authMw, (req, res) => res.json({ user: { id: req.userId, email: req.email } }));

// ---- progress ----
app.get("/api/progress", authMw, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT lesson_id, status, completed_at FROM user_progress WHERE user_id=$1",
      [req.userId]
    );
    res.json(rows.map((r) => ({ lessonId: r.lesson_id, status: r.status, completedAt: r.completed_at })));
  } catch (e) {
    console.error("progress get", e.message);
    res.status(500).json({ error: "db error" });
  }
});

const VALID_STATUS = new Set(["not_started", "in_progress", "completed"]);
app.post("/api/progress", authMw, async (req, res) => {
  const { lessonId, status, completedAt } = req.body || {};
  if (!lessonId || typeof lessonId !== "string" || !VALID_STATUS.has(status)) {
    return res.status(400).json({ error: "invalid lessonId/status" });
  }
  try {
    await pool.query(
      `INSERT INTO user_progress(user_id, lesson_id, status, completed_at, updated_at)
       VALUES ($1,$2,$3,$4,now())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET status=EXCLUDED.status, completed_at=EXCLUDED.completed_at, updated_at=now()`,
      [req.userId, lessonId, status, completedAt || null]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("progress post", e.message);
    res.status(500).json({ error: "db error" });
  }
});

// ---- profile ----
app.get("/api/profile", authMw, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT display_name, job_title, ai_interest, tools_wanted FROM user_profiles WHERE user_id=$1",
      [req.userId]
    );
    const p = rows[0] || {};
    res.json({
      displayName: p.display_name || "",
      jobTitle: p.job_title || "",
      aiInterest: p.ai_interest || "",
      toolsWanted: p.tools_wanted || "",
    });
  } catch (e) {
    console.error("profile get", e.message);
    res.status(500).json({ error: "db error" });
  }
});
app.put("/api/profile", authMw, async (req, res) => {
  const { displayName, jobTitle, aiInterest, toolsWanted } = req.body || {};
  const clip = (v) => (typeof v === "string" ? v.slice(0, 500) : null);
  try {
    await pool.query(
      `INSERT INTO user_profiles(user_id, display_name, job_title, ai_interest, tools_wanted, updated_at)
       VALUES ($1,$2,$3,$4,$5,now())
       ON CONFLICT (user_id)
       DO UPDATE SET display_name=EXCLUDED.display_name, job_title=EXCLUDED.job_title,
                     ai_interest=EXCLUDED.ai_interest, tools_wanted=EXCLUDED.tools_wanted, updated_at=now()`,
      [req.userId, clip(displayName), clip(jobTitle), clip(aiInterest), clip(toolsWanted)]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("profile put", e.message);
    res.status(500).json({ error: "db error" });
  }
});

// ---- static SPA ----
app.use(express.static(DIST));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `clrclaude backend on :${PORT} (hub=${CLRHUB}, db=${process.env.CLRCLAUDE_DATABASE_URL ? "set" : "MISSING"}, secret=${process.env.SUPABASE_JWT_SECRET ? "set" : "MISSING"})`
  );
});

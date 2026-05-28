
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "2mb" }));

function makeDefaultStore() {
  return {
    admin: { user: "admin", pass: "otyrar2024" },
    content: {
      otyrar_news: [],
      otyrar_gallery: [],
      otyrar_heritage: [],
      otyrar_science: [],
      otyrar_director: {},
      otyrar_qa: [],
      otyrar_contact: {},
      otyrar_documents: [],
    },
    updatedAt: new Date().toISOString(),
  };
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(makeDefaultStore(), null, 2),
      "utf8"
    );
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

async function writeStore(store) {
  store.updatedAt = new Date().toISOString();

  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(store, null, 2),
    "utf8"
  );
}

function getTokenFromReq(req) {
  const auth = req.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return null;
  }

  return auth.slice("Bearer ".length).trim();
}

function requireAuth(req, res, next) {
  const token = getTokenFromReq(req);

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = sessions.get(token);

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }

  req.session = session;

  next();
}

app.post("/api/auth/login", async (req, res) => {
  const { user, pass } = req.body || {};

  if (!user || !pass) {
    return res.status(400).json({
      error: "Missing credentials"
    });
  }

  const store = await readStore();

  if (
    user !== store.admin.user ||
    pass !== store.admin.pass
  ) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const token = crypto.randomUUID();

  sessions.set(token, {
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  res.json({
    token,
    user
  });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  const token = getTokenFromReq(req);

  if (token) {
    sessions.delete(token);
  }

  res.json({ ok: true });
});

app.get("/api/content", requireAuth, async (req, res) => {
  const store = await readStore();

  res.json({
    content: store.content,
    adminUser: store.admin.user,
    updatedAt: store.updatedAt,
  });
});

app.put("/api/content", requireAuth, async (req, res) => {
  const nextContent = req.body?.content;

  if (!nextContent || typeof nextContent !== "object") {
    return res.status(400).json({
      error: "Invalid content payload"
    });
  }

  const store = await readStore();

  store.content = nextContent;

  await writeStore(store);

  res.json({
    ok: true,
    updatedAt: store.updatedAt
  });
});

app.patch("/api/admin/password", requireAuth, async (req, res) => {
  const { oldPass, newPass } = req.body || {};

  if (
    !oldPass ||
    !newPass ||
    String(newPass).length < 6
  ) {
    return res.status(400).json({
      error: "Invalid password payload"
    });
  }

  const store = await readStore();

  if (oldPass !== store.admin.pass) {
    return res.status(400).json({
      error: "Old password is incorrect"
    });
  }

  store.admin.pass = newPass;

  await writeStore(store);

  res.json({ ok: true });
});

app.get("/api/public/content", async (req, res) => {
  const store = await readStore();

  res.json({
    content: store.content,
    updatedAt: store.updatedAt,
  });
});

app.use(express.static(ROOT_DIR));

app.listen(PORT, () => {
  console.log(`Otyrar CMS backend running on port ${PORT}`);
});
```

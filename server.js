
const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// ─────────────────────────────
// UPLOADS
// ─────────────────────────────

const UPLOAD_DIR = path.join(ROOT_DIR, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, UPLOAD_DIR);

  },

  filename: function (req, file, cb) {

    const unique =
      Date.now() + "-" + file.originalname;

    cb(null, unique);

  }

});

const upload = multer({
  storage
});

// ─────────────────────────────
// MONGODB
// ─────────────────────────────

const client = new MongoClient(
  process.env.MONGO_URI
);

let db;

// ─────────────────────────────

const sessions = new Map();

const SESSION_TTL_MS =
  1000 * 60 * 60 * 12;

// ─────────────────────────────

app.use(cors({
  origin: '*',
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}));

app.use(express.json({
  limit: "2mb"
}));

// ─────────────────────────────
// DEFAULT STORE
// ─────────────────────────────

function makeDefaultStore() {

  return {

    admin: {
      user: "admin",
      pass: "otyrar2024"
    },

    content: {

      otyrar_news: [],
      otyrar_gallery: [],
      otyrar_heritage: [],
      otyrar_science: [],
      otyrar_director: {},
      otyrar_qa: [],
      otyrar_contact: {},
      otyrar_documents: []

    },

    updatedAt:
      new Date().toISOString()

  };

}

// ─────────────────────────────
// CONNECT MONGO
// ─────────────────────────────

async function ensureStore() {

  if (!db) {

    await client.connect();

    db = client.db("otyrar");

    console.log("MongoDB connected");

  }

}

// ─────────────────────────────
// READ STORE
// ─────────────────────────────

async function readStore() {

  await ensureStore();

  const col =
    db.collection("cms");

  let data =
    await col.findOne({
      name: "main"
    });

  if (!data) {

    data = makeDefaultStore();

    await col.insertOne({
      name: "main",
      ...data
    });

  }

  return data;

}

// ─────────────────────────────
// WRITE STORE
// ─────────────────────────────

async function writeStore(store) {

  await ensureStore();

  store.updatedAt =
    new Date().toISOString();

  const col =
    db.collection("cms");

  await col.updateOne(

    { name: "main" },

    {
      $set: store
    },

    {
      upsert: true
    }

  );

}

// ─────────────────────────────
// TOKEN
// ─────────────────────────────

function getTokenFromReq(req) {

  const auth =
    req.headers.authorization || "";

  if (
    !auth.startsWith("Bearer ")
  ) {

    return null;

  }

  return auth
    .slice("Bearer ".length)
    .trim();

}

// ─────────────────────────────
// AUTH
// ─────────────────────────────

function requireAuth(
  req,
  res,
  next
) {

  const token =
    getTokenFromReq(req);

  if (
    !token ||
    !sessions.has(token)
  ) {

    return res.status(401).json({
      error: "Unauthorized"
    });

  }

  const session =
    sessions.get(token);

  if (
    Date.now() >
    session.expiresAt
  ) {

    sessions.delete(token);

    return res.status(401).json({
      error: "Session expired"
    });

  }

  req.session = session;

  next();

}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────

app.post(
  "/api/auth/login",
  async (req, res) => {

    const {
      user,
      pass
    } = req.body || {};

    if (!user || !pass) {

      return res.status(400).json({
        error:
          "Missing credentials"
      });

    }

    const store =
      await readStore();

    if (
      user !==
        store.admin.user ||

      pass !==
        store.admin.pass
    ) {

      return res.status(401).json({
        error:
          "Invalid credentials"
      });

    }

    const token =
      crypto.randomUUID();

    sessions.set(token, {

      user,

      expiresAt:
        Date.now() +
        SESSION_TTL_MS

    });

    res.json({
      token,
      user
    });

  }
);

// ─────────────────────────────
// LOGOUT
// ─────────────────────────────

app.post(
  "/api/auth/logout",
  requireAuth,
  (req, res) => {

    const token =
      getTokenFromReq(req);

    if (token) {
      sessions.delete(token);
    }

    res.json({
      ok: true
    });

  }
);

// ─────────────────────────────
// GET CONTENT
// ─────────────────────────────

app.get(
  "/api/content",
  requireAuth,
  async (req, res) => {

    const store =
      await readStore();

    res.json({

      content:
        store.content,

      adminUser:
        store.admin.user,

      updatedAt:
        store.updatedAt

    });

  }
);

// ─────────────────────────────
// SAVE CONTENT
// ─────────────────────────────

app.put(
  "/api/content",
  requireAuth,
  async (req, res) => {

    const nextContent =
      req.body?.content;

    if (
      !nextContent ||
      typeof nextContent !==
        "object"
    ) {

      return res.status(400).json({
        error:
          "Invalid content payload"
      });

    }

    const store =
      await readStore();

    store.content = {

      ...store.content,

      ...nextContent

    };

    await writeStore(store);

    res.json({

      ok: true,

      updatedAt:
        store.updatedAt

    });

  }
);

// ─────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────

app.patch(
  "/api/admin/password",
  requireAuth,
  async (req, res) => {

    const {
      oldPass,
      newPass
    } = req.body || {};

    if (
      !oldPass ||
      !newPass ||
      String(newPass).length < 6
    ) {

      return res.status(400).json({
        error:
          "Invalid password payload"
      });

    }

    const store =
      await readStore();

    if (
      oldPass !==
      store.admin.pass
    ) {

      return res.status(400).json({
        error:
          "Old password is incorrect"
      });

    }

    store.admin.pass =
      newPass;

    await writeStore(store);

    res.json({
      ok: true
    });

  }
);

// ─────────────────────────────
// PUBLIC CONTENT
// ─────────────────────────────

app.get(
  "/api/public/content",
  async (req, res) => {

    const store =
      await readStore();

    res.json({

      content:
        store.content,

      updatedAt:
        store.updatedAt

    });

  }
);

// ─────────────────────────────
// IMAGE UPLOAD
// ─────────────────────────────

app.post(
  "/api/upload",
  requireAuth,
  upload.single("image"),
  (req, res) => {

    if (!req.file) {

      return res.status(400).json({
        error: "No file"
      });

    }

    res.json({

      ok: true,

      url:
        "/uploads/" +
        req.file.filename

    });

  }
);

// ─────────────────────────────

app.use(
  express.static(ROOT_DIR)
);

app.use(
  "/uploads",
  express.static(UPLOAD_DIR)
);

// ─────────────────────────────

app.listen(PORT, () => {

  console.log(
    `Otyrar CMS backend running on port ${PORT}`
  );

});


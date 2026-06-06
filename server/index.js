import express from "express";
import cors from "cors";
import { initDB } from "./db.js";
import pool from "./db.js";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

// 读取 AI 人设 Prompt（动态读取，支持热更新）
const promptFilePath = join(__dirname, "../src/assets/.md/.md");
let aiSystemPrompt = "";

function getAiSystemPrompt() {
  try {
    aiSystemPrompt = fs.readFileSync(promptFilePath, "utf-8").trim();
  } catch {
    // 文件读取失败则使用内存中的缓存值
  }
  return aiSystemPrompt || "你是一个友好的AI助手。";
}


const app = express();
const PORT = 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "https://kxincc.top",
  "https://www.kxincc.top",
  "http://124.220.25.108",
];

app.use(cors({
  origin(origin, callback) {
    // 允许无 origin 的请求（如 curl、服务器内部调用）
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // 暂时允许所有来源，后续可改为 callback(new Error("Not allowed"))
    }
  },
  credentials: true,
}));
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: Date.now()
  });
});
// ============ 管理员登录 Token 存储 ============
const adminTokens = new Map(); // token -> { username, expires }

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// 管理员认证中间件
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "未登录" });
  }
  const token = auth.slice(7);
  const info = adminTokens.get(token);
  if (!info || info.expires < Date.now()) {
    adminTokens.delete(token);
    return res.status(401).json({ error: "登录已过期" });
  }
  req.adminUser = info.username;
  next();
}

// ============ 管理员认证 API ============

// 管理员登录
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "用户名和密码不能为空" });

  const [rows] = await pool.execute(
    "SELECT id, username, role, avatar FROM users WHERE username = ? AND password = ? AND role = 'admin'",
    [username, password]
  );
  if (rows.length === 0) return res.status(403).json({ error: "用户名或密码错误，或非管理员" });

  const token = generateToken();
  adminTokens.set(token, { username: rows[0].username, expires: Date.now() + 24 * 60 * 60 * 1000 });

  res.json({ token, username: rows[0].username, avatar: rows[0].avatar });
});

// 验证 Token
app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ valid: true, username: req.adminUser });
});

// 管理员登出
app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const auth = req.headers.authorization;
  const token = auth.slice(7);
  adminTokens.delete(token);
  res.json({ success: true });
});

// ============ 通用频率限制 ============
const actionRateLimit = new Map(); // key -> { count, date }

function checkActionRateLimit(key, maxPerDay) {
  const today = new Date().toISOString().slice(0, 10);
  const info = actionRateLimit.get(key);
  if (!info || info.date !== today) {
    actionRateLimit.set(key, { count: 1, date: today });
    return true;
  }
  if (info.count >= maxPerDay) return false;
  info.count++;
  return true;
}

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
}

// ============ 点赞 API ============

// 获取某张照片的点赞数
app.get("/api/likes/:key", async (req, res) => {
  const [rows] = await pool.execute("SELECT count FROM likes WHERE photo_key = ?", [req.params.key]);
  res.json({ count: rows.length > 0 ? rows[0].count : 0 });
});

// 批量获取点赞数
app.post("/api/likes/batch", async (req, res) => {
  const { keys } = req.body;
  if (!Array.isArray(keys)) return res.status(400).json({ error: "keys must be array" });

  const placeholders = keys.map(() => "?").join(",");
  const [rows] = await pool.execute(
    `SELECT photo_key, count FROM likes WHERE photo_key IN (${placeholders})`,
    keys
  );

  const result = {};
  keys.forEach(k => { result[k] = 0; });
  rows.forEach(r => { result[r.photo_key] = r.count; });

  res.json(result);
});

// 点赞（+1，每IP每张照片每天最多1次）
app.post("/api/likes/:key", async (req, res) => {
  const ip = getClientIp(req);
  const likeKey = `like:${ip}:${req.params.key}`;
  if (!checkActionRateLimit(likeKey, 1)) {
    return res.status(429).json({ error: "今天已经点过赞了", limited: true });
  }

  await pool.execute(
    "INSERT INTO likes (photo_key, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1",
    [req.params.key]
  );

  const [rows] = await pool.execute("SELECT count FROM likes WHERE photo_key = ?", [req.params.key]);
  res.json({ count: rows[0].count });
});

// 清除所有点赞（管理员）
app.delete("/api/likes", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM likes");
  res.json({ success: true });
});

// ============ 评论 API ============

// 获取某张照片的评论
app.get("/api/comments/:key", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, username, avatar, text, created_at FROM comments WHERE photo_key = ? ORDER BY created_at ASC",
    [req.params.key]
  );
  res.json(rows);
});

// 添加评论（每IP每分钟最多5条）
app.post("/api/comments/:key", async (req, res) => {
  const ip = getClientIp(req);
  const commentKey = `comment:${ip}`;
  if (!checkActionRateLimit(commentKey, 50)) {
    return res.status(429).json({ error: "评论太频繁了，稍后再试" });
  }

  const { username, avatar, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "评论不能为空" });
  if (text.trim().length > 500) return res.status(400).json({ error: "评论太长了，最多500字" });

  // 检查是否被封禁
  if (username) {
    const [banned] = await pool.execute("SELECT banned FROM users WHERE username = ?", [username]);
    if (banned.length > 0 && banned[0].banned === 1) {
      return res.status(403).json({ error: "该账号已被封禁，无法评论" });
    }
  }

  const created_at = Date.now();
  const [result] = await pool.execute(
    "INSERT INTO comments (photo_key, username, avatar, text, created_at) VALUES (?, ?, ?, ?, ?)",
    [req.params.key, username || "游客", avatar || "/1.png", text.trim(), created_at]
  );

  res.json({
    id: result.insertId,
    username: username || "游客",
    avatar: avatar || "/1.png",
    text: text.trim(),
    created_at,
  });
});

// 删除评论（管理员）
app.delete("/api/comments/:id", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM comments WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// ============ 管理员专用 API ============

// 获取所有评论（分页）
app.get("/api/admin/comments", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const search = req.query.search || "";
  const offset = (page - 1) * pageSize;

  let where = "";
  const params = [];
  if (search) {
    where = "WHERE text LIKE ? OR username LIKE ? OR photo_key LIKE ?";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.execute(
    `SELECT id, photo_key, username, avatar, text, created_at FROM comments ${where} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`,
    params
  );

  const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM comments ${where}`, params);

  res.json({ list: rows, total: countRows[0].total, page, pageSize });
});

// 批量删除评论
app.post("/api/admin/comments/batch-delete", requireAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "请选择要删除的评论" });

  const placeholders = ids.map(() => "?").join(",");
  await pool.execute(`DELETE FROM comments WHERE id IN (${placeholders})`, ids);
  res.json({ success: true, deleted: ids.length });
});

// 获取所有用户
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, username, role, avatar, created_at, banned FROM users ORDER BY created_at DESC"
  );
  res.json(rows);
});

// 封禁/解封用户
app.post("/api/admin/users/:id/ban", requireAdmin, async (req, res) => {
  const { banned } = req.body; // 1=封禁 0=解封
  await pool.execute("UPDATE users SET banned = ? WHERE id = ?", [banned ? 1 : 0, Number(req.params.id)]);
  res.json({ success: true });
});

// 删除用户
app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM users WHERE id = ? AND role != 'admin'", [Number(req.params.id)]);
  res.json({ success: true });
});

// 修改管理员密码
app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "密码不能为空" });
  if (newPassword.length < 6) return res.status(400).json({ error: "新密码至少6位" });

  const [rows] = await pool.execute(
    "SELECT id FROM users WHERE username = ? AND password = ?",
    [req.adminUser, oldPassword]
  );
  if (rows.length === 0) return res.status(403).json({ error: "原密码错误" });

  await pool.execute("UPDATE users SET password = ? WHERE username = ?", [newPassword, req.adminUser]);
  res.json({ success: true });
});

// 获取统计信息
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  const [likeCount] = await pool.execute("SELECT COUNT(*) as total FROM likes");
  const [likeSum] = await pool.execute("SELECT IFNULL(SUM(count), 0) as total FROM likes");
  const [commentCount] = await pool.execute("SELECT COUNT(*) as total FROM comments");
  const [userCount] = await pool.execute("SELECT COUNT(*) as total FROM users");
  const [guestbookCount] = await pool.execute("SELECT COUNT(*) as total FROM guestbook");

  res.json({
    photoCount: likeCount[0].total,
    totalLikes: likeSum[0].total,
    totalComments: commentCount[0].total,
    totalUsers: userCount[0].total,
    totalGuestbook: guestbookCount[0].total,
  });
});

// ============ 留言板 API ============

// 获取所有留言
app.get("/api/guestbook", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, username, avatar, text, reply, created_at FROM guestbook ORDER BY created_at DESC"
  );
  res.json(rows);
});

// 发表留言（每IP每天最多10条）
app.post("/api/guestbook", async (req, res) => {
  const ip = getClientIp(req);
  const guestbookKey = `guestbook:${ip}`;
  if (!checkActionRateLimit(guestbookKey, 10)) {
    return res.status(429).json({ error: "留言太频繁了，稍后再试" });
  }

  const { username, avatar, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "留言不能为空" });
  if (text.trim().length > 500) return res.status(400).json({ error: "留言太长了，最多500字" });

  const created_at = Date.now();
  const [result] = await pool.execute(
    "INSERT INTO guestbook (username, avatar, text, created_at) VALUES (?, ?, ?, ?)",
    [username || "游客", avatar || "/1.png", text.trim(), created_at]
  );

  res.json({
    id: result.insertId,
    username: username || "游客",
    avatar: avatar || "/1.png",
    text: text.trim(),
    reply: null,
    created_at,
  });
});

// 管理员回复留言
app.post("/api/admin/guestbook/:id/reply", requireAdmin, async (req, res) => {
  const { reply } = req.body;
  if (!reply || !reply.trim()) return res.status(400).json({ error: "回复不能为空" });

  try {
    const [result] = await pool.execute(
      "UPDATE guestbook SET reply = ? WHERE id = ?",
      [reply.trim(), Number(req.params.id)]
    );
    console.log(`[Guestbook Reply] id=${req.params.id}, reply="${reply.trim()}", affectedRows=${result.affectedRows}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[Guestbook Reply Error]", err);
    res.status(500).json({ error: "回复保存失败" });
  }
});

// 管理员删除留言
app.delete("/api/admin/guestbook/:id", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM guestbook WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// 管理员获取所有留言（含分页搜索）
app.get("/api/admin/guestbook", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const search = req.query.search || "";
  const offset = (page - 1) * pageSize;

  let where = "";
  const params = [];
  if (search) {
    where = "WHERE text LIKE ? OR username LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.execute(
    `SELECT id, username, avatar, text, reply, created_at FROM guestbook ${where} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`,
    params
  );

  const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM guestbook ${where}`, params);

  res.json({ list: rows, total: countRows[0].total, page, pageSize });
});

// ============ AI 对话 API ============

// 速率限制：每IP每天最多20次（可通过管理后台调整）
let aiDailyLimit = 20;
const aiRateLimit = new Map(); // ip -> { count, date }

function getRemainingLimit(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const info = aiRateLimit.get(ip);
  if (!info || info.date !== today) {
    return aiDailyLimit;
  }
  return Math.max(0, aiDailyLimit - info.count);
}

app.post("/api/ai/chat", async (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  const remaining = getRemainingLimit(ip);

  if (remaining <= 0) {
    return res.status(429).json({ error: "今日对话次数已用完，明天再来聊吧～", limit: 0 });
  }

  const { messages, username } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  // 只保留最近6轮对话（省 token）
  const recentMessages = messages.slice(-12);

  // 更新速率
  const today = new Date().toISOString().slice(0, 10);
  const info = aiRateLimit.get(ip);
  if (!info || info.date !== today) {
    aiRateLimit.set(ip, { count: 1, date: today });
  } else {
    info.count++;
  }

  try {
    const apiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: getAiSystemPrompt() },
          ...recentMessages,
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error("[DeepSeek API Error]", data);
      return res.status(500).json({ error: "AI暂时开小差了，稍后再试～", limit: remaining - 1 });
    }

    const reply = data.choices?.[0]?.message?.content || "嗯...我好像走神了，再说一次？";

    // 保存对话日志
    const userMsg = recentMessages.filter(m => m.role === "user").pop();
    try {
      await pool.execute(
        "INSERT INTO ai_chat_logs (ip, username, user_message, ai_reply, created_at) VALUES (?, ?, ?, ?, ?)",
        [ip, username || "游客", userMsg?.content || "", reply, Date.now()]
      );
    } catch (logErr) {
      console.error("[AI Chat Log Error]", logErr);
    }

    res.json({ reply, limit: remaining - 1 });
  } catch (err) {
    console.error("[DeepSeek API Error]", err);
    res.status(500).json({ error: "网络出了点问题，稍后再试～", limit: remaining - 1 });
  }
});

// ============ AI 管理 API ============

// 获取对话日志（分页搜索）
app.get("/api/admin/ai/logs", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const search = req.query.search || "";
  const offset = (page - 1) * pageSize;

  let where = "";
  const params = [];
  if (search) {
    where = "WHERE user_message LIKE ? OR ai_reply LIKE ? OR username LIKE ? OR ip LIKE ?";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.execute(
    `SELECT id, ip, username, user_message, ai_reply, created_at FROM ai_chat_logs ${where} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`,
    params
  );
  const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM ai_chat_logs ${where}`, params);

  // 统计
  const [todayCount] = await pool.execute(
    "SELECT COUNT(*) as total FROM ai_chat_logs WHERE created_at > ?",
    [Date.now() - 24 * 60 * 60 * 1000]
  );
  const [totalCount] = await pool.execute("SELECT COUNT(*) as total FROM ai_chat_logs");

  res.json({
    list: rows,
    total: countRows[0].total,
    page,
    pageSize,
    todayCount: todayCount[0].total,
    totalCount: totalCount[0].total,
  });
});

// 删除单条对话日志
app.delete("/api/admin/ai/logs/:id", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM ai_chat_logs WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// 清空所有对话日志
app.delete("/api/admin/ai/logs", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM ai_chat_logs");
  res.json({ success: true });
});

// 获取 AI 人设 Prompt
app.get("/api/admin/ai/prompt", requireAdmin, (req, res) => {
  res.json({ prompt: getAiSystemPrompt() });
});

// 更新 AI 人设 Prompt
app.post("/api/admin/ai/prompt", requireAdmin, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) return res.status(400).json({ error: "人设不能为空" });
  try {
    fs.writeFileSync(promptFilePath, prompt.trim(), "utf-8");
    aiSystemPrompt = prompt.trim();
    res.json({ success: true });
  } catch (err) {
    console.error("[Save Prompt Error]", err);
    res.status(500).json({ error: "保存失败" });
  }
});

// 获取/设置速率限制
app.get("/api/admin/ai/limit", requireAdmin, (req, res) => {
  res.json({ limit: aiDailyLimit });
});

app.post("/api/admin/ai/limit", requireAdmin, (req, res) => {
  const { limit } = req.body;
  if (!limit || limit < 1) return res.status(400).json({ error: "限制必须大于0" });
  aiDailyLimit = limit;
  res.json({ success: true, limit: aiDailyLimit });
});

// ============ 启动 ============

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});

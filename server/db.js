import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "my_website",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initDB() {
  // 先创建数据库（如果不存在）
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  await conn.query("CREATE DATABASE IF NOT EXISTS my_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  await conn.end();

  // 创建表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS likes (
      photo_key VARCHAR(100) PRIMARY KEY,
      count INT NOT NULL DEFAULT 0
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      photo_key VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL DEFAULT '游客',
      avatar VARCHAR(255) NOT NULL DEFAULT '/1.png',
      text TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      INDEX idx_comments_key (photo_key)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'visitor',
      avatar VARCHAR(255) NOT NULL DEFAULT '/1.png',
      created_at BIGINT NOT NULL,
      banned TINYINT NOT NULL DEFAULT 0
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      avatar VARCHAR(255) NOT NULL DEFAULT '/1.png',
      text TEXT NOT NULL,
      reply TEXT DEFAULT NULL,
      created_at BIGINT NOT NULL,
      INDEX idx_guestbook_time (created_at)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ai_chat_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(50) NOT NULL,
      username VARCHAR(50) DEFAULT '游客',
      user_message TEXT NOT NULL,
      ai_reply TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      INDEX idx_ai_chat_time (created_at)
    )
  `);

  // 插入默认管理员账号（如不存在）
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPwd = process.env.ADMIN_PASSWORD || "admin123";
  const [adminRows] = await pool.execute("SELECT id FROM users WHERE username = ?", [adminUser]);
  if (adminRows.length === 0) {
    await pool.execute(
      "INSERT INTO users (username, password, role, avatar, created_at) VALUES (?, ?, ?, ?, ?)",
      [adminUser, adminPwd, "admin", "/1.png", Date.now()]
    );
  }

  console.log("MySQL database initialized");
}

export default pool;

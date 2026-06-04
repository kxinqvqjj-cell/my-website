const API_BASE = "/api";

// ============ 点赞 ============

export async function getLikeCount(key) {
  const res = await fetch(`${API_BASE}/likes/${encodeURIComponent(key)}`);
  if (!res.ok) console.error("getLikeCount failed:", res.status);
  const data = await res.json();
  return data.count;
}

export async function getLikeCounts(keys) {
  const res = await fetch(`${API_BASE}/likes/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
  });
  if (!res.ok) console.error("getLikeCounts failed:", res.status);
  return res.json(); // { [key]: count }
}

export async function addLike(key) {
  const res = await fetch(`${API_BASE}/likes/${encodeURIComponent(key)}`, { method: "POST" });
  if (!res.ok) console.error("addLike failed:", res.status);
  const data = await res.json();
  return data.count;
}

export async function clearAllLikes() {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API_BASE}/likes`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

// ============ 评论 ============

export async function getComments(key) {
  const res = await fetch(`${API_BASE}/comments/${encodeURIComponent(key)}`);
  return res.json(); // [{ id, username, avatar, text, created_at }]
}

export async function addComment(key, { username, avatar, text }) {
  const res = await fetch(`${API_BASE}/comments/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, avatar, text }),
  });
  return res.json();
}

export async function deleteComment(id) {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API_BASE}/comments/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

// ============ 留言板 ============

export async function getGuestbookMessages() {
  const res = await fetch(`${API_BASE}/guestbook`);
  return res.json(); // [{ id, username, avatar, text, reply, created_at }]
}

export async function addGuestbookMessage({ username, avatar, text }) {
  const res = await fetch(`${API_BASE}/guestbook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, avatar, text }),
  });
  return res.json();
}

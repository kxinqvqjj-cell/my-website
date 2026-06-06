import "./Admin.css";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE = "/api";

function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("admin_token"));
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // 当前 tab
  const [tab, setTab] = useState("dashboard");

  // 数据
  const [stats, setStats] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentSearch, setCommentSearch] = useState("");
  const [selectedComments, setSelectedComments] = useState(new Set());

  const [users, setUsers] = useState([]);

  // 留言板管理
  const [guestbookList, setGuestbookList] = useState([]);
  const [guestbookTotal, setGuestbookTotal] = useState(0);
  const [guestbookPage, setGuestbookPage] = useState(1);
  const [guestbookSearch, setGuestbookSearch] = useState("");
  const [replyForm, setReplyForm] = useState({ id: null, text: "" });

  // 修改密码
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  // AI 管理
  const [aiLogs, setAiLogs] = useState([]);
  const [aiLogTotal, setAiLogTotal] = useState(0);
  const [aiLogPage, setAiLogPage] = useState(1);
  const [aiLogSearch, setAiLogSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLimit, setAiLimit] = useState(20);
  const [aiStats, setAiStats] = useState({ todayCount: 0, totalCount: 0 });
  const [aiPromptMsg, setAiPromptMsg] = useState("");

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  // 验证 token
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/check`, { headers: headers() })
      .then(res => {
        if (!res.ok) {
          setToken("");
          setIsLoggedIn(false);
          localStorage.removeItem("admin_token");
        }
      })
      .catch(() => {});
  }, [token, headers]);

  // 登录
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "登录失败");
        return;
      }
      setToken(data.token);
      setIsLoggedIn(true);
      localStorage.setItem("admin_token", data.token);
    } catch {
      setLoginError("网络错误");
    }
  };

  // 登出
  const handleLogout = async () => {
    await fetch(`${API_BASE}/admin/logout`, { method: "POST", headers: headers() });
    setToken("");
    setIsLoggedIn(false);
    localStorage.removeItem("admin_token");
  };

  // 加载统计
  const loadStats = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: headers() });
    if (res.ok) setStats(await res.json());
  }, [headers]);

  // 加载评论
  const loadComments = useCallback(async (page = 1, search = "") => {
    const params = new URLSearchParams({ page, pageSize: 20 });
    if (search) params.set("search", search);
    const res = await fetch(`${API_BASE}/admin/comments?${params}`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setComments(data.list);
      setCommentTotal(data.total);
      setCommentPage(page);
    }
  }, [headers]);

  // 加载用户
  const loadUsers = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: headers() });
    if (res.ok) setUsers(await res.json());
  }, [headers]);

  // 加载留言
  const loadGuestbook = useCallback(async (page = 1, search = "") => {
    const params = new URLSearchParams({ page, pageSize: 20 });
    if (search) params.set("search", search);
    const res = await fetch(`${API_BASE}/admin/guestbook?${params}`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setGuestbookList(data.list);
      setGuestbookTotal(data.total);
      setGuestbookPage(page);
    }
  }, [headers]);

  // 加载 AI 对话日志
  const loadAiLogs = useCallback(async (page = 1, search = "") => {
    const params = new URLSearchParams({ page, pageSize: 20 });
    if (search) params.set("search", search);
    const res = await fetch(`${API_BASE}/admin/ai/logs?${params}`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setAiLogs(data.list);
      setAiLogTotal(data.total);
      setAiLogPage(page);
      setAiStats({ todayCount: data.todayCount, totalCount: data.totalCount });
    }
  }, [headers]);

  // 加载 AI 人设
  const loadAiPrompt = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/ai/prompt`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setAiPrompt(data.prompt);
    }
  }, [headers]);

  // 加载 AI 速率限制
  const loadAiLimit = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/ai/limit`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setAiLimit(data.limit);
    }
  }, [headers]);

  // 切换 tab 时加载数据
  useEffect(() => {
    if (!isLoggedIn) return;
    if (tab === "dashboard") loadStats();
    if (tab === "comments") { setSelectedComments(new Set()); loadComments(1, commentSearch); }
    if (tab === "users") loadUsers();
    if (tab === "guestbook") { setReplyForm({ id: null, text: "" }); loadGuestbook(1, guestbookSearch); }
    if (tab === "ai") { loadAiLogs(1, aiLogSearch); loadAiPrompt(); loadAiLimit(); }
  }, [tab, isLoggedIn, loadStats, loadComments, loadUsers, loadGuestbook, commentSearch, guestbookSearch, loadAiLogs, loadAiPrompt, loadAiLimit, aiLogSearch]);

  // 删除单条评论
  const deleteComment = async (id) => {
    if (!confirm("确定删除此评论？")) return;
    await fetch(`${API_BASE}/comments/${id}`, { method: "DELETE", headers: headers() });
    loadComments(commentPage, commentSearch);
  };

  // 批量删除评论
  const batchDeleteComments = async () => {
    if (selectedComments.size === 0) return alert("请先选择评论");
    if (!confirm(`确定删除 ${selectedComments.size} 条评论？`)) return;
    await fetch(`${API_BASE}/admin/comments/batch-delete`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ ids: [...selectedComments] }),
    });
    setSelectedComments(new Set());
    loadComments(commentPage, commentSearch);
  };

  // 封禁/解封用户
  const toggleBan = async (user) => {
    const action = user.banned ? "解封" : "封禁";
    if (!confirm(`确定${action}用户 "${user.username}"？`)) return;
    await fetch(`${API_BASE}/admin/users/${user.id}/ban`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ banned: user.banned ? 0 : 1 }),
    });
    loadUsers();
  };

  // 删除用户
  const deleteUser = async (user) => {
    if (!confirm(`确定删除用户 "${user.username}"？该用户的评论不会被删除。`)) return;
    await fetch(`${API_BASE}/admin/users/${user.id}`, { method: "DELETE", headers: headers() });
    loadUsers();
  };

  // 删除留言
  const deleteGuestbook = async (id) => {
    if (!confirm("确定删除此留言？")) return;
    await fetch(`${API_BASE}/admin/guestbook/${id}`, { method: "DELETE", headers: headers() });
    loadGuestbook(guestbookPage, guestbookSearch);
  };

  // 回复留言
  const replyGuestbook = async (id) => {
    const text = replyForm.text.trim();
    console.log("[replyGuestbook] id:", id, "text:", text, "replyForm:", replyForm);
    if (!text) return alert("请输入回复内容");
    try {
      const res = await fetch(`${API_BASE}/admin/guestbook/${id}/reply`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ reply: text }),
      });
      const data = await res.json();
      console.log("[replyGuestbook] response:", res.status, data);
      if (res.ok) {
        setReplyForm({ id: null, text: "" });
        loadGuestbook(guestbookPage, guestbookSearch);
      } else {
        alert(data.error || "回复失败");
      }
    } catch (err) {
      console.error("reply error:", err);
      alert("网络错误，回复失败");
    }
  };

  // 修改密码
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg("两次输入的新密码不一致");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/change-password`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg("密码修改成功");
        setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPwdMsg(data.error || "修改失败");
      }
    } catch {
      setPwdMsg("网络错误");
    }
  };

  const toggleSelectComment = (id) => {
    setSelectedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map(c => c.id)));
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString("zh-CN");
  };

  const totalPages = Math.ceil(commentTotal / 20);

  // ========== 登录页 ==========
  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h1>🔐 管理员登录</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="用户名"
              value={loginForm.username}
              onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
            />
            <input
              type="password"
              placeholder="密码"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
            />
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit">登录</button>
          </form>
          <Link to="/" className="admin-back">← 返回网站</Link>
        </div>
      </div>
    );
  }

  // ========== 管理后台 ==========
  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>⚙️ 管理后台</h1>
        <div className="admin-header-right">
          <Link to="/" className="admin-back">← 返回网站</Link>
          <button onClick={handleLogout} className="admin-logout-btn">退出登录</button>
        </div>
      </header>

      <nav className="admin-nav">
        {[
          { key: "dashboard", label: "📊 数据概览" },
          { key: "comments", label: "💬 评论管理" },
          { key: "guestbook", label: "📝 留言管理" },
          { key: "ai", label: "🤖 AI管理" },
          { key: "users", label: "👥 用户管理" },
          { key: "settings", label: "⚙️ 账号设置" },
        ].map(t => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {/* 数据概览 */}
        {tab === "dashboard" && stats && (
          <div className="admin-dashboard">
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-number">{stats.totalLikes}</div>
                <div className="stat-label">总点赞数</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.photoCount}</div>
                <div className="stat-label">被点赞照片</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalComments}</div>
                <div className="stat-label">总评论数</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">注册用户</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalGuestbook}</div>
                <div className="stat-label">留言数</div>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button
                className="danger"
                onClick={async () => {
                  if (!confirm("确定清除所有点赞数据？此操作不可恢复！")) return;
                  const res = await fetch(`${API_BASE}/likes`, {
                    method: "DELETE",
                    headers: headers(),
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("点赞数据已清除");
                    loadStats();
                  } else {
                    alert("清除失败");
                  }
                }}
              >
                🗑️ 清除所有点赞数据
              </button>
            </div>
          </div>
        )}

        {/* 评论管理 */}
        {tab === "comments" && (
          <div className="admin-comments">
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="搜索评论内容/用户名/照片..."
                value={commentSearch}
                onChange={e => setCommentSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadComments(1, commentSearch)}
              />
              <button onClick={() => loadComments(1, commentSearch)}>搜索</button>
              <button
                className="danger"
                onClick={batchDeleteComments}
                disabled={selectedComments.size === 0}
              >
                批量删除 ({selectedComments.size})
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={toggleSelectAll} checked={selectedComments.size === comments.length && comments.length > 0} /></th>
                  <th>ID</th>
                  <th>照片</th>
                  <th>用户</th>
                  <th>评论内容</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(c => (
                  <tr key={c.id} className={selectedComments.has(c.id) ? "selected" : ""}>
                    <td><input type="checkbox" checked={selectedComments.has(c.id)} onChange={() => toggleSelectComment(c.id)} /></td>
                    <td>{c.id}</td>
                    <td className="photo-key">{c.photo_key}</td>
                    <td>
                      <img className="user-avatar-sm" src={c.avatar} alt="" />
                      {c.username}
                    </td>
                    <td className="comment-text-cell">{c.text}</td>
                    <td className="time-cell">{formatTime(c.created_at)}</td>
                    <td>
                      <button className="sm danger" onClick={() => deleteComment(c.id)}>删除</button>
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr><td colSpan="7" className="empty">暂无评论</td></tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={commentPage <= 1} onClick={() => loadComments(commentPage - 1, commentSearch)}>上一页</button>
                <span>{commentPage} / {totalPages}</span>
                <button disabled={commentPage >= totalPages} onClick={() => loadComments(commentPage + 1, commentSearch)}>下一页</button>
              </div>
            )}
          </div>
        )}

        {/* AI 管理 */}
        {tab === "ai" && (
          <div className="admin-ai">
            {/* 统计卡片 */}
            <div className="stat-cards" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-number">{aiStats.todayCount}</div>
                <div className="stat-label">今日对话次数</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{aiStats.totalCount}</div>
                <div className="stat-label">总对话次数</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{aiLimit}</div>
                <div className="stat-label">每日限制/IP</div>
              </div>
            </div>

            {/* 人设编辑 */}
            <div className="admin-ai-section">
              <h3>📝 AI 人设 Prompt</h3>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={10}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              {aiPromptMsg && (
                <p className={aiPromptMsg.includes("成功") ? "admin-success" : "admin-error"} style={{ marginTop: 8 }}>
                  {aiPromptMsg}
                </p>
              )}
              <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/admin/ai/prompt`, {
                        method: "POST",
                        headers: headers(),
                        body: JSON.stringify({ prompt: aiPrompt }),
                      });
                      const data = await res.json();
                      setAiPromptMsg(data.success ? "✅ 人设已更新，立即生效" : (data.error || "更新失败"));
                      setTimeout(() => setAiPromptMsg(""), 3000);
                    } catch {
                      setAiPromptMsg("网络错误");
                    }
                  }}
                >
                  💾 保存人设
                </button>
              </div>
            </div>

            {/* 速率限制 */}
            <div className="admin-ai-section" style={{ marginTop: 24 }}>
              <h3>⚡ 速率限制</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <span>每IP每天最多对话次数：</span>
                <input
                  type="number"
                  value={aiLimit}
                  onChange={e => setAiLimit(Number(e.target.value))}
                  min={1}
                  style={{ width: 80, padding: "6px 10px", border: "1px solid #d9d9d9", borderRadius: 6, fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/admin/ai/limit`, {
                        method: "POST",
                        headers: headers(),
                        body: JSON.stringify({ limit: aiLimit }),
                      });
                      const data = await res.json();
                      if (data.success) alert(`✅ 已更新为每天 ${aiLimit} 次`);
                      else alert("更新失败");
                    } catch {
                      alert("网络错误");
                    }
                  }}
                >
                  保存
                </button>
              </div>
            </div>

            {/* 对话日志 */}
            <div className="admin-ai-section" style={{ marginTop: 24 }}>
              <h3>💬 对话记录</h3>
              <div className="admin-toolbar">
                <input
                  type="text"
                  placeholder="搜索对话内容/用户名/IP..."
                  value={aiLogSearch}
                  onChange={e => setAiLogSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loadAiLogs(1, aiLogSearch)}
                />
                <button onClick={() => loadAiLogs(1, aiLogSearch)}>搜索</button>
                <button
                  className="danger"
                  onClick={async () => {
                    if (!confirm("确定清空所有对话记录？此操作不可恢复！")) return;
                    await fetch(`${API_BASE}/admin/ai/logs`, { method: "DELETE", headers: headers() });
                    loadAiLogs(1, aiLogSearch);
                  }}
                >
                  🗑️ 清空全部
                </button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户</th>
                    <th>IP</th>
                    <th>用户消息</th>
                    <th>AI 回复</th>
                    <th>时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {aiLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.username}</td>
                      <td className="photo-key">{log.ip}</td>
                      <td className="comment-text-cell" title={log.user_message}>{log.user_message}</td>
                      <td className="comment-text-cell" title={log.ai_reply}>{log.ai_reply}</td>
                      <td className="time-cell">{formatTime(log.created_at)}</td>
                      <td>
                        <button className="sm danger" onClick={async () => {
                          if (!confirm("确定删除？")) return;
                          await fetch(`${API_BASE}/admin/ai/logs/${log.id}`, { method: "DELETE", headers: headers() });
                          loadAiLogs(aiLogPage, aiLogSearch);
                        }}>删除</button>
                      </td>
                    </tr>
                  ))}
                  {aiLogs.length === 0 && (
                    <tr><td colSpan="7" className="empty">暂无对话记录</td></tr>
                  )}
                </tbody>
              </table>

              {Math.ceil(aiLogTotal / 20) > 1 && (
                <div className="admin-pagination">
                  <button disabled={aiLogPage <= 1} onClick={() => loadAiLogs(aiLogPage - 1, aiLogSearch)}>上一页</button>
                  <span>{aiLogPage} / {Math.ceil(aiLogTotal / 20)}</span>
                  <button disabled={aiLogPage >= Math.ceil(aiLogTotal / 20)} onClick={() => loadAiLogs(aiLogPage + 1, aiLogSearch)}>下一页</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 用户管理 */}
        {tab === "users" && (
          <div className="admin-users">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>头像</th>
                  <th>用户名</th>
                  <th>角色</th>
                  <th>注册时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.banned ? "banned" : ""}>
                    <td>{u.id}</td>
                    <td><img className="user-avatar-sm" src={u.avatar} alt="" /></td>
                    <td>{u.username}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role === "admin" ? "管理员" : "访客"}</span></td>
                    <td className="time-cell">{formatTime(u.created_at)}</td>
                    <td>
                      <span className={`status-badge ${u.banned ? "banned" : "active"}`}>
                        {u.banned ? "已封禁" : "正常"}
                      </span>
                    </td>
                    <td>
                      {u.role !== "admin" && (
                        <>
                          <button className="sm" onClick={() => toggleBan(u)}>
                            {u.banned ? "解封" : "封禁"}
                          </button>
                          <button className="sm danger" onClick={() => deleteUser(u)}>删除</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="7" className="empty">暂无用户</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 留言管理 */}
        {tab === "guestbook" && (
          <div className="admin-guestbook">
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="搜索留言内容/用户名..."
                value={guestbookSearch}
                onChange={e => setGuestbookSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadGuestbook(1, guestbookSearch)}
              />
              <button onClick={() => loadGuestbook(1, guestbookSearch)}>搜索</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户</th>
                  <th>留言内容</th>
                  <th>管理员回复</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {guestbookList.map(g => (
                  <tr key={g.id}>
                    <td>{g.id}</td>
                    <td>
                      <img className="user-avatar-sm" src={g.avatar} alt="" />
                      {g.username}
                    </td>
                    <td className="comment-text-cell">{g.text}</td>
                    <td className="comment-text-cell">
                      {replyForm.id === g.id ? (
                        <div className="reply-edit">
                          <input
                            type="text"
                            value={replyForm.text}
                            onChange={e => setReplyForm(f => ({ ...f, text: e.target.value }))}
                            placeholder="输入回复..."
                            autoFocus
                          />
                          <button className="sm" onClick={() => replyGuestbook(g.id)}>保存</button>
                          <button className="sm" onClick={() => setReplyForm({ id: null, text: "" })}>取消</button>
                        </div>
                      ) : (
                        g.reply || "—"
                      )}
                    </td>
                    <td className="time-cell">{formatTime(g.created_at)}</td>
                    <td>
                      <button className="sm" onClick={() => setReplyForm({ id: g.id, text: g.reply || "" })}>
                        {g.reply ? "修改回复" : "回复"}
                      </button>
                      <button className="sm danger" onClick={() => deleteGuestbook(g.id)}>删除</button>
                    </td>
                  </tr>
                ))}
                {guestbookList.length === 0 && (
                  <tr><td colSpan="6" className="empty">暂无留言</td></tr>
                )}
              </tbody>
            </table>

            {Math.ceil(guestbookTotal / 20) > 1 && (
              <div className="admin-pagination">
                <button disabled={guestbookPage <= 1} onClick={() => loadGuestbook(guestbookPage - 1, guestbookSearch)}>上一页</button>
                <span>{guestbookPage} / {Math.ceil(guestbookTotal / 20)}</span>
                <button disabled={guestbookPage >= Math.ceil(guestbookTotal / 20)} onClick={() => loadGuestbook(guestbookPage + 1, guestbookSearch)}>下一页</button>
              </div>
            )}
          </div>
        )}

        {/* 账号设置 */}
        {tab === "settings" && (
          <div className="admin-settings">
            <h2>修改管理员密码</h2>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="原密码"
                value={pwdForm.oldPassword}
                onChange={e => setPwdForm(f => ({ ...f, oldPassword: e.target.value }))}
              />
              <input
                type="password"
                placeholder="新密码（至少6位）"
                value={pwdForm.newPassword}
                onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
              />
              <input
                type="password"
                placeholder="确认新密码"
                value={pwdForm.confirmPassword}
                onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))}
              />
              {pwdMsg && <p className={pwdMsg.includes("成功") ? "admin-success" : "admin-error"}>{pwdMsg}</p>}
              <button type="submit">修改密码</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;

import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./Login";
import Home from "./Home";
import Contact from "./Contact";
import Gallery from "./Gallery";
import Love from "./Love";
import Admin from "./Admin";

function App() {
  const [isLogin, setIsLogin] = useState(() => !!localStorage.getItem("user_login"));
  const [username, setUsername] = useState(() => localStorage.getItem("user_name") || "");
  const [avatar, setAvatar] = useState(() => localStorage.getItem("user_avatar") || "");
  const location = useLocation();

  // 登录状态持久化：变化时同步到 localStorage
  useEffect(() => {
    if (isLogin) {
      localStorage.setItem("user_login", "1");
      localStorage.setItem("user_name", username);
      localStorage.setItem("user_avatar", avatar);
    } else {
      localStorage.removeItem("user_login");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_avatar");
    }
  }, [isLogin, username, avatar]);

  // 管理员后台不需要网站登录
  if (location.pathname === "/admin") {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  if (!isLogin) {
    return (
      <Login
        setIsLogin={setIsLogin}
        setUsername={setUsername}
        setAvatar={setAvatar}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            username={username}
            avatar={avatar}
          />
        }
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/gallery"
        element={<Gallery username={username} avatar={avatar} />}
      />

      <Route
        path="/love"
        element={<Love username={username} avatar={avatar} />}
      />

      <Route
        path="/admin"
        element={<Admin />}
      />
    </Routes>
  );
}

export default App;

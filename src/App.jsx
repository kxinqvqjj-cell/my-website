import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./Login";
import Home from "./Home";
import Contact from "./Contact";
import Gallery from "./Gallery";
import Love from "./Love";
import Admin from "./Admin";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const location = useLocation();

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

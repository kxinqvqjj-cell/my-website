import { Routes, Route, Link } from "react-router-dom";

export default function App() {
  return (
    <div style={styles.page}>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

function Navbar() {
  return (
    <div style={styles.nav}>
      <div style={styles.logo}>MySite</div>

      <div style={styles.links}>
        <Link style={styles.link} to="/">首页</Link>
        <Link style={styles.link} to="/projects">项目</Link>
        <Link style={styles.link} to="/about">关于</Link>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div style={styles.center}>
      <h1>欢迎来到我的网站</h1>
      <p>Web Developer · AI Learner</p>
    </div>
  );
}

function Projects() {
  return (
    <div style={styles.center}>
      <h2>项目页面</h2>
      <p>AI Chat / Node API / React Website</p>
    </div>
  );
}

function About() {
  return (
    <div style={styles.center}>
      <h2>关于我</h2>
      <p>正在学习前端与 AI 开发的开发者</p>
    </div>
  );
}

const styles = {
  page: {
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Arial",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  logo: {
    fontWeight: "bold",
  },

  links: {
    display: "flex",
    gap: "20px",
  },

  link: {
    color: "white",
    textDecoration: "none",
    opacity: 0.8,
  },

  center: {
    padding: "80px",
    textAlign: "center",
  },
};
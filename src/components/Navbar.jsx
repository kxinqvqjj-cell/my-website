import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={styles.nav}>
      <div style={styles.logo}>MyPortfolio</div>

      <div style={styles.links}>
        <Link style={styles.link} to="/">首页</Link>
        <Link style={styles.link} to="/projects">项目</Link>
        <Link style={styles.link} to="/about">关于</Link>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "white",
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
};
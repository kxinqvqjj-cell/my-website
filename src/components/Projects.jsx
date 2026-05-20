export default function Projects() {
  return (
    <div style={styles.section}>
      <h2>项目展示</h2>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>AI Chat</h3>
          <p>基于 DeepSeek API</p>
        </div>

        <div style={styles.card}>
          <h3>个人网站</h3>
          <p>React Portfolio</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: {
    padding: "60px",
    color: "white",
    textAlign: "center",
  },

  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginTop: "30px",
  },

  card: {
    width: "250px",
    padding: "20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
  },
};
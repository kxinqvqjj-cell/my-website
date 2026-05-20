export default function Home() {
  return (
    <div style={styles.hero}>
      <h1 style={styles.title}>你好，我是开发者</h1>

      <p style={styles.subtitle}>
        React · Node.js · AI Developer
      </p>

      <button style={styles.button}>
        查看项目
      </button>
    </div>
  );
}

const styles = {
  hero: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "white",
  },

  title: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: "30px",
  },

  button: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};
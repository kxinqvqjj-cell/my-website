export default function About() {
  return (
    <div style={styles.section}>
      <h2>关于我</h2>

      <p>
        正在学习 React、Node.js 与 AI 应用开发。
      </p>
    </div>
  );
}

const styles = {
  section: {
    padding: "60px",
    color: "white",
    textAlign: "center",
  },
};
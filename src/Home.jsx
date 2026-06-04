import "./Home.css";
import { Link } from "react-router-dom";
function Home({
username,
avatar,}) {
  return (
    <div className="home">

      <div className="layout">

        {/* 左侧 */}
      {/* 左侧 */}
<div className="left-column">

  <div className="visitor-card">

    {/* 我的头像 */}
    <img
      src="/cjw.png"
      alt=""
      className="visitor-mini-avatar"
    />
{/* 音乐播放器 */}
  <div className="mini-music-player">

  <img
    src="/yinyuetouxiang.png"
    alt=""
    className="music-cover"
  />

  <h3>나란한 밤</h3>

  <p className="music-author">
    Parallel Night

  </p>

  <audio controls>
    <source
      src="/music.mp3"
      type="audio/mpeg"
    />
  </audio>

</div>
    {/* 访客卡片 */}
    <div className="visitor-info">

      <img
        src={avatar}
        alt=""
        className="visitor-avatar"
      />

      <div className="visitor-text">
        <h4>欢迎来访，{username}</h4>
        <p>👋 访客身份已同步</p>
      </div>

    </div>

    <h1 className="visitor-name">
      KXINCC
    </h1>

    <div className="visitor-tag">
      💻 软件工程 ｜ AI Agent 开发者
    </div>

    <div className="visitor-status">
      🟢 正在访问
    </div>

  </div>

  <Link
    to="/contact"
    className="contact-btn"
  >
    📬 点击联系我
  </Link>

</div>
        {/* 中间 */}
        <div className="center-column">

          <div className="panel">

            <h1 className="hero-title">
              Hello, I'm
              <br />
              KXINCC
            </h1>
          </div>
<div className="panel">
  <h2>关于我</h2>
            <p>
             莆院大三学子，AI Agent开发，热爱写随笔！
            </p>

            <p>
              我是天生的乐观主义者，喜欢用代码创造美好事物。无论是前端界面还是AI智能，我都充满热情地去探索和实现。
            </p>

          </div>

          {/* 兴趣收藏 */}
          <div className="panel">

            <h2>兴趣与收藏</h2>

            <div className="interest-grid">

             <Link
  to="/gallery"
  className="interest-card"
>
  <img src="/11.png" alt="图片" />
  <h3>我的图片</h3>
</Link>

             <Link
  to="/love"
  className="interest-card"
>
                <img src="/12.png" alt="热爱" />
                <h3>我的热爱</h3>
</Link>

            </div>

          </div>

          {/* 项目展示 */}
         <div className="panel">

  <h2>项目展示</h2>

  <div className="projects">

    <a
      href="https://kxinc.netlify.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="project-card"
    >
      <img
        src="/13.png"
        alt=""
        className="project-image"
      />

      <h3>个人博客</h3>

      <p>
        React + Vite 开发的现代登录页
      </p>
    </a>

    <a
  href="https://fastidious-parfait-4e91f0.netlify.app/"
  target="_blank"
  rel="noopener noreferrer"
  className="project-card"
>
      <img
        src="/14.png"
        alt=""
        className="project-image"
      />

      <h3>个人卡片</h3>

      <p>
        HTML + CSS + JS+Node.js + Express
      </p>
    </a>

  </div>

</div>
          {/* 教育背景 */}
          <div className="panel">

            <h2 className="section-title">
  教育背景
</h2>

        <div className="timeline">

  <div className="timeline-item">
    <div className="timeline-dot"></div>

    <div className="timeline-content">
      <span>小学 · 2011 - 2017</span>
      <h3>贵州省紫云县板当小学</h3>
    </div>
  </div>

  <div className="timeline-item">
    <div className="timeline-dot"></div>

    <div className="timeline-content">
      <span>初中 · 2017 - 2020</span>
      <h3>贵州省紫云县第二中学</h3>
    </div>
  </div>

  <div className="timeline-item">
    <div className="timeline-dot"></div>

    <div className="timeline-content">
      <span>高中 · 2020 - 2023</span>
      <h3>长顺县民族高级中学</h3>
    </div>
  </div>

  <div className="timeline-item">
    <div className="timeline-dot"></div>

    <div className="timeline-content">
      <span>大学 · 2023 - 至今</span>
      <h3>莆田学院</h3>
      <p>软件工程专业（在读）</p>
    </div>
  </div>

</div>

          </div>

        </div>

        {/* 右侧 */}
        <div className="right-column">

          <div className="panel">

            <h2>个人统计</h2>   

            <div className="stats">

              <div className="stat-card">
                <h2>7+</h2>
                <p>个人随笔</p>
              </div>

              <div className="stat-card">
                <h2>8+</h2>
                <p>成长记录</p>
              </div>

            </div>

          </div>

          <div className="panel">

            <h2>技术栈</h2>

            <div className="skills">
              <span>HTML</span>
              <span>CSS</span>
              <span>JavaScript</span>
              <span>React</span>
              <span>AI Agent</span>
              <span>Netlify</span>
               <span>JWT登录</span>
            </div>

          </div>

        </div>

      </div>

   </div>
  );
}

export default Home;
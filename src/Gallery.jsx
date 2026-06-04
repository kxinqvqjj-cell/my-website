import "./Gallery.css";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const LS_KEY = "gallery_data";

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

function Gallery({ username = "游客", avatar = "" }) {
  const tabNameMap = {
    campus: "树",
    life: "生活",
    travel: "旅游",
    note: "随笔",
  };

  const [tab, setTab] = useState("campus");
  const [index, setIndex] = useState(0);
  
  // 用 ref 存储实时数据，UI 通过 forceUpdate 触发刷新
  const likesRef = useRef(loadData().likes || {});
  const [likesVersion, setLikesVersion] = useState(0); // 版本号触发重渲染
  const likes = likesRef.current;

  const commentsRef = useRef(loadData().comments || {});
  const [commentsVersion, setCommentsVersion] = useState(0);
  const comments = commentsRef.current;

  const [input, setInput] = useState("");

  // 音乐播放器
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  // 点赞动画
  const [hearts, setHearts] = useState([]);

  // 大图查看
  const [lightbox, setLightbox] = useState(false);

  // 异步保存到 localStorage（防抖）
  const saveTimer = useRef(null);
  const needSave = useRef(false);
  useEffect(() => {
    if (!needSave.current) return;
    needSave.current = false;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData({ likes: likesRef.current, comments: commentsRef.current });
    }, 500);
    return () => {};
  }, [likesVersion, commentsVersion]);

  const photos = {
    campus: [
      "/20.png", "/21.png", "/22.png", "/23.png", "/24.png",
      "/25.png", "/26.png", "/27.png", "/28.png", "/29.png",
      "/30.png", "/31.png", "/32.png", "/33.png", "/34.png",
      "/35.png", "/36.png", "/37.png", "/38.png", "/39.png",
      "/40.png", "/41.png", "/42.png", "/43.png", "/44.png",
      "/45.png", "/46.png", "/47.png", "/48.png", "/49.png",
      "/50.png", "/51.png", "/52.png", "/53.png", "/54.png",
      "/55.png", "/56.png", "/57.png", "/58.png", "/59.png",
    ],
    life: [
      "/150.png", "/151.png", "/152.png", "/153.png", "/154.png",
      "/155.png", "/156.png", "/157.png", "/158.png", "/159.png",
      "/160.png", "/161.png", "/162.png", "/163.png", "/164.png",
      "/165.png", "/166.png", "/167.png", "/168.png", "/169.png",
      "/170.png", "/171.png", "/172.png", "/173.png", "/174.png",
      "/175.png", "/176.png", "/177.png", "/178.png", "/179.png",
      "/180.png", "/181.png", "/182.png", "/183.png", "/184.png",
      "/185.png", "/186.png", "/187.png", "/188.png", "/189.png",
      "/190.png", "/191.png", "/192.png", "/193.png", "/194.png",
    ],
    travel: [
      "/79.png", "/80.png", "/81.png", "/82.png", "/83.png",
      "/84.png", "/85.png", "/86.png", "/87.png", "/88.png",
      "/89.png", "/90.png", "/91.png", "/92.png", "/93.png",
      "/94.png", "/95.png", "/96.png", "/97.png", "/98.png",
      "/99.png", "/100.png", "/101.png", "/102.png", "/103.png",
      "/104.png", "/105.png", "/106.png", "/107.png", "/108.png",
      "/109.png", "/110.png", "/111.png", "/112.png", "/113.png",
      "/114.png", "/115.png", "/116.png", "/117.png", "/118.png",
      "/119.png", "/120.png", "/121.png", "/122.png", "/123.png",
      "/124.png", "/125.png", "/126.png", "/127.png", "/128.png",
      "/129.png", "/130.png", "/131.png", "/132.png", "/133.png",
      "/134.png", "/135.png", "/136.png", "/137.png", "/138.png",
      "/139.png", "/140.png", "/141.png", "/142.png", "/143.png",
      "/144.png", "/145.png", "/146.png", "/147.png", "/148.png",
      "/149.png",
    ],
    note: [
      "/60.png", "/61.png", "/62.png", "/63.png", "/64.png",
      "/65.png", "/66.png", "/67.png", "/68.png", "/69.png",
      "/70.png", "/71.png", "/72.png", "/73.png", "/74.png",
      "/75.png", "/76.png", "/77.png", "/78.png",
    ],
  };
  const list = photos[tab];
  const prev = () => {
    setIndex(i => {
      const len = photos[tab].length;
      return i === 0 ? len - 1 : i - 1;
    });
  };

  const next = () => {
    setIndex(i => {
      const len = photos[tab].length;
      return i === len - 1 ? 0 : i + 1;
    });
  };

  const currentKey = `${tab}-${index}`;

  const toggleLike = useCallback(() => {
    const key = `${tab}-${index}`;
    likesRef.current = {
      ...likesRef.current,
      [key]: (likesRef.current[key] || 0) + 1,
    };
    setLikesVersion(v => v + 1);
    needSave.current = true;

    // 爱心动画
    const idBase = Date.now();
    const newHearts = Array.from({ length: 8 }, (_, i) => ({
      id: idBase + i,
      x: (Math.random() - 0.5) * 80,
      y: -(Math.random() * 60 + 20),
      rotate: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.8,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 800);
  }, [tab, index]);

  const addComment = () => {
    const text = input.trim();
    if (!text) return;
    const entry = {
      user: username,
      avatar: avatar || "/1.png",
      text,
      time: Date.now(),
    };
    const key = currentKey;
    commentsRef.current = {
      ...commentsRef.current,
      [key]: [...(commentsRef.current[key] || []), entry],
    };
    setCommentsVersion(v => v + 1);
    needSave.current = true;
    setInput("");
  };

  return (
    <div className="gallery-page">

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} src="/xuezhiqian.mp3" loop />

      <div className="top-left-bar">
        <Link to="/" className="back-btn">← 返回主页</Link>
      </div>

      {/* 音乐播放器 */}
      <div className="music-player">
        <img
          src="/yinyuetouxiang2.png"
          alt=""
          className={`music-cover ${playing ? "spinning" : ""}`}
          onClick={toggleMusic}
        />
        <div className="music-info">
          <h3 className="music-title">被人</h3>
          <p className="music-author">薛之谦</p>
        </div>
        <div className="music-controls">
          <button className="music-play-btn" onClick={toggleMusic}>
            {playing ? "⏸" : "▶"}
          </button>
          <input
            type="range"
            className="music-volume"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolume}
          />
        </div>
      </div>

      <h1>📸 相册</h1>

      {/* 分类 */}
      <div className="gallery-tabs">
        {Object.keys(photos).map(key => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => {
              setTab(key);
              setIndex(0);
            }}
          >
              {tabNameMap[key]}
          </button>
        ))}
      </div>

  {/* 主卡片 */}
<div className="viewer">

  <button onClick={prev} className="nav">←</button>

  <div className="stack">
    {list.map((img, i) => {
      const offset = i - index;

      if (offset < 0 || offset > 2) return null;

      return (
        <div
          key={i}
          className="stack-card"
           onClick={() => { if (offset === 0) setLightbox(true); else setIndex(i); }} 
          style={{
            transform: `
              translateX(${offset * 18}px)
              scale(${1 - offset * 0.05})
              translateY(${offset * 6}px)
            `,
            opacity: offset === 0 ? 1 : 0.6 - offset * 0.2,
            zIndex: 10 - offset,
          }}
        >
          <img src={img} alt="" />
        </div>
      );
    })}
  </div>

  <button onClick={next} className="nav">→</button>

</div>

{/* 计数 + 点赞 + 留言 */}
<div className="gallery-actions">
   <div className="counter" key={index}>
    {index + 1} / {list.length}
  </div>

  <button
    className="like-btn"
    onClick={toggleLike}
  >
    ❤️ {likes[currentKey] || 0}
    {hearts.map(h => (
      <span
        key={h.id}
        className="heart-particle"
        style={{
          '--dx': h.x + 'px',
          '--dy': h.y + 'px',
          '--rot': h.rotate + 'deg',
          '--sc': h.scale,
        }}
      >
        ❤️
      </span>
    ))}
  </button>
</div>

<div className="comment-box">
  <img className="comment-avatar" src={avatar || "/1.png"} alt="" />
  <input
    type="text"
    placeholder="说点什么吧..."
    value={input}
    onChange={e => setInput(e.target.value)}
    onKeyDown={e => e.key === "Enter" && addComment()}
  />
  <button onClick={addComment}>发送</button>
</div>

<div className="comment-list">
  {(comments[currentKey] || []).map((c, i) => (
    <div key={i} className="comment-item">
      <img className="comment-user-avatar" src={c.avatar} alt="" />
      <div className="comment-body">
        <span className="comment-user">{c.user}</span>
        <span className="comment-text">{c.text}</span>
      </div>
    </div>
  ))}
</div>

      {/* dots */}
      <div className="dots">
        {list.map((_, i) => (
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <span className="lightbox-close">✕</span>
          <div className="lightbox-nav left" onClick={e => { e.stopPropagation(); prev(); }}>‹</div>
          <img
            src={list[index]}
            alt=""
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          <div className="lightbox-nav right" onClick={e => { e.stopPropagation(); next(); }}>›</div>
          <div className="lightbox-counter">{index + 1} / {list.length}</div>
        </div>
      )}

    </div>
  );
}

export default Gallery;
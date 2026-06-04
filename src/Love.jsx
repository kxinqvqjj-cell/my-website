import "./Gallery.css";
import "./Love.css";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getLikeCounts, addLike, clearAllLikes, getComments, addComment as apiAddComment } from "./api";

function Love({ username = "游客", avatar = "" }) {
  const [index, setIndex] = useState(0);

  const [likes, setLikes] = useState({});
  const currentKey = `love-${index}`;

  const [comments, setComments] = useState([]);

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

  const photos = [
    "/195.png", "/196.png", "/197.png", "/198.png", "/199.png",
    "/200.png", "/201.png", "/202.png", "/203.png", "/204.png",
    "/205.png", "/206.png", "/207.png", "/208.png", "/209.png",
    "/210.png", "/211.png", "/212.png", "/213.png", "/214.png",
    "/215.png", "/216.png", "/217.png", "/218.png", "/219.png",
    "/220.png", "/221.png", "/222.png", "/223.png", "/224.png",
    "/225.png", "/226.png", "/227.png", "/228.png", "/229.png",
    "/230.png", "/231.png", "/232.png", "/233.png", "/234.png",
    "/235.png", "/236.png", "/237.png", "/238.png", "/239.png",
    "/240.png", "/241.png", "/242.png", "/243.png", "/244.png",
    "/245.png", "/246.png", "/247.png", "/248.png", "/249.png",
    "/250.png", "/251.png", "/252.png", "/253.png", "/254.png",
    "/255.png", "/256.png", "/257.png", "/258.png", "/259.png",
    "/260.png", "/261.png", "/262.png", "/263.png", "/264.png",
    "/265.png", "/266.png", "/267.png", "/268.png", "/269.png",
    "/270.png", "/271.png", "/272.png", "/273.png",
  ];

  // 加载所有点赞数
  useEffect(() => {
    const keys = photos.map((_, i) => `love-${i}`);
    getLikeCounts(keys).then(data => setLikes(data)).catch(() => {});
  }, []);

  // 加载当前照片评论
  useEffect(() => {
    getComments(currentKey).then(data => setComments(data)).catch(() => {});
  }, [index]);

  const clearLikes = async () => {
    await clearAllLikes();
    const keys = photos.map((_, i) => `love-${i}`);
    const data = await getLikeCounts(keys);
    setLikes(data);
  };

  const prev = () => {
    setIndex(i => (i === 0 ? photos.length - 1 : i - 1));
  };

  const next = () => {
    setIndex(i => (i === photos.length - 1 ? 0 : i + 1));
  };

  const toggleLike = useCallback(async () => {
    try {
      const newCount = await addLike(currentKey);
      setLikes(prev => ({ ...prev, [currentKey]: newCount }));
    } catch {}

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
  }, [currentKey]);

  const handleAddComment = async () => {
    const text = input.trim();
    if (!text) return;
    try {
      const entry = await apiAddComment(currentKey, {
        username,
        avatar: avatar || "/1.png",
        text,
      });
      setComments(prev => [...prev, entry]);
      setInput("");
    } catch {}
  };

  return (
    <div className="gallery-page love-page">

      <audio ref={audioRef} src="/music1.mp3" loop />

      <div className="top-left-bar">
        <Link to="/" className="back-btn">← 返回主页</Link>
      </div>

      <div className="music-player">
        <img
          src="/yinyuetouxiang3.png"
          alt=""
          className={`music-cover ${playing ? "spinning" : ""}`}
          onClick={toggleMusic}
        />
        <div className="music-info">
          <h3 className="music-title">Parallel Night</h3>
          <p className="music-author">나란한 밤</p>
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

      <h1> 我的最爱小韩</h1>

      <div className="viewer">
        <button onClick={prev} className="nav">←</button>

        <div className="stack">
          {photos.map((img, i) => {
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

      <div className="gallery-actions">
        <div className="counter" key={index}>
          {index + 1} / {photos.length}
        </div>

        <button className="like-btn" onClick={toggleLike}>
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
        {username === "KxinqvqJJ" && <button className="like-btn" onClick={clearLikes} title="清除所有点赞" style={{fontSize: "0.85em", opacity: 0.7}}>🗑️</button>}
      </div>

      <div className="comment-box">
        <img className="comment-avatar" src={avatar || "/1.png"} alt="" />
        <input
          type="text"
          placeholder="说点什么吧..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddComment()}
        />
        <button onClick={handleAddComment}>发送</button>
      </div>

      <div className="comment-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <img className="comment-user-avatar" src={c.avatar} alt="" />
            <div className="comment-body">
              <span className="comment-user">{c.username}</span>
              <span className="comment-text">{c.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dots">
        {photos.map((_, i) => (
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
            src={photos[index]}
            alt=""
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          <div className="lightbox-nav right" onClick={e => { e.stopPropagation(); next(); }}>›</div>
          <div className="lightbox-counter">{index + 1} / {photos.length}</div>
        </div>
      )}

    </div>
  );
}

export default Love;

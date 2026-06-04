import "./Login.css";
import { useState, useRef } from "react";

function Login({
  setIsLogin,
  setUsername: saveUsername,
  setAvatar: saveAvatar,
}) {
  const dragged = useRef(false);
  const avatarListRef = useRef(null);

  const [entered, setEntered] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [userPhoto, setUserPhoto] = useState(null);

  const avatars = [
    "/1.png",
    "/2.png",
    "/3.png",
    "/4.png",
    "/5.png",
    "/6.png",
    "/7.png",
    "/8.png",
  ];
const isDown = useRef(false);
const startX = useRef(0);
const scrollLeft = useRef(0);

const handleMouseDown = (e) => {

  dragged.current = false;

  isDown.current = true;

  startX.current =
    e.pageX - avatarListRef.current.offsetLeft;

  scrollLeft.current =
    avatarListRef.current.scrollLeft;
};

const handleMouseLeave = () => {
  isDown.current = false;
};

const handleMouseUp = () => {
  isDown.current = false;
};

const handleMouseMove = (e) => {

  if (!isDown.current) return;

  dragged.current = true;

  e.preventDefault();

  const x =
    e.pageX - avatarListRef.current.offsetLeft;

  const walk =
    (x - startX.current) * 2;

  avatarListRef.current.scrollLeft =
    scrollLeft.current - walk;
};

  /* ===== 入口欢迎页 ===== */
  if (!entered) {
    return (
      <div className="login-wrapper">
        <div className="bg"></div>
        <div className="page">
          <div className="welcome-entrance">
            <img src="/cjw1.png" alt="avatar" className="welcome-avatar" />
            <h1 className="welcome-title">kxinc</h1>
            <p className="welcome-sub">欢迎来到我的个人网站</p>
            <button className="welcome-btn" onClick={() => setEntered(true)}>
              进 入
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===== 登录页 ===== */
  return (
    <div className="login-wrapper">
      <div className="bg"></div>

      <div className="page">
        <div className="card">

          <div className="left-panel">
  <img
    src="/9.png"
    alt="my-photo"
  />
</div>

          <div className="right-panel">

            <h1>欢迎来访！</h1>
            
<div
  className="avatar-list"
  ref={avatarListRef}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseLeave}
>

  {avatars.map((avatar, index) => (
    <div
      key={index}
      className={
        selectedAvatar === index
          ? "avatar active"
          : "avatar"
      }
      onClick={() => {
  setSelectedAvatar(index);

}}
    >
      <img
        src={avatar}
        alt=""
      />
    </div>
  ))}
<label className="add-avatar">
  +

  <input
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files[0];

      if (file) {
        setUserPhoto(
          URL.createObjectURL(file)
        );
      } 
    }}
  />
</label>
</div>
            <p>选择您的形象并输入姓名</p>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) =>
    setUsername(e.target.value)
  }
/>

<button
  onClick={() => {

    if (!username.trim()) {
      alert("请输入用户名");
      return;
    }

    saveUsername(username);

    saveAvatar(
      userPhoto
        ? userPhoto
        : avatars[selectedAvatar]
    );

    setIsLogin(true);

  }}
>
  登录
</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
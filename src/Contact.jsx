import "./Contact.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Contact() {
const [modalImg, setModalImg] = useState(null);
const [showModal, setShowModal] = useState(false);

  const openModal = (img) => {
    setModalImg(img);
    // 下一帧触发 transition
    requestAnimationFrame(() => {
      setShowModal(true);
    });
  };

  const closeModal = () => {
    setShowModal(false);
    // 等 transition 结束再清掉图片
    setTimeout(() => {
      setModalImg(null);
    }, 300);
  };

  return (
    <div className="contact-page">

      <div className="contact-card">

        <Link to="/" className="back-btn">
          ← 返回主页
        </Link>

        <h1>联系我</h1>

        <div className="contact-grid">

          <div className="contact-item" onClick={() => openModal("/16.png")}>
            <h2>微信</h2>
            <img src="/16.png" alt="" />
          </div>

          <div className="contact-item" onClick={() => openModal("/17.png")}>
            <h2>网易云音乐</h2>
            <img src="/17.png" alt="" />
          </div>

          <div className="contact-item" onClick={() => openModal("/18.png")}>
            <h2>抖音</h2>
            <img src="/18.png" alt="" />
          </div>

        </div>

      </div>

      {modalImg && (
  <div className={`modal ${showModal ? "show" : ""}`} onClick={closeModal}>
    <img src={modalImg} alt="" />
  </div>
)}

    </div>
  );
}

export default Contact;
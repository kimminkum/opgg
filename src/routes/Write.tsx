// Write.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import "../css/Community.scss";

const Write: React.FC = () => {
  const { id } = useParams();
  const parsedId = id ? parseInt(id) : undefined;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (parsedId !== undefined) {
      axios
        .get(`http://localhost:8008/detail/${parsedId}`)
        .then((res) => {
          const boardDate = res.data[0];
          setTitle(boardDate.BOARD_TITLE);
          setContent(boardDate.BOARD_CONTENT);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setTitle("");
      setContent("");
    }
  }, [parsedId]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("전부 입력해 주세요.");
      return;
    }

    if (parsedId !== undefined) {
      axios
        .put(`http://localhost:8008/update/${parsedId}`, { title, content })
        .then((response) => {
          console.log(response);
          navigate("/");
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      axios
        .post("http://localhost:8008/insert", { title, content })
        .then((response) => {
          console.log("Post created successfully:", response.data);
          navigate("/"); // useNavigate를 사용하여 경로 변경
        })
        .catch((error) => {
          console.error("Error creating post:", error);
        });
    }
  };

  return (
    <div className="write">
      <div>
        <h1>{parsedId !== undefined ? "글 수정" : "글 작성"}</h1>
        <form>
          <label>Title : </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <label>Content : </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <br />

          <div className="flex">
            <button type="button" onClick={handleSave}>
              Save
            </button>
            <Link to="/">
              <button>돌아가기</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Write;

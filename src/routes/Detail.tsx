// Detail.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../css/Community.scss";

interface Board {
  BOARD_TITLE: string;
  BOARD_CONTENT: string;
  // 다른 필요한 속성들 추가
}

interface CommentItem {
  redet_id: number;
  redet_content: string;
}

const Detail: React.FC = () => {
  const { id } = useParams();
  const parsedId = id ? parseInt(id) : undefined;
  const [board, setBoard] = useState<Board | null>(null); // 초기값은 null로 설정
  const navigate = useNavigate();
  const [comment, setComment] = useState<CommentItem[]>([]);
  const [redet, setRedet] = useState("");

  useEffect(() => {
    if (parsedId !== undefined) {
      axios
        .post(`http://localhost:8008/detail`, { boardIdList: parsedId })
        .then((response) => {
          setBoard(response.data[0]);
        })
        .catch((error) => {
          console.error("Error fetching board details:", error);
        });

      axios
        .post(`http://localhost:8008/comment`, { boardIdList: parsedId })
        .then((res) => {
          // res.data는 [{ redet_id: 1, redet_content: '댓글 내용' }, ...]와 같은 형태의 배열
          setComment(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [parsedId, comment]);

  if (!board) {
    return <div>Loading...</div>;
  }

  const handleDelete = () => {
    console.log("start");
    if (parsedId !== undefined) {
      axios
        .delete(`http://localhost:8008/delete/${parsedId}`)
        .then((response) => {
          console.log("none");
          console.log("Post deleted successfully:", response.data);
          // 삭제 성공 시 홈페이지로 이동
          navigate("/");
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
          console.log("huri");
        });
    }
  };

  const handleUpdate = () => {
    navigate(`/write/${parsedId}`);
  };

  const handleDeleteComment = (redetId: number) => {
    axios
      .delete(`http://localhost:8008/redet/${redetId}`)
      .then((res) => {
        console.log("댓글 삭제 성공:", res.data);

        // 삭제 후 댓글 목록을 다시 불러와 화면을 갱신
        axios
          .post(`http://localhost:8008/comment`, { boardIdList: parsedId })
          .then((res) => {
            setComment(res.data);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error("댓글 삭제 에러:", err);
      });
  };

  const onRedet = () => {
    if (!redet.trim()) {
      return;
    }

    axios
      .post("http://localhost:8008/redet", { redet, id })
      .then((res) => {
        console.log("rok", res.data);
      })
      .catch((err) => {
        console.error("ERROR :", err);
      });

    setRedet("");
  };

  return (
    <div className="detail">
      <div>
        <h2>글 상세 내용</h2>
        <div className="detail_box">
          <div className="title_p">제목 : {board.BOARD_TITLE}</div>
          <div className="content_p">{board.BOARD_CONTENT}</div>

          <div className="comment_p">
            {/* 배열 형태의 comment를 매핑하여 표시 */}
            {comment.map((commentItem, index) => (
              <div key={index} className="flex_start comment_box">
                <div>{commentItem.redet_content}</div>

                <button
                  type="button"
                  className="x_button"
                  onClick={() => handleDeleteComment(commentItem.redet_id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="redets">
          <input
            type="text"
            value={redet}
            onChange={(e) => setRedet(e.target.value)}
          />
          <button type="button" onClick={onRedet}>
            댓글
          </button>
        </div>

        <div className="flex_end">
          <button onClick={handleUpdate}>수정하기</button>
          <Link to="/">
            <button>돌아가기</button>
          </Link>
          <button className="red_btn" onClick={handleDelete}>
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;

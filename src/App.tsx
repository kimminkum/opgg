import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./css/basic.scss";
import "./css/Main.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./routes/Main";
import Community from "./routes/Community";
import Detail from "./routes/Detail";
import Write from "./routes/Write";

const App: React.FC = () => {
  const [loginOn, setLoginOn] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [commuInfo, setCommuInfo] = useState<{
    accessToken: string;
    userId: string;
    nickname: string;
  } | null>(null);

  const handleLoginStatusChange = (data: {
    isLoggedIn: boolean;
    accessToken: string;
    userId: string;
    nickname: string;
  }) => {
    setLoginOn(data.isLoggedIn);
    setCommuInfo({
      accessToken: data.accessToken,
      userId: data.userId,
      nickname: data.nickname
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Header windowWidth={windowWidth}></Header>
        {/* header */}
        {/* router */}

        <Routes>
          <Route path="/" element={<Main windowWidth={windowWidth} />}></Route>
          <Route path="/Community" element={<Community />}></Route>
          <Route path="/Community/Detail/:id" element={<Detail />}></Route>
          <Route path="/Write" element={<Write />}></Route>
          <Route path="/Write/:id" element={<Write />}></Route>
        </Routes>

        <Footer windowWidth={windowWidth}></Footer>
      </BrowserRouter>
    </div>
  );
};

export default App;

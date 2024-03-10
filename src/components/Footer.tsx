import styled from "styled-components";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import opgglogo from "../img/opgglogo.svg";
import instar from "../img/icon-logo-instagram.svg";
import youtube from "../img/icon-logo-youtube.svg";
import x from "../img/icon-logo-x.svg";
import facebook from "../img/icon-logo-facebook.svg";
import data from "../data/footerdata";

interface FooterProps {
  windowWidth: number;
}

const Footer: React.FC<FooterProps> = ({ windowWidth }) => {
  return (
    <div>
      <div className="footerline">
        <div>
          {windowWidth > 1240 && (
            <div>
              <img src={opgglogo} alt="" />
            </div>
          )}
          <div>
            <p className="title">OP.GG</p>
            <ul>
              <li>
                <p>About OP.GG </p>
              </li>
              <li>
                <p>Company</p>
              </li>
              <li>
                <p>Blog</p>
              </li>
              <li>
                <p>히스토리</p>
              </li>
            </ul>
          </div>
          <div>
            <p className="title">Products</p>

            <ul>
              {data.map((item: { id: number; name: string }) => (
                <li key={item.id} className="flex">
                  <p>{item.name}</p>
                  <span>
                    <FontAwesomeIcon icon={faGamepad} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="title">APPS</p>
            <ul>
              <li className="flex">
                <p>OP.GG Android App</p>
                <span>
                  <FontAwesomeIcon icon={faGamepad} />
                </span>
              </li>
              <li className="flex">
                <p>OP.GG IOS App</p>
                <span>
                  <FontAwesomeIcon icon={faGamepad} />
                </span>
              </li>
              <li className="flex">
                <p>TFT Android App</p>
                <span>
                  <FontAwesomeIcon icon={faGamepad} />
                </span>
              </li>
              <li className="flex">
                <p>TFT IOS App</p>
                <span>
                  <FontAwesomeIcon icon={faGamepad} />
                </span>
              </li>
            </ul>
          </div>
          <div>
            <p className="title">Resources</p>
            <ul>
              <li className="bold">
                <p>개인정보처리방침</p>
              </li>
              <li>
                <p>이용약관</p>
              </li>
              <li>
                <p>도움말</p>
              </li>
              <li>
                <p>이메일 문의하기</p>
              </li>
              <li>
                <p>고객센터 문의</p>
              </li>
            </ul>
          </div>
          <div>
            <p className="title">More</p>
            <ul>
              <li>제휴</li>
              <li>광고</li>
              <li>채용</li>
            </ul>
          </div>
        </div>

        <div>
          <ul className="iconbox">
            <li>
              <img src={instar} alt="" />
            </li>
            <li>
              <img src={youtube} alt="" />
            </li>
            <li>
              <img src={x} alt="" />
            </li>
            <li>
              <img src={facebook} alt="" />
            </li>
          </ul>
          <div className="footertxt">
            <ul>
              <li className="small">주식회사 오피지지 (OP.GG)</li>
              <li className="small">
                통신판매업신고 : 제2019-서울강남-01973호
              </li>
              <li className="small">사업자등록번호 : 295-88-00023</li>
              <li className="small">대표자 : 최상락</li>
              <li className="small">
                서울특별시 강남구 테헤란로 507, 1층, 2층(삼성동, WeWork빌딩)
              </li>
              <li className="small">전화 : 02-455-9903 (평일 09:00 ~ 18:00)</li>
              <li className="small">이메일 : service@op.gg</li>
            </ul>
            <div>
              <p className="small">
                © 2012-2024 OP.GG. OP.GG is not endorsed by Riot Games and does
                not reflect the views or opinions of Riot Games or anyone
                officially involved in producing or managing League of Legends.
                League of Legends and Riot Games are trademarks or registered
                trademarks of Riot Games, Inc. League of Legends © Riot Games,
                Inc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

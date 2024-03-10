import React from "react";
import { Link } from "react-router-dom";

import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import lol from "../img/lol.svg";
import opgglogo from "../img/opgglogo.svg";

interface HeaderProps {
  windowWidth: number;
}

const Header: React.FC<HeaderProps> = ({ windowWidth }) => {
  return (
    <div>
      <div>
        <div className="first flex_sb">
          <div className="logoBox flex">
            <div className="flex">
              <a href="/mainpj" className="flex">
                <img src={lol} alt="" />
                {windowWidth > 1240 && <span>리그오브레전드</span>}
              </a>
            </div>
            <div className="flex">
              <a href="/mainpj">
                <img src={opgglogo} alt="" />
              </a>
            </div>
            {windowWidth < 1240 && (
              <div>
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
          </div>
          <div className="ectBox flex_end ">
            <div>
              <button>로그인</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

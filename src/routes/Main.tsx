import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import IRON from "../img/iorn.webp";
import BRONZE from "../img/bronze.webp";
import SILVER from "../img/silver.webp";
import GOLD from "../img/gold.webp";
import PLATINUM from "../img/platinum.webp";
import EMERALD from "../img/emerald.webp";
import DIAMOND from "../img/diamond.webp";
import MASTER from "../img/master.webp";
import GRANDMASTER from "../img/grandmaster.webp";
import CHALLENGER from "../img/challenger.webp";
import { Console } from "console";

interface riotNameTag {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface riotGameName {
  accountId: string;
  profileIconId: number;
  revisionData: number;
  name: string;
  id: string;
  puuid: string;
  summonerLevel: number;
}

interface riotTagName {
  gameName: string;
  tagLine: string;
}

interface riotUsertier {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}

interface MyMatchData {
  metadata: {
    participants: string[]; // participants 배열의 원소가 어떤 타입인지 명시 필요
    // 다른 metadata 속성들에 대한 타입 명시
  };
  info: {
    gameDuration: number;
    gameMode: string;
    gameEndTimestamp: number;
    gameVersion: string;
    participants: {
      championId: number;
      champLevel: number;
      championName: string;
      assists: number;
      kills: number;
      deaths: number;
      win: boolean;
      summoner1Id: number;
      summoner2Id: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      visionWardsBoughtInGame: number;
      totalMinionsKilled: number;
      teamId: number;
      // 필요한 다른 속성들 추가
    }[];
  };
}

interface MatchInfo {
  metadata: {
    participants: string[];
    dataVersion: string;
    matchId: string;
  };
  info: {
    gameId: number;
    gameVersion: string;
    teams: {
      win: boolean;
    };
    participants: {
      champLevel: number;
      championName: string;
      assists: number;
      kills: number;
      deaths: number;
      dragonKills: number; // 파괴 용
      turretKills: number; //파괴 타워
      baronKills: number; // 파괴 바론
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      championId: number;
      totalMinionsKilled: number; // 미니언 킬
      killingSprees: number; // 연속 처치 더블, 트리플 같은 것.
      participantId: number; // 고유 식별자
      timePlayed: number;
      totalDamageDealtToChampions: number; // 적 챔피언에게 입힌 피해량.
      visionWardsBoughtInGame: number; // 제어와드구매수
      wardKills: number; //와드 처치
      wardsPlaced: number; // 와드 설치
      riotIdName: string;
      riotIdTagline: string;
      summoner1Id: number;
      summoner2Id: number;
      summonerName: string;
      teamPosition: string;
      win: boolean;
      puuid: string;
      teamId: number;
      visionScore: number;
      /** 캐릭터, 판수, 킬관여율, cs양, 분당cs */

      /** 랭크(솔랭), 시간(1시간 전, 하루 전), 승패, 경기 시간(15분 gg), 킬관여, 제어와드,
       *  cs, 분당cs, 경기 종료 시점 아이템, 챔피언, 스펠 1, 2, 룬 1, 2, k/d/a, 상대 챔피언들,
       *  이름들, 우리편 챔피언들, 이름, 피해량, 와드, 바론킬, 용킬, 유충킬, 포탑, 티어*/
    }[]; // << 옆의 대괄호는 participants의 속성이 배열이란 뜻;
  };
  assistsArray: number[];
  deathsArray: number[];
}

interface MainProps {
  windowWidth: number;
}

const Main: React.FC<MainProps> = ({ windowWidth }) => {
  const [name, setName] = useState<string>("");
  const [tier, setTier] = useState<string | undefined>(undefined);
  const [count, setCount] = useState(1);
  const [underStates, setUnderStates] = useState<boolean[]>([]);

  const [matchInfoData, setMatchInfoData] = useState<MatchInfo[]>([]);
  const [myMatchInfoDataArray, setMyMatchInfoDataArray] = useState<
    MyMatchData[]
  >([]);
  const [riotGameName, setRiotGameName] = useState<riotGameName | null>(null);
  const [riotNameTag, setRiotNameTag] = useState<riotNameTag | null>(null);
  const [riotTagName, setRiotTagName] = useState<riotTagName | null>(null);
  const [riotUserInfo, setRiotUserInfo] = useState<riotUsertier | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [favoritOn, setFavoritOn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const riotApiKey = process.env.REACT_APP_RIOT_API_KEY;
  const [winning, setWinning] = useState<number | undefined>(undefined);

  useEffect(() => {
    // 여기서 초기값 설정
    const initialStates = Array(myMatchInfoDataArray.length).fill(false);
    setUnderStates(initialStates);
  }, [myMatchInfoDataArray]);

  const fetchData = async (gameName: string, tagLine: string) => {
    setLoading(true);
    setError(null);
    setMyMatchInfoDataArray([]);
    setMatchInfoData([]);
    setRiotGameName(null);
    setRiotNameTag(null);
    setRiotUserInfo(null);
    setRiotTagName(null);

    try {
      const response = await axios.get(
        `http://localhost:8008/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
        {
          headers: {
            "X-Riot-Token": riotApiKey
          }
        }
      );

      const nameTag = response.data;
      setRiotNameTag(nameTag);

      fetchData2(nameTag.puuid);
    } catch (err) {
      console.error("first name, tag : ", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData2 = async (puuid: string) => {
    try {
      const response2 = await axios.get(
        `http://localhost:8008/lol/summoner/v4/summoners/by-puuid/${puuid}`, // 프록시 서버 엔드포인트로 변경
        {
          headers: {
            "X-Riot-Token": riotApiKey
          }
        }
      );

      const riotCharacterData = response2.data;

      setRiotGameName(riotCharacterData);

      fetchData3(riotCharacterData.puuid);

      fetchData4(riotCharacterData.id);

      fetchData5(riotCharacterData.puuid);
    } catch (err) {
      console.error("summoners data : ", err);
    }
  };

  const fetchData3 = async (puuid: string) => {
    try {
      const response3 = await axios.get(
        `http://localhost:8008/riot/account/v1/accounts/by-puuid/${puuid}`,
        {
          headers: {
            "X-Riot-Token": riotApiKey
          }
        }
      );

      const riotCharacterTag = response3.data;

      setRiotTagName(riotCharacterTag);
    } catch (err) {
      console.error("tag error : ", err);
    }
  };
  // userInfo
  const fetchData4 = async (id: string) => {
    try {
      const response4 = await axios.get(
        `http://localhost:8008/lol/league/v4/entries/by-summoner/${id}`,
        {
          headers: {
            "X-Riot-Token": riotApiKey
          }
        }
      );

      if (response4.status === 200) {
        const riotUserEntry = response4.data;
        const tierImage = getTierImage(riotUserEntry.tier);
        setTier(tierImage);

        setWinning(
          Math.ceil(
            (riotUserEntry.wins / (riotUserEntry.wins + riotUserEntry.losses)) *
              100
          )
        );

        // 모든 속성을 비교하여 업데이트
        if (
          !riotUserInfo ||
          JSON.stringify(riotUserInfo) !== JSON.stringify(riotUserEntry)
        ) {
          setRiotUserInfo({ ...riotUserEntry });
        }
      }
    } catch (err) {
      console.error("tier error : ", err);
    }
  };
  // userMatchData
  const fetchData5 = async (puuid: string) => {
    try {
      const response5 = await axios.get(
        `http://localhost:8008/lol/match/v5/matches/by-puuid/${puuid}?start=0&count=${
          10 * count
        }`,
        {
          headers: {
            "X-Riot-Token": riotApiKey
          }
        }
      );

      const matchDataArray = response5.data;

      for (const matchId of matchDataArray) {
        try {
          const matchResponse = await axios.get(
            `http://localhost:8008/lol/match/v5/matches/${matchId}`,
            {
              headers: {
                "X-Riot-Token": riotApiKey
              }
            }
          );

          const matchData = matchResponse.data;

          const {
            dataVersion,
            matchId: metadataMatchId,
            participants
          } = matchData.metadata;

          const participantAssistsArray = matchData.info.participants.map(
            (participant: any) => participant.assists
          );
          const participantDeathsArray = matchData.info.participants.map(
            (participant: any) => participant.deaths
          );

          // 여기에서 가져온 데이터 활용
          const matchInfo: MatchInfo = {
            metadata: {
              dataVersion,
              matchId: metadataMatchId,
              participants
            },
            info: {
              gameId: matchData.info.gameId,
              gameVersion: matchData.info.gameId,
              teams: {
                win: matchData.info.teams.win
              },
              participants: matchData.info.participants.map(
                (participant: any) => ({
                  assists: participant.assists,
                  deaths: participant.deaths,
                  kills: participant.kills,
                  championId: participant.championId,
                  champLevel: participant.champLevel,
                  championName: participant.championName,
                  dragonKills: participant.dragonKills,
                  turretKills: participant.turretKills,
                  baronKills: participant.baronKills,
                  item0: participant.item0,
                  item1: participant.item1,
                  item2: participant.item2,
                  item3: participant.item3,
                  item4: participant.item4,
                  item5: participant.item5,
                  item6: participant.item6,
                  totalDamageDealtToChampions:
                    participant.totalDamageDealtToChampions,
                  totalMinionsKilled: participant.totalMinionsKilled,
                  killingSprees: participant.killingSprees,
                  timePlayed: participant.timePlayed,
                  visionWardsBoughtInGame: participant.visionWardsBoughtInGame,
                  wardKills: participant.wardKills,
                  wardsPlaced: participant.wardsPlaced,
                  puuid: participant.puuid,
                  win: participant.win,
                  summoner1Id: participant.summoner1Id,
                  summoner2Id: participant.summoner2Id,
                  teamId: participant.teamId,
                  riotIdName: participant.riotIdName,
                  summonerName: participant.summonerName,
                  visionScore: participant.visionScore
                  // ... (나머지 속성들 추가)
                })
              )
            },
            assistsArray: participantAssistsArray,
            deathsArray: participantDeathsArray
          };

          setMatchInfoData((prevData) => [...prevData, matchInfo]);

          const myMatchInfoArray: MyMatchData[] = [];

          for (let i = 0; i < 10; i++) {
            if (puuid === matchInfo.info.participants[i].puuid) {
              const myMatchInfo: MyMatchData = {
                metadata: {
                  participants
                },
                info: {
                  gameDuration: matchData.info.gameDuration,
                  gameMode: matchData.info.gameMode,
                  gameEndTimestamp: matchData.info.gameEndTimestamp,
                  gameVersion: matchData.info.gameVersion,
                  participants: [
                    {
                      championId: matchInfo.info.participants[i].championId,
                      champLevel: matchInfo.info.participants[i].champLevel,
                      championName: matchInfo.info.participants[i].championName,
                      assists: matchInfo.info.participants[i].assists,
                      kills: matchInfo.info.participants[i].kills,
                      deaths: matchInfo.info.participants[i].deaths,
                      win: matchInfo.info.participants[i].win,
                      summoner1Id: matchInfo.info.participants[i].summoner1Id,
                      summoner2Id: matchInfo.info.participants[i].summoner2Id,
                      item0: matchInfo.info.participants[i].item0,
                      item1: matchInfo.info.participants[i].item1,
                      item2: matchInfo.info.participants[i].item2,
                      item3: matchInfo.info.participants[i].item3,
                      item4: matchInfo.info.participants[i].item4,
                      item5: matchInfo.info.participants[i].item5,
                      item6: matchInfo.info.participants[i].item6,
                      visionWardsBoughtInGame:
                        matchInfo.info.participants[i].visionWardsBoughtInGame,
                      totalMinionsKilled:
                        matchInfo.info.participants[i].totalMinionsKilled,
                      teamId: matchInfo.info.participants[i].teamId
                      // 필요한 다른 속성들 추가
                    }
                  ]
                }
              };
              myMatchInfoArray.push(myMatchInfo);
            }
          }

          setMyMatchInfoDataArray((prevData) => [
            ...prevData,
            ...myMatchInfoArray
          ]);
        } catch (err) {
          console.error("match error in info : ", err);
        }
      }
    } catch (err) {
      console.error("match error : ", err);
    }
  };

  const handleButtonClick = () => {
    if (name) {
      // 정규표현식을 사용하여 gameName과 tagLine을 추출
      const match = name.match(/^(.+?)(#(\d+))?$/i);

      if (match) {
        let gameName = match[1];
        const tagLine = match[3] || "1"; // 02

        if (gameName.toLowerCase() === "hideonbush") {
          gameName = "Hide on bush";
        }
        // Riot API에 gameName과 tagLine을 사용하여 소환사 정보 조회
        fetchData(gameName, `KR${tagLine}`);
      } else {
        setError("Invalid format. Please use 'gameName#tagLine'");
      }
    } else {
      setError("Please enter a character name.");
    }
  };

  function formatGameDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}시 ${minutes}분 ${seconds}초`;
    }

    return `${minutes}분 ${seconds}초`;
  }

  function minutcs(cs: number, time: number) {
    const minutes = time / 60; // 초를 분으로 변환
    const result = cs / minutes;

    return Number(result).toFixed(1);
  }

  function formatTimeDifference(gameEndTimestamp: number) {
    const now = Date.now(); // 현재 시간의 타임스탬프

    // 두 타임스탬프 간의 차이를 계산 (밀리초 단위)
    const timeDifference = now - gameEndTimestamp;

    // 차이를 초, 분, 시간, 일로 변환
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // 표시할 문자열 초기화
    let displayString = "";

    if (seconds < 60) {
      // 1분 이내
      displayString = `${seconds}초 전`;
    } else if (minutes < 60) {
      // 1시간 이내
      displayString = `${minutes}분 전`;
    } else if (hours < 24) {
      // 1일 이내
      displayString = `${hours}시간 전`;
    } else if (days < 30) {
      // 30일 이내
      displayString = `${days}일 전`;
    } else {
      // 한 달 이상
      const months = Math.floor(days / 30);
      displayString = `${months}달 전`;
    }

    return displayString;
  }

  const getTierImage = (tier: string): string | undefined => {
    switch (tier) {
      case "IRON":
        return IRON;
      case "BRONZE":
        return BRONZE;
      case "SILVER":
        return SILVER;
      case "GOLD":
        return GOLD;
      case "PLATINUM":
        return PLATINUM;
      case "EMERALD":
        return EMERALD;
      case "DIAMOND":
        return DIAMOND;
      case "MASTER":
        return MASTER;
      case "GRANDMASTER":
        return GRANDMASTER;
      case "CHALLENGER":
        return CHALLENGER;
      default:
        return undefined;
    }
  };

  const favoritClick = () => {
    setFavoritOn(!favoritOn);
  };

  function kda(k: number, d: number, a: number) {
    return d === 0 ? "Perfect" : Number((k + a) / d).toFixed(2);
  }

  // Function to calculate kill participation percentage for an individual participant
  function calculateKillParticipation(
    myParticipant: {
      assists: number;
      kills: number;
      teamId: number;
    },
    totalTeamKills: number
  ): number {
    const myKillsAndAssists = myParticipant.kills + myParticipant.assists;

    if (totalTeamKills === 0) {
      return 0;
    }

    return Math.ceil((myKillsAndAssists / totalTeamKills) * 100);
  }

  function spellString(id: number): string {
    switch (id) {
      case 1:
        return "SummonerBoost";
      case 3:
        return "SummonerExhaust";
      case 4:
        return "SummonerFlash";
      case 6:
        return "SummonerHaste";
      case 7:
        return "SummonerHeal";
      case 11:
        return "SummonerSmite";
      case 12:
        return "SummonerTeleport";
      case 13:
        return "SummonerMana";
      case 14:
        return "SummonerDot";
      case 21:
        return "SummonerBarrier";
      case 30:
        return "SummonerPoroRecall";
      case 31:
        return "SummonerPoroThrow";
      case 32:
        return "SummonerSnowball";
      case 39:
        return "SummonerSnowURFSnowball_Mark";
      case 2202:
        return "SummonerCherryFlash";
      default:
        return "";
    }
  }

  function underClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    setUnderStates((prevStates) => {
      const newUnderStates = [...prevStates];
      // 해당 인덱스에 대한 상태만 업데이트
      newUnderStates[index] = !newUnderStates[index];
      // 새로운 상태 반환
      return newUnderStates;
    });
  }

  return (
    <div>
      <div className="main_bg">
        <div className="changeflex">
          <div className="second flex_sb">
            <div className="flex_sb">
              <ul className="flex_sb">
                <li>
                  <Link to="/">홈</Link>
                </li>

                <li>
                  <Link to="/community">커뮤니티</Link>
                </li>
              </ul>
              <div className="flex">
                <a href="">
                  <span>
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <span>마이페이지</span>
                </a>
              </div>
            </div>
          </div>

          <div className="searchfloor">
            <div>
              <input
                type="text"
                placeholder="롤 닉네임 검색 hideonbush"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button onClick={handleButtonClick} disabled={loading}>
                .GG
              </button>
            </div>
          </div>

          <div className="lastOrder">
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}

            {riotGameName && (
              <div className="searchOn">
                <div className="searchProfile">
                  <div className="flex">
                    <div className="imgtopbox">
                      <div>
                        <img
                          src={`https://cdn.communitydragon.org/latest/profile-icon/${riotGameName.profileIconId}`}
                          alt=""
                        />
                      </div>

                      <div>{riotGameName.summonerLevel}</div>
                    </div>
                    <div className="profile_box">
                      <div className="flex">
                        <p className="userName">{riotGameName.name}</p>
                        <span>#{riotTagName?.tagLine}</span>
                        {!favoritOn && (
                          <button
                            className="favorit_btn1"
                            onClick={favoritClick}
                          >
                            ☆
                          </button>
                        )}
                        {favoritOn && (
                          <button
                            onClick={favoritClick}
                            className="favorit_btn2"
                          >
                            ★
                          </button>
                        )}
                      </div>

                      <p className="Prev">Prev. {riotGameName.name}</p>

                      <button className="userUpdate">전적 갱신</button>
                    </div>
                  </div>
                </div>

                <div className="ingame_rank_box">
                  <div className="user_rank">
                    <div className="solo_rank">
                      <p>솔로랭크</p>

                      {riotUserInfo?.tier ? (
                        <div>
                          <div className="rank_box">
                            <img src={tier} alt="" />
                          </div>
                          <p>{riotUserInfo.tier}</p>
                          <p>{riotUserInfo.leaguePoints} LP</p>
                          <p>
                            {riotUserInfo.wins}승 {riotUserInfo.losses}패{" "}
                            {winning}%
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p>Unranked</p>
                        </div>
                      )}
                    </div>

                    <div className="user_chara"></div>
                  </div>

                  <div className="user_match">
                    {matchInfoData.map((matchInfo, index) => (
                      <div key={index}>
                        {/* 각 매치의 정보를 렌더링 */}
                        {/* ex) <p>gameId: {matchInfo.info.gameId}</p> */}

                        {/* 내 정보를 가져오는 부분 */}
                        {myMatchInfoDataArray &&
                          myMatchInfoDataArray[index] &&
                          myMatchInfoDataArray[index].info.participants[0] && (
                            <div>
                              <div
                                className={
                                  myMatchInfoDataArray[index].info
                                    .participants[0].win
                                    ? "wins matchWindow"
                                    : "losses matchWindow"
                                }
                              >
                                <div
                                  className="under_btn"
                                  onClick={(e) => underClick(e, index)}
                                >
                                  {!underStates[index] && (
                                    <span>
                                      <FontAwesomeIcon icon={faAngleDown} />
                                    </span>
                                  )}
                                  {underStates[index] && (
                                    <span>
                                      <FontAwesomeIcon icon={faAngleUp} />
                                    </span>
                                  )}
                                </div>
                                <div className="matchbar"></div>
                                <div className="info_topLine flex_sb">
                                  <div>
                                    <div className="wl">
                                      {myMatchInfoDataArray[index].info
                                        .participants[0].win
                                        ? "승리"
                                        : "패배"}
                                    </div>
                                    <div>
                                      {formatGameDuration(
                                        myMatchInfoDataArray[index].info
                                          .gameDuration
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <div>
                                      {formatTimeDifference(
                                        myMatchInfoDataArray[index].info
                                          .gameEndTimestamp
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="info_secondLine">
                                  <div>
                                    <div className="champbox">
                                      <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${myMatchInfoDataArray[index].info.participants[0].championName}.png`}
                                        alt="Champion"
                                        className="champImg"
                                      />

                                      <div className="champ_level">
                                        {
                                          myMatchInfoDataArray[index].info
                                            .participants[0].champLevel
                                        }
                                      </div>
                                    </div>
                                    <div className="spellbox">
                                      <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                          myMatchInfoDataArray[index].info
                                            .participants[0].summoner1Id
                                        )}.png`}
                                        alt="Summoner Spell 1"
                                        className="spellImg"
                                      />
                                      <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                          myMatchInfoDataArray[index].info
                                            .participants[0].summoner2Id
                                        )}.png`}
                                        alt="Summoner Spell 2"
                                        className="spellImg"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="kda">
                                      {
                                        myMatchInfoDataArray[index].info
                                          .participants[0].kills
                                      }{" "}
                                      /{" "}
                                      <span>
                                        {
                                          myMatchInfoDataArray[index].info
                                            .participants[0].deaths
                                        }
                                      </span>{" "}
                                      /{" "}
                                      {
                                        myMatchInfoDataArray[index].info
                                          .participants[0].assists
                                      }
                                    </div>

                                    <div>
                                      {kda(
                                        myMatchInfoDataArray[index].info
                                          .participants[0].kills,
                                        myMatchInfoDataArray[index].info
                                          .participants[0].deaths,
                                        myMatchInfoDataArray[index].info
                                          .participants[0].assists
                                      )}{" "}
                                      : 1
                                    </div>
                                  </div>

                                  <div>
                                    <div className="info_stat">
                                      <p>
                                        CS
                                        {
                                          myMatchInfoDataArray[index].info
                                            .participants[0].totalMinionsKilled
                                        }
                                        (
                                        {minutcs(
                                          myMatchInfoDataArray[index].info
                                            .participants[0].totalMinionsKilled,
                                          myMatchInfoDataArray[index].info
                                            .gameDuration
                                        )}
                                        )
                                      </p>
                                      <p>
                                        킬관여(
                                        {myMatchInfoDataArray[
                                          index
                                        ].info.participants.map(
                                          (
                                            myparticipant,
                                            myparticipantIndex
                                          ) => {
                                            const totalTeamKills =
                                              matchInfo.info.participants
                                                .filter(
                                                  (participant) =>
                                                    participant.teamId ===
                                                    myparticipant.teamId
                                                )
                                                .reduce(
                                                  (total, participant) =>
                                                    total + participant.kills,
                                                  0
                                                );

                                            return (
                                              <span key={myparticipantIndex}>
                                                {calculateKillParticipation(
                                                  {
                                                    assists:
                                                      myparticipant.assists,
                                                    kills: myparticipant.kills,
                                                    teamId: myparticipant.teamId
                                                  },
                                                  totalTeamKills
                                                )}
                                              </span>
                                            );
                                          }
                                        )}
                                        %)
                                      </p>
                                      <p>
                                        제어와드
                                        {
                                          myMatchInfoDataArray[index].info
                                            .participants[0]
                                            .visionWardsBoughtInGame
                                        }
                                      </p>
                                    </div>
                                    <div className="itembox">
                                      <span>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].item0 !== 0 && (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item0}.png`}
                                            alt=""
                                          />
                                        )}
                                      </span>
                                      <span>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].item1 !== 0 && (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item1}.png`}
                                            alt=""
                                          />
                                        )}
                                      </span>
                                      <span>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].item2 !== 0 && (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item2}.png`}
                                            alt=""
                                          />
                                        )}
                                      </span>
                                      <span>
                                        <img
                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item6}.png`}
                                          alt=""
                                        />
                                      </span>
                                      <span>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].item3 !== 0 && (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item3}.png`}
                                            alt=""
                                          />
                                        )}
                                      </span>
                                      <span>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].item4 !== 0 && (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item4}.png`}
                                            alt=""
                                          />
                                        )}
                                      </span>
                                      <span>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].item5 !== 0 && (
                                          <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${myMatchInfoDataArray[index].info.participants[0].item5}.png`}
                                            alt=""
                                          />
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {windowWidth > 1240 && (
                                    <div className="team_match">
                                      {matchInfo.info.participants.map(
                                        (participant, participantIndex) => (
                                          <div
                                            key={participantIndex}
                                            className="match_users"
                                          >
                                            <div>
                                              <span>
                                                <img
                                                  src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${participant.championName}.png`}
                                                  alt=""
                                                />
                                              </span>
                                              <span>
                                                {participant.summonerName}
                                              </span>
                                            </div>

                                            {/* 필요한 다른 속성들 추가 */}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div
                                className={`under_info ${
                                  underStates[index] ? "open" : ""
                                }`}
                              >
                                <div className="users_info">
                                  <div className="team1">
                                    <div>
                                      <div className="tr_grid">
                                        <div>
                                          {myMatchInfoDataArray[index].info
                                            .participants[0].win
                                            ? "승리"
                                            : "패배"}
                                        </div>
                                        <div>KDA</div>
                                        <div>피해량</div>
                                        <div>와드</div>
                                        <div>cs</div>
                                        <div>아이템</div>
                                      </div>
                                    </div>
                                    {myMatchInfoDataArray[index].info
                                      .participants[0].win
                                      ? matchInfo.info.participants
                                          .filter(
                                            (participant) => participant.win
                                          )
                                          .map(
                                            (participant, participantIndex) => (
                                              <div>
                                                <div className="tr_grid">
                                                  <div>
                                                    <div className="champbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${participant.championName}.png`}
                                                        alt="Champion"
                                                        className="champImg"
                                                      />

                                                      <div className="champ_level">
                                                        {participant.champLevel}
                                                      </div>
                                                    </div>

                                                    <div className="spellbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner1Id
                                                        )}.png`}
                                                        alt="Summoner Spell 1"
                                                        className="spellImg"
                                                      />
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner2Id
                                                        )}.png`}
                                                        alt="Summoner Spell 2"
                                                        className="spellImg"
                                                      />
                                                    </div>

                                                    <div>
                                                      <p>
                                                        {
                                                          participant.summonerName
                                                        }
                                                      </p>
                                                    </div>
                                                  </div>

                                                  <div>
                                                    <div className="kda">
                                                      {participant.kills} /{" "}
                                                      <span>
                                                        {participant.deaths}
                                                      </span>{" "}
                                                      / {participant.assists}
                                                    </div>

                                                    <div>
                                                      {kda(
                                                        participant.kills,
                                                        participant.deaths,
                                                        participant.assists
                                                      )}{" "}
                                                      : 1
                                                    </div>
                                                  </div>
                                                  <div>
                                                    {participant.totalDamageDealtToChampions.toLocaleString()}
                                                  </div>
                                                  <div className="ward">
                                                    <p>
                                                      {participant.visionScore}
                                                    </p>
                                                    <p>
                                                      {
                                                        participant.visionWardsBoughtInGame
                                                      }
                                                    </p>
                                                  </div>
                                                  <div>
                                                    {
                                                      participant.totalMinionsKilled
                                                    }
                                                    (
                                                    {minutcs(
                                                      participant.totalMinionsKilled,
                                                      myMatchInfoDataArray[
                                                        index
                                                      ].info.gameDuration
                                                    )}
                                                    )
                                                  </div>
                                                  <div className="teamItemBox">
                                                    <span>
                                                      {participant.item0 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item0}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item1 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item1}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item2 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item2}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item5 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item3}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item3 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item4}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item4 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item5}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item6}.png`}
                                                        alt=""
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )
                                      : matchInfo.info.participants
                                          .filter(
                                            (participant) => !participant.win
                                          )
                                          .map(
                                            (participant, participantIndex) => (
                                              <div>
                                                <div className="tr_grid">
                                                  <div>
                                                    <div className="champbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${participant.championName}.png`}
                                                        alt="Champion"
                                                        className="champImg"
                                                      />

                                                      <div className="champ_level">
                                                        {participant.champLevel}
                                                      </div>
                                                    </div>

                                                    <div className="spellbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner1Id
                                                        )}.png`}
                                                        alt="Summoner Spell 1"
                                                        className="spellImg"
                                                      />
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner2Id
                                                        )}.png`}
                                                        alt="Summoner Spell 2"
                                                        className="spellImg"
                                                      />
                                                    </div>

                                                    <div>
                                                      <p>
                                                        {
                                                          participant.summonerName
                                                        }
                                                      </p>
                                                    </div>
                                                  </div>

                                                  <div>
                                                    <div className="kda">
                                                      {participant.kills} /{" "}
                                                      <span>
                                                        {participant.deaths}
                                                      </span>{" "}
                                                      / {participant.assists}
                                                    </div>

                                                    <div>
                                                      {kda(
                                                        participant.kills,
                                                        participant.deaths,
                                                        participant.assists
                                                      )}{" "}
                                                      : 1
                                                    </div>
                                                  </div>
                                                  <div>
                                                    {participant.totalDamageDealtToChampions.toLocaleString()}
                                                  </div>
                                                  <div className="ward">
                                                    <p>
                                                      {participant.visionScore}
                                                    </p>
                                                    <p>
                                                      {
                                                        participant.visionWardsBoughtInGame
                                                      }
                                                    </p>
                                                  </div>
                                                  <div>
                                                    {
                                                      participant.totalMinionsKilled
                                                    }
                                                    (
                                                    {minutcs(
                                                      participant.totalMinionsKilled,
                                                      myMatchInfoDataArray[
                                                        index
                                                      ].info.gameDuration
                                                    )}
                                                    )
                                                  </div>
                                                  <div className="teamItemBox">
                                                    <span>
                                                      {participant.item0 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item0}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item1 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item1}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item2 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item2}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item5 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item3}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item3 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item4}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item4 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item5}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item6}.png`}
                                                        alt=""
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                    <div></div>
                                  </div>
                                  <div className="team2">
                                    <div className="tr_grid">
                                      <div>
                                        {myMatchInfoDataArray[index].info
                                          .participants[0].win
                                          ? "패배"
                                          : "승리"}
                                      </div>
                                      <div>KDA</div>
                                      <div>피해량</div>
                                      <div>와드</div>
                                      <div>cs</div>
                                      <div>아이템</div>
                                    </div>
                                    {myMatchInfoDataArray[index].info
                                      .participants[0].win
                                      ? matchInfo.info.participants
                                          .filter(
                                            (participant) => !participant.win
                                          )
                                          .map(
                                            (participant, participantIndex) => (
                                              <div>
                                                <div className="tr_grid">
                                                  <div>
                                                    <div className="champbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${participant.championName}.png`}
                                                        alt="Champion"
                                                        className="champImg"
                                                      />

                                                      <div className="champ_level">
                                                        {participant.champLevel}
                                                      </div>
                                                    </div>

                                                    <div className="spellbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner1Id
                                                        )}.png`}
                                                        alt="Summoner Spell 1"
                                                        className="spellImg"
                                                      />
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner2Id
                                                        )}.png`}
                                                        alt="Summoner Spell 2"
                                                        className="spellImg"
                                                      />
                                                    </div>

                                                    <div>
                                                      <p>
                                                        {
                                                          participant.summonerName
                                                        }
                                                      </p>
                                                    </div>
                                                  </div>

                                                  <div>
                                                    <div className="kda">
                                                      {participant.kills} /{" "}
                                                      <span>
                                                        {participant.deaths}
                                                      </span>{" "}
                                                      / {participant.assists}
                                                    </div>

                                                    <div>
                                                      {kda(
                                                        participant.kills,
                                                        participant.deaths,
                                                        participant.assists
                                                      )}{" "}
                                                      : 1
                                                    </div>
                                                  </div>
                                                  <div>
                                                    {participant.totalDamageDealtToChampions.toLocaleString()}
                                                  </div>
                                                  <div className="ward">
                                                    <p>
                                                      {participant.visionScore}
                                                    </p>
                                                    <p>
                                                      {
                                                        participant.visionWardsBoughtInGame
                                                      }
                                                    </p>
                                                  </div>
                                                  <div>
                                                    {
                                                      participant.totalMinionsKilled
                                                    }
                                                    (
                                                    {minutcs(
                                                      participant.totalMinionsKilled,
                                                      myMatchInfoDataArray[
                                                        index
                                                      ].info.gameDuration
                                                    )}
                                                    )
                                                  </div>
                                                  <div className="teamItemBox">
                                                    <span>
                                                      {participant.item0 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item0}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item1 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item1}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item2 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item2}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item5 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item3}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item3 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item4}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item4 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item5}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item6}.png`}
                                                        alt=""
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )
                                      : matchInfo.info.participants
                                          .filter(
                                            (participant) => participant.win
                                          )
                                          .map(
                                            (participant, participantIndex) => (
                                              <div>
                                                <div className="tr_grid">
                                                  <div>
                                                    <div className="champbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${participant.championName}.png`}
                                                        alt="Champion"
                                                        className="champImg"
                                                      />

                                                      <div className="champ_level">
                                                        {participant.champLevel}
                                                      </div>
                                                    </div>

                                                    <div className="spellbox">
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner1Id
                                                        )}.png`}
                                                        alt="Summoner Spell 1"
                                                        className="spellImg"
                                                      />
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spellString(
                                                          participant.summoner2Id
                                                        )}.png`}
                                                        alt="Summoner Spell 2"
                                                        className="spellImg"
                                                      />
                                                    </div>

                                                    <div>
                                                      <p>
                                                        {
                                                          participant.summonerName
                                                        }
                                                      </p>
                                                    </div>
                                                  </div>

                                                  <div>
                                                    <div className="kda">
                                                      {participant.kills} /{" "}
                                                      <span>
                                                        {participant.deaths}
                                                      </span>{" "}
                                                      / {participant.assists}
                                                    </div>

                                                    <div>
                                                      {kda(
                                                        participant.kills,
                                                        participant.deaths,
                                                        participant.assists
                                                      )}{" "}
                                                      : 1
                                                    </div>
                                                  </div>
                                                  <div>
                                                    {participant.totalDamageDealtToChampions.toLocaleString()}
                                                  </div>
                                                  <div className="ward">
                                                    <p>
                                                      {participant.visionScore}
                                                    </p>
                                                    <p>
                                                      {
                                                        participant.visionWardsBoughtInGame
                                                      }
                                                    </p>
                                                  </div>
                                                  <div>
                                                    {
                                                      participant.totalMinionsKilled
                                                    }
                                                    (
                                                    {minutcs(
                                                      participant.totalMinionsKilled,
                                                      myMatchInfoDataArray[
                                                        index
                                                      ].info.gameDuration
                                                    )}
                                                    )
                                                  </div>
                                                  <div className="teamItemBox">
                                                    <span>
                                                      {participant.item0 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item0}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item1 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item1}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item2 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item2}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item5 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item3}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item3 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item4}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      {participant.item4 !==
                                                        0 && (
                                                        <img
                                                          src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item5}.png`}
                                                          alt=""
                                                        />
                                                      )}
                                                    </span>
                                                    <span>
                                                      <img
                                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${participant.item6}.png`}
                                                        alt=""
                                                      />
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                    <div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* 각 참가자에 대한 정보를 표시하는 부분 */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;

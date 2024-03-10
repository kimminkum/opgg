import axios from "axios";
import React, { useState } from "react";

interface MapleCharacter {
  ocid: string;
}

interface DetailCharacter {
  character_class: string;
  character_class_level: string;
  world_name: string;
  date: string;
  character_gender: string;
  character_guild_name: string;
  character_level: number;
  character_name: string;
  character_image: string;
}

interface PopularCharacter {
  popularity: number;
  date: string;
}

const MapleApi: React.FC = () => {
  const [name, setName] = useState("");
  const [mapleCharacter, setMapleCharacter] = useState<MapleCharacter | null>(
    null
  );
  const [mapledetail, setMapledetail] = useState<DetailCharacter | null>(null);
  const [populars, setPopulars] = useState<PopularCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const formattedDate = currentDate.toISOString().split("T")[0];
  const myApiKey =
    "test_d5d01dcf5a408a2f32d5662cccf248128aa0ee44db28deb4e95da08b2a4012a160b1f54ba0f445f36db292e67dfe4e33";

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(
          name
        )}`,
        {
          headers: {
            "x-nxopen-api-key": myApiKey
          }
        }
      );

      const mapleCharacterData = response.data; // 새로운 변수에 데이터 저장

      setMapleCharacter(mapleCharacterData);

      try {
        console.log(mapleCharacterData?.ocid + formattedDate);
        const res = await axios.get(
          `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${mapleCharacterData?.ocid}&date=${formattedDate}`,
          {
            headers: {
              "x-nxopen-api-key": myApiKey
            }
          }
        );
        const res2 = await axios.get(
          `https://open.api.nexon.com/maplestory/v1/character/popularity?ocid=${mapleCharacterData?.ocid}&date=${formattedDate}`,
          {
            headers: {
              "x-nxopen-api-key": myApiKey
            }
          }
        );

        setMapledetail(res.data);
        setPopulars(res2.data);
      } catch (err) {
        console.error("second error:", err);
        setError("Error second data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data. Please check the character name.");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (name) {
      fetchData();
    } else {
      setError("Please enter a character name.");
    }
  };

  return (
    <div>
      {/*open API */}
      <div>
        <input
          type="text"
          placeholder="Enter character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleButtonClick} disabled={loading}>
          Fetch Character Info
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {mapleCharacter && (
        <div>
          <div className="maple">Character Name: {mapleCharacter.ocid}</div>

          {mapledetail && (
            <div>
              <div className="detail">
                <p>{mapledetail.character_guild_name}</p>
                <p>{mapledetail.character_class_level}</p>
                <p>{mapledetail.character_gender}</p>
                <p>{mapledetail.character_name}</p>
                <p>{mapledetail.character_level}</p>
                <p>{mapledetail.character_class}</p>
                <p>{mapledetail.world_name}</p>
                <p>{mapledetail.date}</p>
                <p>{populars?.date}</p>
                <p>{populars?.popularity}</p>

                <img src={mapledetail.character_image} alt="" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapleApi;

// try {
//   const response = await axios.get(
//     `http://localhost:8008/lol/summoner/v4/summoners/by-name/${name}`, // 프록시 서버 엔드포인트로 변경
//     {
//       headers: {
//         "X-Riot-Token": riotApiKey
//       }
//     }
//   );

//   const riotCharacterData = response.data;

//   setRiotGameName(riotCharacterData);

//   //  태그
//   try {
//     const response2 = await axios.get(
//       `http://localhost:8008/riot/account/v1/accounts/by-puuid/${riotCharacterData.puuid}`,
//       {
//         headers: {
//           "X-Riot-Token": riotApiKey
//         }
//       }
//     );

//     const riotCharacterTag = response2.data;

//     setRiotTagName(riotCharacterTag);
//   } catch (err) {
//     console.error("tag error : ", err);
//   }

//   // userInfo
//   try {
//     const response3 = await axios.get(
//       `http://localhost:8008/lol/league/v4/entries/by-summoner/${riotCharacterData.id}`,
//       {
//         headers: {
//           "X-Riot-Token": riotApiKey
//         }
//       }
//     );

//     if (response3.status === 200) {
//       const riotUserEntry = response3.data;
//       const tierImage = getTierImage(riotUserEntry.tier);
//       setTier(tierImage);
//       console.log("tier", riotUserEntry.tier);

//       setWinning(
//         Math.ceil(
//           (riotUserEntry.wins /
//             (riotUserEntry.wins + riotUserEntry.losses)) *
//             100
//         )
//       );

//       // 모든 속성을 비교하여 업데이트
//       if (
//         !riotUserInfo ||
//         JSON.stringify(riotUserInfo) !== JSON.stringify(riotUserEntry)
//       ) {
//         setRiotUserInfo({ ...riotUserEntry });
//       }
//     }
//   } catch (err) {
//     console.error("tier error : ", err);
//   }

//   // userMatchData
//   try {
//     const response4 = await axios.get(
//       `http://localhost:8008/lol/match/v5/matches/by-puuid/${
//         riotCharacterData.puuid
//       }?start=0&count=${10 * count}`,
//       {
//         headers: {
//           "X-Riot-Token": riotApiKey
//         }
//       }
//     );

//     const matchDataArray = response4.data;

//     for (const matchId of matchDataArray) {
//       try {
//         console.log("match hi", matchId);
//         const matchResponse = await axios.get(
//           `http://localhost:8008/lol/match/v5/matches/${matchId}`,
//           {
//             headers: {
//               "X-Riot-Token": riotApiKey
//             }
//           }
//         );

//         const matchData = matchResponse.data;
//         console.log(matchResponse.data);

//         const {
//           dataVersion,
//           matchId: metadataMatchId,
//           participants
//         } = matchData.metadata;

//         const participantAssistsArray = matchData.info.participants.map(
//           (participant: any) => participant.assists
//         );
//         const participantDeathsArray = matchData.info.participants.map(
//           (participant: any) => participant.deaths
//         );

//         // 여기에서 가져온 데이터 활용
//         const matchInfo: MatchInfo = {
//           metadata: { dataVersion, matchId: metadataMatchId, participants },
//           info: {
//             gameId: matchData.info.gameId,
//             gameDuration: matchData.info.gameDuration,
//             gameEndTimestamp: matchData.info.gameEndTimestamp,
//             participants: matchData.info.participants.map(
//               (participant: any) => ({
//                 assists: participant.assists,
//                 deaths: participant.deaths,
//                 kills: participant.kills,
//                 champLevel: participant.champLevel,
//                 championName: participant.championName,
//                 dragonKills: participant.dragonKills,
//                 turretKills: participant.turretKills,
//                 baronKills: participant.baronKills,
//                 item0: participant.item0,
//                 item1: participant.item1,
//                 item2: participant.item2,
//                 item3: participant.item3,
//                 item4: participant.item4,
//                 item5: participant.item5,
//                 item6: participant.item6,
//                 physicalDamageDealtToChampions:
//                   participant.physicalDamageDealtToChampions,
//                 totalMinionsKilled: participant.totalMinionsKilled,
//                 killingSprees: participant.killingSprees,
//                 timePlayed: participant.timePlayed,
//                 visionWardsBoughtInGame:
//                   participant.visionWardsBoughtInGame,
//                 wardKills: participant.wardKills,
//                 wardsPlaced: participant.wardsPlaced,
//                 spell1Casts: participant.spell1Casts
//                 // ... (나머지 속성들 추가)
//               })
//             )
//           },
//           assistsArray: participantAssistsArray,
//           deathsArray: participantDeathsArray
//         };

//         setMatchInfoData((prevData) => [...prevData, matchInfo]);
//       } catch (err) {
//         console.error("match error in info : ", err);
//       }
//     }
//   } catch (err) {
//     console.error("match error : ", err);
//   }
// } catch (err) {
//   console.error("error data : ", err);
//   setError("Character Name riot Game Name Error");
// } finally {
//   setLoading(false);
// }
// };

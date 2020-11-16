import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./commonCSS.css";
import Util from "./Util";

function GroupItem(props) {
  const grpInfo = props?.grpInfo;
  if (grpInfo === undefined) {
    alert("프로젝트 및 그룹을 선택해주세요.");
    document.location.href = "/";
  }

  const [pjtName] = useState(props.pjtName);
  const [grpName] = useState(grpInfo.grpName);
  let [grpMember, setGrpMember] = useState(grpInfo.grpMember.join(", "));
  let [boardList, setBoardList] = useState([]);
  let [syncTime, setSyncTime] = useState("");
  let [value_syncBoard, setValue_syncBoard] = useState("게시글 동기화 시작");

  // 그룹멤버 추가
  const addGrpMember = useCallback(() => {
    let elem_memberId = document.getElementById("input_grpMemberId");
    const memberId = elem_memberId !== undefined ? elem_memberId.value : "";

    if (memberId === "") {
      return alert("참여자 ID를 입력 후 시도해주세요.");
    }

    const { apiUrl } = props;
    axios({
      method: "post",
      url: apiUrl + "/board/" + pjtName + "/" + grpName + "/addGrpMember",
      withCredentials: true,
      data: {
        memberId: memberId,
      },
    })
      .then((res) => {
        const result = res.data;

        document.getElementById("msgDiv").innerHTML = result.msg;

        // 추가된 참여자 세팅
        setGrpMember(grpMember + ", " + memberId);

        // 입력한 사용자 명 지우기
        elem_memberId.value = "";
      })
      .catch((error) => {
        let msg = "";
        const res = error?.response;
        // then 과정에서 발생한 로직 에러 처리
        if (error.name !== undefined && res === undefined) {
          msg = error.name + " : " + error.message;
        } else {
          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";
        }
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== undefined ? res.status : 400;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  }, [props, pjtName, grpName, grpMember]);

  // 게시글 추가
  const addPost = useCallback(() => {
    let contents = document.getElementById("board_contents");

    if (contents === null || contents.value === "") {
      return alert("게시글 내용을 입력 후 추가해주세요.");
    }

    const { apiUrl } = props;
    axios({
      method: "post",
      url: apiUrl + "/board/" + pjtName + "/" + grpName + "/addPost",
      withCredentials: true,
      data: {
        contents: contents.value,
      },
    })
      .then((res) => {
        const result = res.data;

        document.getElementById("msgDiv").innerHTML = result.msg;

        contents.value = ""; // 입력한 컨텐츠 내용 비우기
      })
      .catch((error) => {
        let msg = "";
        const res = error?.response;
        // then 과정에서 발생한 로직 에러 처리
        if (error.name !== undefined && res === undefined) {
          msg = error.name + " : " + error.message;
        } else {
          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";
        }
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== undefined ? res.status : 400;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  }, [props, pjtName, grpName]);

  // 동기화 인터벌 토글
  const toggleSyncInterval = useCallback(
    (cb) => {
      const key = "syncBoard"; // 함수 이름을 타이머아이디로 설정
      const timerId = Util.timerObj[key];

      if (timerId === undefined && grpName !== null) {
        Util.startInterval(1, cb, key);
        setValue_syncBoard("게시글 동기화 중지");
      } else if (timerId) {
        Util.stopInterval(key);
        setValue_syncBoard("게시글 동기화 시작");
      } else {
        Util.stopInterval(key);
        alert("그룹이 선택되지 않았습니다. 그룹 선택 후 다시 시도해주십시오.");
      }
    },
    [grpName]
  );

  // 게시글 동기화

  const syncBoard = useCallback(() => {
    const { apiUrl } = props;

    axios({
      method: "post",
      url: apiUrl + "/board/" + pjtName + "/" + grpName + "/syncBoard",
      withCredentials: true,
      data: {
        syncTime: document.getElementById("lbl_syncTime").innerHTML, // 최종 동기화 시간을 전달하여 그 후의 데이터만 읽어오도록 한다.
      },
    })
      .then((res) => {
        const result = res.data;
        const status = res.status;

        // 응답 데이터가 잘못된 경우
        // TODO: API 통신 인증 -> API 통신 전 인증하여 응답 데이터를 검증할 필요가 없도록 해야 한다.
        if (result?.msg === undefined) {
          throw new Error("Error! Invalid response data : " + res.data);
        }

        let isBottom = false;
        const scrollTop = document.getElementById("boardDiv").scrollTop; // 현재 위치
        const scrollHeight = document.getElementById("boardDiv").scrollHeight; // 스크롤 높이
        if (scrollTop === scrollHeight - 700) {
          // 스크롤 높이(700px) 만큼 오차가 생겨 조정
          isBottom = true;
        }

        // 추가된 게시글이 있으면 추가
        if (
          status !== 204 &&
          result.boardList !== null
        ) {
          /**
         * 2020.11.16 dykim - boardList 값이 저장되지 않아 동기화할 때마다 모든 목록이 사라진다.
         * 전에 됬던 기능인데 갑자기 안되서 임시방편으로 항상 모든 목록을 불러오도록 수정
         * 
         * TODO: useCallback 제거 등 프론트 코드를 정리한 후 반드시 고칠 것.
         */
          // let syncList = boardList.concat(result.boardList); // 이전 게시글 + 추가된 게시글

          // const boardList = result.boardList;	// 추가된 게시글

          // 게시글 추가
		      setBoardList(result.boardList);

          // 스크롤 위치가 맨 아래였을 때만 게시글 추가 후 스크롤 이동.
          if (isBottom) {
            document.getElementById(
              "boardDiv"
            ).scrollTop = document.getElementById("boardDiv").scrollHeight;
          }
		    }
		
        // 동기화 시간 갱신
        setSyncTime(result.syncTime);
      })
      .catch((error) => {
        Util.stopInterval("syncBoard");

        let msg = "";
        const res = error?.response;
        // then 과정에서 발생한 로직 에러 처리
        if (error.name !== undefined && res === undefined) {
          msg = error.name + " : " + error.message;
        } else {
          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";
        }
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== undefined ? res.status : 400;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  }, [props, pjtName, grpName]);

  useEffect(() => {
    // 게시글 내용 이벤트 등록
    document
      .getElementById("board_contents")
      .addEventListener("keydown", (e) => {
        // 엔터키 입력 시
        if (e.which === 13) {
          // 컨트롤 or Shift or alt 를 같이 누르지 않은 경우
          if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            addPost(); // 게시글 추가
          }
        }
      });
  }, []);

  // state 중 boardList 만 가져옴
  const li_boardList = boardList.map((board, i) => (
    <div key={i} className="defaultDiv" style={{ width: "100%" }}>
      <ul>
        <li>ID: {board.userId}</li>
        <li>작성일: {board.reg_dt}</li>
        <li>
          내용{" "}
          <textarea
            name="contents"
            rows="3"
            readOnly
            style={{ resize: "none", width: "90%" }}
            value={board.contents}
          />
        </li>
      </ul>
    </div>
  ));

  return (
    <div>
      <div id="div_grpInfo">
        <h3>[그룹 정보]</h3>
        <div className="defaultDiv">
          <ul>
            <li>그룹 이름 : {grpName}</li>
            <li>그룹 참여자 : {grpMember}</li>
            참여자 추가 : <input type="text" id="input_grpMemberId" />
            <input type="button" value="추가" onClick={addGrpMember} />
          </ul>
        </div>
      </div>

      <div id="div_boardInfo">
        <h3>[{grpName}그룹의 게시글]</h3>
        <input
          type="button"
          id="syncBoard"
          value={value_syncBoard}
          onClick={() => {
            toggleSyncInterval(syncBoard);
          }}
        />
		{/* 
			state로만 할 경우 콜백함수 내에서 상태값이 실시간으로 반영되지 않아 문제가 생긴다.
			이를 해결하기 위해 레이블에 넣고 다시 불러오는 식으로 수정 
		*/}
        동기화 시간 : <label id="lbl_syncTime">{syncTime}</label>
        <div className="defaultDiv">
          <div
            className="scrollDiv"
            id="boardDiv"
            style={{ overflowX: "hidden" }}
          >
            {li_boardList}
          </div>
          <div className="defaultDiv" style={{ width: "100%" }}>
            <ul>
              <li>
                내용{" "}
                <textarea
                  id="board_contents"
                  rows="3"
                  style={{ resize: "none", width: "90%" }}
                />
              </li>
              <input
                type="button"
                id="btn_addPost"
                value="올리기"
                onClick={addPost}
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupItem;

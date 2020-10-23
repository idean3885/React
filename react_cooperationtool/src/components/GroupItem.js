import React, { Component } from "react";
import axios from "axios";
import "./commonCSS.css";
import Util from "./Util";

export default class ProjectItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pjtName: "",
      grpName: "",
      grpMember: "",
      boardList: [],
      syncTime: "",
      value_syncBoard: "게시글 동기화 시작",
    };

    // 그룹 정보 설정 | 메인화면으로 리다이렉트
    if (
      props !== undefined &&
      props.grpInfo &&
      props.pjtName &&
      props.pjtName !== ""
    ) {
      const grpInfo = props.grpInfo;

      this.state.pjtName = props.pjtName;
      this.state.grpName = grpInfo.grpName;
      this.state.grpMember = grpInfo.grpMember.join(", ");
    } else {
      alert("프로젝트 및 그룹을 선택해주세요.");
      document.location.href = "/";
    }

    // 인터벌 중지
    // 기존에 동기화가 진행 중일 수도 있기 때문에 일단 중지시킨다.
    Util.stopInterval(this.syncBoard);
  }

  // 그룹멤버 추가
  addGrpMember = () => {
    let elem_memberId = document.getElementById("input_grpMemberId");
    const memberId = elem_memberId !== undefined ? elem_memberId.value : "";

    const { pjtName, grpName } = this.state;

    if (memberId === "") {
      return alert("참여자 ID를 입력 후 시도해주세요.");
    }

    const { apiUrl } = this.props;
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
        let { grpMember } = this.state;
        grpMember += ", " + memberId;

        this.setState({
          grpMember: grpMember,
        });

        // 입력한 사용자 명 지우기
        elem_memberId.value = "";
      })
      .catch((error) => {
        const res = error.response;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== null ? res.status : 400;
        
        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        const msg =
          res?.data?.msg !== undefined
            ? res.data.msg
            : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다. API서버 상태 및 기능 확인하시기 바랍니다.";
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;
        
        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  // 동기화 인터벌 토글
  toggleInterval = (func) => {
    const key = Object.keys(func)[0]; // 함수 이름(키값) 을 타이머아이디로 설정
    const timerId = Util.timerObj[key];
    const { grpName } = this.state;

    if (timerId === undefined && grpName !== null) {
      Util.startInterval(1, func);
      this.setState({
        value_syncBoard: "게시글 동기화 중지",
      });
    } else if (timerId) {
      Util.stopInterval(func);

      this.setState({
        value_syncBoard: "게시글 동기화 시작",
      });
    } else {
      //alert('group Select Plz.');
    }
  };

  // 게시글 동기화
  syncBoard = {
    syncBoard: () => {
      const { apiUrl } = this.props;
      let { pjtName, syncTime, boardList } = this.state;

      axios({
        method: "post",
        url:
          apiUrl +
          "/board/" +
          pjtName +
          "/" +
          this.state.grpName +
          "/syncBoard",
        withCredentials: true,
        data: {
          syncTime: syncTime, // 최종 동기화 시간을 전달하여 그 후의 데이터만 읽어오도록 한다.
        },
      })
        .then((res) => {
          const result = res.data;

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
          if (result.boardList) {
            boardList = boardList.concat(result.boardList); // 이전 게시글 + 추가된 게시글

            // const boardList = result.boardList;	// 추가된 게시글

            // 게시글 추가 및 동기화 시간 갱신
            this.setState({
              boardList: boardList,
              syncTime: result.syncTime,
            });

            // 스크롤 위치가 맨 아래였을 때만 게시글 추가 후 스크롤 이동.
            if (isBottom) {
              document.getElementById(
                "boardDiv"
              ).scrollTop = document.getElementById("boardDiv").scrollHeight;
            }
          }
        })
        .catch((error) => {
		  Util.stopInterval(this.syncBoard);
		  
		  const res = error.response;

          // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
          let status = res?.status !== null ? res.status : 400;

          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          const msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다. API서버 상태 및 기능 확인하시기 바랍니다.";
          alert(msg);
          document.getElementById("msgDiv").innerHTML = msg;

          // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
          if (status === 405) {
            return (document.location.href = "/");
		  }
		  
		  return console.error(error);
		});
    },
  };

  // 게시글 추가
  addPost = () => {
    const { pjtName, grpName } = this.state;

    let contents = document.getElementById("board_contents");

    if (contents === null || contents.value === "") {
      return alert("게시글 내용을 입력 후 추가해주세요.");
    }

    const { apiUrl } = this.props;
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
        const res = error.response;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== null ? res.status : 400;

        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        const msg =
          res?.data?.msg !== undefined
            ? res.data.msg
            : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다. API서버 상태 및 기능 확인하시기 바랍니다.";
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  componentDidMount() {
    // 게시글 내용 이벤트 등록
    document
      .getElementById("board_contents")
      .addEventListener("keydown", (e) => {
        // 엔터키 입력 시
        if (e.which === 13) {
          // 컨트롤 or Shift or alt 를 같이 누르지 않은 경우
          if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            this.addPost(); // 게시글 추가
          }
        }
      });
  }

  render() {
    // state 중 boardList 만 가져옴
    const { boardList } = this.state;
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

    // TODO: 스크롤 위치가 이전 위치를 반영하는 것을 보아 추가된 게시글 div 만 리렌더링 때 추가되는듯 하다.
    //		 전체가 다시 그려지지 않는 이유를 확인해야 한다.
    return (
      <div>
        <div id="div_grpInfo">
          <h3>[그룹 정보]</h3>
          <div className="defaultDiv">
            <ul>
              <li>그룹 이름 : {this.state.grpName}</li>
              <li>그룹 참여자 : {this.state.grpMember}</li>
              참여자 추가 : <input type="text" id="input_grpMemberId" />
              <input type="button" value="추가" onClick={this.addGrpMember} />
            </ul>
          </div>
        </div>

        <div id="div_boardInfo">
          <h3>[{this.state.grpName}그룹의 게시글]</h3>
          <input
            type="button"
            id="syncBoard"
            value={this.state.value_syncBoard}
            onClick={() => {
              this.toggleInterval(this.syncBoard);
            }}
          />
          동기화 시간 : {this.state.syncTime}
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
                  onClick={this.addPost}
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

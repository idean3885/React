import React, { Component } from "react";
import axios from "axios";
import "./commonCSS.css";

import Util from "./Util";

export default class UserInfoItem extends Component {
  state = {
    debugStyle: "block",
    signInStyle: "block",
    signUpStyle: "block",
    signOutStyle: "none",
    userInfoStyle: "none",
    userId: "",
    userName: "",
    pjtList: [],
  };

  // 로그인 화면 보기
  viewSignIn = () => {
    // 사용자 정보 화면 갱신 후 로그인 화면 진입
    this.setState({
      userInfoStyle: "none",
      userId: "",
      userName: "",
      pjtList: [],
    });

    this.props.viewSignIn();
  };

  // 회원가입 화면 보기
  viewSignUp = () => {
    this.props.viewSignUp();
  };

  // 로그아웃 기능
  signOut = () => {
    const { apiUrl } = this.props;

    axios({
      method: "post",
      url: apiUrl + "/auth/signout",
      withCredentials: true,
    })
      .then((res) => {
        const result = res.data;

        alert(result.msg);

        document.location.href = "/";
      })
      .catch((error) => {
        let msg = "";
        // then 과정에서 발생한 로직 에러 처리
        if (error.name !== undefined) {
          msg = error.name + " : " + error.message;
        } else {
          const res = error?.response;

          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";

          // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
          const status = res?.status !== undefined ? res.status : 405;

          // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
          if (status === 405) {
            return (document.location.href = "/");
          }
        }
        alert(msg);

        return (document.location.href = "/");
      });
  };

  // 프로젝트 조회
  viewProject = (pjtName) => {
    const { apiUrl } = this.props;

    axios({
      method: "post",
      url: apiUrl + "/board/" + pjtName,
      withCredentials: true,
    })
      .then((res) => {
        const result = res.data;
        document.getElementById("msgDiv").innerHTML = result.msg;

        return this.props.viewProject(result.pjtInfo);
      })
      .catch((error) => {
        let msg = "";
        // then 과정에서 발생한 로직 에러 처리
        if (error.name !== undefined) {
          msg = error.name + " : " + error.message;
        } else {
          const res = error?.response;

          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";

          // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
          const status = res?.status !== undefined ? res.status : 405;

          // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
          if (status === 405) {
            return (document.location.href = "/");
          }
        }
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        return console.error(error);
      });
  };

  // 프로젝트 생성
  createProject = () => {
    const { apiUrl } = this.props;
    let elem_pjtName = document.getElementById("input_pjtName");
    const pjtName = elem_pjtName !== undefined ? elem_pjtName.value : null;

    // 값이 입력되었는지 확인
    if (pjtName == null || pjtName === "") {
      return alert("프로젝트 이름을 입력해주세요.");
    }

    axios({
      method: "post",
      url: apiUrl + "/board/createProject",
      withCredentials: true,
      data: {
        pjtName: pjtName,
      },
    })
      .then((res) => {
        const result = res.data;

        // 디버그 표시
        document.getElementById("msgDiv").innerHTML = result.msg;

        alert(result.msg);
        // 프로젝트 생성한 경우 -> list 추가 필요.
        let pjtList = this.state.pjtList;
        pjtList.push(pjtName);

        // 화면 갱신 -> setState 할 경우 re rendering 됨.
        this.setState({
          pjtList: pjtList,
        });

        // 입력한 프로젝트 명 지우기
        elem_pjtName.value = "";
      })
      .catch((error) => {
        let msg = "";
        // then 과정에서 발생한 로직 에러 처리
        if (error.name !== undefined) {
          msg = error.name + " : " + error.message;
        } else {
          const res = error?.response;

          // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
          msg =
            res?.data?.msg !== undefined
              ? res.data.msg
              : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";

          // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
          const status = res?.status !== undefined ? res.status : 405;

          // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
          if (status === 405) {
            return (document.location.href = "/");
          }
        }
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        return console.error(error);
      });
  };

  /**
   * 사용자 정보 불러오기
   * Util 에서 함수 이름으로 인터벌타이머를 관리하기 위해 map{"함수 이름": funcion()} 으로 생성함.
   */
  getLoginUserinfo = {
    // 화살표 함수로 만들 경우 this가 자동으로 바인딩된다.
    // 화살표 함수는 이름을 설정할 수 없기 때문에 map 으로 설정하여 인터벌 타이머ID에 사용될 키 값을 따로 정한다.
    getLoginUserinfo: () => {
      const { apiUrl } = this.props;

      axios({
        method: "post",
        url: apiUrl + "/auth/getLoginUser",
        withCredentials: true,
      })
        .then((res) => {
          const result = res.data;

          // 사용자 정보가 조회된 경우(로그인한 경우)
          const loginUser = result.userInfo;

          // 화면 갱신 -> setState 할 경우 re rendering 됨.
          this.setState({
            signInStyle: "none",
            signUpStyle: "none",
            signOutStyle: "block",
            userInfoStyle: "block",
            userId: loginUser.userId,
            userName: loginUser.userName,
            pjtList: loginUser.joinProjects,
          });
        })
        .catch((error) => {
          Util.stopInterval(this.getLoginUserinfo);

          let msg = "";
          // then 과정에서 발생한 로직 에러 처리
          if (error.name !== undefined) {
            msg = error.name + " : " + error.message;
          } else {
            const res = error?.response;

            // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
            msg =
              res?.data?.msg !== undefined
                ? res.data.msg
                : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";
          }
          alert(msg);
          document.getElementById("msgDiv").innerHTML = msg;

          return this.viewSignIn();
        });
    },
  };

  // 컴포넌트 생성 -> render 이후 실행됨.
  // 렌더링 안에서 인터벌을 실행할 경우
  // 사용자 정보 조회 -> 조회된 정보로 rerendering -> 다시 인터벌 시작
  // 위 과정으로 인해 무한루프가 발생한다.
  // 이를 막기 위해 렌더링 안에서 re rendering이 발생할 수 있는 setState 는 하지 않는다.
  componentDidMount() {
    if (this.props.isStart) {
      Util.startInterval(60, this.getLoginUserinfo);
    }
  }

  render() {
    // state 중 pjtList만 가져옴
    const { pjtList } = this.state;
    const li_pjtList = pjtList.map((pjtName, i) => (
      <li key={i}>
        {/* 
					함수에 인자 전달하는 3가지 방법

					1. 화살표 함수
						예) <button onClick={ () => { this.showMsg('webisfree'); } }> 
						
					2. bind() 함수 -> 콜백 시, this를 전달하기 위해 주로 쓰임
						예) <button onClick={ this.showMsg.bind(this, 'webisfree') }>
						
					3. prop, data-속성
						<button
							data-msg={'webisfree'}
							onClick={ this.showMsg }>
							Click
							</button>
							
						showMsg = (event) => {
						const msg = event.target.getAttribute('data-msg');
						console.log(msg);
						};
					*/}
        <a
          href="#!"
          onClick={() => {
            this.viewProject(pjtName);
          }}
        >
          {pjtName}
        </a>
      </li>
    ));
    return (
      <div id="div_header">
        <p>
          <a href="/">메인으로 가기</a>
        </p>
        <a
          href="#!"
          onClick={this.viewSignIn}
          style={{ display: this.state.signInStyle }}
        >
          {" "}
          로그인{" "}
        </a>
        <a
          href="#!"
          onClick={this.viewSignUp}
          style={{ display: this.state.signUpStyle }}
        >
          {" "}
          회원가입{" "}
        </a>
        <a
          href="#!"
          onClick={this.signOut}
          style={{ display: this.state.signOutStyle }}
        >
          {" "}
          로그아웃{" "}
        </a>

        <div id="div_debug" style={{ display: this.state.debugStyle }}>
          <h3>[디버그]</h3>
          <div className="defaultDiv" id="msgDiv"></div>
        </div>

        <div id="div_userInfo" style={{ display: this.state.userInfoStyle }}>
          <h3>[내 정보]</h3>
          <div className="defaultDiv">
            <ol>
              <li>ID : {this.state.userId}</li>
              <li>이름 : {this.state.userName}</li>
              <li>
                참여 프로젝트
                <ul id="ul_pjtList">{li_pjtList}</ul>
              </li>
              프로젝트 생성 : <input type="text" id="input_pjtName" />
              <input type="button" value="생성" onClick={this.createProject} />
              <li id="li_noticeList">내 알림함</li>
              <li id="li_category">카테고리</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

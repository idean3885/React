import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./commonCSS.css";

import Util from "./Util";

function UserInfoItem(props) {
  let [debugStyle] = useState("block");
  let [signInStyle, setSignInStyle] = useState("block");
  let [signUpStyle, setSignUpStyle] = useState("block");
  let [signOutStyle, setSignOutStyle] = useState("none");
  let [userInfoStyle, setUserInfoStyle] = useState("none");
  let [userId, setUserId] = useState("");
  let [userName, setUserName] = useState("");
  let [pjtList, setPjtList] = useState([]);

  // 로그인 화면 보기
  const viewSignIn = useCallback(() => {
    // 사용자 정보 화면에 값이 남아있을 수 있기에 초기화 후 이동한다.
    setUserInfoStyle("none");
    setUserId("");
    setUserName("");
    setPjtList([]);

    // 로그인 화면 호출
    props.viewSignIn();
  }, [props]);

  // 회원가입 화면 보기
  const viewSignUp = useCallback(() => {
    props.viewSignUp();
  }, [props]);

  // 로그아웃 기능
  const signOut = useCallback(() => {
    const { apiUrl } = props;

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

        return (document.location.href = "/");
      });
  }, [props]);

  // 프로젝트 조회
  const viewProject = useCallback(
    (pjtName) => {
      const { apiUrl } = props;

      axios({
        method: "post",
        url: apiUrl + "/board/" + pjtName,
        withCredentials: true,
      })
        .then((res) => {
          const result = res.data;
          document.getElementById("msgDiv").innerHTML = result.msg;

          return props.viewProject(result.pjtInfo);
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
          let status = res?.status !== null ? res.status : 400;

          // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
          if (status === 405) {
            return (document.location.href = "/");
          }

          return console.error(error);
        });
    },
    [props]
  );

  // 프로젝트 생성
  const createProject = useCallback(() => {
    const { apiUrl } = props;
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
        setPjtList(pjtList.push(pjtName));

        // 입력한 프로젝트 명 지우기
        elem_pjtName.value = "";
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
        let status = res?.status !== null ? res.status : 400;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  }, [props, pjtList]);

  /**
   * 사용자 정보 불러오기
   * Util 에서 함수 이름으로 인터벌타이머를 관리하기 위해 map{"함수 이름": funcion()} 으로 생성함.
   */
  const getLoginUserInfo = useCallback(() => {
	const { apiUrl } = props;

	axios({
	  method: "post",
	  url: apiUrl + "/auth/getLoginUser",
	  withCredentials: true,
	})
	  .then((res) => {
		const result = res.data;

		// 사용자 정보가 조회된 경우(로그인한 경우)
		const loginUser = result.userInfo;

		setSignInStyle("none");
		setSignUpStyle("none");
		setSignOutStyle("block");
		setUserInfoStyle("block");
		setUserId(loginUser.userId);
		setUserName(loginUser.userName);
		setPjtList(loginUser.joinProjects);
	  })
	  .catch((error) => {
		Util.stopInterval('getLoginUserInfo');

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

		return viewSignIn();
	  });
  }, [props, viewSignIn]);
    

  // 렌더가 완료된 후 호출되는 콜백함수
  // componentDidMount + componentDidUpdate = useEffect
  useEffect(() => {
    // 렌더링 안에서 인터벌을 실행할 경우
    // 사용자 정보 조회 -> 조회된 정보로 rerendering -> 다시 인터벌 시작
    // 위 과정으로 인해 무한루프가 발생한다.
    // 이를 막기 위해 렌더링 안에서 re rendering이 발생할 수 있는 setState 는 하지 않는다.
    if (props.isStart) {
      Util.startInterval(60, getLoginUserInfo, 'getLoginUserInfo');
    }
  }, [props, getLoginUserInfo]);

  const li_pjtList = pjtList.map((pjtName, i) => (
    <li key={i}>
      {/* 
				함수에 인자 전달하는 3가지 방법

				1. 화살표 함수
					예) <button onClick={ () => { showMsg('webisfree'); } }> 
					
				2. bind() 함수 -> 콜백 시, this를 전달하기 위해 주로 쓰임
					예) <button onClick={ showMsg.bind(this, 'webisfree') }>
					
				3. prop, data-속성
					<button
						data-msg={'webisfree'}
						onClick={ showMsg }>
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
          viewProject(pjtName);
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
      <a href="#!" onClick={viewSignIn} style={{ display: signInStyle }}>
        로그인
      </a>
      <a href="#!" onClick={viewSignUp} style={{ display: signUpStyle }}>
        회원가입
      </a>
      <a href="#!" onClick={signOut} style={{ display: signOutStyle }}>
        로그아웃
      </a>

      <div id="div_debug" style={{ display: debugStyle }}>
        <h3>[디버그]</h3>
        <div className="defaultDiv" id="msgDiv"></div>
      </div>

      <div id="div_userInfo" style={{ display: userInfoStyle }}>
        <h3>[내 정보]</h3>
        <div className="defaultDiv">
          <ol>
            <li>ID : {userId}</li>
            <li>이름 : {userName}</li>
            <li>
              참여 프로젝트
              <ul id="ul_pjtList">{li_pjtList}</ul>
            </li>
            프로젝트 생성 : <input type="text" id="input_pjtName" />
            <input type="button" value="생성" onClick={createProject} />
            <li id="li_noticeList">내 알림함</li>
            <li id="li_category">카테고리</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default UserInfoItem;

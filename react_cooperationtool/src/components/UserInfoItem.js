import React, { useEffect, useState } from "react";
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
  let [noticeList, setNoticeList] = useState([]);
  let [noticeSyncTime, setNoticeSyncTime] = useState('');

  // 로그인 화면 보기
  const viewSignIn = () => {
    // 사용자 정보 화면에 값이 남아있을 수 있기에 초기화 후 이동한다.
    setUserInfoStyle("none");
    setUserId("");
    setUserName("");
    setPjtList([]);

    // 로그인 화면 호출
    props.viewSignIn();
  };

  // 회원가입 화면 보기
  const viewSignUp = () => {
    props.viewSignUp();
  };

  // 로그아웃 기능
  const signOut = () => {
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
  };

  // 프로젝트 조회
  const viewProject = (pjtName) => {
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
        let status = res?.status !== undefined ? res.status : 400;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  // 프로젝트 생성
  const createProject = () => {
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
        let status = res?.status !== undefined ? res.status : 400;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  /**
   * 사용자 정보 불러오기
   * Util 에서 함수 이름으로 인터벌타이머를 관리하기 위해 map{"함수 이름": funcion()} 으로 생성함.
   */
  const getLoginUserInfo = () => {
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
  
        // 화면에 보여줄 값 먼저 설정
        setUserId(loginUser.userId);
        setUserName(loginUser.userName);
        setPjtList(loginUser.joinProjects);
  
        // 설정된 값이 보여지도록 style 변경
        setSignInStyle("none");
        setSignUpStyle("none");
        setSignOutStyle("block");
        setUserInfoStyle("block");
      })
      .catch((error) => {
        Util.stopInterval('getLoginUserInfo');  // 사용자 정보 조회
        Util.stopInterval('getNoticeList');     // 알림함 갱신
  
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
    };

  /**
   * 알림함 갱신
   */
  const getNoticeList = ()=> {
    const { apiUrl } = props;

    const el_noticeSyncTime = document.getElementById('lbl_noticeSyncTime').innerHTML;
    axios({
      method:'POST',
      url: apiUrl + "/auth/getNoticeList",
      withCredentials: true,
      data: {
        syncTime: el_noticeSyncTime
      }
    })
    .then(res=> {
      const result = res.data;
      const status = res.status;

      // 응답 데이터가 잘못된 경우
      // TODO: API 통신 인증 -> API 통신 전 인증하여 응답 데이터를 검증할 필요가 없도록 해야 한다.
      if (result?.msg === undefined) {
        throw new Error("Error! Invalid response data : " + res.data);
      }

      // 추가된 게시글이 있으면 추가
      if (
        status !== 204
        && result.noticeList !== null
      ) {
        /**
         * 2020.11.16 dykim - noticeList에 값이 저장되지 않아 동기화할 때마다 모든 목록이 사라진다.
         * 전에 됬던 기능인데 갑자기 안되서 임시방편으로 항상 모든 목록을 불러오도록 수정
         * 
         * TODO: useCallback 제거 등 프론트 코드를 정리한 후 반드시 고칠 것.
         */
        //let syncList = noticeList.concat(result.noticeList);
        setNoticeList(result.noticeList);
      }

      // 동기화 시간 갱신
      setNoticeSyncTime(result.syncTime);
    })
    .catch(e=> {
      Util.stopInterval('getLoginUserInfo');  // 사용자 정보 조회
      Util.stopInterval('getNoticeList');     // 알림함 갱신

      let msg = "";
      const res = e?.response;
      // then 과정에서 발생한 로직 에러 처리
      if (e.name !== undefined && res === undefined) {
        msg = e.name + " : " + e.message;
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
  };

  /**
   * 프로젝트 초대 수락
   */
  const joinPjt = (bodyData)=> {
    const {apiUrl} = props;
    const {pjtName} = bodyData;

    axios({
      method: 'post',
      url: apiUrl + '/board/' + pjtName + '/addPjtMember',
      withCredentials: true,
      data: { memberId: userId }
    })
    .then(res=> {
      const result = res.data;

      // 디버그 표시
      document.getElementById("msgDiv").innerHTML = result.msg;
      alert(result.msg);

      // 사용자 정보 갱신
      getLoginUserInfo();      
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
	  });
  };

  /**
   * 알림 읽음 처리
   */
  const readNotice = (bodyData)=> {
    const {apiUrl} = props;
    const {reg_dt} = bodyData;

    axios({
      method:'post',
      url: apiUrl + '/auth/modNotice',
      withCredentials: true,
      data: {
        reg_dt: reg_dt, 
        updateData: {isRead: true}
      }
    })
    .then(res=> {
      const result = res.data;

      // 디버그 표시
      document.getElementById("msgDiv").innerHTML = result.msg;
      alert(result.msg);

      // TODO : 알림함 갱신
      getNoticeList();
    })
    .catch(e=> {
      let msg = "";
      const res = e?.response;
      // then 과정에서 발생한 로직 에러 처리
      if (e.name !== undefined && res === undefined) {
        msg = e.name + " : " + e.message;
      } else {
        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        msg =
        res?.data?.msg !== undefined
          ? res.data.msg
          : "읽음 처리에 실패하였습니다.\nAPI서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";
      }
      alert(msg);
      document.getElementById("msgDiv").innerHTML = msg;

      const status = res?.status;
      if (status===405) {
        alert('권한이 없습니다. 다시 로그인해주시기 바랍니다.');
        signOut();
      }
    });
  };

  /**
   * 알림 삭제
   */
  const delNotice = (bodyData)=> {
    const {apiUrl} = props;
    const {reg_dt} = bodyData;

    axios({
      method:'post',
      url: apiUrl + '/auth/modNotice',
      withCredentials: true,
      data: {reg_dt: reg_dt, 
        updateData: {use_yn: false}
      }
    })
    .then(res=> {
      const result = res.data;

      // 디버그 표시
      document.getElementById("msgDiv").innerHTML = result.msg;
      alert(result.msg);

      // TODO : 알림함 갱신
    })
    .catch(e=> {
      let msg = "";
      const res = e?.response;
      // then 과정에서 발생한 로직 에러 처리
      if (e.name !== undefined && res === undefined) {
        msg = encodeURI.name + " : " + e.message;
      } else {
        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        msg =
        res?.data?.msg !== undefined
          ? res.data.msg
          : "알림 삭제에 실패하였습니다.\nAPI서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다.\n API서버 상태 및 기능 확인하시기 바랍니다.";
      }
      alert(msg);
      document.getElementById("msgDiv").innerHTML = msg;

      const status = res?.status;
      if (status===405) {
        alert('권한이 없습니다. 다시 로그인해주시기 바랍니다.');
        signOut();
      }
    });
  };

  /**
   * 알림 처리 기능
   */
  const procNotice = (type, bodyData)=> {
    switch(type){
      case 'invitePjt': 
        joinPjt(bodyData);
        break;
      case 'read':
        readNotice(bodyData);
        break;
      case 'delete':
        delNotice(bodyData);
        break;
      default:
        console.log('해당되는 작업이 없습니다.');
    }
  };

  // 렌더가 완료된 후 호출되는 콜백함수
  // componentDidMount + componentDidUpdate = useEffect
  useEffect(() => {
    console.log('user Effect!');
    // 렌더링 안에서 인터벌을 실행할 경우
    // 사용자 정보 조회 -> 조회된 정보로 rerendering -> 다시 인터벌 시작
    // 위 과정으로 인해 무한루프가 발생한다.
    // 이를 막기 위해 렌더링 안에서 re rendering이 발생할 수 있는 setState 는 하지 않는다.
    if (props.isStart) {
      // TODO: 화면이 렌더링될 때마다 해당 메소드가 실행된다. 인터벌을 관리할 컴포넌트가 따로 있어야될 듯 하다.
      Util.startInterval(60, getLoginUserInfo, 'getLoginUserInfo');
      setTimeout(Util.startInterval(10, getNoticeList, 'getNoticeList'), 1500);
    }
  }, []); // 의존성을 제거하여 최초 진입 시, 한번만 실행된 이후 props 의 값이 변경된다하더라도 useEffect() 가 실행되지 않도록 한다.

  // 프로젝트 목록
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

  // 알림함 목록
  const li_noticeList = 
    noticeList.map((notice, i) => (
      <div key={i} className="defaultDiv" style={{maxWidth: '500px'}}>
        <ol>
          <li>isRead: {notice.isRead? '읽음': "읽지 않음."} <input type="button" onClick={()=>{procNotice('read', {reg_dt: notice.reg_dt})}} value="읽음 처리"/></li>
          <li>title: {notice.title}</li>
          <li>reg_dt: {notice.reg_dt}</li>
          <li>use_yn: {notice.use_yn? '삭제되지 않음.': '삭제됨.'} <input type="button" onClick={()=>{procNotice('delete', {reg_dt: notice.reg_dt})}} value="삭제 처리"/></li>
          <li>
              <p>수락하시려면 <input type="button" onClick={()=>{procNotice(notice.type, notice.bodyData)}} value="수락"/> 버튼 클릭~</p>
          </li>
        </ol>
      </div>
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
            <li id="li_noticeList">
              내 알림함
              동기화 시간 : <label id="lbl_noticeSyncTime">{noticeSyncTime}</label>
              {li_noticeList}
            </li>
            <li id="li_category">카테고리</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default UserInfoItem;

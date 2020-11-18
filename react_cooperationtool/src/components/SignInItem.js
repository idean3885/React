import React, { useEffect } from "react";
import axios from "axios";
import "./commonCSS.css";

function SignInForm(props) {
  // 로그인 기능
  const signIn = () => {
    let elem_userId = document.getElementById("user_id");
    let elem_userPwd = document.getElementById("user_pwd");

    const user_id = elem_userId !== undefined ? elem_userId.value : null;
    const user_pwd = elem_userPwd !== undefined ? elem_userPwd.value : null;

    // 값이 입력되었는지 확인
    if (user_id == null || user_pwd == null) {
      return alert("아이디와 비밀번호를 모두 입력 후 로그인해주십시오.");
    }

    const { apiUrl } = props;
    axios({
      method: "post",
      url: apiUrl + "/auth/signin",
      withCredentials: true,
      data: {
        user_id: user_id,
        user_pwd: user_pwd,
      },
    })
      .then((res) => {
        const result = res.data;

        alert(result.msg);

        // 로그인 성공한 경우 메인화면으로 리다이렉트
        // 화면만 리 렌더링할 경우 componentDidMount() 가 실행되지 않아 사용자 정보 조회 인터벌이 실행되지 않는다.
        // 따라서 메인화면으로 다시 진입하여 인터벌이 정상적으로 실행되도록 한다.
        document.location.href = "/";
      })
      .catch((error) => {
        elem_userPwd.value = ""; // 입력한 비밀번호 지우기

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

        return console.error(error);
      });
  };

  // 렌더가 완료된 후 호출되는 콜백함수
  // componentDidMount + componentDidUpdate = useEffect
  useEffect(() => {
    // 비밀번호 입력창 이벤트 등록
    document.getElementById("user_pwd").addEventListener("keydown", (e) => {
      // 엔터키 입력 시
      if (e.which === 13) {
        e.preventDefault();
        signIn(); // 로그인 진행
      }
    });
  }, [signIn]);

  return (
    <div id="div_signIn">
      <h3> [로그인 화면] </h3>
      <div className="defaultDiv">
        <div>
          <input type="text" id="user_id" placeholder="ID 입력" />
        </div>
        <div>
          <input type="password" id="user_pwd" placeholder="PWD 입력" />
        </div>
        <input type="button" value="로그인" onClick={signIn} />
      </div>
    </div>
  );
}

export default SignInForm;

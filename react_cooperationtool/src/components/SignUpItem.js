import React, { useCallback } from "react";
import axios from "axios";
import "./commonCSS.css";

function SignUpItem(props) {
  const viewSignIn = useCallback(() => {
    props.viewSignIn();
  }, [props]);

  const signUp = useCallback(() => {
    let user_id = document.getElementById("user_id");
    let user_pwd = document.getElementById("user_pwd");
    let user_name = document.getElementById("user_name");

    if (user_id == null || user_pwd == null || user_name == null) {
      return alert("값을 모두 입력 후 시도해 주세요.");
    }

    const { apiUrl } = props;
    axios({
      method: "post",
      url: apiUrl + "/auth/signup",
      withCredentials: true,
      data: {
        user_id: user_id.value,
        user_pwd: user_pwd.value,
        user_name: user_name.value,
      },
    })
      .then((res) => {
        const result = res.data;
        alert(result.msg);
        document.getElementById("msgDiv").innerHTML = result.msg;

        // 회원가입 성공한 경우 로그인 화면 보여주기
        viewSignIn();
      })
      .catch((error) => {
        user_pwd.value = ""; // 입력한 비밀번호 지우기

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
  }, [props, viewSignIn]);

  return (
    <div id="div_signUp">
      <h3>[회원가입 화면]</h3>
      <div className="defaultDiv">
        <div>
          아이디 : <input type="text" id="user_id" placeholder="ID 입력" />
        </div>
        <div>
          비밀번호 :{" "}
          <input type="password" id="user_pwd" placeholder="PWD 입력" />
        </div>
        <div>
          이름 :{" "}
          <input type="text" id="user_name" placeholder="이름을 입력해주세요" />
        </div>
        <input type="button" value="가입하기" onClick={signUp} />
      </div>
    </div>
  );
}

export default SignUpItem;

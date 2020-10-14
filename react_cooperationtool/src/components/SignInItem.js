import React, { Component} from 'react';
import axios from 'axios';
import './commonCSS.css';

export default class SignInItem extends Component{
    constructor() {
        super();

        // 메소드 내 this 를 클래스의 this로 연결한다.
        // 메소드를 함수 리터럴로 만들경우, this 는 함수에서 가장 가까운 변수인 리터럴변수로 바인딩된다.
        // 따라서 다른 메소드들은 함수 리터럴로 만들기로 한다.
        this.signIn = this.signIn.bind(this);
    }

    viewUserInfo = e=> {
        //e.preventDefault();
        this.props.viewUserInfo();
    }

    signIn = ()=> {
        let elem_userId = document.getElementById('user_id');
        let elem_userPwd = document.getElementById('user_pwd');

        const user_id = elem_userId !== undefined? elem_userId.value : null;
        const user_pwd = elem_userPwd !== undefined? elem_userPwd.value : null;

        // 값이 입력되었는지 확인
        if (user_id==null || user_pwd==null) {
            return alert('아이디와 비밀번호를 모두 입력 후 로그인해주십시오.')
        }

        axios({
			method: 'post',
			url: this.props.apiURL + '/auth/signin',
            withCredentials: true,
            data: {
                user_id: user_id, 
                user_pwd: user_pwd
            }
		})
		.then((response)=> {
            const result = response.data;

            if (!result.isExec) {
				elem_userPwd.value = '';    // 입력한 비밀번호 지우기

                return alert(result.msg);
			}
	
            // 로그인 성공한 경우 header 화면 보여주기
            this.viewUserInfo();
		})
		.catch((error)=> {
			elem_userPwd.value = '';    // 입력한 비밀번호 지우기
			return console.error(error);
        });
    }

    render() {
        return (
            <div id="div_signIn">
                <h3> [로그인 화면] </h3>
                <div className="defaultDiv">
                    <div><input type="text" id="user_id" placeholder="ID 입력"/></div>
                    <div><input type="password" id="user_pwd" placeholder="PWD 입력"/></div>
                    <input type="button" value="로그인" onClick={this.signIn}/>
                </div>
             </div>
        )
    }
}
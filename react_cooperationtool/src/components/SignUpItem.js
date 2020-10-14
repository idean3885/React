import React, { Component} from 'react';
import axios from 'axios';
import './commonCSS.css';

export default class SignInItem extends Component{
    viewSignIn = e=> {
        e.preventDefault();
        this.props.viewSignIn();
    }

    signUp = ()=> {
        let user_id = document.getElementById('user_id');
        let user_pwd = document.getElementById('user_pwd');
        let user_name = document.getElementById('user_name');

        if (user_id == null || user_pwd==null || user_name==null) {
            return alert('값을 모두 입력 후 시도해 주세요.');
        }

        user_id = user_id.value;
        user_pwd = user_pwd.value;
        user_name = user_name.value;

        axios({
			method: 'post',
			url: this.props.apiURL + '/auth/signup',
            withCredentials: true,
            data: {
                user_id: user_id, 
                user_pwd: user_pwd, 
                user_name: user_name
            }
		})
		.then((result)=> {
			if (!result.isExec) {
                user_pwd.value = '';    // 입력한 비밀번호 지우기

                return alert(result.msg);
            }
	
			// 회원가입 성공한 경우 로그인 화면으로 이동
            alert(result.msg);
            this.viewSignIn();
		})
		.catch((error)=> {
			user_pwd.value = '';    // 입력한 비밀번호 지우기
			return console.error(error);
        });
    }

    render() {
        return (
            <div id="div_signUp">
               <h3>[회원가입 화면]</h3>
                <div className="defaultDiv">
                    <div>아이디     : <input type="text" id="user_id" placeholder="ID 입력" /></div>
                    <div>비밀번호   : <input type="password" id="user_pwd" placeholder="PWD 입력"/></div>
                    <div>이름       : <input type="text" id="user_name" placeholder="이름을 입력해주세요"/></div>
                    <input type="button" value="가입하기" onClick={this.signUp}/>
                </div>
             </div>
        )
    }
}
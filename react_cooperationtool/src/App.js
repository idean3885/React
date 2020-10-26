import React, { Component} from 'react';
import ErrorBoundary from './components/ErrorBoundary';

/* 컴포넌트 */
import UserInfoItem from './components/UserInfoItem';
import SignInItem from './components/SignInItem';
import SignUpItem from './components/SignUpItem';
import ProjectItem from './components/ProjectItem';

class App extends Component {
	state = {
		isViewSignIn: false,	// 로그인 화면 보여줄지
		isViewSignUp: false,	// 회원가입 화면 보여줄지
		isViewProject: false,	// 프로젝트 조회 화면 보여줄 지
		isStartUserInfo: true	// 사용자 조회 인터벌 시작할 지
	}

	// setState 를 할 경우, 설정된 값으로 rendering 이 다시 진행된다.
	viewSignIn = ()=> {
		console.log('로그인 화면 세팅!');

		// state가 변경된 값에 대해서만 렌더링이 진행되는 듯...
		// 전부 false 후 필요한 부분만 다시 true 처리하여 값이 항상 변하도록 한다.
		this.setState({
			isViewSignIn: false,
			isViewSignUp: false,
			isViewProject: false,
			isStartUserInfo: false
		})

		this.setState({
			isViewSignIn: true
		});
	}

	viewSignUp = ()=> {
		this.setState({
			isViewSignIn: false,
			isViewSignUp: false,
			isViewProject: false,
			isStartUserInfo: false
		})

		this.setState({
			isViewSignUp: true
		});
	}

	viewUserInfo = ()=> {
		this.setState({
			isViewSignIn: false,
			isViewSignUp: false,
			isViewProject: false,
			isStartUserInfo: true
		});
	}

	viewProject = (project)=> {	
		this.setState({
			isViewProject: false,
			isViewSignIn: false,
			isViewSignUp: false,
			pjtInfo: {}
		});

		this.setState({
			isViewProject: true,
			isStartUserInfo: true,
			pjtInfo: project
		});
	}

	render() {
		const {apiUrl} = this.props;	// API서버 주소
		return (
			<div>
				{/* 사용자 정보 */}
				<ErrorBoundary>
					<UserInfoItem apiUrl={apiUrl} viewSignIn={this.viewSignIn} viewSignUp={this.viewSignUp} viewProject={this.viewProject} isStart={this.state.isStartUserInfo}/>
				</ErrorBoundary>

				{/* 로그인 */}
				<ErrorBoundary>
					{this.state.isViewSignIn &&
						<SignInItem apiUrl={apiUrl} viewUserInfo={this.viewUserInfo}/>
					}
				</ErrorBoundary>
					
				{/* 회원가입 */}
				<ErrorBoundary>
					{this.state.isViewSignUp &&
						<SignUpItem apiUrl={apiUrl} viewSignIn={this.viewSignIn}/>
					}
				</ErrorBoundary>
				
				{/* 프로젝트 조회 */}
				<ErrorBoundary>
					{this.state.isViewProject &&
						<ProjectItem apiUrl={apiUrl} pjtInfo={this.state.pjtInfo}/>
					}
				</ErrorBoundary>
			</div>
		)
	}
}

App.defaultProps = {
	apiUrl: 'http://localhost:3050'
};

export default App;

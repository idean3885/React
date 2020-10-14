import React, { Component} from 'react';
import axios from 'axios';
import './commonCSS.css';
import Util from './Util';

export default class ProjectItem extends Component{
    constructor(props) {
        super(props);

        this.state= {
            pjtName: "",
            grpName: "",
            grpMember: "",
			boardList: [],
			syncTime: '',
			value_syncBoard: '게시글 동기화 시작'
        }

        if (props!==undefined && props.grpInfo && props.pjtName && props.pjtName!=="") {
            const grpInfo = props.grpInfo;

            this.state.pjtName = props.pjtName;
            this.state.grpName = grpInfo.grpName;
            this.state.grpMember = grpInfo.grpMember.join(', ');
        } else {
            alert('프로젝트 및 그룹을 선택해주세요.');
            document.location.href = '/';
        } 
    }    

    addGrpMember = ()=> {
        const elem_memberId = document.getElementById('input_grpMemberId');
        const memberId = elem_memberId!==undefined? elem_memberId.value : '';

        const {pjtName} = this.state;
        const {grpName} = this.state;

        if (memberId==='') {
            return alert('참여자 ID를 입력 후 시도해주세요.');
        }

        const url = this.props.apiURL + '/baord/' + pjtName + '/' + grpName + '/addGrpMember';
        axios({
			method: 'post',
			url: url,
            withCredentials: true,
            data: {
                memberId: memberId
            }
		})
		.then((result)=> {
            document.getElementById('msgDiv').innerHTML = result.msg;

            if (!result.isExec) {
                return alert(result.msg);
			}
	
            // 추가된 참여자 세팅
            let grpMember = this.state.grpMember;
            grpMember += ", " + memberId;

            this.setState({
                grpMember: grpMember
            });
		})
		.catch((error)=> {
            const status = error.response.status;
            const msg = error.response.data.msg;

            alert(msg);
            // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
            if (status===405) {
                return document.location.href = '/';
            }

			return console.error(error);
        });
	}
	
	toggleInterval = (func)=> {
		const key = Object.keys(func)[0];
		const timerId = Util.timerObj[key];

		if (timerId == null && this.state.grpName!=null) {
			Util.startInterval(1, func);
			this.setState({
				value_syncBoard: '게시글 동기화 중지'
			});
        } 
        else if (timerId){
			Util.stopInterval(func);
			
			this.setState({
				value_syncBoard: '게시글 동기화 시작'
			});
        }
        else {
            //alert('group Select Plz.');
        }
	}

    syncBoard = {
		syncBoard : ()=> {
			axios({
				method: 'post',
				url:this.props.apiURL + '/board/' + this.state.pjtName + '/' + this.state.grpName + '/syncBoard',
				withCredentials: true,
				data: {
					syncTime: this.state.syncTime  // 최종 동기화 시간을 전달하여 그 후의 데이터만 읽어오도록 한다.
				},
			})
			.then((response) => {
				const result = response.data;

				if (!result.isExec) {
					return alert(result.msg);
				}

				let isBottom = false;
				const scrollTop = document.getElementById('boardDiv').scrollTop;	// 현재 위치
				const scrollHeight = document.getElementById('boardDiv').scrollHeight;	// 스크롤 높이
				if ( scrollTop === scrollHeight -700) {    // 스크롤 높이(700px) 만큼 오차가 생겨 조정
					isBottom = true;
				}

				// 추가된 게시글이 있으면 추가
				if (result.boardList) {
					//const boardList = this.state.boardList.concat(result.boardList);	// 이전 게시글 + 추가된 게시글

					const boardList = result.boardList;	// 추가된 게시글

					// 게시글 추가 및 동기화 시간 갱신
					this.setState({
						boardList: boardList,
						syncTime: result.syncTime
					});

					// 스크롤 위치가 맨 아래였을 때만 게시글 추가 후 스크롤 이동.
					if (isBottom) {
						document.getElementById('boardDiv').scrollTop = document.getElementById('boardDiv').scrollHeight;
					}
				}
			})
			.catch((error)=> {
				Util.stopInterval(this.syncBoard);
				return console.error(error);
			});
		}
	}
	
	addPost = ()=> {
		;
	}

    render() {
		// state 중 boardList 만 가져옴
		const {boardList} = this.state;
		const li_boardList = boardList.map(
			(board, i) => (
				<div class="defaultDiv" style={{width: "100%"}}>
					<ul>
						<li>ID: {board.userId}</li>
						<li>작성일: {board.reg_dt}</li>
						<li>내용 <textarea name="contents" rows="3" readOnly style={{resize: 'none', width: '90%'}}>{board.contents}</textarea></li>
					</ul>
				</div>
			)
		);

		let boardElem = document.getElementById('boardDiv');
		if (boardElem !== null) {
			boardElem.innerHTML += li_boardList;
		}
		
        return (
			<div>
				<div id="div_grpInfo">
					<h3>[그룹 정보]</h3>
					<div className="defaultDiv">
						<ul>
							<li>그룹 이름 : {this.state.grpName}</li>
							<li>그룹 참여자 : {this.state.grpMember}</li>
							참여자 추가 : <input type="text" id="input_grpMemberId" /><input type="button" value="추가" onClick={this.addGrpMember}/>
						</ul>
					</div>
				</div>

				<div id="div_boardInfo">
					<h3>[{this.state.grpName}그룹의 게시글]</h3>
					<input type="button" id="syncBoard" value="동기화 시작" onClick={()=> {Util.startInterval(1, this.syncBoard)}}/>
					<input type="button" id="syncBoard" value="동기화 중지" onClick={()=> {Util.stopInterval(this.syncBoard);}}/>
					동기화 시간 : {this.state.syncTime}
					<div className="defaultDiv">
						<div className="scrollDiv" id="boardDiv" style={{overflowX: "hidden"}}></div>
						<div className="defaultDiv" style={{width: '100%'}}>
							<ul>
								<li>내용 <textarea id="board_contents" rows="3" style={{resize: 'none', width: '90%'}}></textarea></li>
								<input type="button" id="btn_addPost" value="올리기" onClick={this.addPost}/>
							</ul>
						</div>
					</div>
				</div>
			</div>
        )
    }
}
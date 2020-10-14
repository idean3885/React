import React, { Component} from 'react';
import axios from 'axios';
import './commonCSS.css';

import GroupItem from './GroupItem';

export default class ProjectItem extends Component{
    constructor(props) {
        super(props);

        this.state= {
            pjtName: "",
            pjtOwner: "",
            pjtMember: "",
            grpList: [],
            isViewGroup: false,
            grpInfo: {}
        }

        if (props!==undefined && props.pjtInfo) {
            const project = props.pjtInfo;

            this.state.pjtName = project.pjtName;
            this.state.pjtOwner = project.pjtOwner;
            this.state.pjtMember = project.pjtMember.join(', ');
            this.state.grpList = project.pjtGroups;
        }       
    }

    inviteUser = ()=> {
        const elem_memberId = document.getElementById('input_pjtMemberId');
        const memberId = elem_memberId!==undefined? elem_memberId.value : '';

        const {pjtName} = this.state;

        if (memberId==='') {
            return alert('참여자 ID를 입력 후 시도해주세요.');
        }

        if (pjtName==='') {
            return alert('프로젝트가 선택되지 않았습니다.');
        }
        
        const url = this.props.apiURL + '/baord/' + pjtName + '/addPjtMember';
        axios({
			method: 'post',
			url: url,
            withCredentials: true,
            data: {
                memberId: memberId
            }
		})
		.then((response)=> {
            const result = response.data;
            document.getElementById('msgDiv').innerHTML = result.msg;

            if (!result.isExec) {
                return alert(result.msg);
			}
	
            // 추가된 참여자 세팅
            let pjtMember = this.state.pjtMember;
            pjtMember += ", " + memberId;

            // this.setState({
            //     pjtMember: ''
            // });

            this.setState({
                pjtMember: pjtMember
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

    addGroup = ()=> {
        ;
    }

    // 그룹 조회
    viewGroup = (pathName)=> {
        const url = this.props.apiURL + pathName;

        axios({
            method:'post',
            url: url,
            withCredentials: true,
        })
        .then((response)=>{
            const result = response.data;
            
            // TODO: 게시글 조회 인터벌 중지 및 시작
            // Util.stopInterval(syncBoard);

            // 그룹 정보가 조회되지 않은 경우
            if (!result.isExec) {
                console.error(result.msg);
                // Util.stopInterval(syncBoard);

                return alert(result.msg);
            }

            if (result.grpInfo) {
                const grpInfo = result.grpInfo;

                // 프로젝트 정보 리 렌더링을 위해 일부러 false 후 true 처리
                this.setState({
                    isViewGroup: false,
                    grpInfo: {}
                });

                this.setState({
                    isViewGroup: true,
                    grpInfo: grpInfo
                });
            }
        })
        .catch((error)=> {
            // Util.stopInterval(syncBoard);
            
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

    render() {
        // state 중 grpList만 가져옴
		const {grpList} = this.state;
		const li_grpList = grpList.map(
			(group, i) => (
				<li key={i}>
					<a href="#!" onClick={()=>{this.viewGroup('/board/' + this.state.pjtName + '/' + group.grpName)}}>
						[{group.grpName}] {group.grpMember.join(', ')}
                    </a>
				</li>
			)
		);

        return (
            <div>
                <div id="div_pjtInfo">
                    <h3>[프로젝트 정보]</h3>
                    <div className="defaultDiv">
                        <ol>
                            <li>프로젝트 이름 : {this.state.pjtName}</li>
                            <li>소유자(생성자) : {this.state.pjtOwner}</li>
                            <li>프로젝트 참여자 : {this.state.pjtMember}</li>
                            참여자 초대 : <input type="text" id="input_pjtMemberId" /><input type="button" value="초대" onClick={this.inviteUser}/>
                            <li>생성된 그룹</li>
                            그룹 추가 : <input type="text" id="input_grpName" /><input type="button" id="addGroup" value="추가" onClick={this.addGroup}/>
                            <ul id="ul_grpList">
                                {li_grpList}
                            </ul>
                        </ol>
                    </div>
                </div>

                <div id="div_grpInfo">
                    {this.state.isViewGroup &&
                        <GroupItem apiURL={this.props.apiURL} pjtName={this.state.pjtName} grpInfo={this.state.grpInfo}/>
                    }
                </div>
             </div>
        )
    }
}
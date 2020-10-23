import React, { Component } from "react";
import axios from "axios";
import "./commonCSS.css";

import GroupItem from "./GroupItem";

export default class ProjectItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pjtName: "",
      pjtOwner: "",
      pjtMember: "",
      grpList: [],
      isViewGroup: false,
      grpInfo: {},
    };

    if (props !== undefined && props.pjtInfo) {
      const project = props.pjtInfo;

      this.state.pjtName = project.pjtName;
      this.state.pjtOwner = project.pjtOwner;
      this.state.pjtMember = project.pjtMember.join(", ");
      this.state.grpList = project.pjtGroups;
    }
  }

  // 프로젝트 참여자 초대
  inviteUser = () => {
    let elem_memberId = document.getElementById("input_pjtMemberId");
    const memberId = elem_memberId !== undefined ? elem_memberId.value : "";

    const { pjtName } = this.state;

    if (memberId === "") {
      return alert("참여자 ID를 입력 후 시도해주세요.");
    }

    if (pjtName === "") {
      return alert("프로젝트가 선택되지 않았습니다.");
    }

    const { apiUrl } = this.props;
    axios({
      method: "post",
      url: apiUrl + "/board/" + pjtName + "/addPjtMember",
      withCredentials: true,
      data: {
        memberId: memberId,
      },
    })
      .then((res) => {
        const result = res.data;

				alert(result.msg);
        document.getElementById("msgDiv").innerHTML = result.msg;

        // 추가된 참여자 세팅
        let pjtMember = this.state.pjtMember;
        pjtMember += ", " + memberId;

        // reRendering 을 위한 setState
        this.setState({
          pjtMember: pjtMember,
        });

        // 입력한 사용자명 지우기
        elem_memberId.value = "";
      })
      .catch((error) => {
        const res = error.response;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== null ? res.status : 405;
        
        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        const msg =
          res?.data?.msg !== undefined
            ? res.data.msg
            : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다. API서버 상태 및 기능 확인하시기 바랍니다.";
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  // 그룹 추가
  addGroup = () => {
    let elem_grpName = document.getElementById("input_grpName");
    let grpName = elem_grpName !== undefined ? elem_grpName.value : null;

    if (grpName == null || grpName === "") {
      return alert("그룹 이름을 입력 후 시도해주세요.");
    }

    const { apiUrl } = this.props;
    const { pjtName } = this.state;
    axios({
      method: "post",
      url: apiUrl + "/board/" + pjtName + "/addGroup",
      withCredentials: true,
      data: {
        grpName: grpName,
      },
    })
      .then((res) => {
        const result = res.data;

        document.getElementById("msgDiv").innerHTML = result.msg;
        alert(result.msg);

        if (result.grpInfo) {
          let { grpList } = this.state;
          grpList.push(result.grpInfo);
          this.setState({
            grpList: grpList,
          });

          elem_grpName.value = "";
        }
      })
      .catch((error) => {
        const res = error.response;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== null ? res.status : 400;
        
        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        const msg =
          res?.data?.msg !== undefined
            ? res.data.msg
            : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다. API서버 상태 및 기능 확인하시기 바랍니다.";
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;

        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  // 그룹 조회
  viewGroup = (pathName) => {
    const { apiUrl } = this.props;
    axios({
      method: "post",
      url: apiUrl + pathName,
      withCredentials: true,
    })
      .then((res) => {
        const result = res.data;
        document.getElementById("msgDiv").innerHTML = result.msg;

        if (result.grpInfo) {
          const grpInfo = result.grpInfo;

          // 프로젝트 정보 리 렌더링을 위해 일부러 false 후 true 처리
          this.setState({
            isViewGroup: false,
            grpInfo: {},
          });

          this.setState({
            isViewGroup: true,
            grpInfo: grpInfo,
          });
        }
      })
      .catch((error) => {
        const res = error.response;

        // apiUrl 이 잘못되었거나, 응답 값이 잘못된 경우
        let status = res?.status !== null ? res.status : 400;
        
        // 응답 데이터 양식 : {msg: "xxx", ...} => msg 값이 무조건 전달되도록 api 서버 설정함.
        const msg =
          res?.data?.msg !== undefined
            ? res.data.msg
            : "API서버가 응답하지 않거나 응답데이터(resposeData)가 올바르지 않습니다. API서버 상태 및 기능 확인하시기 바랍니다.";
        alert(msg);
        document.getElementById("msgDiv").innerHTML = msg;
        
        // 권한이 없는 경우 > 토큰만료 등 로그아웃된 것으로 간주하고 메인화면으로 리다이렉트시킨다.
        if (status === 405) {
          return (document.location.href = "/");
        }

        return console.error(error);
      });
  };

  render() {
    // state 중 grpList만 가져옴
    const { grpList } = this.state;
    const li_grpList = grpList.map((group, i) => (
      <li key={i}>
        <a
          href="#!"
          onClick={() => {
            this.viewGroup(
              "/board/" + this.state.pjtName + "/" + group.grpName
            );
          }}
        >
          [{group.grpName}] {group.grpMember.join(", ")}
        </a>
      </li>
    ));

    return (
      <div>
        <div id="div_pjtInfo">
          <h3>[프로젝트 정보]</h3>
          <div className="defaultDiv">
            <ol>
              <li>프로젝트 이름 : {this.state.pjtName}</li>
              <li>소유자(생성자) : {this.state.pjtOwner}</li>
              <li>프로젝트 참여자 : {this.state.pjtMember}</li>
              참여자 초대 : <input type="text" id="input_pjtMemberId" />
              <input type="button" value="초대" onClick={this.inviteUser} />
              <li>생성된 그룹</li>
              그룹 추가 : <input type="text" id="input_grpName" />
              <input
                type="button"
                id="addGroup"
                value="추가"
                onClick={this.addGroup}
              />
              <ul id="ul_grpList">{li_grpList}</ul>
            </ol>
          </div>
        </div>

        <div id="div_grpInfo">
          {this.state.isViewGroup && (
            <GroupItem
              apiUrl={this.props.apiUrl}
              pjtName={this.state.pjtName}
              grpInfo={this.state.grpInfo}
            />
          )}
        </div>
      </div>
    );
  }
}

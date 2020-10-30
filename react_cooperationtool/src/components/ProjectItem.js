import React, { useCallback, useState } from "react";
import axios from "axios";
import "./commonCSS.css";

import GroupItem from "./GroupItem";

function ProjectItem(props) {
    const pjtInfo = props?.pjtInfo;
    if (pjtInfo===undefined) {
        alert('프로젝트가 선택되지 않았습니다.');
        document.location.href = '/';
    }


    const [pjtName] = useState(pjtInfo.pjtName);
    const [pjtOwner] = useState(pjtInfo.pjtOwner);
    let [pjtMember, setPjtMember] = useState(pjtInfo.pjtMember.join(', '));
    let [grpList, setGrpList] = useState(pjtInfo.pjtGroups);
    let [isViewGroup, setIsViewGroup] = useState(false);
    let [grpInfo, setGrpInfo] = useState({});

    // 프로젝트 참여자 초대
    const inviteUser = useCallback(() => {
        let elem_memberId = document.getElementById("input_pjtMemberId");
        const memberId = elem_memberId?.value;
    
        if (memberId === undefined) {
          return alert("참여자 ID를 입력 후 시도해주세요.");
        }
    
        if (pjtName === "") {
          return alert("프로젝트가 선택되지 않았습니다.");
        }
    
        const { apiUrl } = props;
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
            setPjtMember(pjtMember + ", " + memberId);
    
            // 입력한 사용자명 지우기
            elem_memberId.value = "";
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
    }, [props, pjtName, pjtMember]);

     // 그룹 추가
    const addGroup = useCallback(() => {
        let elem_grpName = document.getElementById("input_grpName");
        let grpName = elem_grpName?.value;
    
        if (grpName === undefined) {
          return alert("그룹 이름을 입력 후 시도해주세요.");
        }

        const {apiUrl} = props;
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
              setGrpList(grpList.push(result.grpInfo));
    
              elem_grpName.value = "";
            }
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
    }, [props, pjtName, grpList]);

    // 그룹 조회
    const viewGroup = useCallback((pathName) => {
        const { apiUrl } = props;
        axios({
          method: "post",
          url: apiUrl + pathName,
          withCredentials: true,
        })
          .then((res) => {
            const result = res.data;
            document.getElementById("msgDiv").innerHTML = result.msg;
    
            if (result.grpInfo) {
              let grpInfo = result.grpInfo;
    
              // 프로젝트 정보 리 렌더링을 위해 일부러 false 후 true 처리
              setIsViewGroup(false);
              setGrpInfo({});

              setGrpInfo(grpInfo);
              setIsViewGroup(true);
            }
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
    }, [props]);

    // state 중 grpList만 가져옴
    const li_grpList = grpList.map((group, i) => (
      <li key={i}>
        <a
          href="#!"
          onClick={() => {
            viewGroup(
              "/board/" + pjtName + "/" + group.grpName
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
              <li>프로젝트 이름 : {pjtName}</li>
              <li>소유자(생성자) : {pjtOwner}</li>
              <li>프로젝트 참여자 : {pjtMember}</li>
              참여자 초대 : <input type="text" id="input_pjtMemberId" />
              <input type="button" value="초대" onClick={inviteUser} />
              <li>생성된 그룹</li>
              그룹 추가 : <input type="text" id="input_grpName" />
              <input
                type="button"
                id="addGroup"
                value="추가"
                onClick={addGroup}
              />
              <ul id="ul_grpList">{li_grpList}</ul>
            </ol>
          </div>
        </div>

        <div id="div_grpInfo">
          {isViewGroup && (
            <GroupItem
              apiUrl={props.apiUrl}
              pjtName={pjtName}
              grpInfo={grpInfo}
            />
          )}
        </div>
      </div>
    )
}

export default ProjectItem;
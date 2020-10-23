import React, { Component } from "react";
import "./commonCSS.css";

/**
 * 자식 컴포넌트 렌더링 에러 처리
 * 
 * 렌더링 오류만 잡아내며, 이벤트 핸들러에서 발생한 오류는 처리하지 않는다.
 * 
 * cf. React 16 부터 도입된 기능
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  /**
   * 하위 자식 컴포넌트로부터 에러 발생 시 호출되는 함수
   * 전달받은 오류값으로 state 를 설정하고, 반드시 갱신된 state 를 리턴해야 한다.
   *
   * @param error
   * @returns state
   */
  static getDerivedStateFromError(e) {
    return { error: e };
  }

  render() {
    if (this.state.error) {
      return (
        // 렌더링 중 컴포넌트로부터 에러를 받은 경우
        // 컴포넌트의 관계가 연결되어 있기에 화면을 그리지 않고 에러페이지를 표시한다.
        <div className="defaultDiv">
          <section>
            <h2>React Component Error!</h2>
            <aside>
              <p>{this.state.error && this.state.error.toString()}</p>
            </aside>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

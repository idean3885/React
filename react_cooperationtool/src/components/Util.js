export default class Util {
	static timerObj = Object.create(null);

	/**
	 * 인터벌 시작 함수
	 * 
	 * 콜백함수를 일정시간마다 호출한다.
	 * 이미 인터벌이 진행중이라면 시작하지 않는다.
	 * 
	 * @param sec [인터벌 시간(초)]
	 * @param function [인터벌 함수]
	 * @param key [진행중인 인터벌을 구분할 key 값]
	 * */
	static startInterval = (sec, cb, key)=> {

		console.log("Interval Start : " + key);

        if (this.timerObj[key]!==undefined) {
			return console.log('Interval Already Started.');
        }
		
		cb();    // 인터벌 전에 바로 부르도록
		const timerId = setInterval(cb, sec * 1000);      // 타이머 ID를 값으로 설정
		
		this.timerObj[key] = timerId;
    }

    /**
     * 인터벌 중지
     * 
     * 인터벌을 중지한다. 해당 콜백함수에 대한 인터벌이 없다면 그냥 종료한다.
     * 
     * @param key [진행중인 인터벌 key]
     * */
    static stopInterval = (key)=> {
		const timerId = this.timerObj[key];

		console.log('Interval stop : ' + key);

		if (timerId==null) {
			console.log('Interval Already Stoped.');
			return;
		}

		clearInterval(timerId);

		delete this.timerObj[key];   // 타이머 목록에서 삭제
	}

	/**
	 * 슬립 함수
	 * @param {millisecond} delay [밀리세컨드]
	 */
	static sleep(delay) {
		let start = new Date().getTime();
		while(new Date().getTime() < start + delay);
	}
}
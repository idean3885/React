export default class Util {
	timerObj = Object.create(null);

	/**
	 * 인터벌 시작 함수
	 * 
	 * 콜백함수를 일정시간마다 호출한다.
	 * 이미 인터벌이 진행중이라면 시작하지 않는다.
	 * 
	 * @param sec [인터벌 시간(초)]
	 * @param obj [함수 객체 = {함수이름 : 인터벌 함수}]
	 * */
	static startInterval = (sec, obj)=> {

        // static 메소드라 생성자가 동작하기 전에 함수가 만들어져 값이 꼬이는 듯..
        if (this.timerObj===undefined) {
            this.timerObj = Object.create(null);   // 타이머ID Object, 타이머를 키값으로 모든 인터벌을 한번에 관리한다.
        }

		const key = Object.keys(obj)[0];
		const cb = obj[key];	// 함수 이름을 키로 설정    

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
     * @param obj [함수 객체 = {함수이름 : 인터벌 함수}]
     * */
    static stopInterval = (obj)=> {

        // static 메소드라 생성자가 동작하기 전에 함수가 만들어져 값이 꼬이는 듯..
        if (this.timerObj===undefined) {
            this.timerObj = Object.create(null);   // 타이머ID Object, 타이머를 키값으로 모든 인터벌을 한번에 관리한다.
        }

		const key = Object.keys(obj)[0];

		const timerId = this.timerObj[key];

		console.log('Interval stop : ' + key);

		if (timerId==null) {
			console.log('Interval Already Stoped.');
			return;
		}

		clearInterval(timerId);

		delete this.timerObj[key];   // 타이머 목록에서 삭제
	}
}
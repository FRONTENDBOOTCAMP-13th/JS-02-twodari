import Timer from './createTimer';

const timerBox = document.getElementById('timer-box');

const timerObj = new Timer({
  setMinTime: 60,
  endPoint: '/src/pages/bad_end.html',
});

if (timerBox) {
  timerObj.appendTo(timerBox);
} else {
  console.error('타이머가 없습니다.');
}

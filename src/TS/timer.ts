import Timer from '../utils/createTimer';

const timerBox = document.getElementById('timer-box');

const timerObj = new Timer(60);

if (timerBox) {
  timerObj.appendTo(timerBox);
} else {
  console.error('타이머가 없어염');
}

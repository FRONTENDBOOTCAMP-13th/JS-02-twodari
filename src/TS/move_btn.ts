import { CreateMoveBtn } from '../utils/createMoveBtn.';

const moveButtonBox = document.getElementById('move-btn-box');

if (moveButtonBox) {
  //위쪽 이동 버튼
  const moveButtonUp = new CreateMoveBtn({
    altText: '위로 이동하기', //방향키 대체 텍스트
    position: { bottom: '30%', right: '10%', position: 'fixed' }, //방향키 버튼 위치
    id: 'move-btn-up', //방향키 버튼 ID
    type: 'up', //이동 타입('up', 'down', 'left', 'right')
    isActive: false, //활성화 여부
    onClick: () => {
      console.log('위로 이동');
    },
    moveText: 'N', //방향 텍스트
    moveTextPosition: { bottom: '40%', right: '10%', position: 'fixed' }, //방향 텍스트 위치
  });
  //아래쪽 이동 버튼
  const moveButtonDown = new CreateMoveBtn({
    altText: '아래로 이동하기', //방향키 대체 텍스트
    position: { bottom: '10%', right: '10%', position: 'fixed' }, //방향키 버튼 위치
    id: 'move-btn-down', //방향키 버튼 ID
    type: 'down', //이동 타입('up', 'down', 'left', 'right')
    isActive: false, //활성화 여부
    onClick: () => {
      console.log('아래로 이동');
    },
    moveText: 'S', //방향 텍스트
    moveTextPosition: { bottom: '0%', right: '10%', position: 'fixed' }, //방향 텍스트 위치
  });
  //왼쪽 이동 버튼
  const moveButtonLeft = new CreateMoveBtn({
    altText: '왼쪽으로 이동하기', //방향키 대체 텍스트
    position: { bottom: '20%', right: '20%', position: 'fixed' }, //방향키 버튼 위치
    id: 'move-btn-left', //방향키 버튼 ID top: 'calc(100vh - 10px)', left: 'calc(100vw - 220px)'
    type: 'left', //이동 타입('up', 'down', 'left', 'right')
    isActive: false, //활성화 여부
    onClick: () => {
      console.log('왼쪽으로 이동');
    },
    moveText: 'W', //방향 텍스트
    moveTextPosition: { bottom: '20%', right: '30%', position: 'fixed' }, //방향 텍스트 위치
  });
  //오른쪽 이동 버튼
  const moveButtonRight = new CreateMoveBtn({
    altText: '오른쪽으로 이동하기', //방향키 대체 텍스트
    position: { bottom: '20%', right: '0%', position: 'fixed' }, //방향키 버튼 위치
    id: 'move-btn-right', //방향키 버튼 ID
    type: 'right', //이동 타입('up', 'down', 'left', 'right')
    isActive: false, //활성화 여부
    onClick: () => {
      console.log('오른쪽으로 이동');
    },
    moveText: 'E', //방향 텍스트
    moveTextPosition: { bottom: '20%', right: '10%', position: 'fixed' }, //방향 텍스트 위치
  });

  moveButtonUp.appendTo(moveButtonBox);
  moveButtonDown.appendTo(moveButtonBox);
  moveButtonLeft.appendTo(moveButtonBox);
  moveButtonRight.appendTo(moveButtonBox);
}

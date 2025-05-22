import { CreateMoveBtn } from './createMoveBtn.';
import { RoomManager } from '../../utils/room_manager';

const directionMap = {
  up: 'north',
  down: 'south',
  left: 'west',
  right: 'east',
} as const;

// 위쪽 이동 버튼
const moveButtonUp = new CreateMoveBtn({
  altText: '위로 이동하기',
  id: 'move-btn-up',
  type: 'up',
  isActive: false,
  onClick: () => {
    CreateMoveBtn.setActiveDirection('up');
    RoomManager.goTo(directionMap['up']);
  },
  position: { top: '45px', left: '100px', position: 'absolute' },
  moveText: 'N',
});
moveButtonUp.appendTo();

// 아래쪽 이동 버튼
const moveButtonDown = new CreateMoveBtn({
  altText: '아래로 이동하기',
  id: 'move-btn-down',
  type: 'down',
  isActive: false,
  onClick: () => {
    CreateMoveBtn.setActiveDirection('down');
    RoomManager.goTo(directionMap['down']);
  },
  position: { top: '160px', left: '100px', position: 'absolute' },
  moveText: 'S',
});
moveButtonDown.appendTo();

// 왼쪽 이동 버튼
const moveButtonLeft = new CreateMoveBtn({
  altText: '왼쪽으로 이동하기',
  id: 'move-btn-left',
  type: 'left',
  isActive: false,
  onClick: () => {
    CreateMoveBtn.setActiveDirection('left');
    RoomManager.goTo(directionMap['left']);
  },
  position: { top: '100px', left: '45px', position: 'absolute' },
  moveText: 'W',
});
moveButtonLeft.appendTo();

// 오른쪽 이동 버튼
const moveButtonRight = new CreateMoveBtn({
  altText: '오른쪽으로 이동하기',
  id: 'move-btn-right',
  type: 'right',
  isActive: false,
  onClick: () => {
    CreateMoveBtn.setActiveDirection('right');
    RoomManager.goTo(directionMap['right']);
  },
  position: { top: '100px', left: '155px', position: 'absolute' },
  moveText: 'E',
});
moveButtonRight.appendTo();

// 버튼 클릭 이벤트 리스너 설정
CreateMoveBtn.setupKeyListener();

//초기 실행 west
RoomManager.goTo('west');
CreateMoveBtn.setActiveDirection('left');

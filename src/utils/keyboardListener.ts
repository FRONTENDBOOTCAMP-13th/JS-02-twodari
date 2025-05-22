import { MoveController } from './moveController.ts';
import { TransitionEffect } from './transition_effect.ts';

let isListener = false;

export function setKeyListener() {
  if (isListener) return;

  document.addEventListener('keydown', event => {
    // 암전 중이면 키 입력 무시
    if (TransitionEffect.isInTransition()) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        MoveController.move('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        MoveController.move('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        MoveController.move('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        MoveController.move('right');
        break;
    }
  });
  isListener = true;
}

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
        MoveController.move('up');
        break;
      case 'ArrowDown':
        MoveController.move('down');
        break;
      case 'ArrowLeft':
        MoveController.move('left');
        break;
      case 'ArrowRight':
        MoveController.move('right');
        break;
    }
  });
  isListener = true;
}

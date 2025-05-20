import { MoveController } from './moveController.ts';

let isListener = false;

export function setKeyListener() {
  if (isListener) return;

  document.addEventListener('keydown', event => {
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

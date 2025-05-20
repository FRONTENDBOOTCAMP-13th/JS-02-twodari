import { IRoom } from '../types/type';

export class EastRoom implements IRoom {
  // private visited = false;

  initialize(): void {
    console.log('동쪽 방 초기화');
  }

  render(): void {
    // this.visited = true;
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/east_background.jpg')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }
  }

  cleanup(): void {
    console.log('동쪽 방 정리됨');
  }
}

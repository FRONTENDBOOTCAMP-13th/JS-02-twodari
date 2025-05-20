import { IRoom } from '../types/type';

export class WestRoom implements IRoom {
  private visited = false;

  initialize(): void {
    console.log('서쪽 방 초기화');
  }

  render(): void {
    this.visited = true;
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/west_background.jpg')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }
  }

  cleanup(): void {
    console.log('서쪽 방 정리됨');
  }
}

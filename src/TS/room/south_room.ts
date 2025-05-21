import { IRoom } from '../../types/type.ts';
export class SouthRoom implements IRoom {
  // private visited = false;

  initialize(): void {
    console.log('남쪽 방 초기화');
  }

  render(): void {
    // this.visited = true;
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/south_background.jpg')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }
    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) return;
    btnBox.innerHTML = '';
  }

  cleanup(): void {
    console.log('남쪽 방 정리됨');
  }
}

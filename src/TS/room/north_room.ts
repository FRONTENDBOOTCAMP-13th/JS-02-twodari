import { IRoom, IInventoryItem } from '../../types/type.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import ItemManager from '../../utils/itemManager.ts';

export class NorthRoom implements IRoom {
  private visited = false;
  // private game: CodeGame;
  private itemManager = new ItemManager();

  //방 초기화
  initialize(): void {
    console.log('북쪽 방 초기화');
    // this.game.initialize();
  }

  render(): void {
    this.visited = true;

    //방 그리기
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/background_north.jpg')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) return;

    btnBox.innerHTML = '';
  }

  cleanup(): void {
    console.log('북쪽 방 정리됨');
  }
}

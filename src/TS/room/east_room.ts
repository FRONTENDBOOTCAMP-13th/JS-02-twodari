import { IRoom, IInventoryItem } from '../../types/type.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import { WhiteBoardGame } from '../minigame/east_minigames.ts';

export class EastRoom implements IRoom {
  private miniGame: WhiteBoardGame;

  constructor() {
    this.miniGame = new WhiteBoardGame();

    //인벤토리에 DOM 있는지 체크
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }
  }
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
    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) return;
    btnBox.innerHTML = '';

    //화분에서 아이템 얻기
    const searchButton1 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '고양이 퍼즐 획득', //게임 실행 대체 텍스트
      position: { top: '75%', left: '12%' }, //단서 찾기 버튼 위치
      id: 'search-puzzle', //단서 찾기 버튼 ID
      type: 'clue', //단서 타입('clue' or 'game')
      clueImgSrc: 'src/assets/img/cat_puzzle.webp', //단서 이미지 경로
      clueMessage: '고양이 퍼즐을(를) 획득했다.', //단서 있을 때 메시지
      itemInfo: {
        //IInventoryItem
        id: 'puzzle',
        name: '퍼즐',
        description: '(장소) 에서 발견한 (단서). 어딘가에 쓰일 것 같다.',
        image: 'src/assets/img/cat_puzzle.webp',
        isSelected: false,
      },
      onFound: (item: IInventoryItem) => {
        itemManagerInstance.addItem(item);
      },
    });

    //화이트보드 게임
    const searchButton2 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '화이틑보드 게임 실행', //게임 실행 대체 텍스트
      position: { top: '35%', left: '35%' }, //단서 찾기 버튼 위치
      id: 'board-game-btn', //단서 찾기 버튼 ID
      type: 'game', //단서 타입('clue' or 'game')
      gameCallback: () => {
        this.miniGame.start();
      },
    });

    //탈출 번호 입력
    const searchButton3 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '탈출 비밀번호 실행', //게임 실행 대체 텍스트
      position: { top: '50%', left: '60%' }, //단서 찾기 버튼 위치
      id: 'last-game-btn', //단서 찾기 버튼 ID
      type: 'game', //단서 타입('clue' or 'game')
      gameCallback: () => {},
    });
    searchButton1.appendTo(btnBox);
    searchButton2.appendTo(btnBox);
    searchButton3.appendTo(btnBox);
  }

  cleanup(): void {
    console.log('동쪽 방 정리됨');
  }
}

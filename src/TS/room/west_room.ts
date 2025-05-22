import { IRoom, IInventoryItem } from '../../types/type.ts';
import { CodeGame } from './../minigame/west_minigame.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import { WestPassword } from '../minigame/west_password.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts'; // 공통 인스턴스 사용 <<< 중요!

export class WestRoom implements IRoom {
  private minigame: CodeGame;
  private passwordGame: WestPassword;

  constructor() {
    this.minigame = new CodeGame(() => {
      console.log('코드 미니게임 해결');
    });

    this.passwordGame = new WestPassword(() => {
      console.log('서랍 미니게임 해결');
    });

    // 인벤토리가 이미 DOM에 있는지 확인 후 추가
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }
  }

  // 방 초기화
  initialize(): void {
    console.log('서쪽 방 초기화');
  }

  render(): void {
    // 방 그리기
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/west_background.webp')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) return;
    btnBox.innerHTML = '';

    // 첫번째 찾기 버튼 (단서1: 찢어진 종이)
    const searchButton1 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '구겨진 종이 조사하기',
      position: { top: '70%', left: '7%' },
      id: 'search-paper',
      type: 'clue',
      clueImgSrc: '/src/assets/img/clue_paper.webp',
      clueMessage: '찢어진 종이를 획득했다. 무슨 내용이지?',
      itemInfo: {
        id: 'paper',
        name: '찢어진 종이',
        description: '책상에서 발견한 찢어진 종이.',
        image: '/src/assets/img/clue_paper.webp',
        isSelected: false,
      },
      onFound: (item: IInventoryItem) => {
        itemManagerInstance.addItem(item); // 공통 인스턴스 사용
      },
    });

    // 두번째 찾기 버튼 (페이크, 커피잔)
    const searchButton2 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '커피잔 조사하기',
      position: { top: '65%', left: '20%' },
      id: 'search-coffee',
      type: 'clue',
      clueImgSrc: '',
      emptyMessage: '아무것도 없는 듯 하다.',
    });

    // 세번째 찾기 버튼 (미니게임1 : 코드 게임)
    const searchButton3 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '노트북 조사하기',
      position: { top: '40%', left: '47%' },
      id: 'west-game-btn',
      type: 'game',
      gameCallback: () => {
        this.minigame.start();
      },
    });

    // 네번째 찾기 버튼 (미니게임2 : 서랍 열기)
    const searchButton4 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '서랍 조사하기',
      position: { top: '55%', left: '80%' },
      id: 'drawer-password-btn',
      type: 'game',
      gameCallback: () => {
        this.passwordGame.start();
      },
    });

    // DOM에 추가
    searchButton1.appendTo(btnBox);
    searchButton2.appendTo(btnBox);
    searchButton3.appendTo(btnBox);
    searchButton4.appendTo(btnBox);
  }

  // 방 정리
  cleanup(): void {
    console.log('서쪽 방 정리됨');
    this.minigame.close();
    this.passwordGame.close();
  }
}

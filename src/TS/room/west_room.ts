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

    // 첫번째 찾기 버튼 (단서1)
    const searchButton1 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '쓰레기통 단서 찾기',
      position: { top: '30%', left: '10%' },
      id: 'search-btn-1',
      type: 'clue',
      clueImgSrc: '/src/assets/img/clue_1.png',
      clueMessage: '단서1 을(를) 획득했다.',
      itemInfo: {
        id: 'clue-1',
        name: '단서 1',
        description: '(장소) 에서 발견한 (단서). 어딘가에 쓰일 것 같다.',
        image: '/src/assets/img/clue_1.png',
        isSelected: false,
      },
      onFound: (item: IInventoryItem) => {
        itemManagerInstance.addItem(item); // 공통 인스턴스 사용
      },
    });

    // 두번째 찾기 버튼 (2번째 단서)
    const searchButton2 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '쓰레기통 단서 찾기',
      position: { top: '20%', left: '20%' },
      id: 'search-btn-2',
      type: 'clue',
      clueImgSrc: '/src/assets/img/clue_3.png',
      clueMessage: '단서2 을(를) 획득했다.',
      itemInfo: {
        id: 'clue-2',
        name: '단서 2',
        description: '(장소) 에서 발견한 (단서). 어딘가에 쓰일 것 같다.',
        image: '/src/assets/img/clue_3.png',
        isSelected: false,
      },
      onFound: (item: IInventoryItem) => {
        itemManagerInstance.addItem(item); // 공통 인스턴스 사용 <<< 중요!
      },
    });

    // 나머지 버튼들...
    const searchButton3 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '쓰레기통 단서 찾기',
      position: { top: '70%', left: '70%' },
      id: 'search-btn-3',
      type: 'clue',
      clueImgSrc: '',
      emptyMessage: '아무것도 없는 듯 하다.',
    });

    const searchButton4 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '코드 게임 실행',
      position: { top: '90%', left: '90%' },
      id: 'west-game-btn',
      type: 'game',
      gameCallback: () => {
        this.minigame.start();
      },
    });

    const searchButton5 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '서랍 비밀번호 입력',
      position: { top: '50%', left: '70%' },
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
    searchButton5.appendTo(btnBox);
  }

  // 방 정리
  cleanup(): void {
    console.log('서쪽 방 정리됨');
    this.minigame.close();
    this.passwordGame.close();
  }
}

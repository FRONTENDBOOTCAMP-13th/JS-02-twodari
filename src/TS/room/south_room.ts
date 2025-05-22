import { IRoom, IInventoryItem } from '../../types/type.ts';
import { PuzzleGame } from '../minigame/south_minigame.ts';
import { PasswordKeypad } from '../minigame/password_keypad.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import { showCluePopup } from '../../utils/showCluePopup.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts';

export class SouthRoom implements IRoom {
  private puzzleGame: PuzzleGame;
  private PasswordKeypad: PasswordKeypad;
  private keypadContainer: HTMLElement | null = null;

  private static puzzleCompleted = false;
  private static PasswordKeypadCompleted = false;

  constructor() {
    console.log('SouthRoom 생성자 실행');

    // 인벤토리가 이미 DOM에 있는지 확인 후 추가
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }

    // 미니게임 컨테이너 생성 확인
    const gameContainer = document.getElementById('minigame-container');
    if (!gameContainer) {
      console.warn('minigame-container가 없습니다. 생성합니다.');
      const newContainer = document.createElement('div');
      newContainer.id = 'minigame-container';
      newContainer.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 hidden';
      document.body.appendChild(newContainer);
    }

    // 키패드 컨테이너 생성
    this.keypadContainer = document.createElement('div');
    this.keypadContainer.id = 'keypad-container';
    this.keypadContainer.className = 'hidden';
    document.body.appendChild(this.keypadContainer);

    // 퍼즐 게임 초기화
    this.puzzleGame = new PuzzleGame(() => {
      console.log('퍼즐 미니게임 성공');
      SouthRoom.puzzleCompleted = true;

      showCluePopup({
        clueImgSrc: '/src/assets/img/mirror.webp',
        message: '쪽지가 떨어졌다. "범인은 솔루션팀에 있어."',
      });
    });

    // 비밀번호 키패드 초기화
    this.PasswordKeypad = new PasswordKeypad('keypad-container', () => {
      console.log('비밀번호 성공');
      SouthRoom.PasswordKeypadCompleted = true;

      // 아이템 추가 로직
      const newItem: IInventoryItem = {
        id: 'employee-card',
        name: '피 묻은 사원증',
        description: "금고에서 발견한 피 묻은 사원증. 이름의 초성이 'ㅁㅅ'인 것 같다.",
        image: '/src/assets/img/clue_copier.webp',
        isSelected: false,
      };

      itemManagerInstance.addItem(newItem);

      showCluePopup({
        clueImgSrc: '/src/assets/img/clue_copier.webp',
        message: "피가 튄 사원증이 있다. 성이 가려져 이름 초성만 흐릿하게 보인다. 'ㅁㅅ'.",
      });
    });
  }

  initialize(): void {
    console.log('남쪽 방 초기화');

    // 먼저 컨테이너가 숨겨져 있는지 확인
    const gameContainer = document.getElementById('minigame-container');
    if (gameContainer) {
      gameContainer.classList.add('hidden');
    }

    const keypadContainer = document.getElementById('keypad-container');
    if (keypadContainer) {
      keypadContainer.classList.add('hidden');
    }

    // 그 후에 미니게임 초기화
    this.puzzleGame.initialize();
    this.PasswordKeypad.initialize();
  }

  render(): void {
    console.log('SouthRoom render 실행');

    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/south_background.webp')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) {
      console.error('search-btn-box를 찾을 수 없습니다');
      return;
    }
    btnBox.innerHTML = '';

    const hasItemInInventory = (itemId: string): boolean => {
      if (typeof itemManagerInstance.checkItem === 'function') {
        return itemManagerInstance.checkItem(itemId);
      }
      return false;
    };

    // 1. 액자 검색 버튼 - 퍼즐 미니게임
    const PuzzleButton = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '액자 조사하기',
      position: { top: '45%', left: '75%' },
      id: 'search-Puzzle',
      type: 'game',
      gameCallback: () => {
        console.log('액자 영역 클릭됨');

        const hasPiece = hasItemInInventory('Piece');
        console.log('그림 조각 소유 여부:', hasPiece);

        if (SouthRoom.puzzleCompleted) {
          showCluePopup({
            clueImgSrc: '/src/assets/img/mirror.webp',
            message: '그림 조각이 딱 맞는다.',
          });
        } else if (hasPiece) {
          console.log('퍼즐 게임 시작');
          this.puzzleGame.start();
        } else {
          showCluePopup({
            message: '액자 속 그림이 무언가 어색하다.',
          });
        }
      },
    });

    const self = this;

    // 2. 금고 검색 버튼 - 금고 키패드 (팝업 없이 바로 키패드 표시)
    const safeButton = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '금고 조사하기',
      position: { top: '47%', left: '20%' },
      id: 'search-keypad',
      type: 'game',
      gameCallback: () => {
        console.log('금고 영역 클릭됨');

        if (SouthRoom.PasswordKeypadCompleted) {
          showCluePopup({
            clueImgSrc: '/src/assets/img/clue_copier.webp', // 사원증 이미지로 변경
            message: "피가 튄 사원증이 있다. 성이 가려져 이름 초성만 흐릿하게 보인다. 'ㅁㅅ'.",
          });
        } else {
          // 팝업 없이 바로 키패드 표시
          self.PasswordKeypad.start();
        }
      },
    });

    // DOM에 버튼 추가
    PuzzleButton.appendTo(btnBox);
    safeButton.appendTo(btnBox);

    console.log('버튼 추가 완료');
  }

  cleanup(): void {
    console.log('남쪽 방 정리됨');
    this.puzzleGame.close();
    this.PasswordKeypad.close();

    // 컨테이너 숨기기
    if (this.keypadContainer) {
      this.keypadContainer.classList.add('hidden');
    }

    const gameContainer = document.getElementById('minigame-container');
    if (gameContainer) {
      gameContainer.classList.add('hidden');
    }
  }
}




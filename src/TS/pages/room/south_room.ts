// SouthRoom 클래스 - 남쪽 방 구성
// 퍼즐 미니게임과 금고 키패드 미니게임 구현

import { IRoom } from '../../../types/type.ts';
import { PuzzleGame } from '../../minigame/south_minigame.ts';
import { PasswordKeypad } from '../../minigame/password_keypad.ts';
import { CreateSearchBtn } from '../../components/createSearchBtn.ts';
import { showCluePopup } from '../../../utils/showCluePopup.ts';
import itemManagerInstance from '../../../utils/itemManagerInstance.ts';

export class SouthRoom implements IRoom {
  private puzzleGame: PuzzleGame;
  private PasswordKeypad: PasswordKeypad;
  private keypadContainer: HTMLElement | null = null;

  private static puzzleCompleted = false;
  private static PasswordKeypadCompleted = false;

  constructor() {
    console.log('SouthRoom 생성자 실행');

    // 인벤토리 DOM이 없으면 추가
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }

    // 미니게임 컨테이너가 없으면 생성
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
        clueImgSrc: '/assets/img/clue_copier.webp',
        message: '쪽지가 떨어졌다. "범인은 솔루션팀에 있어."',
      });
    });

    // 비밀번호 키패드 초기화
    this.PasswordKeypad = new PasswordKeypad('keypad-container', () => {
      console.log('비밀번호 성공');
      SouthRoom.PasswordKeypadCompleted = true;

      showCluePopup({
        clueImgSrc: '/assets/img/idcard.webp',
        message: "핏자국이 선명한 사원증. 이름은 지워졌고, 초성 'ㅁㅅ'만 희미하게 보인다. 뒷면에는 '0525'라는 숫자가 적혀 있다.",
      });
    });
  }

  // 남쪽 방 초기화
  initialize(): void {
    console.log('남쪽 방 초기화');

    // 게임/키패드 컨테이너 숨기기
    document.getElementById('minigame-container')?.classList.add('hidden');
    document.getElementById('keypad-container')?.classList.add('hidden');

    // 미니게임 초기화
    this.puzzleGame.initialize();
    this.PasswordKeypad.initialize();
  }

  // 렌더링 함수
  render(): void {
    console.log('SouthRoom render 실행');

    // 배경 이미지 설정
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/south_background.webp')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    // 검색 버튼 박스 초기화
    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) {
      console.error('search-btn-box를 찾을 수 없습니다');
      return;
    }
    btnBox.innerHTML = '';

    // 인벤토리 아이템 보유 여부 확인 함수
    const hasItemInInventory = (itemId: string): boolean => {
      return typeof itemManagerInstance.checkItem === 'function' && itemManagerInstance.checkItem(itemId);
    };

    // 액자 검색 버튼 (퍼즐 미니게임)
    const PuzzleButton = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
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
            clueImgSrc: '/assets/img/clue_copier.webp',
            message: '쪽지가 떨어졌다. "범인은 솔루션팀에 있어."',
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

    // 2. 금고 검색 버튼 (비밀번호 키패드)
    const safeButton = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '금고 조사하기',
      position: { top: '47%', left: '20%' },
      id: 'search-keypad',
      type: 'game',
      gameCallback: () => {
        console.log('금고 영역 클릭됨');

        if (SouthRoom.PasswordKeypadCompleted) {
          showCluePopup({
            clueImgSrc: '/assets/img/idcard.webp',
            message: "핏자국이 선명한 사원증. 이름은 지워졌고, 초성 'ㅁㅅ'만 희미하게 보인다. 뒷면에는 '0525'라는 숫자가 적혀 있다.",
          });
        } else {
          this.PasswordKeypad.start();
        }
      },
    });

    // 버튼 DOM에 추가
    PuzzleButton.appendTo(btnBox);
    safeButton.appendTo(btnBox);

    console.log('버튼 추가 완료');
  }

  // 방 정리 메서드
  cleanup(): void {
    console.log('남쪽 방 정리됨');
    this.puzzleGame.close();
    this.PasswordKeypad.close();

    // 컨테이너 숨기기
    this.keypadContainer?.classList.add('hidden');
    document.getElementById('minigame-container')?.classList.add('hidden');
  }
}

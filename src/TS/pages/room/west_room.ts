import { IRoom } from '../../../types/type.ts';
import { CodeGame } from '../../minigame/west_minigame.ts';
import { CreateSearchBtn } from '../../components/createSearchBtn.ts';
import { WestPassword } from '../../minigame/west_password.ts';
import itemManagerInstance from '../../../utils/itemManagerInstance.ts';
import { showCluePopup } from '../../../utils/showCluePopup.ts';

// 전역 객체로 방 이동 간 상태 보존 (새로고침 시 초기화됨)
const WestRoomState = {
  codeGameCompleted: false,
  drawerGameCompleted: false,
};

export class WestRoom implements IRoom {
  private minigame: CodeGame;
  private passwordGame: WestPassword;
  private originalGameContainer: HTMLElement | null = null;

  // 게터/세터로 전역 상태에 접근
  private get codeGameCompleted(): boolean {
    return WestRoomState.codeGameCompleted;
  }
  private set codeGameCompleted(value: boolean) {
    WestRoomState.codeGameCompleted = value;
  }

  private get drawerGameCompleted(): boolean {
    return WestRoomState.drawerGameCompleted;
  }
  private set drawerGameCompleted(value: boolean) {
    WestRoomState.drawerGameCompleted = value;
  }

  constructor() {
    console.log('WestRoom 생성자 실행');

    // 코드 미니게임 초기화
    this.minigame = new CodeGame(() => {
      console.log('코드 미니게임 해결');
      this.codeGameCompleted = true;

      // 미니게임 컨테이너 정리
      this.cleanupMiniGameContainer();
    });

    // 서랍 미니게임 초기화
    this.passwordGame = new WestPassword(() => {
      console.log('서랍 미니게임 해결');
      this.drawerGameCompleted = true;
    });

    // 인벤토리가 이미 DOM에 있는지 확인 후 추가
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }
  }

  // 방 초기화
  initialize(): void {
    console.log('서쪽 방 초기화');

    // 상태 디버깅 로그
    console.log('코드 게임 상태:', this.codeGameCompleted ? '완료' : '미완료');
    console.log('서랍 게임 상태:', this.drawerGameCompleted ? '완료' : '미완료');

    // 미니게임 컨테이너 초기화
    this.cleanupMiniGameContainer();

    // 백업 컨테이너가 있다면 복원 (방 이동 시)
    this.restoreOriginalContainer();
  }

  // 미니게임 컨테이너 초기화
  private cleanupMiniGameContainer(): void {
    const container = document.getElementById('minigame-container');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
      container.classList.add('hidden');
    }
  }

  // 백업 컨테이너 복원 (방 이동 후 돌아왔을 때)
  private restoreOriginalContainer(): void {
    // 백업 컨테이너가 있고 현재 컨테이너가 없으면 복원
    if (this.originalGameContainer && !document.getElementById('minigame-container')) {
      document.body.appendChild(this.originalGameContainer);
      this.originalGameContainer = null;
    }
  }

  // 코드 미니게임 준비 (방 이동 후에도 작동하도록)
  private prepareCodeMinigame(): void {
    // 1. 현재 minigame-container 가져오기
    let container = document.getElementById('minigame-container');

    // 2. 컨테이너가 없으면 새로 만들기
    if (!container) {
      container = document.createElement('div');
      container.id = 'minigame-container';
      document.body.appendChild(container);
    }

    // 3. 컨테이너 스타일 초기화 및 설정 (미니게임이 제대로 작동하도록)
    container.innerHTML = '';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    container.style.zIndex = '9999';
    container.classList.remove('hidden');

    // 4. 클래스도 추가 (미니게임에서 참조할 수 있는 경우)
    if (!container.classList.contains('minigame-container')) {
      container.classList.add('minigame-container');
    }

    // 콘솔 로그 (디버깅용)
    console.log('코드 미니게임 컨테이너 준비 완료');
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
      iconSrc: '/assets/icon/search.svg',
      altText: '구겨진 종이 조사하기',
      position: { top: '70%', left: '7%' },
      id: 'search-paper',
      type: 'view',
      clueImgSrc: '/assets/img/clue_paper.webp',
      clueMessage: '찢어진 종이를 획득했다. 무슨 내용이지?',
    });

    // 두번째 찾기 버튼 (페이크, 커피잔)
    const searchButton2 = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '커피잔 조사하기',
      position: { top: '65%', left: '20%' },
      id: 'search-coffee',
      type: 'clue',
      clueImgSrc: '',
      emptyMessage: '아무것도 없는 듯 하다.',
    });

    // 세번째 찾기 버튼 (미니게임1 : 코드 게임)
    const searchButton3 = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '노트북 조사하기',
      position: { top: '40%', left: '47%' },
      id: 'west-game-btn',
      type: 'game',
      gameCallback: () => {
        console.log('노트북 버튼 클릭됨');

        // 이미 완료된 미니게임인지 확인
        if (this.codeGameCompleted) {
          showCluePopup({
            message: '금고 번호 : 55 52 51 54 56 57',
          });
          return;
        }

        // 핵심 변경: 미니게임 컨테이너 준비 후 시작
        this.prepareCodeMinigame();

        // 약간의 지연 후 미니게임 시작 (컨테이너 준비 시간)
        setTimeout(() => {
          // 미니게임 시작 전 원본 컨테이너 백업
          const originalContainer = document.getElementById('minigame-container');
          if (originalContainer) {
            // 클론이 아닌 참조를 저장 (방 이동 시 복원용)
            this.originalGameContainer = originalContainer;
          }

          // 기존 미니게임 실행
          this.minigame.start();
        }, 50);
      },
    });

    // 네번째 찾기 버튼 (미니게임2 : 서랍 열기)
    const searchButton4 = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '서랍 조사하기',
      position: { top: '55%', left: '80%' },
      id: 'drawer-password-btn',
      type: 'game',
      gameCallback: () => {
        console.log('서랍 버튼 클릭됨');

        // 이미 완료된 미니게임인지 확인
        if (this.drawerGameCompleted) {
          showCluePopup({
            message: '이제는 아무것도 없다.',
          });
          return;
        }

        // 서랍 미니게임 시작 전 컨테이너 준비
        this.prepareCodeMinigame(); // 코드 미니게임과 동일 컨테이너 사용

        // 서랍 미니게임 시작
        setTimeout(() => {
          this.passwordGame.start();
        }, 50);
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

    // 미니게임 강제 종료
    try {
      this.minigame.close();
      this.passwordGame.close();
    } catch (e) {
      console.warn('미니게임 종료 중 오류:', e);
    }

    // 미니게임 컨테이너 정리
    this.cleanupMiniGameContainer();
  }
}

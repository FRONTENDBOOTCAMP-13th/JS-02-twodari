import { IMiniGame } from '../../types/type.ts';
import { showCluePopup } from '../../utils/showCluePopup.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts';

// 전역 상태 객체 (새로고침 시 초기화됨)
const WestPasswordState = {
  hasBeenCleared: false,
  itemAdded: false,
};

export class WestPassword implements IMiniGame {
  private container: HTMLElement | null = null;
  private inputBoxes: HTMLSpanElement[] = [];
  private input: number[] = [];
  private readonly correctCode = [3, 1, 4];
  private failText: HTMLElement | null = null;
  private onComplete?: () => void;
  private justCleared = false;
  private keyHandler: (e: KeyboardEvent) => void;
  private gameContainer: HTMLElement | null = null;

  // 상태 게터/세터
  private get hasBeenCleared(): boolean {
    return WestPasswordState.hasBeenCleared;
  }
  private set hasBeenCleared(value: boolean) {
    WestPasswordState.hasBeenCleared = value;
  }

  private get itemAdded(): boolean {
    return WestPasswordState.itemAdded;
  }
  private set itemAdded(value: boolean) {
    WestPasswordState.itemAdded = value;
  }

  constructor(onComplete?: () => void) {
    this.onComplete = onComplete;

    // 키보드 핸들러를 클래스 초기화 시점에 바인딩
    this.keyHandler = this.handleKeyDown.bind(this);
  }

  //시작하기
  start(): void {
    console.log('서랍 미니게임 시작');

    // 기존 minigame-container 찾기 및 참조 저장
    this.gameContainer = document.getElementById('minigame-container');

    // 컨테이너 스타일 명확하게 지정
    if (this.gameContainer) {
      console.log('미니게임 컨테이너 스타일 설정');
      this.gameContainer.style.position = 'fixed';
      this.gameContainer.style.top = '0';
      this.gameContainer.style.left = '0';
      this.gameContainer.style.width = '100%';
      this.gameContainer.style.height = '100%';
      this.gameContainer.style.zIndex = '10000';
      this.gameContainer.style.backgroundColor = '#000000'; // 완전 불투명
      this.gameContainer.style.alignItems = 'center';
      this.gameContainer.style.justifyContent = 'center';
      this.gameContainer.style.display = 'flex';
      this.gameContainer.classList.remove('hidden');
    }

    //서랍이 완료 되어 있다면
    if (this.hasBeenCleared) {
      console.log('서랍 미니게임 이미 완료됨, 메시지 표시');

      //첫번째 클리어 단계라면
      if (this.justCleared) {
        this.justCleared = false;
        this.destroy();
        return;
      }

      // 완료 메시지 표시 후 정리
      showCluePopup({
        message: '서랍은 이미 열려 있다.',
      });

      setTimeout(() => this.destroy(), 100);
      return;
    }

    this.initialize();

    // 명시적으로 이벤트 리스너 추가 - document 대신 직접 컨테이너에 이벤트 추가
    setTimeout(() => {
      if (this.container) {
        this.container.addEventListener('keydown', this.keyHandler);
        this.container.focus();
        console.log('서랍 미니게임 컨테이너에 직접 이벤트 리스너 추가 및 포커스');
      }
    }, 100);
  }

  close(): void {
    console.log('서랍 미니게임 종료');
    this.destroy();
  }

  //패스워드 그리기
  initialize(): void {
    this.container = document.createElement('div');
    this.container.className = 'fixed inset-0 z-[100]';
    this.container.tabIndex = -1;

    const overlay = document.createElement('div');
    overlay.className = 'game-layer';
    overlay.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      this.container?.focus();
      return false;
    });

    const contentBox = document.createElement('div');
    contentBox.className = 'content-box-style';

    const focusIndicator = document.createElement('div');
    focusIndicator.id = 'focus-indicator';
    focusIndicator.className = 'text-green-500 text-center mb-2';
    focusIndicator.textContent = '숫자 키로 입력 후, Enter';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex gap-4 mb-6';

    this.inputBoxes = [];
    for (let i = 0; i < 3; i++) {
      const box = document.createElement('span');
      box.textContent = '0';
      box.className = 'input-box-style';
      this.inputBoxes.push(box);
      inputWrapper.appendChild(box);
    }

    this.failText = document.createElement('p');
    this.failText.textContent = '서랍은 굳게 닫혀 있다.';
    this.failText.className = 'fail-text-style';

    const backBtn = document.createElement('button');
    backBtn.textContent = '뒤로가기';
    backBtn.className = 'back-btn-style';
    backBtn.addEventListener('click', () => this.destroy());

    contentBox.appendChild(focusIndicator);
    contentBox.appendChild(inputWrapper);
    contentBox.appendChild(this.failText);
    contentBox.appendChild(backBtn);

    this.container.appendChild(overlay);
    this.container.appendChild(contentBox);
    document.body.appendChild(this.container);

    this.container.addEventListener('focus', () => {
      const indicator = document.getElementById('focus-indicator');
      if (indicator) indicator.style.visibility = 'visible';
      this.inputBoxes.forEach(box => {
        box.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.2)';
      });
    });

    this.container.addEventListener('blur', () => {
      setTimeout(() => this.container?.focus(), 10);
    });

    contentBox.addEventListener('mousedown', e => {
      if (document.activeElement === this.container) return;
      this.container?.focus();
      e.stopPropagation();
    });

    document.addEventListener('keydown', this.keyHandler);
    setTimeout(() => this.container?.focus(), 100);
  }

  // 키보드 핸들러를 별도 메서드로 분리
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.container) return;

    // 디버깅용 로그
    console.log('서랍 미니게임 키 입력 감지:', e.key);

    if (e.key >= '0' && e.key <= '9') {
      // 최대 3자리까지만 입력 가능
      if (this.input.length < 3) {
        this.input.push(parseInt(e.key));
        this.updateDisplay();

        // 자동 확인 - 3자리 입력 완료 시
        if (this.input.length === 3) {
          setTimeout(() => this.checkCode(), 500);
        }
      }

      // 이벤트 전파 방지
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Backspace') {
      this.input.pop();
      this.updateDisplay();

      // 이벤트 전파 방지
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Enter') {
      this.checkCode();

      // 이벤트 전파 방지
      e.preventDefault();
      e.stopPropagation();
      return;
    } else if (e.key === 'Escape') {
      this.destroy();

      // 이벤트 전파 방지
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // 숫자 입력칸 업데이트
  private updateDisplay() {
    for (let i = 0; i < 3; i++) {
      this.inputBoxes[i].textContent = this.input[i]?.toString() ?? '0';

      // 입력된 숫자 강조
      if (this.input[i] !== undefined) {
        this.inputBoxes[i].style.backgroundColor = '#4a5568';
        this.inputBoxes[i].style.color = '#ffffff';
      } else {
        this.inputBoxes[i].style.backgroundColor = '#333';
        this.inputBoxes[i].style.color = '#999';
      }
    }
  }

  // 비밀번호 확인
  private checkCode() {
    console.log('서랍 비밀번호 확인:', this.input.join(''));

    if (
      this.input.length === 3 &&
      this.input[0] === this.correctCode[0] &&
      this.input[1] === this.correctCode[1] &&
      this.input[2] === this.correctCode[2]
    ) {
      this.handleSuccess();
    } else {
      this.handleFailure();
    }
  }

  // 성공 시 처리
  private handleSuccess() {
    console.log('서랍 비밀번호 성공');
    this.hasBeenCleared = true; // 전역 상태 업데이트
    this.justCleared = true;

    // 성공 애니메이션 또는 표시
    if (this.failText) {
      this.failText.textContent = '서랍이 열렸습니다!';
      this.failText.style.color = '#4ade80';
    }

    // 입력 상자 스타일 변경
    this.inputBoxes.forEach(box => {
      box.style.backgroundColor = '#166534';
      box.style.color = 'white';
      box.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
    });

    // 중요: 아이템 추가는 여기서만 한 번 수행
    // onComplete()는 호출하되 아이템 추가는 하지 않음
    this.addItem();

    // 약간의 지연 후 종료
    setTimeout(() => {
      this.destroy();
      // 완료 콜백 호출 (아이템 추가 없이)
      this.onComplete?.();
    }, 1500);
  }

  // 아이템 추가 - 한 번만 호출되도록 로직 추가
  private addItem() {
    // 이미 아이템을 추가했다면 중복 실행 방지
    if (this.itemAdded) {
      console.log('이미 렌치 아이템이 추가되어 있음, 중복 추가 방지');
      return;
    }

    console.log('렌치 아이템 추가');

    // 아이템 추가
    itemManagerInstance.addItem({
      id: 'wrench',
      name: '공구',
      description: '공구. 고장난 물건을 고칠 수 있을 것 같다.',
      image: '/assets/img/wrench.webp',
      isSelected: false,
    });

    // 팝업은 한 번만 표시
    showCluePopup({
      clueImgSrc: '/assets/img/wrench.webp',
      message: '서랍에는 공구가 들어있었다.',
    });

    // 아이템 추가 플래그 설정 (전역 상태 업데이트)
    this.itemAdded = true;
  }

  // 실패 시 처리
  private handleFailure() {
    console.log('서랍 비밀번호 실패');

    if (this.failText) {
      this.failText.textContent = '잘못된 비밀번호입니다.';
      this.failText.style.color = '#ef4444';
    }

    // 입력 상자 스타일 변경 (실패 표시)
    this.inputBoxes.forEach(box => {
      box.style.backgroundColor = '#7f1d1d';
      box.style.color = 'white';

      // 잠시 후 원래 스타일로 복원
      setTimeout(() => {
        box.style.backgroundColor = '#333';
        box.style.color = '#999';
      }, 500);
    });

    // 입력 초기화
    setTimeout(() => {
      this.input = [];
      this.updateDisplay();
    }, 500);
  }

  private destroy() {
    console.log('서랍 미니게임 제거');

    // 이벤트 리스너 제거
    if (this.container) {
      this.container.removeEventListener('keydown', this.keyHandler);
    }

    // 컨테이너 제거
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    // 중요: 게임 컨테이너 스타일 복원 및 숨기기
    const gameContainer = document.getElementById('minigame-container');
    if (gameContainer) {
      gameContainer.innerHTML = '';
      gameContainer.style.display = 'none';
      gameContainer.classList.add('hidden');
      gameContainer.style.backgroundColor = 'transparent';
    }

    // 상태 초기화 (단, hasBeenCleared와 itemAdded는 유지)
    this.input = [];
    this.inputBoxes = [];
  }
}

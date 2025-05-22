import { IMiniGame } from '../../types/type.ts';
import { showCluePopup } from '../../utils/showCluePopup.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts';

export class WestPassword implements IMiniGame {
  private container: HTMLElement | null = null;
  private inputBoxes: HTMLSpanElement[] = [];
  private input: number[] = [];
  private readonly correctCode = [3, 1, 4];
  private failText: HTMLElement | null = null;
  private onComplete?: () => void;
  private hasBeenCleared = false;
  private justCleared = false;
  private keyHandler: (e: KeyboardEvent) => void;

  constructor(onComplete?: () => void) {
    this.onComplete = onComplete;

    // 키보드 핸들러를 클래스 초기화 시점에 바인딩
    this.keyHandler = this.handleKeyDown.bind(this);
  }

  //시작하기
  start(): void {
    //서랍이 완료 되어 있다면
    if (this.hasBeenCleared) {
      //첫번째 클리어 단계라면
      if (this.justCleared) {
        this.justCleared = false;
        return;
      }

      showCluePopup({
        message: '서랍은 이미 열려 있다.',
      });
      return;
    }

    this.initialize();
  }

  close(): void {
    this.destroy();
  }

  //패스워드 그리기
  initialize(): void {
    this.container = document.createElement('div');
    this.container.className = 'fixed inset-0 z-[100]';
    this.container.tabIndex = -1; // 포커스 가능하도록 설정

    // bg overlay - 이벤트 처리 추가
    const overlay = document.createElement('div');
    overlay.className = 'game-layer';

    // 오버레이 클릭 시 이벤트 버블링 방지
    overlay.addEventListener('mousedown', e => {
      e.preventDefault(); // 기본 동작 방지
      e.stopPropagation(); // 버블링 방지

      // 중요: 컨테이너에 다시 포커스 설정
      if (this.container) {
        this.container.focus();
      }

      return false;
    });

    // content wrapper
    const contentBox = document.createElement('div');
    contentBox.className = 'content-box-style';

    // 입력 상태 표시기 추가
    const focusIndicator = document.createElement('div');
    focusIndicator.id = 'focus-indicator';
    focusIndicator.className = 'text-green-500 text-center mb-2';
    focusIndicator.textContent = '숫자 키로 입력 후, Enter';

    // 숫자 입력칸
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex gap-4 mb-6';
    for (let i = 0; i < 3; i++) {
      const box = document.createElement('span');
      box.textContent = '0';
      box.className = 'input-box-style';
      this.inputBoxes.push(box);
      inputWrapper.appendChild(box);
    }

    // 실패 텍스트
    this.failText = document.createElement('p');
    this.failText.textContent = '서랍은 굳게 닫혀 있다.';
    this.failText.className = 'fail-text-style';

    // 뒤로가기 버튼
    const backBtn = document.createElement('button');
    backBtn.textContent = '뒤로가기';
    backBtn.className = 'back-btn-style';
    backBtn.addEventListener('click', () => {
      this.destroy();
    });

    // 요소들 추가
    contentBox.appendChild(focusIndicator);
    contentBox.appendChild(inputWrapper);
    contentBox.appendChild(this.failText);
    contentBox.appendChild(backBtn);

    this.container.appendChild(overlay);
    this.container.appendChild(contentBox);
    document.body.appendChild(this.container);

    // 포커스 관련 이벤트
    this.container.addEventListener('focus', () => {
      const indicator = document.getElementById('focus-indicator');
      if (indicator) indicator.style.visibility = 'visible';

      // 포커스 시 입력 상자 스타일 변경
      this.inputBoxes.forEach(box => {
        box.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.2)';
      });
    });

    this.container.addEventListener('blur', () => {
      // blur 이벤트 처리에서 즉시 포커스 다시 가져오기
      setTimeout(() => {
        if (this.container) this.container.focus();
      }, 10);
    });

    // 콘텐츠 박스 클릭 시 포커스 유지
    contentBox.addEventListener('mousedown', e => {
      // 현재 요소가 이미 포커스되어 있으면 이벤트 처리 중단
      if (document.activeElement === this.container) {
        return;
      }

      // 포커스 다시 설정
      if (this.container) {
        this.container.focus();
      }

      // 이벤트 버블링 방지
      e.stopPropagation();
    });

    // 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', this.keyHandler);

    // 초기 포커스 설정
    setTimeout(() => {
      if (this.container) {
        this.container.focus();
      }
    }, 100);
  }

  // 키보드 핸들러를 별도 메서드로 분리
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.container) return;

    // 디버깅용 로그 추가
    console.log('키 입력 감지:', e.key);

    if (e.key >= '0' && e.key <= '9') {
      if (this.input.length < 3) {
        this.input.push(parseInt(e.key));
      }
    } else if (e.key === 'Backspace') {
      this.input.pop();
    } else if (e.key === 'Enter') {
      this.checkCode();
      return;
    }
    this.updateDisplay();
  }

  // 숫자 입력칸 업데이트
  private updateDisplay() {
    for (let i = 0; i < 3; i++) {
      this.inputBoxes[i].textContent = this.input[i]?.toString() ?? '0';
    }
  }

  // 비밀번호 확인
  private checkCode() {
    if (this.input.join('') === this.correctCode.join('')) {
      this.handleSuccess();
    } else {
      this.handleFailure();
    }
  }

  // 성공 시 처리
  private handleSuccess() {
    this.hasBeenCleared = true;
    this.justCleared = true;
    this.destroy();

    this.showClueItem();

    this.onComplete?.();
  }

  // 실패 시 처리
  private handleFailure() {
    this.failText!.textContent = '잘못된 비밀번호를 입력한 것 같다.';
    this.input = [];
    this.updateDisplay();
  }

  private destroy() {
    // 이벤트 리스너 제거 - 바인딩된 함수 참조 사용
    document.removeEventListener('keydown', this.keyHandler);
    this.container?.remove();
    this.container = null;
    this.input = [];
    this.inputBoxes = [];
  }

  // 단서 아이템 보여주기 팝업
  private showClueItem() {
    // 공통 인스턴스 사용하도록 수정
    itemManagerInstance.addItem({
      id: 'wrench',
      name: '공구',
      description: '공구. 고장난 물건을 고칠 수 있을 것 같다.',
      image: '/assets/img/wrench.webp',
      isSelected: false,
    });

    showCluePopup({
      clueImgSrc: '/assets/img/wrench.webp',
      message: '서랍에는 공구가 들어있었다.',
    });
  }
}

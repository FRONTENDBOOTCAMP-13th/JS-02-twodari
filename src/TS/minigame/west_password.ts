import { IMiniGame } from '../../types/type.ts';
import ItemManager from '../../utils/itemManager.ts';
import { showCluePopup } from '../../utils/showCluePopup.ts';

export class WestPassword implements IMiniGame {
  private container: HTMLElement | null = null;
  private inputBoxes: HTMLSpanElement[] = [];
  private input: number[] = [];
  private readonly correctCode = [3, 1, 4];
  private failText: HTMLElement | null = null;
  private onComplete?: () => void;
  private hasBeenCleared = false;
  private justCleared = false;

  constructor(onComplete?: () => void) {
    this.onComplete = onComplete;
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

    // bg overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-layer';

    // content wrapper
    const contentBox = document.createElement('div');
    contentBox.className = 'content-box-style';

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

    contentBox.appendChild(inputWrapper);
    contentBox.appendChild(this.failText);
    contentBox.appendChild(backBtn);

    this.container.appendChild(overlay);
    this.container.appendChild(contentBox);
    document.body.appendChild(this.container);

    // 키보드 입력 처리
    document.addEventListener('keydown', this.keyHandler);

    //포커싱이 안되는 문제 -> 아직 해결 못함
    setTimeout(() => {
      this.container?.focus();
    }, 0);
  }

  // 키보드 입력 처리
  private keyHandler = (e: KeyboardEvent) => {
    if (!this.container) return;

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
  };

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
    this.failText!.textContent = '틀렸습니다.';
    this.input = [];
    this.updateDisplay();
  }
  private destroy() {
    document.removeEventListener('keydown', this.keyHandler);
    this.container?.remove();
    this.container = null;
    this.input = [];
  }

  // 단서 아이템 보여주기 팝업
  private showClueItem() {
    const itemManager = new ItemManager();

    itemManager.addItem({
      id: 'wrench',
      name: '공구',
      description: '공구. 고장난 물건을 고칠 수 있을 것 같다.',
      image: '/src/assets/img/wrench.webp',
      isSelected: false,
    });

    showCluePopup({
      clueImgSrc: '/src/assets/img/wrench.webp',
      message: '공구를 획득했다.',
    });
  }
}

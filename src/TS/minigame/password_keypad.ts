export class PasswordKeypad {
  private container: HTMLElement;
  private display!: HTMLInputElement;
  private inputValue: string = '';

  private readonly correctPassword: string = '743689';
  private readonly maxLength: number = 8;

  private onSuccess: () => void;
  private unlockSound: HTMLAudioElement;
  private volumeValue: number = 0.5;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private failureSound: HTMLAudioElement; 


  constructor(containerId: string, onSuccess: () => void) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID "${containerId}" not found.`);
    }

    this.container = container;
    this.onSuccess = onSuccess;
    this.unlockSound = new Audio('/effectSound/unlock.mp3'); // 성공 사운드
    this.unlockSound.volume = this.volumeValue;
    this.failureSound = new Audio('/effectSound/error.ogg'); // 실패 사운드
    this.failureSound.volume = this.volumeValue;
  }

  public initialize(): void {
    this.initUI();
    this.addKeyboardSupport();
    // 초기화 시 숨김 상태로 설정
    this.container.classList.add('hidden');
  }

  public start(): void {
    console.log('키패드 시작');
    // 컨테이너 직접 표시
    this.container.classList.remove('hidden');
    // 인라인 스타일로 확실하게 표시
    this.container.style.display = 'block';
    this.container.style.position = 'fixed';
    this.container.style.top = '50%';
    this.container.style.left = '50%';
    this.container.style.transform = 'translate(-50%, -50%)';
    this.container.style.zIndex = '999';
  }

  public close(): void {
    this.container.classList.add('hidden');
    this.container.style.display = 'none';
    this.inputValue = '';
    if (this.display) {
      this.display.value = '';
    }

    // 리스너 제거
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
  }

  private initUI(): void {
    // 폼 요소 생성 (DOM 경고 해결)
    const formElement = document.createElement('form');
    formElement.onsubmit = e => {
      e.preventDefault(); // 폼 기본 제출 동작 방지
    };

    this.display = document.createElement('input');
    this.display.type = 'password';
    this.display.disabled = true;
    this.display.autocomplete = 'new-password'; // autocomplete 속성 설정
    this.display.className = 'w-full mb-4 px-3 py-3 text-center text-2xl border-none rounded bg-gray-800 text-green-400 font-mono tracking-widest shadow-inner ring-1 ring-green-500 focus:outline-none';

    const keypadGrid = document.createElement('div');
    keypadGrid.className = 'grid grid-cols-3 gap-3';

    const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '입력'];

    buttons.forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = `
        bg-gray-700 text-green-200 font-bold text-xl p-4 rounded border border-gray-600 
        shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] 
        hover:bg-gray-600 active:bg-gray-500 
        transition duration-100
      `;
      btn.addEventListener('click', () => this.handleButtonClick(label));
      keypadGrid.appendChild(btn);
    });

    // 닫기 버튼 추가
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '닫기';
    closeBtn.className = 'w-full mt-4 bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition';
    closeBtn.addEventListener('click', () => this.close());

    // 폼에 요소들 추가
    formElement.appendChild(this.display);
    formElement.appendChild(keypadGrid);
    formElement.appendChild(closeBtn); // 닫기 버튼 추가

    // 기존 콘텐츠 초기화
    this.container.innerHTML = '';
    this.container.className = 'max-w-xs mx-auto p-6 rounded-lg shadow-lg bg-gray-900 border border-gray-700';
    this.container.appendChild(formElement);
  }

  private handleButtonClick(label: string): void {
    if (label === '←') {
      this.inputValue = this.inputValue.slice(0, -1);
    } else if (label === '입력') {
      this.checkPassword();
      return;
    } else {
      if (this.inputValue.length < this.maxLength) {
        this.inputValue += label;
      }
    }

    this.display.value = this.inputValue;
  }

  private checkPassword(): void {
    if (this.inputValue === this.correctPassword) {
      this.playSuccessSoundAndContinue();
    } else {
      this.indicateFailure();
    }
  }

  private playSuccessSoundAndContinue(): void {
    this.unlockSound.play().catch(err => {
      console.warn('오디오 재생 실패:', err);
    });

    setTimeout(() => {
      // 성공 시 키패드 자동으로 닫기
      this.close();
      // 그 후 성공 콜백 호출
      this.onSuccess();
    }, 1500);
  }

  private indicateFailure(): void {
    this.display.classList.add('bg-red-800');
    this.failureSound.currentTime = 0; // 사운드가 겹칠 때를 대비해 처음부터 재생
    this.failureSound.play().catch(() => {});

    setTimeout(() => {
      this.display.classList.remove('bg-red-800');
      this.inputValue = '';
      this.display.value = '';
    }, 600);
  }

  private addKeyboardSupport(): void {
    // 기존 리스너 제거 (중복 방지)
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }

    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (this.inputValue.length < this.maxLength) {
          this.inputValue += e.key;
        }
      } else if (e.key === 'Backspace') {
        this.inputValue = this.inputValue.slice(0, -1);
      } else if (e.key === 'Enter') {
        this.checkPassword();
        return;
      }

      this.display.value = this.inputValue;
    };

    document.addEventListener('keydown', this.keydownListener);
  }
}

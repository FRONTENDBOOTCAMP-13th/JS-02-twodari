import { IMiniGame } from '../../types/type.ts';

export class EscapeCodeGame implements IMiniGame {
  private escapeElement: HTMLDialogElement;
  private correctPassword = '0523';
  private inputValue: string = '';
  private maxLength: number = 4;
  private display!: HTMLInputElement;
  private keydownListener?: (e: KeyboardEvent) => void;
  private trueEnddingCode: '2239' | false = false;

  constructor() {
    this.escapeElement = this.createEscape();
  }

  public initialize(): void {
    console.log('미니게임 초기화');
    this.addKeyboardSupport();
  }

  public start() {
    this.openEscapeGame();
  }

  public close() {}

  //탈출 코드 게임 생성
  private createEscape(): HTMLDialogElement {
    const escapeKeypad = document.createElement('dialog');
    escapeKeypad.className = 'mt-60 mx-auto p-6 rounded-lg shadow-lg bg-gray-900 border border-gray-700';

    const keypadForm = document.createElement('form');
    keypadForm.onsubmit = e => {
      e.preventDefault(); // 폼 기본 제출 동작 방지
    };
    escapeKeypad.appendChild(keypadForm);

    const display = document.createElement('input');
    display.type = 'password';
    display.disabled = true;
    display.autocomplete = 'new-password'; // autocomplete 속성 설정
    display.className =
      'w-full mb-4 px-3 py-3 text-center text-2xl border-none rounded bg-gray-800 text-green-400 font-mono tracking-widest shadow-inner ring-1 ring-green-500 focus:outline-none';

    this.display = display;
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
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.handleButtonClick(label);
      });
      keypadGrid.appendChild(btn);
    });

    // 폼에 요소들 추가
    keypadForm.appendChild(display);
    keypadForm.appendChild(keypadGrid);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.className = 'absolute w-10 h-10 ml-125 border-4 top-4 right-4 rounded-2xl border-[#464646] bg-[#ff3b3b] text-white';
    closeBtn.addEventListener('click', () => {
      this.closeEscapeGame();
    });

    escapeKeypad.appendChild(closeBtn);

    return escapeKeypad;
  }

  public openEscapeGame() {
    this.escapeElement.showModal();
  }

  public closeEscapeGame() {
    this.escapeElement.close();
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

  public setTrueEnddingCode(code: '2239' | false) {
    this.trueEnddingCode = code;
  }

  public checkPassword(): void {
    if (this.inputValue === '') {
      console.log('응 아니야');
      this.closeEscapeGame();
    } else if (this.trueEnddingCode === '2239' && this.inputValue === this.correctPassword) {
      console.log('트루엔딩');
      window.location.href = 'true_end.html';
    } else {
      console.log('노말엔딩');
      window.location.href = 'normal_end.html';
    }
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

  //요소 내보내기
  public getBoardElement() {
    return this.escapeElement;
  }
}

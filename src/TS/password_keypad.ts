class PasswordKeypad {
  private container: HTMLElement; // 키패드를 렌더링할 DOM 컨테이너
  private display!: HTMLInputElement; // 사용자 입력을 보여줄 비밀번호 화면
  private inputValue: string = ''; // 현재 입력된 값
  private readonly correctPassword: string = '1234'; // 정답 비밀번호
  private readonly maxLength: number = 8; // 입력 최대 길이
  private onSuccess: () => void; // 성공 시 호출할 콜백 함수
  private unlockSound: HTMLAudioElement; // 정답 시 재생할 사운드

  constructor(containerId: string, onSuccess: () => void) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID "${containerId}" not found.`);
    }

    this.container = container;
    this.onSuccess = onSuccess;
    this.unlockSound = new Audio('/effectSound/unlock.mp3'); // 정적 폴더에서 효과음 불러오기

    this.initUI(); // UI 구성 생성
    this.addKeyboardSupport(); // 키보드 입력 처리
  }

  private initUI(): void {
    // 입력창 생성 및 스타일 적용 (디지털 느낌)
    this.display = document.createElement('input');
    this.display.type = 'password';
    this.display.disabled = true;
    this.display.className =
      'w-full mb-4 px-3 py-3 text-center text-2xl border-none rounded bg-gray-800 text-green-400 font-mono tracking-widest shadow-inner ring-1 ring-green-500 focus:outline-none';

    // 버튼 그리드 영역 생성
    const keypadGrid = document.createElement('div');
    keypadGrid.className = 'grid grid-cols-3 gap-3';

    // 버튼 라벨 목록
    const buttons = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      '←', '0', '입력'
    ];

    // 각 버튼 생성 및 이벤트 등록
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

    // 컨테이너 스타일 및 구성 요소 삽입
    this.container.className =
      'max-w-xs mx-auto p-6 rounded-lg shadow-lg bg-gray-900 border border-gray-700';
    this.container.appendChild(this.display);
    this.container.appendChild(keypadGrid);
  }

  // 버튼 클릭 처리
  private handleButtonClick(label: string): void {
    if (label === '←') {
      this.inputValue = this.inputValue.slice(0, -1); // 한 글자 지우기
    } else if (label === '입력') {
      this.checkPassword(); // 비밀번호 확인
      return;
    } else {
      // 최대 길이 제한 내에서 입력 추가
      if (this.inputValue.length < this.maxLength) {
        this.inputValue += label;
      }
    }

    this.display.value = this.inputValue; // 입력값 화면에 표시
  }

  // 비밀번호 확인
  private checkPassword(): void {
    if (this.inputValue === this.correctPassword) {
      this.playSuccessSoundAndContinue(); // 성공 시 처리
    } else {
      this.indicateFailure(); // 실패 시 처리
    }
  }

  // 성공 시 사운드 재생 후 페이지 이동
  private playSuccessSoundAndContinue(): void {
    this.unlockSound.play().catch(err => {
      console.warn('오디오 재생 실패:', err);
    });

    setTimeout(() => {
      this.onSuccess(); // 다음 단계로 이동
    }, 1500);
  }

  // 실패 시 디스플레이 배경을 빨갛게 바꿨다가 원상복구
  private indicateFailure(): void {
    this.display.classList.add('bg-red-800'); // 실패 시 빨간 배경 추가

    setTimeout(() => {
      this.display.classList.remove('bg-red-800'); // 배경 복원
      this.inputValue = ''; // 입력 초기화
      this.display.value = '';
    }, 600);
  }

  // 키보드 입력 지원
  private addKeyboardSupport(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
    });
  }
}

// 페이지 로드 후 키패드 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PasswordKeypad('keypad-container', () => {
    console.log('정답입니다! 다음 페이지로 이동합니다.');
    window.location.href = 'next-stage.html'; // 다음 스테이지 경로로 수정
  });
});

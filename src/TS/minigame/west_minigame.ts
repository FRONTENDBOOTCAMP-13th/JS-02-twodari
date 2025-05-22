import { IMiniGame } from '../../types/type.ts';

export class CodeGame implements IMiniGame {
  private container: HTMLElement | null = null;
  private consoleBox: HTMLDivElement | null = null;
  private inputLine: HTMLDivElement | null = null;
  private inputField: HTMLInputElement | null = null;
  private consoleContent: HTMLDivElement | null = null;
  private terminalContent: HTMLDivElement | null = null; // 터미널 전용 콘텐츠
  private hackContent: HTMLDivElement | null = null; // hack.js 전용 콘텐츠
  private gameCompleted: boolean = false;

  constructor(private onComplete?: () => void) {}

  //게임 초기화
  public initialize(): void {
    console.log('미니게임 초기화');
  }

  //게임 시작
  public start(): void {
    if (!this.container) {
      this.createUI();
    }

    this.container!.classList.remove('hidden');

    if (this.gameCompleted) {
      return;
    }
    setTimeout(() => {
      this.inputField?.focus();
    }, 0);
  }

  //게임 종료
  public close(): void {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  // 게임 만들기
  private createUI(): void {
    const target = document.getElementById('minigame-container');
    if (!target) return;

    // console container
    this.container = target;
    this.container.innerHTML = '';
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';

    // bg overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-layer';
    this.consoleBox = document.createElement('div');
    this.consoleBox.className = 'console-style';

    overlay.appendChild(this.consoleBox);
    this.container.appendChild(overlay);

    //탭 창 나누기
    const tabBar = document.createElement('div');
    tabBar.className = 'tapbar-style';
    //터미널 스위치
    const terminalTab = document.createElement('button');
    terminalTab.textContent = 'Terminal';
    terminalTab.className = 'active-tab';
    terminalTab.onclick = () => this.switchTab('terminal');
    terminalTab.setAttribute('data-tab', 'terminal');

    //파일 스위치
    const hackTab = document.createElement('button');
    hackTab.textContent = 'hack.js';
    hackTab.className = 'unactive-tab';
    hackTab.onclick = () => this.switchTab('hack');
    hackTab.setAttribute('data-tab', 'hack');

    tabBar.appendChild(terminalTab);
    tabBar.appendChild(hackTab);
    this.consoleBox.appendChild(tabBar);

    const consoleBoxWrapper = document.createElement('div');
    consoleBoxWrapper.className = 'console-content-wrapper';

    // 터미널 콘텐츠 영역
    this.terminalContent = document.createElement('div');
    this.terminalContent.className = 'whitespace-pre terminal-content';
    this.terminalContent.innerText =
      '[main-server ~/] > connect main-server\n' +
      '[main-server ~/] > run NUKE.exe\n' +
      '[main-server ~/] > backdoor\n' +
      '-------------------------------\n' +
      '[main-server ~/] > 터미널에 올바른 명령어를 입력하세요.';

    // hack.js 콘텐츠 영역
    this.hackContent = document.createElement('div');
    this.hackContent.className = 'whitespace-pre hack-content hidden';
    this.hackContent.innerText =
      '// hack.js\n' +
      '// 해킹용 코드 입니다. 터미널에 run 실행 명령을 사용하세요.\n\n' +
      'export function hack() {\n' +
      "  console.log('해킹 시퀀스 시작');\n" +
      '  const code = secret code;\n' +
      '  return code;\n' +
      '}';

    // 현재 활성 콘텐츠 참조 (기본값: 터미널)
    this.consoleContent = this.terminalContent;

    consoleBoxWrapper.appendChild(this.terminalContent);
    consoleBoxWrapper.appendChild(this.hackContent);
    this.consoleBox.appendChild(consoleBoxWrapper);

    // 입력 라인
    this.inputLine = document.createElement('div');
    this.inputLine.className = 'mt-2 flex';
    this.inputLine.id = 'input-line';

    const prompt = document.createElement('span');
    prompt.textContent = '[main-server ~/] >';
    prompt.className = 'mr-2';

    this.inputField = document.createElement('input');
    this.inputField.className = 'terminal-input outline-none';
    this.inputField.type = 'text';
    this.inputField.autocomplete = 'off';
    this.inputField.spellcheck = false;
    this.inputField.setAttribute('autocorrect', 'off');

    this.inputField.addEventListener('keydown', e => this.handleInput(e));

    this.inputLine.appendChild(prompt);
    this.inputLine.appendChild(this.inputField);
    consoleBoxWrapper.appendChild(this.inputLine);

    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.className = 'close-btn-style';
    closeButton.addEventListener('click', () => this.close());

    this.consoleBox.appendChild(closeButton);
  }

  //탭 전환 처리
  private updateContent(type: 'terminal' | 'hack') {
    if (!this.terminalContent || !this.hackContent) return;

    if (type === 'terminal') {
      // 터미널 탭: 터미널 콘텐츠 보이기, hack.js 숨기기
      this.terminalContent.classList.remove('hidden');
      this.hackContent.classList.add('hidden');
      this.consoleContent = this.terminalContent;
    } else {
      // hack.js 탭: hack.js 콘텐츠 보이기, 터미널 숨기기
      this.terminalContent.classList.add('hidden');
      this.hackContent.classList.remove('hidden');
      this.consoleContent = this.hackContent;
    }
  }

  private switchTab(tab: 'terminal' | 'hack') {
    if (!this.consoleBox) return;

    const terminalTab = this.consoleBox.querySelector('[data-tab="terminal"]') as HTMLButtonElement;
    const hackTab = this.consoleBox.querySelector('[data-tab="hack"]') as HTMLButtonElement;
    const inputLine = this.consoleBox.querySelector('#input-line') as HTMLDivElement;

    if (tab === 'terminal') {
      terminalTab.style.backgroundColor = '#00ff84';
      hackTab.style.backgroundColor = '#374151';

      if (inputLine) {
        inputLine.style.display = 'flex';
        setTimeout(() => {
          this.inputField?.focus();
        }, 0);
      }
    } else {
      terminalTab.style.backgroundColor = '#374151';
      hackTab.style.backgroundColor = '#00ff84';

      if (inputLine) inputLine.style.display = 'none'; //입력창 숨김
    }
    this.updateContent(tab);
  }

  //입력 이벤트 처리
  private handleInput(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = this.inputField?.value.trim();
      if (!command) return;

      const resultLine = document.createElement('div');
      resultLine.textContent = `[main-server ~/] > ${command}`;
      this.terminalContent?.appendChild(resultLine);

      // 응답 시뮬레이션
      const response = document.createElement('div');
      if (command === 'run hack.js') {
        response.innerHTML = '시스템 접속 허용됨. 금고번호는: <strong>55 52 51 54 56 57</strong>';
        this.gameCompleted = true;
        if (this.onComplete) this.onComplete();
        //잘못된 명령어 입력 시
      } else {
        response.textContent = `command not found: ${command}`;
      }
      this.terminalContent?.appendChild(response);
      this.inputField!.value = '';

      // 스크롤 자동으로 내리기
      if (this.consoleContent === this.terminalContent) {
        const consoleBoxWrapper = this.consoleBox?.querySelector('.console-content-wrapper') as HTMLDivElement;
        if (consoleBoxWrapper) {
          consoleBoxWrapper.scrollTop = consoleBoxWrapper.scrollHeight;
        }
      }
    }
  }

  public isCompleted(): boolean {
    return this.gameCompleted;
  }
}

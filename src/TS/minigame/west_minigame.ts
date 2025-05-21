import { IMiniGame } from '../../types/type.ts';

export class CodeGame implements IMiniGame {
  private container: HTMLElement | null = null;
  private consoleBox: HTMLDivElement | null = null;
  private inputLine: HTMLDivElement | null = null;
  private inputField: HTMLSpanElement | null = null;
  private consoleContent: HTMLDivElement | null = null;
  private currentTab: 'terminal' | 'hack' = 'terminal';
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

    // 콘솔 내용 영역
    this.consoleContent = document.createElement('div');
    this.consoleContent.className = 'whitespace-pre';
    this.consoleBox.appendChild(this.consoleContent);
    this.updateContent('terminal');

    // 입력 라인
    this.inputLine = document.createElement('div');
    this.inputLine.className = 'mt-2 flex';
    this.inputLine.id = 'input-line';

    const prompt = document.createElement('span');
    prompt.textContent = '[main-server ~/] >';
    prompt.className = 'mr-2';

    //포커스 애니메이션
    this.inputField = document.createElement('span');
    this.inputField.className = 'outline-none whitespace-pre animate-blink';
    this.inputField.tabIndex = 0;
    this.inputField.contentEditable = 'true';
    this.inputField.textContent = '|';

    // 포커스 되면 애니메이션 제거
    this.inputField.addEventListener('focus', () => {
      this.inputField?.classList.remove('animate-blink');
      this.inputField!.textContent = '';
    });

    this.inputField.addEventListener('keydown', e => this.handleInput(e));

    this.inputLine.appendChild(prompt);
    this.inputLine.appendChild(this.inputField);
    this.consoleBox.appendChild(this.inputLine);

    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.className = 'close-btn-style';
    closeButton.addEventListener('click', () => this.close());
    this.consoleBox.appendChild(closeButton);

    this.container.appendChild(this.consoleBox);
  }

  //탭 전환 처리
  private updateContent(type: 'terminal' | 'hack') {
    if (!this.consoleContent) return;
    this.currentTab = type;

    //터미널이면
    if (type === 'terminal') {
      this.consoleContent.innerText =
        '[main-server ~/] > connect main-server\n' +
        '[main-server ~/] > run NUKE.exe\n' +
        '[main-server ~/] > backdoor\n' +
        '-------------------------------\n' +
        '[main-server ~/] > 터미널에 올바른 명령어를 입력하세요.';
      //터미널이 아니면 = 파일이면
    } else {
      this.consoleContent.innerText =
        '// hack.js\n' +
        '// 해킹용 코드 입니다. 터미널에 run 실행 명령을 사용하세요.\n\n' +
        'export function hack() {\n' +
        "  console.log('해킹 시퀀스 시작');\n" +
        '  const code = secret code;\n' +
        '  return code;\n' +
        '}';
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
      const command = this.inputField?.innerText.trim();
      if (!command) return;

      // 새로운 줄 생성
      const resultLine = document.createElement('div');
      resultLine.textContent = `[main-server ~/] > ${command}`;
      this.consoleBox?.insertBefore(resultLine, this.inputLine!);

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
      this.consoleBox?.insertBefore(response, this.inputLine!);
      this.inputField!.innerText = '';
    }
  }

  public isCompleted(): boolean {
    return this.gameCompleted;
  }
}

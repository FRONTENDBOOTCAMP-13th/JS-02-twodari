import { IMiniGame } from '../../types/type.ts';

export class CodeGame implements IMiniGame {
  private container: HTMLElement | null = null;
  private consoleBox: HTMLDivElement | null = null;
  private inputLine: HTMLDivElement | null = null;
  private inputField: HTMLInputElement | null = null;
  private consoleContent: HTMLDivElement | null = null;
  private terminalContent: HTMLDivElement | null = null;
  private hackContent: HTMLDivElement | null = null;
  private gameCompleted: boolean = false;
  private isComposing: boolean = false; // IME fix를 위한 속성

  constructor(private onComplete?: () => void) {}

  public initialize(): void {
    console.log('미니게임 초기화');
  }

  public start(): void {
    if (!this.container) {
      this.createUI();
    }

    this.container!.classList.remove('hidden');

    if (this.gameCompleted) return;

    setTimeout(() => this.inputField?.focus(), 0);
  }

  public close(): void {
    if (this.container) {
      this.container.classList.add('hidden');
      this.container.style.display = 'none';
    } else {
      console.log('미니게임 UI가 없습니다.');
    }
  }

  private createUI(): void {
    const target = document.getElementById('minigame-container');
    if (!target) return;

    this.container = target;
    this.container.innerHTML = '';
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';

    const overlay = document.createElement('div');
    overlay.className = 'game-layer';
    this.consoleBox = document.createElement('div');
    this.consoleBox.className = 'console-style';

    overlay.appendChild(this.consoleBox);
    this.container.appendChild(overlay);

    const tabBar = document.createElement('div');
    tabBar.className = 'tapbar-style';

    const terminalTab = document.createElement('button');
    terminalTab.textContent = 'Terminal';
    terminalTab.className = 'active-tab';
    terminalTab.onclick = () => this.switchTab('terminal');
    terminalTab.setAttribute('data-tab', 'terminal');

    const hackTab = document.createElement('button');
    hackTab.textContent = 'hack.js';
    hackTab.className = 'unactive-tab';
    hackTab.onclick = () => this.switchTab('hack');
    hackTab.setAttribute('data-tab', 'hack');

    tabBar.append(terminalTab, hackTab);
    this.consoleBox.appendChild(tabBar);

    const consoleBoxWrapper = document.createElement('div');
    consoleBoxWrapper.className = 'console-content-wrapper';

    this.terminalContent = document.createElement('div');
    this.terminalContent.className = 'whitespace-pre terminal-content';
    this.terminalContent.innerText =
      '[main-server ~/] > connect main-server\n' +
      '[main-server ~/] > run NUKE.exe\n' +
      '[main-server ~/] > backdoor\n' +
      '-------------------------------\n' +
      '[main-server ~/] > 터미널에 올바른 명령어를 입력하세요.';

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

    this.consoleContent = this.terminalContent;

    consoleBoxWrapper.append(this.terminalContent, this.hackContent);
    this.consoleBox.appendChild(consoleBoxWrapper);

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

    // IME 처리: 한글 입력 시 중복 방지
    this.inputField.addEventListener('compositionstart', () => {
      this.isComposing = true;
    });

    this.inputField.addEventListener('compositionend', () => {
      this.isComposing = false;
    });

    this.inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !this.isComposing) {
        e.preventDefault();
        this.handleCommand();
      }
    });

    this.inputLine.append(prompt, this.inputField);
    consoleBoxWrapper.appendChild(this.inputLine);

    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.className = 'close-btn-style';
    closeButton.addEventListener('click', () => this.close());
    this.consoleBox.appendChild(closeButton);

    const handleClose = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('닫기 버튼 클릭됨');
      this.close();
    };

    closeButton.addEventListener('click', handleClose);
  }

  private updateContent(type: 'terminal' | 'hack') {
    if (!this.terminalContent || !this.hackContent) return;

    if (type === 'terminal') {
      this.terminalContent.classList.remove('hidden');
      this.hackContent.classList.add('hidden');
      this.consoleContent = this.terminalContent;
    } else {
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
      inputLine.style.display = 'flex';
      setTimeout(() => this.inputField?.focus(), 0);
    } else {
      terminalTab.style.backgroundColor = '#374151';
      hackTab.style.backgroundColor = '#00ff84';
      inputLine.style.display = 'none';
    }

    this.updateContent(tab);
  }

  private handleCommand() {
    const command = this.inputField?.value.trim();
    if (!command) return;

    const resultLine = document.createElement('div');
    resultLine.textContent = `[main-server ~/] > ${command}`;
    this.terminalContent?.appendChild(resultLine);

    const response = document.createElement('div');
    if (command === 'run hack.js') {
      response.innerHTML = '시스템 접속 허용됨. 금고번호는: <strong>55 52 51 54 56 57</strong>';
      this.gameCompleted = true;
      this.onComplete?.();
    } else {
      response.textContent = `command not found: ${command}`;
    }
    this.terminalContent?.appendChild(response);
    this.inputField!.value = '';

    const consoleBoxWrapper = this.consoleContent?.parentElement as HTMLDivElement;
    if (consoleBoxWrapper) {
      consoleBoxWrapper.scrollTop = consoleBoxWrapper.scrollHeight;
    }
  }

  public isCompleted(): boolean {
    return this.gameCompleted;
  }
}

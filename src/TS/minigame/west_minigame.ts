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
  private eventListeners: Array<{ element: HTMLElement | Document; type: string; listener: EventListener }> = [];
  private globalKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(private onComplete?: () => void) {}

  public initialize(): void {
    console.log('코드 미니게임 초기화');
  }

  public start(): void {
    console.log('코드 미니게임 시작 요청');

    // 컨테이너 확인 및 생성
    const container = document.getElementById('minigame-container');
    if (!container) {
      console.error('미니게임 컨테이너를 찾을 수 없습니다');
      return;
    }

    // 컨테이너 설정
    container.style.display = 'flex';
    container.classList.remove('hidden');
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '9999';

    // UI 생성
    this.createUI();

    // 완료 상태 확인
    if (this.gameCompleted) {
      console.log('이미 완료된 게임입니다');
      return;
    }

    // 글로벌 키보드 이벤트 핸들러 설정 - 수정된 부분
    this.setupGlobalKeyboardHandler();

    // 입력 필드에 포커스
    setTimeout(() => {
      if (this.inputField) {
        this.inputField.focus();
        console.log('입력 필드에 포커스 설정됨');
      }
    }, 100);
  }

  // 수정된 전역 키보드 이벤트 핸들러 설정
  private setupGlobalKeyboardHandler(): void {
    // 기존 핸들러가 있으면 제거
    if (this.globalKeydownHandler) {
      document.removeEventListener('keydown', this.globalKeydownHandler, true);
    }

    // 새 핸들러 생성 및 등록
    this.globalKeydownHandler = (e: KeyboardEvent) => {
      // 미니게임 활성화 상태에서만 처리
      if (this.container && this.container.style.display !== 'none') {
        // 중요: 입력 필드가 포커스되어 있는지 확인
        const activeElement = document.activeElement;

        // 입력 필드가 포커스되어 있지 않은 경우에만 방향키/WASD 차단
        if (activeElement !== this.inputField) {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            console.log('방향키 입력 차단(필드 외부):', e.key);
            e.stopPropagation();
            e.preventDefault();
          }
        }
        // 입력 필드가 포커스된 상태에서는 방향키만 차단 (WASD는 허용)
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          console.log('방향키 입력 차단(필드 내부):', e.key);
          e.stopPropagation();
          e.preventDefault();
        }
      }
    };

    // 캡처 단계에서 이벤트 처리 (다른 핸들러보다 먼저 실행)
    document.addEventListener('keydown', this.globalKeydownHandler, true);

    // 이벤트 리스너 추적에 추가
    this.eventListeners.push({
      element: document,
      type: 'keydown',
      listener: this.globalKeydownHandler as EventListener,
    });
  }

  public close(): void {
    console.log('코드 미니게임 종료');

    // 글로벌 키보드 이벤트 핸들러 제거
    if (this.globalKeydownHandler) {
      document.removeEventListener('keydown', this.globalKeydownHandler, true);
      this.globalKeydownHandler = null;
    }

    // 모든 이벤트 리스너 제거
    this.removeAllEventListeners();

    // 컨테이너 찾기
    const container = document.getElementById('minigame-container');
    if (container) {
      container.classList.add('hidden');
      container.style.display = 'none';
      container.innerHTML = '';
    } else {
      console.warn('미니게임 컨테이너를 찾을 수 없습니다');
    }

    // 객체 참조 정리
    this.container = null;
    this.consoleBox = null;
    this.inputLine = null;
    this.inputField = null;
    this.consoleContent = null;
    this.terminalContent = null;
    this.hackContent = null;
  }

  private createUI(): void {
    console.log('코드 미니게임 UI 생성');

    // 컨테이너 가져오기
    const target = document.getElementById('minigame-container');
    if (!target) {
      console.error('미니게임 컨테이너를 찾을 수 없습니다');
      return;
    }

    // 컨테이너 초기화
    target.innerHTML = '';
    this.container = target;

    // 오버레이 생성

    const overlay = document.createElement('div');
    overlay.className = 'game-layer';

    // 콘솔 박스 생성
    this.consoleBox = document.createElement('div');
    this.consoleBox.className = 'console-style';
    overlay.appendChild(this.consoleBox);
    this.container.appendChild(overlay);

    overlay.appendChild(this.consoleBox);
    this.container.appendChild(overlay);

    // 탭 바 생성
    const tabBar = document.createElement('div');
    tabBar.className = 'tapbar-style';

    const terminalTab = document.createElement('button');
    terminalTab.textContent = 'Terminal';
    terminalTab.className = 'active-tab';
    terminalTab.setAttribute('data-tab', 'terminal');
    this.addEventListenerWithTracking(terminalTab, 'click', () => this.switchTab('terminal'));

    const hackTab = document.createElement('button');
    hackTab.textContent = 'hack.js';
    hackTab.className = 'unactive-tab';
    hackTab.setAttribute('data-tab', 'hack');
    this.addEventListenerWithTracking(hackTab, 'click', () => this.switchTab('hack'));

    tabBar.append(terminalTab, hackTab);
    this.consoleBox.appendChild(tabBar);

    // 콘솔 내용 래퍼 생성
    const consoleBoxWrapper = document.createElement('div');
    consoleBoxWrapper.className = 'console-content-wrapper';
    consoleBoxWrapper.style.flex = '1';
    consoleBoxWrapper.style.overflow = 'auto';
    consoleBoxWrapper.style.display = 'flex';
    consoleBoxWrapper.style.flexDirection = 'column';
    consoleBoxWrapper.style.padding = '5px';

    // 터미널 콘텐츠 생성
    this.terminalContent = document.createElement('div');
    this.terminalContent.className = 'whitespace-pre terminal-content';
    this.terminalContent.style.whiteSpace = 'pre-wrap';
    this.terminalContent.style.flex = '1';
    this.terminalContent.innerText =
      '[main-server ~/] > connect main-server\n' +
      '[main-server ~/] > run NUKE.exe\n' +
      '[main-server ~/] > backdoor\n' +
      '-------------------------------\n' +
      '[main-server ~/] > 터미널에 올바른 명령어를 입력하세요.';

    // 해킹 콘텐츠 생성
    this.hackContent = document.createElement('div');
    this.hackContent.className = 'whitespace-pre hack-content hidden';
    this.hackContent.style.whiteSpace = 'pre-wrap';
    this.hackContent.style.flex = '1';
    this.hackContent.style.display = 'none';
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

    // 입력 라인 생성
    this.inputLine = document.createElement('div');
    this.inputLine.className = 'mt-2 flex';
    this.inputLine.id = 'input-line';

    const prompt = document.createElement('span');
    prompt.textContent = '[main-server ~/] >';
    prompt.className = 'mr-2';
    prompt.style.marginRight = '8px';

    // 입력 필드 생성
    this.inputField = document.createElement('input');
    this.inputField.className = 'terminal-input outline-none';
    this.inputField.type = 'text';
    this.inputField.autocomplete = 'off';
    this.inputField.spellcheck = false;
    this.inputField.setAttribute('autocorrect', 'off');

    // IME 처리: 한글 입력 시 중복 방지
    this.addEventListenerWithTracking(this.inputField, 'compositionstart', () => {
      this.isComposing = true;
    });

    this.addEventListenerWithTracking(this.inputField, 'compositionend', () => {
      this.isComposing = false;
    });

    // 입력 필드 키 이벤트 핸들링 - 수정됨
    this.addEventListenerWithTracking(this.inputField, 'keydown', (e: Event) => {
      const keyEvent = e as KeyboardEvent;

      // Enter 키 누를 때만 기본 동작 차단
      if (keyEvent.key === 'Enter' && !this.isComposing) {
        e.preventDefault();
        this.handleCommand();
      }

      // 다른 키는 정상적으로 동작하도록 허용
      // e.stopPropagation() 제거함
    });

    this.inputLine.append(prompt, this.inputField);
    consoleBoxWrapper.appendChild(this.inputLine);

    // 닫기 버튼 생성
    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.className = 'close-btn-style';

    // 닫기 버튼 이벤트 리스너
    const handleClose = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('닫기 버튼 클릭됨');
      this.close();
    };

    this.addEventListenerWithTracking(closeButton, 'click', handleClose);

    this.consoleBox.appendChild(closeButton);

    // 포커스 설정 강화
    this.container.addEventListener('click', () => {
      if (this.inputField) {
        this.inputField.focus();
        console.log('컨테이너 클릭으로 입력 필드에 포커스 설정됨');
      }
    });

    // 초기 포커스 설정
    setTimeout(() => {
      if (this.inputField) {
        this.inputField.focus();
        console.log('입력 필드에 포커스 설정됨');
      }
    }, 100);
  }

  // 이벤트 리스너 추적을 위한 헬퍼 메서드 - Document 타입 지원
  private addEventListenerWithTracking(element: HTMLElement | Document, type: string, listener: EventListener): void {
    element.addEventListener(type, listener);
    this.eventListeners.push({ element, type, listener });
  }

  // 모든 이벤트 리스너 제거
  private removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.eventListeners = [];
  }

  private updateContent(type: 'terminal' | 'hack') {
    if (!this.terminalContent || !this.hackContent) return;

    if (type === 'terminal') {
      this.terminalContent.style.display = 'block';
      this.hackContent.style.display = 'none';
      this.consoleContent = this.terminalContent;
    } else {
      this.terminalContent.style.display = 'none';
      this.hackContent.style.display = 'block';
      this.consoleContent = this.hackContent;
    }
  }

  private switchTab(tab: 'terminal' | 'hack') {
    if (!this.consoleBox) return;

    const terminalTab = this.consoleBox.querySelector('[data-tab="terminal"]') as HTMLButtonElement;
    const hackTab = this.consoleBox.querySelector('[data-tab="hack"]') as HTMLButtonElement;

    if (!terminalTab || !hackTab) {
      console.error('탭 요소를 찾을 수 없습니다');
      return;
    }

    const inputLine = this.inputLine;
    if (!inputLine) {
      console.error('입력 라인 요소를 찾을 수 없습니다');
      return;
    }

    if (tab === 'terminal') {
      terminalTab.style.backgroundColor = '#00ff84';
      terminalTab.style.color = 'black';
      hackTab.style.backgroundColor = '#374151';
      hackTab.style.color = '#00ff84';
      inputLine.style.display = 'flex';
      setTimeout(() => this.inputField?.focus(), 0);
    } else {
      terminalTab.style.backgroundColor = '#374151';
      terminalTab.style.color = '#00ff84';
      hackTab.style.backgroundColor = '#00ff84';
      hackTab.style.color = 'black';
      inputLine.style.display = 'none';
    }

    this.updateContent(tab);
  }

  private handleCommand() {
    if (!this.inputField || !this.terminalContent) return;

    const command = this.inputField.value.trim();
    if (!command) return;

    // 명령어 추가
    const resultLine = document.createElement('div');
    resultLine.textContent = `[main-server ~/] > ${command}`;
    this.terminalContent.appendChild(resultLine);

    // 응답 생성
    const response = document.createElement('div');
    if (command === 'run hack.js') {
      response.innerHTML = '시스템 접속 허용됨. 금고번호는: <strong>55 52 51 54 56 57</strong>';
      this.gameCompleted = true;

      // 약간의 지연 후 완료 콜백 호출
      setTimeout(() => {
        this.close(); // 미니게임 창 닫기
        if (this.onComplete) {
          this.onComplete();
        }
      }, 2000);
    } else {
      response.textContent = `command not found: ${command}`;
    }
    this.terminalContent.appendChild(response);
    this.inputField.value = '';

    // 스크롤 맨 아래로
    const consoleBoxWrapper = this.consoleContent?.parentElement as HTMLDivElement;
    if (consoleBoxWrapper) {
      consoleBoxWrapper.scrollTop = consoleBoxWrapper.scrollHeight;
    }
  }

  public isCompleted(): boolean {
    return this.gameCompleted;
  }
}

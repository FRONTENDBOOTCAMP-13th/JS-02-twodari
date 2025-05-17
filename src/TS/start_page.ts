// 인터페이스 정의
import type { IStoryText } from '../types/type';

// 페이지 타입 정의
type PageId = 'loading-page' | 'title-page' | 'start-page';

/**
 * 페이지 관리 및 전환을 처리하는 클래스
 */
class PageManager {
  private currentPage: PageId = 'loading-page';
  private transitionOverlay: HTMLElement;

  constructor() {
    const overlay = document.getElementById('transition-overlay');
    if (!overlay) {
      throw new Error('transition-overlay 요소를 찾을 수 없습니다');
    }
    this.transitionOverlay = overlay;

    // 처음에는 로딩 페이지만 표시
    this.showPage('loading-page');

    // 로딩 페이지 표시 후 3초 뒤 타이틀 페이지로 전환
    setTimeout(() => {
      this.transitionToPage('title-page');
    }, 3000);

    // 타이틀 페이지의 시작 버튼 이벤트 리스너 설정
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.transitionToPage('start-page');
      });
    }
  }

  /**
   * 페이지 전환 메서드 (암전 효과 포함)
   */
  public transitionToPage = (pageId: PageId): void => {
    // 1. 먼저 암전 효과를 보여줌
    this.transitionOverlay.classList.add('opacity-100');

    // 2. 암전 완료 후 페이지 전환
    setTimeout(() => {
      this.hidePage(this.currentPage);
      this.showPage(pageId);
      this.currentPage = pageId;

      // 3. 새 페이지 표시 후 암전 효과 제거
      setTimeout(() => {
        this.transitionOverlay.classList.remove('opacity-100');

        // 4. 시작 페이지로 이동한 경우 Terminal 초기화
        if (pageId === 'start-page') {
          new Terminal();
        }
      }, 200);
    }, 800);
  };

  /**
   * 특정 페이지를 숨기는 메서드
   */
  private hidePage = (pageId: PageId): void => {
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.add('hidden');
    }
  };

  /**
   * 특정 페이지를 표시하는 메서드
   */
  private showPage = (pageId: PageId): void => {
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.remove('hidden');
    }
  };
}

/**
 * Terminal 클래스 - 시작 페이지의 터미널 효과 구현
 */
class Terminal {
  private introText: HTMLElement;
  private terminal: HTMLElement;
  private typingSpeed: number = 40;
  private isTyping: boolean = true;
  private introCursor: HTMLElement | null = null;
  private terminalCursor: HTMLElement | null = null;

  // 게임 인트로 스토리 텍스트 배열 - 흰색으로 표시될 부분
  private introContent: IStoryText[] = [
    { text: "스타트업 '넥스트 코드'의 천재 개발자 김진우가 회사 사무실에서 살해당한 채 발견되었습니다.", delay: 500 },
    { text: '그는 혁신적인 AI 알고리즘을 개발 중이었고, 다음 날 중요한 투자자 미팅을 앞두고 있었습니다.', delay: 500 },
    { text: '경찰은 내부자의 소행으로 보고 있지만, 증거가 부족한 상태입니다.', delay: 700 },
    { text: '', delay: 300 },
    { text: ' 당신은 김진우의 친구이자 같은 개발자로, 그가 남긴 메시지를 받게 됩니다.', delay: 500 },
    { text: '"누군가 내 코드를 노리고 있어. 만약 내게 무슨 일이 있어나면, 내 사무실에 숨긴 단서들을 찾아줘. 부디 진실을 밝혀줘."', delay: 1000 },
    { text: '', delay: 300 },
    { text: '이제부터 당신은 경찰이 현장 보존을 풀기 전 1시간 동안 사무실에 들어가 진실을 밝혀야 합니다.', delay: 800 },
  ];

  // 암호화된 메시지 텍스트 배열 - 녹색으로 표시될 부분
  private encryptedMessages: IStoryText[] = [
    { text: '> 01010100 01101000 01100101 00100000 01100011 01101111 01100100 01100101', delay: 500 },
    { text: '> DF83B7A2E4C6F9D0 [암호화된 파일 경로]', delay: 300 },
    { text: '> SYS_ERR: 0x45F2D1 - 접근 권한 거부됨', delay: 300 },
    { text: '> <C0D3_SH4D0W>: 내부 시스템 침투 시도 감지', delay: 500 },
    { text: '', delay: 600 },
    { text: '> 친구의 부탁을 지켜줄 준비가 되셨습니까? (Y)', delay: 1000 },
  ];

  constructor() {
    const introTextElement = document.getElementById('intro-text');
    if (!introTextElement) {
      throw new Error('intro-text 요소를 찾을 수 없습니다');
    }
    this.introText = introTextElement;

    const terminalElement = document.getElementById('terminal');
    if (!terminalElement) {
      throw new Error('terminal 요소를 찾을 수 없습니다');
    }
    this.terminal = terminalElement;

    this.createCursors();
    this.startTypingAnimation();
  }

  private createCursors = (): void => {
    this.introCursor = document.createElement('span');
    this.introCursor.className = 'ending-cursor cursor-white';
    this.introText.appendChild(this.introCursor);

    this.terminalCursor = document.createElement('span');
    this.terminalCursor.className = 'ending-cursor cursor-green';
    this.terminal.appendChild(this.terminalCursor);
  };

  private startTypingAnimation = async (): Promise<void> => {
    // 인트로 텍스트 타이핑
    for (const item of this.introContent) {
      if (!this.introCursor) {
        throw new Error('introCursor가 초기화되지 않았습니다');
      }
      await this.typeText(this.introText, item.text, this.introCursor);
      if (!this.introCursor) {
        throw new Error('introCursor가 초기화되지 않았습니다');
      }
      this.introText.removeChild(this.introCursor);
      this.introText.innerHTML += '\n';
      this.introText.appendChild(this.introCursor);
      await this.wait(item.delay || 500);
    }

    // 암호화된 메시지 타이핑
    for (const item of this.encryptedMessages) {
      if (!this.terminalCursor) {
        throw new Error('terminalCursor가 초기화되지 않았습니다');
      }
      await this.typeText(this.terminal, item.text, this.terminalCursor);
      if (!this.terminalCursor) {
        throw new Error('terminalCursor가 초기화되지 않았습니다');
      }
      this.terminal.removeChild(this.terminalCursor);
      this.terminal.innerHTML += '\n';
      this.terminal.appendChild(this.terminalCursor);
      await this.wait(item.delay || 500);
    }

    this.isTyping = false;
    this.setupKeyListener();
  };

  private typeText = async (element: HTMLElement, text: string, cursor: HTMLElement): Promise<void> => {
    for (let i = 0; i < text.length; i++) {
      element.removeChild(cursor);
      element.innerHTML += text.charAt(i);
      element.appendChild(cursor);
      element.scrollTop = element.scrollHeight;
      await this.wait(this.typingSpeed);
    }
  };

  private wait = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  private setupKeyListener = (): void => {
    document.addEventListener('keydown', this.onKeyDown);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.isTyping && e.key.toUpperCase() === 'Y') {
      // 여기서는 다음 게임 페이지로 이동하는 대신 콘솔에 메시지 출력
      console.log('게임이 시작됩니다!');
      // 실제 구현에서는 여기에 게임 시작 페이지로 이동하는 로직을 추가할 수 있음
    }
  };
}

// DOM이 완전히 로드된 후 페이지 관리자 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PageManager();
});

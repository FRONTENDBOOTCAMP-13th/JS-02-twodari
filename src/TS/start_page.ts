// IStoryText 인터페이스 : 텍스트와 지연 시간을 정의
import type { IStoryText } from '../types/type';

/**
 * TerminalGame 클래스
 * 터미널 스타일의 타이핑 효과가 있는 화면
 * 스토리 텍스트를 하나씩 출력하고 사용자 입력에 반응하는 기능 제공
 */
class Terminal {
  // 화면에 표시될 텍스트 요소들
  private introText: HTMLElement; // 흰색 소개 텍스트가 출력될 요소
  private terminal: HTMLElement; // 녹색 암호화 메시지가 출력될 요소
  private typingSpeed: number = 40; // 타이핑 효과의 속도 (ms 단위)
  private isTyping: boolean = true; // 현재 타이핑 중인지 상태 추적
  private introCursor: HTMLElement | null = null; // 흰색 텍스트 영역의 깜빡이는 커서
  private terminalCursor: HTMLElement | null = null; // 녹색 텍스트 영역의 깜빡이는 커서

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

  /**
   * 생성자: 게임 초기화
   * DOM 요소를 가져오고, 커서를 생성하며, 애니메이션을 시작함
   */
  constructor() {
    // HTML 요소 가져오기 - null 체크 추가
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

    // 커서 생성 및 타이핑 애니메이션 시작
    this.createCursors();
    this.startTypingAnimation();
  }

  /**
   * 깜빡이는 커서 요소 생성 메서드
   * 흰색과 녹색 두 개의 커서를 각 텍스트 영역에 추가
   */
  private createCursors = (): void => {
    // 흰색 텍스트 영역용 커서 생성
    this.introCursor = document.createElement('span');
    this.introCursor.className = 'ending-cursor cursor-white';
    this.introText.appendChild(this.introCursor);

    // 녹색 텍스트 영역용 커서 생성
    this.terminalCursor = document.createElement('span');
    this.terminalCursor.className = 'ending-cursor cursor-green';
    this.terminal.appendChild(this.terminalCursor);
  };

  /**
   * 타이핑 애니메이션 시작 메서드
   * 인트로 텍스트와 암호화된 메시지를 순차적으로 출력
   */
  private startTypingAnimation = async (): Promise<void> => {
    // 먼저 인트로 텍스트 타이핑 (흰색 영역)
    for (const item of this.introContent) {
      // 커서 null 체크
      if (!this.introCursor) {
        throw new Error('introCursor가 초기화되지 않았습니다');
      }
      // 한 글자씩 타이핑 효과 적용
      await this.typeText(this.introText, item.text, this.introCursor);
      // 줄바꿈 처리 - null 체크
      if (!this.introCursor) {
        throw new Error('introCursor가 초기화되지 않았습니다');
      }
      this.introText.removeChild(this.introCursor);
      this.introText.innerHTML += '\n';
      this.introText.appendChild(this.introCursor);
      // 다음 줄 출력 전 지연 시간
      await this.wait(item.delay || 500);
    }

    // 다음으로 암호화된 메시지 타이핑 (녹색 영역)
    for (const item of this.encryptedMessages) {
      // 커서 null 체크
      if (!this.terminalCursor) {
        throw new Error('terminalCursor가 초기화되지 않았습니다');
      }
      // 한 글자씩 타이핑 효과 적용
      await this.typeText(this.terminal, item.text, this.terminalCursor);
      // 줄바꿈 처리 - null 체크
      if (!this.terminalCursor) {
        throw new Error('terminalCursor가 초기화되지 않았습니다');
      }
      this.terminal.removeChild(this.terminalCursor);
      this.terminal.innerHTML += '\n';
      this.terminal.appendChild(this.terminalCursor);
      // 다음 줄 출력 전 지연 시간
      await this.wait(item.delay || 500);
    }

    // 모든 텍스트 출력 완료 후 사용자 입력 대기 상태로 전환
    this.isTyping = false;
    this.setupKeyListener();
  };

  /**
   * 텍스트 타이핑 효과를 구현하는 메서드 : 한 글자씩 출력하여 타이핑하는 효과를 제공
   */
  private typeText = async (element: HTMLElement, text: string, cursor: HTMLElement): Promise<void> => {
    for (let i = 0; i < text.length; i++) {
      // 커서를 제거하고 글자를 추가한 다음 커서를 다시 추가
      element.removeChild(cursor);
      element.innerHTML += text.charAt(i);
      element.appendChild(cursor);
      // 요소의 스크롤을 항상 최신 내용이 보이도록 조정
      element.scrollTop = element.scrollHeight;
      // 타이핑 속도에 맞게 대기
      await this.wait(this.typingSpeed);
    }
  };

  /**
   * 지정된 시간(ms) 동안 대기하는 유틸리티 메서드
   */
  private wait = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * 키보드 이벤트 리스너 설정 메서드
   * 사용자 입력(Y)을 감지
   */
  private setupKeyListener = (): void => {
    document.addEventListener('keydown', this.onKeyDown);
  };

  /**
   * 키보드 이벤트 처리 메서드
   * Y키를 누르면 게임 시작
   */
  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.isTyping && e.key.toUpperCase() === 'Y') {
      this.onStartGame();
    }
  };

  /**
   * 게임 시작 처리 메서드
   * Y키를 눌렀을 때 호출됨
   */
  private onStartGame = (): void => {
    // 게임시작.html 페이지로 바로 이동
    window.location.href = '게임시작.html';
  };
}

// DOM이 완전히 로드된 후 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
  new Terminal();
});

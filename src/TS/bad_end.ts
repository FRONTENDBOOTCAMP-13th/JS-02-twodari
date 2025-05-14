/**
 * bad_end.ts
 * 배드 엔딩 시퀀스를 관리하는 파일
 * 두 개의 배경 이미지와 연속된 텍스트 표시, 장면 전환 효과를 구현
 */
import type { IStoryText } from '../types/type';

/**
 * 첫 번째 장면에 표시될 텍스트 내용 배열
 * 경찰 체포 장면
 */
const badEndingPart1: IStoryText[] = [
  { text: '단서를 찾는 것에 정신이 팔려서 시간을 보지 못했다. 사무실 문이 요란하게 열렸다.', delay: 800 },
  { text: '', delay: 100 },
  { text: '"움직이지 마! 경찰이다!"', delay: 600 },
  { text: '', delay: 100 },
  { text: '당신은 손을 들었고, 현장 침입자로 체포되었다.', delay: 600 },
  { text: '', delay: 100 },
  { text: '', delay: 100 },
  { text: '며칠 후, 경찰의 조사로 나온 증거는 모두 당신을 가리키고 있었다.', delay: 800 },
  { text: '', delay: 100 },
  { text: "'김진우와 기술 공유 문제로 다툰 기록, 현장에 남겨진 당신의 지문...'", delay: 800 },
  { text: '', delay: 100 },
  { text: '누군가 정교하게 증거를 조작한 것이 분명했다.', delay: 1000 },
];

/**
 * 두 번째 장면에 표시될 텍스트 내용 배열
 * 감옥에서의 상황과 기자회견 장면
 */
const badEndingPart2: IStoryText[] = [
  { text: '------ 3일 후 ------', delay: 1200 },
  { text: '', delay: 100 },
  { text: '옆 감방 사람이 재밌는 소식이 있다며, 내게 넌지시 말을 전해준다.', delay: 800 },
  { text: '', delay: 100 },
  { text: "'넥스트 코드 개발자의 죽음, 동료 개발자 체포'라는 헤드라인이 뉴스를 장식했다는 얘기였다.", delay: 1000 },
  { text: '', delay: 100 },
  { text: "창밖으로 라이벌 회사인 '테크노바'의 CEO가 기자회견을 하는 모습이 보였다.", delay: 800 },
  { text: '', delay: 100 },
  { text: '', delay: 100 },
  { text: '"우리는 혁신적인 AI 기술 인수에 성공했습니다! 이는 시장을 완전히 바꿀 것입니다."', delay: 800 },
  { text: '', delay: 100 },
  { text: '그의 미소 뒤에 숨겨진 비밀을 당신이 알아챌 수도 있었지만, 이제 너무 늦었다.', delay: 800 },
  { text: '', delay: 100 },
  { text: '쇠창살 너머로 보이는 하늘은, 오늘도 무심하게 푸르기만 하다.', delay: 1200 },
];

/**
 * BadEndingSequence 클래스
 * 배드 엔딩 시퀀스의 전체 흐름을 관리하는 클래스
 * 두 개의 장면 전환과 타이핑 효과, 크레딧 표시 등 구현
 */
class BadEndingSequence {
  // DOM 요소 참조 저장 변수들
  private endingText1: HTMLElement; // 첫 번째 장면의 텍스트 컨테이너
  private endingText2: HTMLElement; // 두 번째 장면의 텍스트 컨테이너
  private endingScene1: HTMLElement; // 첫 번째 배경 이미지 요소
  private endingScene2: HTMLElement; // 두 번째 배경 이미지 요소
  private credits: HTMLElement; // 크레딧 표시 요소
  private endingScene3: HTMLElement; // 세 번째 배경 요소
  private finalCredits: HTMLElement; // 최종 크레딧 요소

  // 커서 요소 참조
  private cursor1: HTMLElement | null = null; // 첫 번째 장면의 타이핑 커서
  private cursor2: HTMLElement | null = null; // 두 번째 장면의 타이핑 커서

  // 타이핑 속도 설정 (밀리초 단위)
  private typingSpeed: number = 40;

  /**
   * 생성자: 필요한 DOM 요소를 가져오고 시퀀스를 시작함
   */
  constructor() {
    // DOM 요소 참조 가져오기
    this.endingText1 = document.getElementById('ending-text-1') as HTMLElement;
    this.endingText2 = document.getElementById('ending-text-2') as HTMLElement;
    this.endingScene1 = document.getElementById('ending-scene-1') as HTMLElement;
    this.endingScene2 = document.getElementById('ending-scene-2') as HTMLElement;
    this.credits = document.getElementById('credits') as HTMLElement;
    this.endingScene3 = document.getElementById('ending-scene-3') as HTMLElement;
    this.finalCredits = document.getElementById('final-credits') as HTMLElement;

    // 커서 생성 및 시퀀스 시작
    this.createCursors();
    this.startSequence();
  }

  /**
   * 타이핑 효과를 위한 커서 요소 생성 메서드
   * 각 텍스트 영역에 커서를 추가함
   */
  private createCursors = (): void => {
    // 첫 번째 장면용 커서 생성 및 추가
    this.cursor1 = document.createElement('span');
    this.cursor1.className = 'cursor cursor-white';
    this.endingText1.appendChild(this.cursor1);

    // 두 번째 장면용 커서 생성 및 추가 (초기에는 숨김 상태)
    this.cursor2 = document.createElement('span');
    this.cursor2.className = 'cursor cursor-white';
    this.cursor2.style.display = 'none'; // 두 번째 장면 전까지 숨김
    this.endingText2.appendChild(this.cursor2);
  };

  /**
   * 엔딩 시퀀스 시작 메서드
   * 모든 텍스트를 순차적으로 표시하고 장면 전환을 처리
   */
  private startSequence = async (): Promise<void> => {
    // 첫 번째 파트 텍스트 순차 출력
    for (const item of badEndingPart1) {
      if (!this.cursor1) continue; // 커서 검증

      // 텍스트 타이핑 효과 실행
      await this.typeText(this.endingText1, item.text, this.cursor1);

      // 줄바꿈 처리
      this.endingText1.removeChild(this.cursor1);
      this.endingText1.innerHTML += '\n';
      this.endingText1.appendChild(this.cursor1);

      // 지정된 지연 시간만큼 대기
      await this.wait(item.delay || 500);
    }

    // 첫 번째 장면 완료 후 잠시 대기
    await this.wait(1500);

    // 두 번째 장면으로 전환
    this.transitionToScene2();

    // 두 번째 파트 텍스트 순차 출력
    for (const item of badEndingPart2) {
      if (!this.cursor2) continue; // 커서 검증

      // 텍스트 타이핑 효과 실행
      await this.typeText(this.endingText2, item.text, this.cursor2);

      // 줄바꿈 처리
      this.endingText2.removeChild(this.cursor2);
      this.endingText2.innerHTML += '\n';
      this.endingText2.appendChild(this.cursor2);

      // 지정된 지연 시간만큼 대기
      await this.wait(item.delay || 500);
    }

    // 모든 텍스트 출력 완료 후 크레딧 표시 전 잠시 대기
    await this.wait(2000);

    // 크레딧 표시
    this.showCredits();
  };

  /**
   * 텍스트 타이핑 효과를 구현하는 메서드
   * 글자 하나씩 순차적으로 화면에 표시
   */
  private typeText = async (element: HTMLElement, text: string, cursor: HTMLElement): Promise<void> => {
    // 텍스트를 한 글자씩 순회
    for (let i = 0; i < text.length; i++) {
      // 커서를 제거하고 현재 글자를 추가한 다음 커서를 다시 추가
      element.removeChild(cursor);
      element.innerHTML += text.charAt(i);
      element.appendChild(cursor);

      // 요소의 스크롤을 항상 최신 텍스트가 보이도록 조정
      element.scrollTop = element.scrollHeight;

      // 타이핑 속도에 맞춰 대기
      await this.wait(this.typingSpeed);
    }
  };

  /**
   * 지정된 시간(밀리초) 동안 대기하는 유틸리티 메서드
   */
  private wait = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * 첫 번째 장면에서 두 번째 장면으로 전환하는 메서드
   * 배경 이미지와 텍스트 영역을 전환함
   */
  private transitionToScene2 = (): void => {
    // 첫 번째 텍스트와 커서 숨기기
    if (this.cursor1) this.cursor1.style.display = 'none';
    this.endingText1.style.display = 'none';
    this.endingText1.style.visibility = 'hidden';
    this.endingText1.style.position = 'absolute';
    this.endingText1.style.zIndex = '-1';

    // 두 번째 배경을 먼저 표시로 설정 (투명 상태로)
    this.endingScene2.style.display = 'block';

    // 강제 리플로우를 통해 CSS 트랜지션이 제대로 적용되게 함
    void this.endingScene2.offsetWidth;

    // 첫 번째 배경을 서서히 사라지게 함
    this.endingScene1.style.opacity = '0';
    setTimeout(() => {
      this.endingScene1.style.display = 'none'; // 완전히 투명해진 후 제거
    }, 1000);

    // 두 번째 배경을 서서히 나타나게 하면서 텍스트 영역도 표시
    setTimeout(() => {
      // 배경 투명도 설정
      this.endingScene2.style.opacity = '0.4';

      // 두 번째 텍스트 영역과 커서 표시
      this.endingText2.style.display = 'block';
      this.endingText2.style.zIndex = '10';
      if (this.cursor2) this.cursor2.style.display = 'inline-block';
    }, 100);
  };

  /**
   * 모든 텍스트 표시가 끝난 후 크레딧을 표시하는 메서드
   * 페이드 인 효과로 크레딧을 서서히 나타나게 함
   */
  private showCredits = (): void => {
    // 두 번째 커서 숨기기
    if (this.cursor2) this.cursor2.style.display = 'none';

    // 크레딧 요소를 표시 상태로 설정 (초기에는 투명하게)
    this.credits.style.display = 'block';
    this.credits.style.opacity = '0';

    // 트랜지션 효과로 크레딧 서서히 나타나게 함
    setTimeout(() => {
      this.credits.style.transition = 'opacity 2s'; // 2초간 페이드 인
      this.credits.style.opacity = '1';

      // 5초 후에 세 번째 장면으로 전환
      setTimeout(() => {
        this.transitionToScene3();
      }, 5000);
    }, 100);
  };

  /**
   * 두 번째 장면에서 최종 크레딧으로 전환하는 메서드
   */
  private transitionToScene3 = (): void => {
    // 기존 크레딧 숨기기
    this.credits.style.opacity = '0';
    setTimeout(() => {
      this.credits.style.display = 'none';
    }, 1000);

    // 두 번째 텍스트 숨기기
    this.endingText2.style.opacity = '0';
    this.endingText2.style.transition = 'opacity 1s';
    setTimeout(() => {
      this.endingText2.style.display = 'none';
      this.endingText2.style.visibility = 'hidden';
    }, 1000);

    // 두 번째 배경 숨기기
    this.endingScene2.style.opacity = '0';
    setTimeout(() => {
      this.endingScene2.style.display = 'none';
    }, 1000);

    // 세 번째 배경(검정)으로 전환
    this.endingScene3.style.display = 'block';
    void this.endingScene3.offsetWidth;
    this.endingScene3.style.opacity = '1';

    // 최종 크레딧 표시
    setTimeout(() => {
      this.finalCredits.style.display = 'block';
      this.finalCredits.style.opacity = '0';

      // 페이드 인 효과로 최종 크레딧 서서히 나타나게
      setTimeout(() => {
        this.finalCredits.style.transition = 'opacity 2s';
        this.finalCredits.style.opacity = '1';

        // 크레딧이 표시된 후 5초 뒤에 페이드아웃 시작
        setTimeout(() => {
          // 페이드아웃 효과
          document.body.classList.add('ending-fade-out');

          // 페이드아웃이 완료된 후 페이지 이동
          setTimeout(() => {
            window.location.href = '../pages/start_page.html';
          }, 2000); // 페이드아웃 지속 시간과 동일하게 설정
        }, 5000);
      }, 100);
    }, 1200);
  };
}

// DOM이 완전히 로드된 후 엔딩 시퀀스 시작
document.addEventListener('DOMContentLoaded', () => {
  new BadEndingSequence();
});

/**
 * normal_end.ts
 * 노멀 엔딩 시퀀스를 관리하는 파일
 * 두 개의 배경 이미지와 연속된 텍스트 표시, 장면 전환 효과를 구현
 */
import type { IStoryText } from '../types/type';

/**
 * 첫 번째 장면에 표시될 텍스트 내용 배열
 */
const normalEndingPart1: IStoryText[] = [
  { text: '겨우 시간 내에 사무실을 빠져나왔지만, 정확하게 누가 범인인지를 알아내진 못했다.', delay: 800 },
  { text: '', delay: 100 },
  { text: '경찰 주임이 당신에게 다가온다. 분명 사건에 대해 조사를 하려하겠지.', delay: 800 },
  { text: '', delay: 100 },
  { text: '"사무실에 무단 침입한 이유를 설명해주시겠어요?"', delay: 600 },
  { text: '', delay: 100 },
  { text: '당신은 김진우가 남긴 메시지와 찾은 몇 가지 단서들을 보여주었다.', delay: 800 },
  { text: '', delay: 100 },
  { text: '"흥미롭군요. 하지만 이것만으로는 누가 범인인지 특정하기 어렵습니다."', delay: 800 },
  { text: '', delay: 100 },
  { text: '김진우의 AI 알고리즘 파일도 사라져버렸고, 경찰 조사는 몇 주간 계속되었다.', delay: 1000 },
  { text: '', delay: 100 },
  { text: '무력하게도, 나는 기다리는 것 밖에 할 수 있는 게 없었다.', delay: 1000 },
];

/**
 * 두 번째 장면에 표시될 텍스트 내용 배열
 */
const normalEndingPart2: IStoryText[] = [
  { text: '------ 1개월 후 ------', delay: 1500 },
  { text: '', delay: 100 },
  { text: "'넥스트 코드' 사무실은 다소 침체된 분위기가 이어지고 있고, 김진우의 빈자리는 크게 느껴졌다.", delay: 800 },
  { text: '', delay: 100 },
  { text: "그의 죽음은 공식적으로 '미제 사건'으로 분류되었고, 회사는 그가 개발하던 프로젝트를 중단할 수 밖에 없었다.", delay: 800 },
  { text: '', delay: 100 },
  { text: '', delay: 100 },
  { text: '가끔 당신은 누군가가 당신을 지켜보는 듯한 느낌을 받곤 한다.', delay: 800 },
  { text: '', delay: 100 },
  { text: '회의실 유리창에 비친 그림자가 익숙한 듯 보였지만, 돌아보면 아무도 없다.', delay: 800 },
  { text: '', delay: 100 },
  { text: '진실은 아직 어딘가에 숨겨져 있지 않을까. 언젠가는 반드시 밝혀내리라 다짐한다.', delay: 1200 },
];

/**
 * NormalEndingSequence 클래스
 * 노멀 엔딩 시퀀스의 전체 흐름을 관리하는 클래스
 * 두 개의 장면 전환과 타이핑 효과, 크레딧 표시 등 구현
 */
class NormalEndingSequence {
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
   */
  private createCursors = (): void => {
    // 첫 번째 장면용 커서 생성 및 추가
    this.cursor1 = document.createElement('span');
    this.cursor1.className = 'ending-cursor cursor-white';
    this.endingText1.appendChild(this.cursor1);

    // 두 번째 장면용 커서 생성 및 추가
    this.cursor2 = document.createElement('span');
    this.cursor2.className = 'ending-cursor cursor-white hidden-element';
    this.endingText2.appendChild(this.cursor2);
  };

  /**
   * 엔딩 시퀀스 시작 메서드
   * 모든 텍스트를 순차적으로 표시하고 장면 전환을 처리
   */
  private startSequence = async (): Promise<void> => {
    // 첫 번째 파트 텍스트 순차 출력
    for (const item of normalEndingPart1) {
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
    for (const item of normalEndingPart2) {
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
   *
   * @param element - 텍스트가 표시될 HTML 요소
   * @param text - 표시할 텍스트 내용
   * @param cursor - 타이핑 효과에 사용될 커서 요소
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
   *
   * @param ms - 대기 시간 (밀리초)
   * @returns Promise - 지정된 시간이 지나면 resolve되는 Promise
   */
  private wait = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * 첫 번째 장면에서 두 번째 장면으로 전환하는 메서드
   */
  private transitionToScene2 = (): void => {
    // 첫 번째 텍스트와 커서 숨기기
    if (this.cursor1) this.cursor1.classList.add('hidden-element');
    this.endingText1.classList.add('ending-fade-out');

    // 우선 첫 번째 배경을 완전히 페이드아웃하여 검정 화면 효과 생성
    this.endingScene1.classList.add('ending-fade-out');

    // 첫 번째 단계: 완전한 검정 화면으로 전환 (1초 대기)
    setTimeout(() => {
      this.endingText1.classList.add('hidden-element');
      this.endingScene1.classList.add('hidden-element');

      // 두 번째 배경을 준비하되 아직 투명하게 유지
      this.endingScene2.classList.remove('hidden-element');
      this.endingScene2.classList.add('visible-element');
      this.endingScene2.style.opacity = '0'; // 완전히 투명 상태에서 시작

      // 두 번째 단계: 잠시 검정 화면 유지 (1초 대기)
      setTimeout(() => {
        // 두 번째 장면을 서서히 나타나게 함
        this.endingScene2.style.opacity = '0.4'; // 원하는 투명도로 설정

        // 두 번째 텍스트 영역과 커서 표시 준비
        this.endingText2.classList.remove('hidden-element');
        this.endingText2.classList.add('visible-element');
        this.endingText2.style.opacity = '0'; // 우선 투명하게 시작

        // 세 번째 단계: 두 번째 장면 텍스트 페이드인 (0.5초 대기)
        setTimeout(() => {
          this.endingText2.style.opacity = '1'; // 텍스트 표시
          if (this.cursor2) this.cursor2.classList.remove('hidden-element');
        }, 500);
      }, 1000); // 검정 화면 지속 시간
    }, 1000); // 첫 번째 장면 페이드아웃 시간
  };

  /**
   * 모든 텍스트 표시가 끝난 후 크레딧을 표시하는 메서드
   */
  private showCredits = (): void => {
    // 두 번째 커서 숨기기
    if (this.cursor2) this.cursor2.classList.add('hidden-element');

    // 크레딧 요소를 페이드인 준비
    this.credits.classList.remove('hidden-element');
    this.credits.classList.add('visible-element', 'fade-in-nonactive');

    // 트랜지션 효과로 크레딧 서서히 나타나게 함
    setTimeout(() => {
      this.credits.classList.add('fade-in-active');

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
    // 두 번째 텍스트를 먼저 fade out 시킴
    this.endingText2.classList.add('ending-fade-out');

    // 크레딧도 fade out
    this.credits.classList.add('ending-fade-out');
    this.credits.classList.remove('fade-in-active');

    setTimeout(() => {
      this.endingText2.classList.add('hidden-element');
      this.credits.classList.add('hidden-element');

      // 두 번째 배경 fade out
      this.endingScene2.classList.add('ending-fade-out');
      setTimeout(() => {
        this.endingScene2.classList.add('hidden-element');
      }, 1000);

      // 검정 배경으로 전환
      this.endingScene3.classList.remove('hidden-element');
      this.endingScene3.classList.add('visible-element');
      void this.endingScene3.offsetWidth;
      this.endingScene3.style.opacity = '1';

      // 최종 크레딧 표시
      setTimeout(() => {
        this.finalCredits.classList.remove('hidden-element');
        this.finalCredits.classList.add('visible-element', 'fade-in-nonactive');

        setTimeout(() => {
          this.finalCredits.classList.add('fade-in-active');

          setTimeout(() => {
            document.body.classList.add('ending-fade-out');

            setTimeout(() => {
              window.location.href = '../pages/start_page.html';
            }, 2000);
          }, 5000);
        }, 100);
      }, 1200);
    }, 1000); // fade out 애니메이션 시간
  };
}

// DOM이 완전히 로드된 후 엔딩 시퀀스 시작
document.addEventListener('DOMContentLoaded', () => {
  new NormalEndingSequence();
});

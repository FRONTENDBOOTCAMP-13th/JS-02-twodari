// src/utils/transition_effect.ts

export class TransitionEffect {
  private static overlay: HTMLDivElement | null = null;
  private static isTransitioning = false;
  private static readonly TRANSITION_DURATION = 800; // 0.8초

  /**
   * 암전 효과용 오버레이 초기화
   */
  public static initialize(): void {
    if (this.overlay) return;

    // 오버레이 요소 생성
    this.overlay = document.createElement('div');
    this.overlay.id = 'blackout-overlay';

    // 스타일 설정
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'black',
      opacity: '0',
      transition: 'opacity 1s ease',
      zIndex: '9999',
      pointerEvents: 'none',
    });

    // DOM에 추가
    document.body.appendChild(this.overlay);
  }

  /**
   * 암전 시작
   */
  public static startBlackout(): void {
    if (!this.overlay) this.initialize();

    this.isTransitioning = true;

    if (this.overlay) {
      this.overlay.style.pointerEvents = 'auto';
      this.overlay.style.opacity = '1';
    }
  }

  /**
   * 암전 종료
   */
  public static endBlackout(): void {
    if (!this.overlay) return;

    this.overlay.style.opacity = '0';

    // 천천히 사라지도록 타이머 설정
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.pointerEvents = 'none';
      }
      this.isTransitioning = false;
    }, this.TRANSITION_DURATION);
  }

  /**
   * 발소리 재생
   */
  public static playFootstepSound(): void {
    try {
      const footstepAudio = new Audio('/effectSound/footstep.ogg');
      footstepAudio.volume = 0.4; // 볼륨 설정
      footstepAudio.play().catch(e => console.warn('발소리 재생 실패:', e));
    } catch (error) {
      console.warn('발소리 재생 중 오류:', error);
    }
  }

  /**
   * 암전 효과와 함께 방 전환
   * @param callback 방 전환 후 실행할 함수
   */
  public static async transition(callback: () => void): Promise<void> {
    // 이미 전환 중이면 무시
    if (this.isTransitioning) return;

    // 암전 시작 및 발소리 재생
    this.startBlackout();
    this.playFootstepSound();

    // 암전 완료 대기
    await new Promise(resolve => setTimeout(resolve, this.TRANSITION_DURATION));

    // 방 전환 콜백 실행
    callback();

    // 약간의 지연 후 암전 종료
    setTimeout(() => {
      this.endBlackout();
    }, 200);
  }

  /**
   * 현재 전환 중인지 확인
   */
  public static isInTransition(): boolean {
    return this.isTransitioning;
  }
}

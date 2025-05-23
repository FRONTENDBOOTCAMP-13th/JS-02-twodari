/**
 * minigames.ts - 게임 내 미니게임 구현
 *
 * MirrorGame: 거울 닦기 미니게임
 * CopierGame: 복합기 수리 미니게임
 */
import { IMiniGame } from '../../types/type';

/**
 * MirrorGame 클래스 - 거울 닦기 미니게임
 *
 * 이 게임은 혈흔이 묻은 거울을 닦아 숨겨진 단서(314)를 찾는 미니게임입니다.
 * 마우스나 터치로 화면을 드래그하면 피가 지워지면서 거울이 드러납니다.
 */
export class MirrorGame implements IMiniGame {
  // === 캔버스 관련 변수 ===
  private mirrorCanvas: HTMLCanvasElement | null = null; // 거울 이미지를 그릴 캔버스
  private bloodCanvas: HTMLCanvasElement | null = null; // 피 이미지를 그릴 캔버스
  private mirrorCtx: CanvasRenderingContext2D | null = null; // 거울 그리기 컨텍스트
  private bloodCtx: CanvasRenderingContext2D | null = null; // 피 그리기 컨텍스트
  private containerWidth: number = 500; // 게임 영역 너비
  private containerHeight: number = 500; // 게임 영역 높이

  // === 게임 상태 변수 ===
  private isMouseDown: boolean = false; // 마우스 클릭 중인지 여부
  private cleanedPercentage: number = 0; // 청소 진행률 (0-100%)
  private originalBloodData: ImageData | null = null; // 원래 피 이미지 데이터
  private brushSize: number = 20; // 지우개 크기 (픽셀)
  private prevX: number = 0; // 이전 마우스 X 좌표
  private prevY: number = 0; // 이전 마우스 Y 좌표

  // === 오디오 관련 변수 ===
  private audioContext: AudioContext | null = null; // 오디오 컨텍스트
  private audioBuffer: AudioBuffer | null = null; // 로드된 효과음
  private lastSoundTime: number = 0; // 마지막 효과음 재생 시간
  private soundCooldown: number = 200; // 효과음 재생 간격 (밀리초)

  /**
   * 생성자
   * @param onComplete 게임 완료 시 실행될 함수
   */
  constructor(private onComplete: () => void) {}

  // ================ 초기화 관련 메서드 ================

  /**
   * 게임 초기화 (필수 구현)
   * 캔버스, 이미지, 오디오 등을 준비합니다.
   */
  public initialize = (): void => {
    this.createCanvases();
    this.resetGameState();
    this.loadImages();
    this.initAudio();
  };

  /**
   * 캔버스 생성 및 설정
   * 두 개의 캔버스를 만들어 겹쳐 놓습니다.
   */
  private createCanvases = (): void => {
    // 1. 두 개의 캔버스 생성 (하나는 거울용, 하나는 피용)
    this.mirrorCanvas = document.createElement('canvas');
    this.bloodCanvas = document.createElement('canvas');

    // 2. 캔버스 크기 설정
    this.mirrorCanvas.width = this.bloodCanvas.width = this.containerWidth;
    this.mirrorCanvas.height = this.bloodCanvas.height = this.containerHeight;

    // 3. 그래픽 컨텍스트 가져오기
    this.mirrorCtx = this.mirrorCanvas.getContext('2d');
    this.bloodCtx = this.bloodCanvas.getContext('2d', { alpha: true }); // 투명도 지원

    // 4. 캔버스 위치 설정 (겹치도록)
    this.mirrorCanvas.style.position = 'absolute';
    this.mirrorCanvas.style.top = '0';
    this.mirrorCanvas.style.left = '0';

    this.bloodCanvas.style.position = 'absolute';
    this.bloodCanvas.style.top = '0';
    this.bloodCanvas.style.left = '0';
    this.bloodCanvas.style.pointerEvents = 'auto'; // 마우스 이벤트 활성화
  };

  /**
   * 게임 상태 초기화
   */
  private resetGameState = (): void => {
    this.isMouseDown = false;
    this.cleanedPercentage = 0;
    this.prevX = 0;
    this.prevY = 0;
  };

  /**
   * 이미지 로드
   * 거울 이미지와 피 이미지를 불러옵니다.
   */
  private loadImages = (): void => {
    const mirrorImg = new Image(); // 거울 이미지 객체
    const bloodImg = new Image(); // 피 이미지 객체

    // 거울 이미지 로드 완료 시
    mirrorImg.onload = () => {
      if (this.mirrorCtx) {
        // 픽셀 이미지 선명도 유지
        this.mirrorCtx.imageSmoothingEnabled = false;
        // 거울 이미지 그리기
        this.mirrorCtx.drawImage(mirrorImg, 0, 0, this.containerWidth, this.containerHeight);
      }
    };

    // 피 이미지 로드 완료 시
    bloodImg.onload = () => {
      if (this.bloodCtx) {
        // 픽셀 이미지 선명도 유지
        this.bloodCtx.imageSmoothingEnabled = false;

        // 피 이미지 크기 조정 (거울 이미지 중앙의 숫자를 가리도록)
        const scale = 1.6; // 1.6배 크기로 확대
        const scaledWidth = this.containerWidth * scale;
        const scaledHeight = this.containerHeight * scale;
        const offsetX = (this.containerWidth - scaledWidth) / 2; // 중앙 정렬
        const offsetY = (this.containerHeight - scaledHeight) / 2;

        // 피 이미지 그리기
        this.bloodCtx.drawImage(bloodImg, offsetX, offsetY, scaledWidth, scaledHeight);

        // 원본 피 이미지 데이터 저장 (나중에 청소 진행률 계산에 사용)
        this.originalBloodData = this.bloodCtx.getImageData(0, 0, this.containerWidth, this.containerHeight);
      }
    };

    // 이미지 로드 오류 시 대체 이미지 표시
    mirrorImg.onerror = () => this.createFallbackImage('mirror');
    bloodImg.onerror = () => this.createFallbackImage('blood');

    // 이미지 로드 시작
    mirrorImg.src = '/assets/img/mirror.webp';
    bloodImg.src = '/assets/img/blood.webp';
  };

  /**
   * 이미지 로드 실패 시 대체 이미지 생성
   */
  private createFallbackImage = (type: 'mirror' | 'blood'): void => {
    console.error(`${type} 이미지 로드 실패, 대체 이미지 생성`);

    if (type === 'mirror' && this.mirrorCtx) {
      // 거울 대체 이미지 - 숫자 314가 보이는 회색 배경
      this.mirrorCtx.fillStyle = '#333'; // 어두운 회색
      this.mirrorCtx.fillRect(0, 0, this.containerWidth, this.containerHeight);
      this.mirrorCtx.fillStyle = '#fff'; // 흰색 텍스트
      this.mirrorCtx.font = '48px Arial';
      this.mirrorCtx.textAlign = 'center';
      this.mirrorCtx.fillText('314', this.containerWidth / 2, this.containerHeight / 2);
    } else if (type === 'blood' && this.bloodCtx) {
      // 피 대체 이미지 - 빨간색 반투명 배경
      this.bloodCtx.fillStyle = 'rgba(180, 0, 0, 0.8)';
      this.bloodCtx.fillRect(0, 0, this.containerWidth, this.containerHeight);
      this.originalBloodData = this.bloodCtx.getImageData(0, 0, this.containerWidth, this.containerHeight);
    }
  };

  /**
   * 오디오 초기화
   * 닦는 효과음을 로드합니다.
   */
  private initAudio = async (): Promise<void> => {
    try {
      // 1. 오디오 컨텍스트 생성 (브라우저 호환성 고려)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 2. 여러 가능한 경로에서 오디오 파일 찾기 시도
      const possiblePaths = ['/effectSound/mirror_swipe.mp3'];

      // 3. 각 경로를 순차적으로 시도하여 첫 번째로 성공하는 경로 사용
      for (const path of possiblePaths) {
        try {
          // 파일 가져오기 시도
          const response = await fetch(path);
          if (response.ok) {
            // 오디오 데이터를 배열 버퍼로 변환
            const arrayBuffer = await response.arrayBuffer();
            // 오디오 버퍼로 디코딩
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log(`효과음 로드 성공: ${path}`);
            break; // 성공했으므로 반복 중단
          }
        } catch (e) {
          console.log(`${path} 경로에서 효과음을 찾을 수 없음`);
        }
      }
    } catch (error) {
      console.error('효과음 초기화 실패:', error);
    }
  };

  // ================ 게임 UI 및 시작 ================

  /**
   * 게임 시작 (필수 구현)
   * UI를 생성하고 게임을 화면에 표시합니다.
   */
  public start = (): void => {
    const container = document.getElementById('minigame-container');
    if (!container) return;

    // 1. 컨테이너 준비
    this.prepareContainer(container);

    // 2. 게임 UI 생성 및 표시
    container.appendChild(this.createGameUI());

    // 3. 이벤트 리스너 설정
    this.setupEventListeners();
  };

  /**
   * 게임 컨테이너 준비
   */
  private prepareContainer = (container: HTMLElement): void => {
    container.innerHTML = '';
    container.classList.remove('hidden');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  };

  /**
   * 게임 UI 생성
   * 게임에 필요한 모든 시각적 요소를 만듭니다.
   */
  private createGameUI = (): HTMLElement => {
    // 1. 메인 게임 박스
    const gameBox = document.createElement('div');
    gameBox.className = 'bg-black p-5 rounded-lg shadow-lg text-center';

    // 2. 제목
    const title = document.createElement('h2');
    title.className = 'text-white text-xl mb-3';
    title.textContent = '피 묻은 거울';

    // 3. 설명 텍스트
    const desc = document.createElement('p');
    desc.className = 'text-gray-300 mb-4';
    desc.textContent = '마우스를 드래그하여 피를 닦아내기';

    // 4. 진행률 표시줄
    const progressContainer = this.createProgressBar();

    // 5. 캔버스 컨테이너
    const canvasContainer = this.createCanvasContainer();

    // 6. 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.id = 'close-game';
    closeButton.className = 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded';
    closeButton.textContent = '닫기';

    closeButton.addEventListener('click', () => {
      console.log('닫기 버튼 클릭됨');
      this.close();
    });

    // 7. UI 조립
    gameBox.appendChild(title);
    gameBox.appendChild(desc);
    gameBox.appendChild(progressContainer);
    gameBox.appendChild(canvasContainer);
    gameBox.appendChild(closeButton);

    return gameBox;
  };

  /**
   * 진행률 표시줄 생성
   */
  private createProgressBar = (): HTMLElement => {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'w-full bg-gray-700 h-3 rounded-full mb-4';

    const progressBar = document.createElement('div');
    progressBar.id = 'mirror-progress';
    progressBar.className = 'bg-green-600 h-3 rounded-full transition-all duration-300';
    progressBar.style.width = '0%';

    progressContainer.appendChild(progressBar);
    return progressContainer;
  };

  /**
   * 캔버스 컨테이너 생성
   */
  private createCanvasContainer = (): HTMLElement => {
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'relative border border-gray-600 rounded-lg mb-4 overflow-hidden';
    canvasContainer.style.width = `${this.containerWidth}px`;
    canvasContainer.style.height = `${this.containerHeight}px`;

    // 캔버스 추가 (순서 중요: 거울 먼저, 피 나중에)
    if (this.mirrorCanvas && this.bloodCanvas) {
      canvasContainer.appendChild(this.mirrorCanvas);
      canvasContainer.appendChild(this.bloodCanvas);
    }

    return canvasContainer;
  };

  // ================ 이벤트 처리 ================

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners = (): void => {
    if (!this.bloodCanvas) return;

    // 마우스 이벤트
    this.bloodCanvas.addEventListener('mousedown', this.onMouseDown);
    this.bloodCanvas.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    this.bloodCanvas.addEventListener('mouseleave', this.onMouseUp);

    // 터치 이벤트 (모바일 지원)
    this.bloodCanvas.addEventListener('touchstart', this.onTouchStart);
    this.bloodCanvas.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
  };

  /**
   * 마우스 누를 때 - 닦기 시작
   */
  private onMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    this.isMouseDown = true;

    // 오디오 컨텍스트 활성화 (브라우저는 사용자 상호작용 후에만 소리 허용)
    this.activateAudio();

    // 마우스 위치 계산
    const rect = this.bloodCanvas!.getBoundingClientRect();
    this.prevX = e.clientX - rect.left;
    this.prevY = e.clientY - rect.top;

    // 해당 위치 지우기
    this.eraseAtPoint(this.prevX, this.prevY);
  };

  /**
   * 마우스 이동 시 - 드래그 중 닦기
   */
  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isMouseDown) return; // 마우스 버튼이 눌려있지 않으면 무시
    e.preventDefault();

    const rect = this.bloodCanvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 이전 위치에서 현재 위치까지 선을 그리며 지우기
    this.eraseLine(this.prevX, this.prevY, x, y);

    // 현재 위치 저장
    this.prevX = x;
    this.prevY = y;
  };

  /**
   * 마우스 뗄 때 - 닦기 종료
   */
  private onMouseUp = (): void => {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    // 청소 진행률 계산
    this.calculateCleanedPercentage();
  };

  /**
   * 터치 시작 - 모바일 닦기 시작
   */
  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault(); // 화면 스크롤 방지
    if (e.touches.length === 0) return;

    this.isMouseDown = true;
    this.activateAudio();

    const rect = this.bloodCanvas!.getBoundingClientRect();
    const touch = e.touches[0];
    this.prevX = touch.clientX - rect.left;
    this.prevY = touch.clientY - rect.top;

    this.eraseAtPoint(this.prevX, this.prevY);
  };

  /**
   * 터치 이동 - 모바일 닦기 진행
   */
  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (!this.isMouseDown || e.touches.length === 0) return;

    const rect = this.bloodCanvas!.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.eraseLine(this.prevX, this.prevY, x, y);

    this.prevX = x;
    this.prevY = y;
  };

  /**
   * 터치 종료 - 모바일 닦기 종료
   */
  private onTouchEnd = (): void => {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    this.calculateCleanedPercentage();
  };

  // ================ 게임 메커니즘 ================

  /**
   * 오디오 활성화
   * 브라우저는 사용자 상호작용 없이는 소리를 재생할 수 없음
   */
  private activateAudio = (): void => {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  };

  /**
   * 특정 점에서 피 지우기
   */
  private eraseAtPoint = (x: number, y: number): void => {
    if (!this.bloodCtx) return;

    // 'destination-out' 모드는 그려지는 부분을 투명하게 만듦
    this.bloodCtx.globalCompositeOperation = 'destination-out';

    // 원 모양으로 지우기
    this.bloodCtx.beginPath();
    this.bloodCtx.arc(x, y, this.brushSize, 0, Math.PI * 2);
    this.bloodCtx.fill();
  };

  /**
   * 두 점 사이에 선을 그리며 피 지우기
   */
  private eraseLine = (x1: number, y1: number, x2: number, y2: number): void => {
    if (!this.bloodCtx) return;

    // 투명 모드 설정
    this.bloodCtx.globalCompositeOperation = 'destination-out';

    // 두꺼운 선 그리기 (지우개 효과)
    this.bloodCtx.lineWidth = this.brushSize * 2;
    this.bloodCtx.lineCap = 'round'; // 선 끝이 둥글게
    this.bloodCtx.lineJoin = 'round'; // 선 연결 부분이 둥글게

    // 선 그리기
    this.bloodCtx.beginPath();
    this.bloodCtx.moveTo(x1, y1);
    this.bloodCtx.lineTo(x2, y2);
    this.bloodCtx.stroke();

    // 끝점에 원 추가 (더 부드러운 효과)
    this.bloodCtx.beginPath();
    this.bloodCtx.arc(x2, y2, this.brushSize / 2, 0, Math.PI * 2);
    this.bloodCtx.fill();

    // 효과음 재생
    this.playCleaningSound();
  };

  /**
   * 청소 효과음 재생
   */
  private playCleaningSound = (): void => {
    const currentTime = Date.now();

    // 마지막 소리 재생 후 일정 시간이 지났는지 확인 (너무 잦은 소리 재생 방지)
    if (currentTime - this.lastSoundTime <= this.soundCooldown) return;
    if (!this.audioContext || !this.audioBuffer) return;

    try {
      // 1. 오디오 소스 생성
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;

      // 2. 볼륨 조절기 생성
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.5; // 볼륨 50%

      // 3. 연결 및 재생
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);

      // 4. 재생 시간 기록
      this.lastSoundTime = currentTime;
    } catch (err) {
      console.error('효과음 재생 실패:', err);
    }
  };

  /**
   * 청소 진행률 계산
   * 원래 불투명했던 픽셀 중 얼마나 투명해졌는지 계산
   */
  private calculateCleanedPercentage = (): void => {
    if (!this.bloodCtx || !this.bloodCanvas || !this.originalBloodData) return;

    // 현재 피 레이어 이미지 데이터 가져오기
    const currentData = this.bloodCtx.getImageData(0, 0, this.containerWidth, this.containerHeight);
    const pixels = currentData.data;
    const originalPixels = this.originalBloodData.data;

    // 픽셀 카운터 초기화
    let originalNonTransparentPixels = 0;
    let currentNonTransparentPixels = 0;

    // 4바이트마다 검사 (R,G,B,A 중 A값만)
    for (let i = 3; i < originalPixels.length; i += 4) {
      // 원래 불투명했던 픽셀만 계산 (알파값 > 50)
      if (originalPixels[i] > 50) {
        originalNonTransparentPixels++;

        // 현재도 불투명한지 확인
        if (pixels[i] > 50) {
          currentNonTransparentPixels++;
        }
      }
    }

    // 지워진 비율 계산
    const cleanedPixels = originalNonTransparentPixels - currentNonTransparentPixels;
    this.cleanedPercentage = (cleanedPixels / originalNonTransparentPixels) * 100;

    // 진행률 표시줄 업데이트
    this.updateProgressBar();

    // 80% 이상 지워졌으면 게임 성공
    if (this.cleanedPercentage > 80) {
      this.completeGame();
    }
  };

  /**
   * 진행률 표시줄 업데이트
   */
  private updateProgressBar = (): void => {
    const progressBar = document.getElementById('mirror-progress');
    if (progressBar) {
      progressBar.style.width = `${this.cleanedPercentage}%`;
    }
  };

  /**
   * 게임 완료 처리
   */
  private completeGame = (): void => {
    // 잠시 후 게임 종료 및 콜백 실행
    setTimeout(() => {
      this.onComplete();
      this.close();
    }, 500);
  };

  /**
   * 게임 종료 (필수 구현)
   * 이벤트 리스너 제거 및 리소스 정리
   */
  public close = (): void => {
    // 1. 이벤트 리스너 제거
    this.removeEventListeners();

    // 2. 오디오 리소스 정리
    if (this.audioContext) {
      this.audioContext.close().catch(err => console.error('오디오 정리 실패:', err));
    }

    // 3. 게임 UI 숨기기
    const container = document.getElementById('minigame-container');
    if (container) {
      container.classList.add('hidden');
      container.style.display = 'none';
      container.innerHTML = '';
    }
  };

  /**
   * 이벤트 리스너 제거
   */
  private removeEventListeners = (): void => {
    if (this.bloodCanvas) {
      this.bloodCanvas.removeEventListener('mousedown', this.onMouseDown);
      this.bloodCanvas.removeEventListener('mousemove', this.onMouseMove);
      this.bloodCanvas.removeEventListener('mouseleave', this.onMouseUp);
      this.bloodCanvas.removeEventListener('touchstart', this.onTouchStart);
      this.bloodCanvas.removeEventListener('touchmove', this.onTouchMove);
    }

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchend', this.onTouchEnd);
  };
}

/**
 * 복합기 수리 미니게임
 * 타이밍 바에서 특정 구간에 맞춰 버튼을 눌러 복합기를 수리하는 게임
 */
export class CopierGame implements IMiniGame {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private durability: number = 0;
  private hearts: number = 3;
  private barPosition: number = 50;
  private barDirection: number = 1;
  private barSpeed: number = 7;
  private isGameActive: boolean = false;
  private gameInterval: number | null = null;
  private completeVisible: boolean = false;
  private lastHitResult: 'PERFECT' | 'GOOD' | 'MISS' | '' = '';
  private copierImage: HTMLImageElement | null = null;
  private heartImage: HTMLImageElement | null = null;

  // 연속 클릭 및 속도 제어
  private lastClickTime: number = 0;
  private clickCooldown: number = 300; // 300ms 쿨다운
  private speedIncreased: boolean = false; // 속도 증가 방지 플래그

  // 사운드 관련 변수
  private audioContext: AudioContext | null = null;
  private repairSound: AudioBuffer | null = null;
  private goodHitSound: AudioBuffer | null = null;
  private perfectHitSound: AudioBuffer | null = null;
  private missSound: AudioBuffer | null = null;
  private failureSound: AudioBuffer | null = null;
  private completeSound: AudioBuffer | null = null;
  private repairSoundSource: AudioBufferSourceNode | null = null;
  private audioActivated: boolean = false;

  // 색상 상수
  private readonly PERFECT_COLOR = '#00BFFF';
  private readonly GOOD_COLOR = '#ffff00';
  private readonly NORMAL_COLOR = '#FF6347';
  private readonly PROGRESS_COLOR = '#4caf50';
  private readonly PERFECT_ACTIVE_COLOR = '#00BFFF';
  private readonly GOOD_ACTIVE_COLOR = '#FFFF00';
  private readonly MISS_ACTIVE_COLOR = '#FF6347';
  private readonly HEART_LOSS_PENALTY = 50;

  /**
   * 복합기 게임 생성자
   * @param onComplete 게임 완료 시 실행할 콜백함수
   */
  constructor(private onComplete: () => void) {}

  /**
   * 게임 초기화
   */
  public initialize = (): void => {
    // 캔버스 생성
    this.canvas = document.createElement('canvas');
    this.canvas.width = 700;
    this.canvas.height = 450;
    this.canvas.className = 'border border-gray-500';
    this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';

    this.ctx = this.canvas.getContext('2d');

    // 게임 상태 초기화
    this.durability = 0;
    this.hearts = 3;
    this.barPosition = 50;
    this.barDirection = 1;
    this.isGameActive = false;
    this.completeVisible = false;
    this.lastHitResult = '';
    this.audioActivated = false;

    // 클릭 관련 변수 초기화
    this.lastClickTime = 0;
    this.speedIncreased = false;

    // 이미지와 오디오 로드
    this.loadImages();
    this.initAudio();
  };

  /**
   * 이미지 로드
   */
  private loadImages = (): void => {
    // 복합기 이미지 로드
    this.copierImage = new Image();
    this.copierImage.src = '/assets/img/copier.webp';
    this.copierImage.onload = () => console.log('복합기 이미지 로드 성공');
    this.copierImage.onerror = () => {
      console.error('복합기 이미지 로드 실패');
      this.copierImage = null;
    };

    // 하트 이미지 로드
    this.heartImage = new Image();
    this.heartImage.src = '/assets/img/health.webp';
    this.heartImage.onload = () => console.log('하트 이미지 로드 성공');
    this.heartImage.onerror = () => {
      console.error('하트 이미지 로드 실패');
      this.heartImage = null;
    };
  };

  /**
   * 오디오 초기화 - 로드만 하고 재생하지 않음
   */
  private initAudio = async (): Promise<void> => {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
      console.log('오디오 초기화됨 - 아직 재생 안 함');
    } catch (error) {
      console.error('오디오 초기화 실패:', error);
    }
  };

  /**
   * 게임에 필요한 모든 사운드 파일 로드
   */
  private loadSounds = async (): Promise<void> => {
    if (!this.audioContext) return;

    try {
      await this.loadSound('/effectSound/repair_loop.mp3', 'repair');
      await this.loadSound('/effectSound/good_hit.mp3', 'goodHit');
      await this.loadSound('/effectSound/perfect_hit.mp3', 'perfectHit');
      await this.loadSound('/effectSound/miss.mp3', 'miss');
      await this.loadSound('/effectSound/complete.mp3', 'complete');
      await this.loadSound('/effectSound/failure.mp3', 'failure');
    } catch (error) {
      console.error('사운드 로드 실패:', error);
    }
  };

  /**
   * 개별 사운드 파일 로드
   */
  private loadSound = async (url: string, type: string): Promise<void> => {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`사운드 파일을 찾을 수 없음: ${url}`);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // 사운드 타입에 따라 적절한 버퍼에 저장
      switch (type) {
        case 'repair':
          this.repairSound = audioBuffer;
          break;
        case 'goodHit':
          this.goodHitSound = audioBuffer;
          break;
        case 'perfectHit':
          this.perfectHitSound = audioBuffer;
          break;
        case 'miss':
          this.missSound = audioBuffer;
          break;
        case 'complete':
          this.completeSound = audioBuffer;
          break;
        case 'failure':
          this.failureSound = audioBuffer;
          break;
      }
    } catch (error) {
      console.error(`${type} 사운드 로드 실패:`, error);
    }
  };

  /**
   * 오디오 컨텍스트 활성화 및 배경음 재생
   */
  private ensureAudioActivation = (): void => {
    if (!this.audioContext) return;

    // 이미 활성화됨
    if (this.audioActivated) return;

    // suspended 상태면 활성화
    if (this.audioContext.state === 'suspended') {
      this.audioContext
        .resume()
        .then(() => {
          console.log('오디오 컨텍스트 활성화 성공');
          this.audioActivated = true;
          this.playRepairSound();
        })
        .catch(error => {
          console.error('오디오 컨텍스트 활성화 실패:', error);
        });
    } else if (this.audioContext.state === 'running') {
      this.audioActivated = true;
      this.playRepairSound();
    }
  };

  /**
   * 수리 배경 사운드 재생
   */
  private playRepairSound = (): void => {
    if (!this.audioContext || !this.repairSound || this.repairSoundSource) return;

    try {
      this.repairSoundSource = this.audioContext.createBufferSource();
      this.repairSoundSource.buffer = this.repairSound;
      this.repairSoundSource.loop = true;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.3; // 볼륨 조절

      this.repairSoundSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 종료 이벤트 처리
      this.repairSoundSource.onended = () => {
        this.repairSoundSource = null;
      };

      this.repairSoundSource.start(0);
      console.log('배경음 재생 시작');
    } catch (error) {
      console.error('배경음 재생 실패:', error);
      this.repairSoundSource = null;
    }
  };

  /**
   * 효과음 재생
   */
  private playSound = (type: 'goodHit' | 'perfectHit' | 'miss' | 'complete' | 'failure'): void => {
    if (!this.audioContext) return;
    if (!this.audioActivated) this.ensureAudioActivation();

    // 사운드 타입에 따라 버퍼 선택
    let buffer: AudioBuffer | null = null;
    let volume = 0.3; // 기본 볼륨

    switch (type) {
      case 'goodHit':
        buffer = this.goodHitSound;
        break;
      case 'perfectHit':
        buffer = this.perfectHitSound;
        break;
      case 'miss':
        buffer = this.missSound;
        break;
      case 'complete':
        buffer = this.completeSound;
        volume = 0.3; // 완료 사운드는 더 크게
        break;
      case 'failure':
        buffer = this.failureSound;
        volume = 0.5; // 실패 사운드도 더 크게
        break;
    }

    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();

      console.log(`${type} 효과음 재생 시작`);
    } catch (error) {
      console.error(`${type} 효과음 재생 실패:`, error);
    }
  };

  /**
   * 배경음만 멈추는 메서드
   */
  private stopBackgroundSound = (): void => {
    if (this.repairSoundSource) {
      try {
        this.repairSoundSource.stop();
        this.repairSoundSource.disconnect();
        this.repairSoundSource = null;
        console.log('배경음만 정지됨');
      } catch (error) {
        console.error('배경음 정지 실패:', error);
      }
    }
  };

  /**
   * 모든 사운드 정지 (닫기 버튼 클릭 시만 사용)
   */
  private stopAllSounds = (): void => {
    // 배경음 정지
    this.stopBackgroundSound();

    // 오디오 컨텍스트 일시 중단
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend().catch(err => {
        console.error('오디오 컨텍스트 일시 중단 실패:', err);
      });
    }

    this.audioActivated = false;
    console.log('모든 사운드 정지됨');
  };

  /**
   * 게임 시작
   */
  public start = (): void => {
    if (!this.canvas) return;

    // 미니게임 컨테이너에 캔버스 추가
    const container = document.getElementById('minigame-container');
    if (!container) return;

    // 컨테이너 설정
    container.classList.remove('hidden');
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';

    // 게임 UI 생성
    const gameBox = document.createElement('div');
    gameBox.className = 'bg-black p-5 rounded-lg shadow-lg text-center';

    // 제목
    const title = document.createElement('h2');
    title.className = 'text-white text-xl mb-3';
    title.textContent = '망가진 복합기';

    // 설명
    const instruction = document.createElement('p');
    instruction.className = 'text-gray-300 mb-4';
    instruction.textContent = '스페이스바나 클릭으로 상호작용하여 복합기 고치기';

    // 캔버스 컨테이너
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'bg-gray-900 p-2 mb-4 rounded-lg overflow-hidden';
    canvasContainer.appendChild(this.canvas);

    // 버튼 영역
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-between';

    // 수리 버튼
    const hitButton = document.createElement('button');
    hitButton.className = 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded';
    hitButton.textContent = '수리하기';
    hitButton.addEventListener('click', () => {
      // 오디오 컨텍스트 활성화
      this.ensureAudioActivation();
      this.checkHit();
    });

    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.className = 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded';
    closeButton.textContent = '닫기';
    closeButton.addEventListener('click', this.close);

    buttonContainer.appendChild(hitButton);
    buttonContainer.appendChild(closeButton);

    // UI 조립
    gameBox.appendChild(title);
    gameBox.appendChild(instruction);
    gameBox.appendChild(canvasContainer);
    gameBox.appendChild(buttonContainer);

    container.appendChild(gameBox);

    // 게임 상태 초기화
    this.durability = 0;
    this.hearts = 3;
    this.barPosition = 50;
    this.barDirection = 1;
    this.isGameActive = true;

    // 클릭 관련 변수 초기화
    this.lastClickTime = 0;
    this.speedIncreased = false;

    // 키보드 이벤트 리스너 설정
    document.addEventListener('keydown', this.handleKeyDown);

    // 게임 루프 시작
    this.gameInterval = window.setInterval(this.gameLoop, 30);

    // 초기 렌더링
    this.draw();
  };

  /**
   * 게임 루프 (주기적으로 호출됨)
   */
  private gameLoop = (): void => {
    if (!this.isGameActive) return;
    this.moveBar();
    this.draw();
  };

  /**
   * 바 위치 이동 - 속도 증가 방지 적용
   */
  private moveBar = (): void => {
    if (!this.isGameActive) return;

    this.barPosition += this.barDirection * this.barSpeed;

    // 방향 전환 시 속도 증가 플래그 초기화
    if (this.barPosition <= 5 || this.barPosition >= 95) {
      this.barDirection *= -1;
      this.speedIncreased = false; // 방향 전환 시 플래그 리셋
    }
  };

  /**
   * 히트 체크 (스페이스바 누를 때) - 정확도 개선 및 쿨다운 추가
   */
  public checkHit = (): void => {
    if (!this.isGameActive) return;

    // 연속 클릭 방지를 위한 쿨다운 체크
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime < this.clickCooldown) {
      console.log('쿨다운 중, 입력 무시');
      return; // 쿨다운 중이면 입력 무시
    }

    // 클릭 시간 저장
    this.lastClickTime = currentTime;

    // 이미 속도가 증가했다면 추가 판정 없이 리턴
    if (this.speedIncreased) {
      console.log('이미 속도 증가됨, 추가 판정 무시');
      return;
    }

    const pos = this.barPosition;

    // 정확도에 따른 점수 및 결과 표시 (판정 구간 조정)
    if (47 <= pos && pos <= 53) {
      // 더 좁은 PERFECT 구간
      // PERFECT 구간
      this.increaseDurability(10);
      this.lastHitResult = 'PERFECT';
      this.playSound('perfectHit');
    } else if ((42 <= pos && pos < 47) || (53 < pos && pos <= 58)) {
      // 더 명확한 GOOD 구간
      // GOOD 구간
      this.increaseDurability(5);
      this.lastHitResult = 'GOOD';
      this.playSound('goodHit');
    } else {
      // MISS 구간
      this.miss();
      this.lastHitResult = 'MISS';
    }

    // 성공한 판정 후 속도 증가 플래그 설정
    if (this.lastHitResult === 'PERFECT' || this.lastHitResult === 'GOOD') {
      this.speedIncreased = true;
    }
  };

  /**
   * 내구도 증가
   */
  private increaseDurability = (amount: number): void => {
    this.durability += amount;
    if (this.durability >= 100) {
      this.winGame();
    }
  };

  /**
   * 미스 처리 - 하트 소진 시 패널티
   */
  private miss = (): void => {
    this.hearts -= 1;
    this.playSound('miss');

    if (this.hearts <= 0) {
      // 하트를 모두 잃으면 내구도 크게 감소 (패널티)
      this.durability -= this.HEART_LOSS_PENALTY;
      if (this.durability < 0) this.durability = 0;

      this.loseGame();
    }
  };

  /**
   * 게임 성공
   */
  private winGame = (): void => {
    this.isGameActive = false;
    this.completeVisible = true;

    // 배경음만 정지하고 완료 효과음 재생
    this.stopBackgroundSound();
    this.playSound('complete');

    console.log('게임 성공 - 배경음 정지됨, 완료 효과음 재생');

    // 2초 후에 완료 콜백 실행
    setTimeout(() => {
      this.onComplete();
      this.close();
    }, 2000);
  };

  /**
   * 게임 실패 처리
   */
  private loseGame = (): void => {
    this.isGameActive = false;

    // 배경음만 정지하고 실패 효과음 재생
    this.stopBackgroundSound();
    this.playSound('failure');

    console.log('게임 실패 - 배경음 정지됨, 실패 효과음 재생');

    // 2초 후에 게임 재시작
    setTimeout(() => {
      this.restart();
    }, 2000);
  };

  /**
   * 게임 재시작 - 변수 초기화 추가
   */
  private restart = (): void => {
    this.hearts = 3;
    this.isGameActive = true;

    // 클릭 관련 변수 초기화
    this.lastClickTime = 0;
    this.speedIncreased = false;

    // 배경음 다시 재생
    this.playRepairSound();
  };

  /**
   * 캔버스 그리기
   */
  private draw = (): void => {
    if (!this.ctx || !this.canvas) return;

    // 캔버스 초기화
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 배경색 설정
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 상단 진행 바 (내구도) 그리기
    this.drawProgressBar();

    // 복합기 이미지 그리기 (중앙에 위치)
    this.drawCopierImage();

    // 상태 표시 텍스트 그리기 (복합기 오른쪽)
    this.drawLastHitResult();

    // 타이밍 바 그리기
    this.drawTimingBar();

    // 하트 (목숨) 그리기 (중앙)
    this.drawHearts();

    // 게임 완료 메시지
    if (this.completeVisible) {
      this.drawCompleteMessage();
    }
  };

  /**
   * 복합기 이미지 그리기
   */
  private drawCopierImage = (): void => {
    if (!this.ctx || !this.canvas) return;

    const imageSize = 150;
    const x = this.canvas.width / 2 - imageSize / 2;
    const y = 120;

    if (this.copierImage && this.copierImage.complete && this.copierImage.naturalWidth !== 0) {
      try {
        this.ctx.drawImage(this.copierImage, x, y, imageSize, imageSize);
      } catch (error) {
        this.drawFallbackCopier(x, y, imageSize);
      }
    } else {
      this.drawFallbackCopier(x, y, imageSize);
    }
  };

  /**
   * 대체 복합기 이미지 그리기
   */
  private drawFallbackCopier = (x: number, y: number, size: number): void => {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(x, y, size, size);
    this.ctx.strokeStyle = '#888';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, size, size);
  };

  /**
   * 진행 바 그리기 (내구도)
   */
  private drawProgressBar = (): void => {
    if (!this.ctx || !this.canvas) return;

    const barWidth = 500;
    const barHeight = 30;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = 50;

    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    this.ctx.fillStyle = this.PROGRESS_COLOR;
    this.ctx.fillRect(barX, barY, barWidth * (this.durability / 100), barHeight);

    this.ctx.strokeStyle = '#4caf50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);
  };

  /**
   * 타이밍 바 그리기 - 판정 구간 표시 조정
   */
  private drawTimingBar = (): void => {
    if (!this.ctx || !this.canvas) return;

    const barY = this.canvas.height - 120;
    const barHeight = 40;
    const barWidth = 500;
    const barLeft = (this.canvas.width - barWidth) / 2;

    // 바 배경
    this.ctx.fillStyle = this.NORMAL_COLOR;
    this.ctx.fillRect(barLeft, barY, barWidth, barHeight);

    // 점수 영역 표시 - 판정 구간과 일치하도록 조정
    const perfectZoneWidth = barWidth * 0.06; // 6% (47-53 구간에 해당)
    const goodZoneWidth = barWidth * 0.05; // 5% (42-47, 53-58 구간에 해당)

    // PERFECT 구간 (중앙)
    this.ctx.fillStyle = this.PERFECT_COLOR;
    const perfectZoneLeft = barLeft + barWidth / 2 - perfectZoneWidth / 2;
    this.ctx.fillRect(perfectZoneLeft, barY, perfectZoneWidth, barHeight);

    // GOOD 구간 (양쪽)
    this.ctx.fillStyle = this.GOOD_COLOR;
    this.ctx.fillRect(perfectZoneLeft - goodZoneWidth, barY, goodZoneWidth, barHeight);
    this.ctx.fillRect(perfectZoneLeft + perfectZoneWidth, barY, goodZoneWidth, barHeight);

    // 현재 위치 마커 (화살표)
    const markerPos = barLeft + (barWidth * this.barPosition) / 100;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(markerPos, barY - 10);
    this.ctx.lineTo(markerPos - 10, barY - 20);
    this.ctx.lineTo(markerPos + 10, barY - 20);
    this.ctx.closePath();
    this.ctx.fill();
  };

  /**
   * 하트 (목숨) 그리기
   */
  private drawHearts = (): void => {
    if (!this.ctx || !this.canvas || this.hearts <= 0) return;

    const heartSize = 30;
    const spacing = 40;

    const totalWidth = this.hearts * heartSize + (this.hearts - 1) * (spacing - heartSize);
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = this.canvas.height - 50;

    for (let i = 0; i < this.hearts; i++) {
      if (this.heartImage && this.heartImage.complete && this.heartImage.naturalWidth !== 0) {
        try {
          this.ctx.drawImage(this.heartImage, startX + i * spacing, startY, heartSize, heartSize);
        } catch (error) {
          this.drawFallbackHeart(startX + i * spacing, startY, heartSize);
        }
      } else {
        this.drawFallbackHeart(startX + i * spacing, startY, heartSize);
      }
    }
  };

  /**
   * 대체 하트 그래픽 그리기
   */
  private drawFallbackHeart = (x: number, y: number, size: number): void => {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(x + size / 4, y + size / 4, size / 4, 0, Math.PI * 2);
    this.ctx.arc(x + (3 * size) / 4, y + size / 4, size / 4, 0, Math.PI * 2);
    this.ctx.moveTo(x, y + size / 4);
    this.ctx.lineTo(x + size / 2, y + size);
    this.ctx.lineTo(x + size, y + size / 4);
    this.ctx.fill();
  };

  /**
   * 마지막 히트 결과 표시
   */
  private drawLastHitResult = (): void => {
    if (!this.ctx || !this.canvas || !this.lastHitResult) return;

    const imageSize = 150;
    const copierX = this.canvas.width / 2 - imageSize / 2;
    const copierY = 120;
    const textX = copierX + imageSize + 30;
    const startY = copierY + 30;

    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'left';

    const resultTexts = [
      { text: 'PERFECT', color: this.lastHitResult === 'PERFECT' ? this.PERFECT_ACTIVE_COLOR : '#666666' },
      { text: 'GOOD', color: this.lastHitResult === 'GOOD' ? this.GOOD_ACTIVE_COLOR : '#666666' },
      { text: 'MISS', color: this.lastHitResult === 'MISS' ? this.MISS_ACTIVE_COLOR : '#666666' },
    ];

    resultTexts.forEach((item, index) => {
      this.ctx!.fillStyle = item.color;
      this.ctx!.fillText(item.text, textX, startY + index * 30);
    });
  };

  /**
   * 완료 메시지 그리기
   */
  private drawCompleteMessage = (): void => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.font = 'bold 36px Arial';
    this.ctx.fillStyle = '#4caf50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
  };

  /**
   * 게임 종료 및 정리
   */
  public close = (): void => {
    this.isGameActive = false;

    // 이벤트 리스너 제거
    document.removeEventListener('keydown', this.handleKeyDown);

    // 게임 루프 정지
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }

    // 모든 사운드 정지 (닫기 버튼 클릭 시에만)
    this.stopAllSounds();

    console.log('게임 종료 - 모든 사운드 정지됨');

    // 미니게임 컨테이너 숨기기
    const container = document.getElementById('minigame-container');
    if (container) {
      container.classList.add('hidden');
      container.style.display = 'none';
      container.innerHTML = '';
    }
  };

  /**
   * 키보드 이벤트 핸들러
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' && this.isGameActive) {
      e.preventDefault();
      this.ensureAudioActivation();
      this.checkHit();
    }
  };
}

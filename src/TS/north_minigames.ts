/**
 * minigames.ts - 게임 내 미니게임 구현
 *
 * MirrorGame: 거울 닦기 미니게임
 * CopierGame: 복합기 수리 미니게임
 */
import { IMiniGame } from '../types/type';

/**
 * MirrorGame 클래스 - 거울 닦기 미니게임
 * 
 * 이 게임은 혈흔이 묻은 거울을 닦아 숨겨진 단서(314)를 찾는 미니게임입니다.
 * 마우스나 터치로 화면을 드래그하면 피가 지워지면서 거울이 드러납니다.
 */
export class MirrorGame implements IMiniGame {
  // === 캔버스 관련 변수 ===
  private mirrorCanvas: HTMLCanvasElement | null = null;  // 거울 이미지를 그릴 캔버스
  private bloodCanvas: HTMLCanvasElement | null = null;   // 피 이미지를 그릴 캔버스
  private mirrorCtx: CanvasRenderingContext2D | null = null;    // 거울 그리기 컨텍스트
  private bloodCtx: CanvasRenderingContext2D | null = null;     // 피 그리기 컨텍스트
  private containerWidth: number = 500;   // 게임 영역 너비
  private containerHeight: number = 500;  // 게임 영역 높이
  
  // === 게임 상태 변수 ===
  private isMouseDown: boolean = false;         // 마우스 클릭 중인지 여부
  private cleanedPercentage: number = 0;        // 청소 진행률 (0-100%)
  private originalBloodData: ImageData | null = null;  // 원래 피 이미지 데이터
  private brushSize: number = 20;        // 지우개 크기 (픽셀)
  private prevX: number = 0;             // 이전 마우스 X 좌표
  private prevY: number = 0;             // 이전 마우스 Y 좌표
  
  // === 오디오 관련 변수 ===
  private audioContext: AudioContext | null = null;  // 오디오 컨텍스트
  private audioBuffer: AudioBuffer | null = null;    // 로드된 효과음
  private lastSoundTime: number = 0;                 // 마지막 효과음 재생 시간
  private soundCooldown: number = 200;               // 효과음 재생 간격 (밀리초)

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
    this.bloodCtx = this.bloodCanvas.getContext('2d', { alpha: true });  // 투명도 지원

    // 4. 캔버스 위치 설정 (겹치도록)
    this.mirrorCanvas.style.position = 'absolute';
    this.mirrorCanvas.style.top = '0';
    this.mirrorCanvas.style.left = '0';

    this.bloodCanvas.style.position = 'absolute';
    this.bloodCanvas.style.top = '0';
    this.bloodCanvas.style.left = '0';
    this.bloodCanvas.style.pointerEvents = 'auto';  // 마우스 이벤트 활성화
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
    const mirrorImg = new Image();  // 거울 이미지 객체
    const bloodImg = new Image();   // 피 이미지 객체

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
        const scale = 1.6;  // 1.6배 크기로 확대
        const scaledWidth = this.containerWidth * scale;
        const scaledHeight = this.containerHeight * scale;
        const offsetX = (this.containerWidth - scaledWidth) / 2;  // 중앙 정렬
        const offsetY = (this.containerHeight - scaledHeight) / 2;

        // 피 이미지 그리기
        this.bloodCtx.drawImage(bloodImg, offsetX, offsetY, scaledWidth, scaledHeight);
        
        // 원본 피 이미지 데이터 저장 (나중에 청소 진행률 계산에 사용)
        this.originalBloodData = this.bloodCtx.getImageData(
          0, 0, this.containerWidth, this.containerHeight
        );
      }
    };

    // 이미지 로드 오류 시 대체 이미지 표시
    mirrorImg.onerror = () => this.createFallbackImage('mirror');
    bloodImg.onerror = () => this.createFallbackImage('blood');

    // 이미지 로드 시작
    mirrorImg.src = '../assets/img/mirror.png';
    bloodImg.src = '../assets/img/blood.png';
  };

  /**
   * 이미지 로드 실패 시 대체 이미지 생성
   */
  private createFallbackImage = (type: 'mirror' | 'blood'): void => {
    console.error(`${type} 이미지 로드 실패, 대체 이미지 생성`);
    
    if (type === 'mirror' && this.mirrorCtx) {
      // 거울 대체 이미지 - 숫자 314가 보이는 회색 배경
      this.mirrorCtx.fillStyle = '#333';  // 어두운 회색
      this.mirrorCtx.fillRect(0, 0, this.containerWidth, this.containerHeight);
      this.mirrorCtx.fillStyle = '#fff';  // 흰색 텍스트
      this.mirrorCtx.font = '48px Arial';
      this.mirrorCtx.textAlign = 'center';
      this.mirrorCtx.fillText('314', this.containerWidth/2, this.containerHeight/2);
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
      const possiblePaths = [
        './assets/audio/cleaning_sound.mp3',
        '../assets/audio/cleaning_sound.mp3',
        '/assets/audio/cleaning_sound.mp3',
        './public/effectSound/mirror_swipe.mp3',
        '../public/effectSound/mirror_swipe.mp3',
        '/public/effectSound/mirror_swipe.mp3'
      ];
      
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
            break;  // 성공했으므로 반복 중단
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
    title.textContent = '피 묻은 거울 닦기';

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
    closeButton.className = 'px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded';
    closeButton.textContent = '닫기';
    closeButton.onclick = this.close;

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
    if (!this.isMouseDown) return;  // 마우스 버튼이 눌려있지 않으면 무시
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
    e.preventDefault();  // 화면 스크롤 방지
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
    this.bloodCtx.lineCap = 'round';  // 선 끝이 둥글게
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
      gainNode.gain.value = 0.5;  // 볼륨 50%
      
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

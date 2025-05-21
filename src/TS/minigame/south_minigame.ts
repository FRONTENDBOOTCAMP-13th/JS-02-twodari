import { IMiniGame } from '../../types/type.ts';

export class PuzzleGame {
  private container: HTMLElement | null = null;
  private puzzleGrid: HTMLDivElement | null = null;
  private pieces: HTMLDivElement[] = [];
  private readonly size = 3; // 3x3
  private backgroundImageUrl = '/assets/img/puzzle.svg';

  constructor(private onComplete?: () => void) {}

  public initialize(): void {
    // 컨테이너는 생성만 하고 표시하지 않음
    this.createUI();

    // 초기화 후 컨테이너 숨기기
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  // start 메서드에서만 컨테이너를 표시
  public start(): void {
    if (!this.container) this.createUI();
    if (this.container) {
      this.container.classList.remove('hidden');
    }
    this.resetPuzzle();
    this.addCloseButton(); // 닫기 버튼 추가
  }

  public close(): void {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  private createUI(): void {
    const target = document.getElementById('minigame-container');
    if (!target) return;

    this.container = target;
    this.container.innerHTML = '';
    this.container.className = 'flex items-center justify-center p-4 bg-black/30 fixed inset-0 z-50'; // 배경 어둡게
    this.puzzleGrid = document.createElement('div');
    this.puzzleGrid.className = 'grid gap-1 bg-white border-4 border-yellow-800 rounded-md shadow-lg';
    this.puzzleGrid.style.gridTemplateColumns = `repeat(${this.size}, 100px)`;
    this.puzzleGrid.style.gridTemplateRows = `repeat(${this.size}, 100px)`;

    this.container.appendChild(this.puzzleGrid);
    this.createPieces();
  }

  private resetPuzzle(): void {
    // 기존 조각 제거 및 새로 생성
    this.pieces = [];
    if (this.puzzleGrid) {
      this.puzzleGrid.innerHTML = '';
      this.createPieces();
    }
  }

  private createPieces(): void {
    const total = this.size * this.size;
    const shuffled = [...Array(total).keys()].sort(() => Math.random() - 0.5);

    shuffled.forEach((originalIndex, i) => {
      const piece = document.createElement('div');
      piece.className = 'w-[100px] h-[100px] border border-gray-300 bg-cover bg-center transition-all duration-150';
      piece.draggable = true;

      const row = Math.floor(originalIndex / this.size);
      const col = originalIndex % this.size;
      piece.style.backgroundImage = `url('${this.backgroundImageUrl}')`;
      piece.style.backgroundPosition = `${-col * 100}px ${-row * 100}px`;

      piece.dataset.originalIndex = originalIndex.toString();
      piece.dataset.currentIndex = i.toString();

      this.addDragEvents(piece);
      this.pieces.push(piece);
      this.puzzleGrid!.appendChild(piece);
    });
  }

  private addDragEvents(piece: HTMLDivElement) {
    piece.addEventListener('dragstart', e => {
      e.dataTransfer?.setData('text/plain', piece.dataset.currentIndex || '');
      piece.classList.add('ring', 'ring-blue-400');
    });

    piece.addEventListener('dragend', () => {
      piece.classList.remove('ring', 'ring-blue-400');
    });

    piece.addEventListener('dragover', e => e.preventDefault());

    piece.addEventListener('drop', e => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer?.getData('text/plain') || '');
      const toIndex = parseInt(piece.dataset.currentIndex || '');

      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        // swap 배열
        [this.pieces[fromIndex], this.pieces[toIndex]] = [this.pieces[toIndex], this.pieces[fromIndex]];

        // currentIndex 갱신
        this.pieces[fromIndex].dataset.currentIndex = fromIndex.toString();
        this.pieces[toIndex].dataset.currentIndex = toIndex.toString();

        // DOM을 배열 순서대로 다시 렌더링
        this.puzzleGrid!.innerHTML = '';
        this.pieces.forEach(piece => this.puzzleGrid!.appendChild(piece));

        this.checkCompletion();
      }
    });
  }

  private checkCompletion() {
    const isSolved = this.pieces.every((piece, idx) => {
      return piece.dataset.originalIndex === idx.toString();
    });

    if (isSolved) {
      this.puzzleGrid?.classList.add('border-green-500');

      // 닫기 버튼 제거
      const closeBtn = this.container?.querySelector('#puzzle-close-btn');
      if (closeBtn) closeBtn.remove();

      this.showCompletionMessage(); // 성공 문구 먼저 표시

      setTimeout(() => {
        this.onComplete?.();
        this.close();
      }, 1700); // 1.7초 후 닫기
    }
  }

  private addCloseButton() {
    if (this.container?.querySelector('#puzzle-close-btn')) return;
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'puzzle-close-btn'; // id 추가
    closeBtn.textContent = '닫기';
    closeBtn.className = 'absolute bottom-4 bg-red-500 text-white px-4 py-2 rounded';
    closeBtn.addEventListener('click', () => {
      console.log('퍼즐 닫기 버튼 클릭');
      this.close();
    });
    if (this.container) {
      this.container.appendChild(closeBtn);
    }
  }

  private showCompletionMessage(): void {
    if (!this.container) return;

    // 이미 메시지가 있으면 중복 추가하지 않음
    if (this.container.querySelector('.puzzle-complete-message')) return;

    const message = document.createElement('div');
    message.textContent = 'COMPLETE!';
    message.className = 'puzzle-complete-message absolute text-green-500 text-5xl font-bold px-6 py-3 rounded-lg';
    message.style.cssText += `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
      -webkit-text-stroke: 1px white; /* 흰 테두리 */
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 그림자 효과 */`;

    this.container.appendChild(message);

    // 메시지 자동 제거
    setTimeout(() => {
      message.remove();
    }, 1500);
  }
}

// // 퍼즐게임 테스트
// // 퍼즐 완성 후 실행할 콜백 함수(선택)
// function onPuzzleComplete() {
//   // 예: 남쪽방 클리어 처리 등
//   console.log('퍼즐 완성!');
// }

// // 퍼즐 인스턴스 생성
// const puzzleGame = new PuzzleGame(onPuzzleComplete);

// // 퍼즐 UI 초기화(최초 1회)
// puzzleGame.initialize();

// // 퍼즐 시작(보이게 함)
// puzzleGame.start();

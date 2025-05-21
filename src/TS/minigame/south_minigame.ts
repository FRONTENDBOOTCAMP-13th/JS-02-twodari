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
    const target = document.getElementById('minigame-container');
    if (target) {
      target.classList.add('hidden');
    }
  }

  // start 메서드에서만 컨테이너를 표시
  public start(): void {
    const target = document.getElementById('minigame-container');
    if (target) {
      target.classList.remove('hidden');
    }
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
    this.container.classList.remove('hidden');
    this.container.classList.add('flex', 'items-center', 'justify-center', 'p-4');

    this.puzzleGrid = document.createElement('div');
    this.puzzleGrid.className = 'grid gap-1 bg-white border-4 border-yellow-800 rounded-md shadow-lg';
    this.puzzleGrid.style.gridTemplateColumns = `repeat(${this.size}, 100px)`;
    this.puzzleGrid.style.gridTemplateRows = `repeat(${this.size}, 100px)`;

    this.container.appendChild(this.puzzleGrid);
    this.createPieces();
  }

  private createPieces(): void {
    const total = this.size * this.size;
    const shuffled = [...Array(total).keys()].sort(() => Math.random() - 0.5);

    shuffled.forEach((originalIndex, i) => {
      const piece = document.createElement('div');
      piece.className = 'w-[100px] h-[100px] border border-gray-300 bg-cover bg-center';
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
        const fromPiece = this.pieces[fromIndex];
        const toPiece = this.pieces[toIndex];

        const fromClone = fromPiece.cloneNode(true) as HTMLDivElement;
        const toClone = toPiece.cloneNode(true) as HTMLDivElement;

        this.puzzleGrid!.replaceChild(toClone, fromPiece);
        this.puzzleGrid!.replaceChild(fromClone, toPiece);

        this.pieces[fromIndex] = toClone;
        this.pieces[toIndex] = fromClone;

        toClone.dataset.currentIndex = fromIndex.toString();
        fromClone.dataset.currentIndex = toIndex.toString();

        this.addDragEvents(fromClone);
        this.addDragEvents(toClone);

        this.checkCompletion();
      }
    });
  }

  private checkCompletion() {
    const isSolved = this.pieces.every((piece, idx) => {
      return piece.dataset.originalIndex === idx.toString();
    });

    if (isSolved) {
      alert('퍼즐 완성!');
      this.onComplete?.();
    }
  }
}

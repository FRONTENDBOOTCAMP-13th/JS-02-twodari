import { IMiniGame } from '../../types/type.ts';

export class WhiteBoardGame implements IMiniGame {
  private boardElement: HTMLDialogElement;

  constructor() {
    this.boardElement = this.createBoard();
  }

  public initialize(): void {
    console.log('미니게임 초기화');
  }

  public start() {
    this.createBoard();
    this.openBoard();
  }

  public close() {}

  //화이트 보드 생성
  private createBoard(): HTMLDialogElement {
    const whiteboard = document.createElement('dialog');
    whiteboard.className = 'white-board-style';

    const boardContainer = document.createElement('div');
    boardContainer.className = 'w-full h-full';
    whiteboard.appendChild(boardContainer);

    const boardImg = document.createElement('img');
    boardImg.className = 'w-full h-full';
    boardImg.src = '/assets/img/white_board.webp';
    boardImg.alt = '화이트 보드 이미지';

    boardContainer.appendChild(boardImg);

    const textField = document.createElement('div');
    textField.className = 'absolute left-[100px] bottom-[70px] flex justify-center items-center gap-4';
    boardContainer.appendChild(textField);

    const boardLabel = document.createElement('label');
    boardLabel.className = 'text-[#980000] font-bold text-lg';
    boardLabel.textContent = '범인은 누구일까? 사번 + 생일 =';

    const boardInput = document.createElement('input');
    boardInput.placeholder = '정답을 입력하세요';

    boardInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.handleInput(boardInput.value);
        boardInput.value = '';
      }
    });

    const sendBtn = document.createElement('button');
    sendBtn.className = 'w-10 h-8 rounded text-[#980000] font-bold text-lg';
    sendBtn.textContent = '입력';

    sendBtn.addEventListener('click', () => {
      this.handleInput(boardInput.value);
      boardInput.value = '';
    });

    textField.appendChild(boardLabel);
    textField.appendChild(boardInput);
    textField.appendChild(sendBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.className = 'absolute w-10 h-10 ml-125 border-4 top-4 right-4 rounded-2xl border-[#464646] bg-[#ff3b3b] text-white';
    closeBtn.addEventListener('click', () => {
      this.closeBoard();
    });

    whiteboard.appendChild(closeBtn);

    return whiteboard;
  }

  public openBoard() {
    this.boardElement.showModal();
  }

  public closeBoard() {
    this.boardElement.close();
  }

  private handleInput(value: any) {
    if (value == 2239) {
      //트루 엔딩으로 가는 로직
      console.log('가자 트루엔딩');
    } else {
      //노말 엔딩으로 가는 로직
      console.log('넌 노말이야');
    }
  }
  public getBoardElement() {
    return this.boardElement;
  }
}

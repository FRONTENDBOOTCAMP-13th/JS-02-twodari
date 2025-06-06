import { IRoom, IInventoryItem } from '../../../types/type.ts';
import itemManagerInstance from '../../../utils/itemManagerInstance.ts';
import { CreateSearchBtn } from '../../components/createSearchBtn.ts';
import { WhiteBoardGame } from '../../minigame/east_minigames.ts';
import { EscapeCodeGame } from '../../minigame/east_escapeCode.ts';

export class EastRoom implements IRoom {
  private whiteBoardGame: WhiteBoardGame;
  private EscapeCodeGame: EscapeCodeGame;

  constructor() {
    this.whiteBoardGame = new WhiteBoardGame();
    this.EscapeCodeGame = new EscapeCodeGame();

    //인벤토리에 DOM 있는지 체크
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }
  }

  initialize(): void {
    console.log('동쪽 방 초기화');
  }

  render(): void {
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/east_background.webp')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }
    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) return;
    btnBox.innerHTML = '';

    if (!document.body.contains(this.whiteBoardGame.getBoardElement())) {
      document.body.appendChild(this.whiteBoardGame.getBoardElement());
    }
    if (!document.body.contains(this.EscapeCodeGame.getBoardElement())) {
      document.body.appendChild(this.EscapeCodeGame.getBoardElement());
    }

    //화분에서 아이템 얻기
    const vessleClueBtn = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '고양이 퍼즐 획득',
      position: { top: '75%', left: '12%' },
      id: 'search-puzzle',
      type: 'clue',
      clueImgSrc: '/assets/img/cat_puzzle.webp',
      clueMessage: '고양이 퍼즐을(를) 획득했다.',
      emptyMessage: '여기는 이제 아무것도 없다.',
      itemInfo: {
        id: 'Piece',
        name: '퍼즐',
        description: '(장소) 에서 발견한 (단서). 어딘가에 쓰일 것 같다.',
        image: '/assets/img/cat_puzzle.webp',
        isSelected: false,
      },
      onFound: (item: IInventoryItem) => {
        itemManagerInstance.addItem(item);
      },
    });

    //화이트보드 게임
    const whiteBoardGameBtn = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '화이틑보드 게임 실행', //게임 실행 대체 텍스트
      position: { top: '35%', left: '35%' }, //단서 찾기 버튼 위치
      id: 'board-game-btn', //단서 찾기 버튼 ID
      type: 'game', //단서 타입('clue' or 'game')
      gameCallback: () => {
        this.whiteBoardGame.start();
        this.whiteBoardGame.onSubmit = result => {
          this.EscapeCodeGame.setTrueEnddingCode(result);
        };
      },
    });

    //탈출 번호 입력
    const escapeGameBtn = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '탈출 비밀번호 실행', //게임 실행 대체 텍스트
      position: { top: '50%', left: '60%' }, //단서 찾기 버튼 위치
      id: 'last-game-btn', //단서 찾기 버튼 ID
      type: 'game', //단서 타입('clue' or 'game')
      gameCallback: () => {
        this.EscapeCodeGame.start();
      },
    });

    vessleClueBtn.appendTo(btnBox);
    whiteBoardGameBtn.appendTo(btnBox);
    escapeGameBtn.appendTo(btnBox);
  }

  cleanup(): void {
    console.log('동쪽 방 정리됨');
  }
}

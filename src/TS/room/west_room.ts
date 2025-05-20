import { IRoom, IInventoryItem } from '../../types/type.ts';
import { CodeGame } from './../minigame/west_minigame.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import ItemManager from '../../utils/itemManager.ts';

export class WestRoom implements IRoom {
  private visited = false;
  private game: CodeGame;
  private itemManager = new ItemManager();

  constructor() {
    this.game = new CodeGame(() => {
      console.log('코드 미니게임 해결');
    });
    this.itemManager.appendTo(document.body);
  }

  //방 초기화
  initialize(): void {
    console.log('서쪽 방 초기화');
    this.game.initialize();
  }

  render(): void {
    //방 그리기
    this.visited = true;

    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/west_background.jpg')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) return;
    btnBox.innerHTML = '';

    //첫번째 찾기 버튼 (단서1)
    const searchButton1 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '쓰레기통 단서 찾기', //단서 찾기 대체 텍스트
      position: { top: '30%', left: '10%' }, //단서 찾기 버튼 위치
      id: 'search-btn-1', //단서 찾기 버튼 ID
      type: 'clue', //단서 타입('clue' or 'game')
      clueImgSrc: '/src/assets/img/clue_1.png', //단서 이미지 경로
      clueMessage: '단서1 을(를) 획득했다.', //단서 있을 때 메시지
      itemInfo: {
        //IInventoryItem
        id: 'clue-1',
        name: '단서 1',
        description: '(장소) 에서 발견한 (단서). 어딘가에 쓰일 것 같다.',
        image: '/src/assets/img/clue_1.png',
      },
      onFound: (item: IInventoryItem) => {
        this.itemManager.addItem(item);
      },
    });

    //두번째 찾기 버튼 (2번째 단서)
    const searchButton2 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '쓰레기통 단서 찾기', //단서 찾기 대체 텍스트
      position: { top: '20%', left: '20%' }, //단서 찾기 버튼 위치
      id: 'search-btn-2', //단서 찾기 버튼 ID
      type: 'clue', //단서 타입('clue' or 'game')
      clueImgSrc: '/src/assets/img/clue_3.png', //단서 이미지 경로
      clueMessage: '단서2 을(를) 획득했다.', //단서 있을 때 메시지
      itemInfo: {
        //IInventoryItem
        id: 'clue-2',
        name: '단서 2',
        description: '(장소) 에서 발견한 (단서). 어딘가에 쓰일 것 같다.',
        image: '/src/assets/img/clue_3.png',
      },
      onFound: (item: IInventoryItem) => {
        this.itemManager.addItem(item);
      },
    });

    //세번째 찾기 버튼 (단서 없을때, 단서 이미 찾은 경우)
    const searchButton3 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '쓰레기통 단서 찾기', //단서 찾기 대체 텍스트
      position: { top: '70%', left: '70%' }, //단서 찾기 버튼 위치
      id: 'search-btn-3', //단서 찾기 버튼 ID
      type: 'clue', //단서 타입('clue' or 'game')
      clueImgSrc: '', //단서 이미지 경로
      emptyMessage: '아무것도 없는 듯 하다.', //단서 없을 때 메시지
    });

    //네번째 찾기 버튼 (게임 버튼)
    const searchButton4 = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg', //단서 찾기 아이콘
      altText: '코드 게임 실행', //게임 실행 대체 텍스트
      position: { top: '90%', left: '90%' }, //단서 찾기 버튼 위치
      id: 'west-game-btn', //단서 찾기 버튼 ID
      type: 'game', //단서 타입('clue' or 'game')
      gameCallback: () => {
        this.game.start();
      },
    });

    // DOM에 추가
    searchButton1.appendTo(btnBox);
    searchButton2.appendTo(btnBox);
    searchButton3.appendTo(btnBox);
    searchButton4.appendTo(btnBox);
  }

  //방 없애기
  cleanup(): void {
    console.log('서쪽 방 정리됨');
    this.game.close();
  }
}

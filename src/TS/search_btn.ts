import { CreateSearchBtn } from '../utils/createSearchBtn';
import type { IInventoryItem } from '../types/type';
import ItemManager from '../utils/itemManager.ts';

const searchButtonBox = document.getElementById('search-btn-box');
const itemManager = new ItemManager();
// itemManager.appendTo(document.body);

if (searchButtonBox) {
  //첫번째 찾기 버튼 (1번째 단서)
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
      itemManager.addItem(item);
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
      itemManager.addItem(item);
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
    altText: '쓰레기통 단서 찾기', //단서 찾기 대체 텍스트
    position: { top: '90%', left: '90%' }, //단서 찾기 버튼 위치
    id: 'search-btn-4', //단서 찾기 버튼 ID
    type: 'game', //단서 타입('clue' or 'game')
    // gameCallback: () => {
    //   startGame(); //게임 실행 함수
    // },
  });

  searchButton1.appendTo(searchButtonBox);
  searchButton2.appendTo(searchButtonBox);
  searchButton3.appendTo(searchButtonBox);
  searchButton4.appendTo(searchButtonBox);
}

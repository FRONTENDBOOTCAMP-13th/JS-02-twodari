import { IRoom, IInventoryItem } from '../../types/type.ts';
import { MirrorGame, CopierGame } from './../minigame/north_minigames.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import { showCluePopup } from '../../utils/showCluePopup.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts';

export class NorthRoom implements IRoom {
  private visited = false;
  private mirrorGame: MirrorGame;
  private copierGame: CopierGame;

  // 정적 변수로 상태 유지 (클래스 레벨에서 공유)
  private static towelCollected = false;
  private static mirrorCompleted = false;
  private static copierCompleted = false;

  constructor() {
    console.log('NorthRoom 생성자 실행');

    // 거울 미니게임 초기화
    this.mirrorGame = new MirrorGame(() => {
      console.log('거울 미니게임 해결');
      NorthRoom.mirrorCompleted = true;

      // 미니게임 성공 후 팝업 표시
      showCluePopup({
        clueImgSrc: '/src/assets/img/mirror.webp',
        message: '거울에 숫자 "314"가 흐릿하게 써있다. 어디에 쓰는 번호지?.',
      });
    });

    // 복합기 미니게임 초기화 - 수정된 부분
    this.copierGame = new CopierGame(() => {
      console.log('복합기 미니게임 해결');
      NorthRoom.copierCompleted = true;

      // 아이템 추가 대신 단순히 단서 이미지와 메시지만 표시
      showCluePopup({
        clueImgSrc: '/src/assets/img/clue_copier.webp',
        message: '복합기를 수리했더니, 종이 한 장이 출력되었다.',
      });
    });
  }

  // 방 초기화
  initialize(): void {
    console.log('북쪽 방 초기화');
    this.mirrorGame.initialize();
    this.copierGame.initialize();

    // minigame-container 확인
    if (!document.getElementById('minigame-container')) {
      console.warn('minigame-container가 없습니다. 미니게임이 제대로 표시되지 않을 수 있습니다.');
    }
  }

  // 방 렌더링
  render(): void {
    console.log('NorthRoom render 실행');
    this.visited = true;

    // 배경 이미지 설정
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/src/assets/img/background_north.webp')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    // 검색 버튼 컨테이너 초기화
    const btnBox = document.getElementById('search-btn-box');
    if (!btnBox) {
      console.error('search-btn-box를 찾을 수 없습니다');
      return;
    }
    btnBox.innerHTML = '';

    // === 인벤토리 아이템 체크 함수 ===
    const hasItemInInventory = (itemId: string): boolean => {
      if (typeof itemManagerInstance.checkItem === 'function') {
        return itemManagerInstance.checkItem(itemId);
      }
      return false;
    };

    // 1. 거울 검색 버튼
    const mirrorButton = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '거울 조사하기',
      position: { top: '40%', left: '80%' },
      id: 'search-mirror',
      type: 'game',
      gameCallback: () => {
        console.log('거울 영역 클릭됨');

        // 타월 확인
        const hasTowel = hasItemInInventory('towel');
        console.log('타월 소유 여부:', hasTowel);

        if (NorthRoom.mirrorCompleted) {
          showCluePopup({
            clueImgSrc: '/src/assets/img/mirror.webp',
            message: '거울에 숫자 "314"가 흐릿하게 써있다. 이미 확인했다.',
          });
        } else if (hasTowel) {
          console.log('타월로 거울 닦기 시작');
          this.mirrorGame.start();
        } else {
          showCluePopup({
            message: '거울이 더럽다. 타월로 닦아야 뭔가 보일 것 같다.',
          });
        }
      },
    });

    // 2. 복합기 검색 버튼 - 수정된 부분
    const copierButton = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '복합기 조사하기',
      position: { top: '50%', left: '45%' },
      id: 'search-copier',
      type: 'game',
      gameCallback: () => {
        console.log('복합기 영역 클릭됨');

        // 렌치 확인
        const hasWrench = hasItemInInventory('wrench');
        console.log('렌치 소유 여부:', hasWrench);

        if (NorthRoom.copierCompleted) {
          // 이미 완료했을 때 거울과 동일하게 단서 이미지와 메시지 표시
          showCluePopup({
            clueImgSrc: '/src/assets/img/clue_copier.webp',
            message: '복합기를 수리했다. 중요한 단서를 발견했다.',
          });
        } else if (hasWrench) {
          this.copierGame.start();
        } else {
          showCluePopup({
            message: '복합기가 고장나 있다. 렌치가 필요할 것 같다.',
          });
        }
      },
    });

    // 3. 쓰레기통 검색 버튼 - 정적 변수로 상태 확인
    const trashButton = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '쓰레기통 조사하기',
      position: { top: '75%', left: '15%' },
      id: 'search-trash',
      type: 'clue',
      clueImgSrc: NorthRoom.towelCollected ? '' : '/src/assets/img/towel.webp',
      clueMessage: NorthRoom.towelCollected ? '이미 쓰레기통을 살펴봤다. 더 이상 볼 것이 없다.' : '쓰레기통에서 타월을 발견했다.',
      itemInfo: NorthRoom.towelCollected
        ? undefined
        : {
            id: 'towel',
            name: '타월',
            description: '쓰레기통에서 발견한 타월. 거울을 닦는데 사용할 수 있을 것 같다.',
            image: '/src/assets/img/towel.webp',
            isSelected: false,
          },
      onFound: (item: IInventoryItem) => {
        if (!NorthRoom.towelCollected) {
          itemManagerInstance.addItem(item);
          NorthRoom.towelCollected = true;
        }
      },
    });

    // 4. test 버튼 (렌치 테스트용)
    const test = new CreateSearchBtn({
      iconSrc: '/src/assets/icon/search.svg',
      altText: '쓰레기통 조사하기',
      position: { top: '15%', left: '35%' },
      id: 'search-trash',
      type: 'clue',
      clueImgSrc: '/src/assets/img/wrench.webp',
      clueMessage: '렌치다.',
      itemInfo: {
        id: 'wrench',
        name: '렌치',
        description: '렌치다.',
        image: '/src/assets/img/wrench.webp',
        isSelected: false,
      },
      onFound: (item: IInventoryItem) => {
        itemManagerInstance.addItem(item);
      },
    });

    // DOM에 버튼 추가
    mirrorButton.appendTo(btnBox);
    copierButton.appendTo(btnBox);
    trashButton.appendTo(btnBox);
    test.appendTo(btnBox);

    console.log('버튼 추가 완료');
  }

  // 방 정리
  cleanup(): void {
    console.log('북쪽 방 정리됨');
    this.mirrorGame.close();
    this.copierGame.close();
  }
}

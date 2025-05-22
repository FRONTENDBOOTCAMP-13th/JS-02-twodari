import { IRoom, IInventoryItem } from '../../types/type.ts';
import { MirrorGame, CopierGame } from './../minigame/north_minigames.ts';
import { CreateSearchBtn } from '../../utils/createSearchBtn.ts';
import { showCluePopup } from '../../utils/showCluePopup.ts';
import itemManagerInstance from '../../utils/itemManagerInstance.ts';

export class NorthRoom implements IRoom {
  private mirrorGame: MirrorGame;
  private copierGame: CopierGame;

  private towelCollected = false;
  private mirrorCompleted = false;
  private copierCompleted = false;

  constructor() {
    console.log('NorthRoom 생성자 실행');

    // 인벤토리가 이미 DOM에 있는지 확인 후 추가
    if (!document.querySelector('.inventory-style')) {
      itemManagerInstance.appendTo(document.body);
    }

    this.checkTowelStatus();

    // 거울 미니게임 초기화
    this.mirrorGame = new MirrorGame(() => {
      console.log('거울 미니게임 해결');
      this.mirrorCompleted = true;
      sessionStorage.setItem('north_mirror_completed', 'true');

      showCluePopup({
        clueImgSrc: '/assets/img/mirror.webp',
        message: '거울에 숫자 "314"가 쓰여있다. 어디에 쓰이는 숫자일까?',
      });
    });

    // 복합기 미니게임 초기화
    this.copierGame = new CopierGame(() => {
      console.log('복합기 미니게임 해결');
      this.copierCompleted = true;
      sessionStorage.setItem('north_copier_completed', 'true');

      showCluePopup({
        clueImgSrc: '/assets/img/clue_copier.webp',
        message: '복합기를 수리했다. 중요한 단서를 발견했다.',
      });
    });
  }

  // 타월 상태 체크
  private checkTowelStatus(): void {
    console.log('타월 상태 체크 중...');

    // 인벤토리에서만 확인
    let hasItemInInventory = false;
    if (typeof itemManagerInstance.checkItem === 'function') {
      hasItemInInventory = itemManagerInstance.checkItem('towel');
      console.log('인벤토리 타월 상태:', hasItemInInventory);
    }

    // 인벤토리 상태만 반영
    this.towelCollected = hasItemInInventory;
    console.log('최종 타월 소유 상태:', this.towelCollected);
  }

  initialize(): void {
    console.log('북쪽 방 초기화');

    // 상태 확인 - 인벤토리만 체크
    this.checkTowelStatus();

    this.mirrorCompleted = sessionStorage.getItem('north_mirror_completed') === 'true';
    this.copierCompleted = sessionStorage.getItem('north_copier_completed') === 'true';

    this.mirrorGame.initialize();
    this.copierGame.initialize();
  }

  render(): void {
    console.log('NorthRoom render 실행');

    // 렌더링 시 타월 상태 확인
    this.checkTowelStatus();
    console.log('쓰레기통 상태:', this.towelCollected ? '이미 수집됨' : '아직 미수집');

    // 배경 이미지 설정
    const bg = document.getElementById('room-background');
    if (bg) {
      bg.style.backgroundImage = `url('/assets/img/background_north.webp')`;
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

    // 거울 검색 버튼
    const mirrorButton = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '거울 조사하기',
      position: { top: '45%', left: '80%' },
      id: 'search-mirror',
      type: 'game',
      gameCallback: () => {
        console.log('거울 영역 클릭됨');

        // 클릭 시점에 타월 상태 다시 확인
        this.checkTowelStatus();
        console.log('타월 소유 여부 (거울 클릭 시):', this.towelCollected);

        if (this.mirrorCompleted) {
          showCluePopup({
            clueImgSrc: '/assets/img/mirror.webp',
            message: '거울에 숫자 "314"가 쓰여있다.',
          });
        } else if (this.towelCollected) {
          console.log('타월로 거울 닦기 시작');
          this.mirrorGame.start();
        } else {
          showCluePopup({
            message: '거울에 피가 부자연스럽게 묻어있다. 하지만 맨 손으로 닦을 수는 없는데...',
          });
        }
      },
    });

    // 2. 복합기 검색 버튼
    const copierButton = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '복합기 조사하기',
      position: { top: '50%', left: '47%' },
      id: 'search-copier',
      type: 'game',
      gameCallback: () => {
        console.log('복합기 영역 클릭됨');

        // 렌치 확인
        const hasWrench = itemManagerInstance.checkItem?.('wrench') || false;
        console.log('렌치 소유 여부:', hasWrench);

        if (this.copierCompleted) {
          showCluePopup({
            clueImgSrc: '/assets/img/clue_copier.webp',
            message: '[경영지원팀 : 사내 10월 이달의 생일자] 안내문이 출력되었다.',
          });
        } else if (hasWrench) {
          this.copierGame.start();
        } else {
          showCluePopup({
            message: '무언가 출력되다 멈춘 복합기다. 고치면 전부 출력될까?',
          });
        }
      },
    });

    // 쓰레기통 검색 버튼 - 무조건 표시하되 획득 후에만 제거하도록
    if (!this.towelCollected) {
      console.log('쓰레기통 버튼 렌더링 중...');
      const trashButton = new CreateSearchBtn({
        iconSrc: '/assets/icon/search.svg',
        altText: '쓰레기통 조사하기',
        position: { top: '72%', left: '11%' },
        id: 'search-trash',
        type: 'clue',
        clueImgSrc: '/assets/img/towel.webp',
        clueMessage: '쓰다 버린 수건같다. 무언가를 닦는데 사용할 수 있을까?',
        itemInfo: {
          id: 'towel',
          name: '수건',
          description: '쓰레기통에서 발견한 수건이다.',
          image: '/assets/img/towel.webp',
          isSelected: false,
        },
        onFound: (item: IInventoryItem) => {
          console.log('수건 발견됨, 인벤토리에 추가 중...');

          // 인벤토리에 아이템 추가
          itemManagerInstance.addItem(item);

          // 상태 업데이트 - 세션 스토리지는 사용하지 않음
          this.towelCollected = true;

          // 버튼 제거
          const trashBtn = document.getElementById('search-trash');
          if (trashBtn && btnBox) {
            btnBox.removeChild(trashBtn);
          }

          // 상태 재확인
          this.checkTowelStatus();
        },
      });

      trashButton.appendTo(btnBox);
    }

    // DOM에 버튼 추가
    mirrorButton.appendTo(btnBox);
    copierButton.appendTo(btnBox);

    console.log('버튼 추가 완료');
  }

  cleanup(): void {
    console.log('북쪽 방 정리됨');
    this.mirrorGame.close();
    this.copierGame.close();
  }
}

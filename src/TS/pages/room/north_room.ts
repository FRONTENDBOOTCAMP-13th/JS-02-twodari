import { IRoom, IInventoryItem } from '../../../types/type.ts';
import { MirrorGame, CopierGame } from '../../minigame/north_minigames.ts';
import { CreateSearchBtn } from '../../components/createSearchBtn.ts';
import { showCluePopup } from '../../../utils/showCluePopup.ts';
import itemManagerInstance from '../../../utils/itemManagerInstance.ts';

// 전역 객체로 방 이동 간 상태 보존 (새로고침 시 초기화됨)
const NorthRoomState = {
  mirrorCompleted: false,
  copierCompleted: false,
};

export class NorthRoom implements IRoom {
  private mirrorGame: MirrorGame;
  private copierGame: CopierGame;

  private towelCollected = false;
  // 인스턴스 변수로 관리 (전역 객체 참조)
  private get mirrorCompleted(): boolean {
    return NorthRoomState.mirrorCompleted;
  }
  private set mirrorCompleted(value: boolean) {
    NorthRoomState.mirrorCompleted = value;
  }

  private get copierCompleted(): boolean {
    return NorthRoomState.copierCompleted;
  }
  private set copierCompleted(value: boolean) {
    NorthRoomState.copierCompleted = value;
  }

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
      this.mirrorCompleted = true; // 전역 객체 업데이트

      showCluePopup({
        clueImgSrc: '/assets/img/mirror.webp',
        message: '거울에 숫자 "314"가 쓰여있다. 어디에 쓰이는 숫자일까?',
      });
    });

    // 복합기 미니게임 초기화
    this.copierGame = new CopierGame(() => {
      console.log('복합기 미니게임 해결');
      this.copierCompleted = true; // 전역 객체 업데이트

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

    // 미니게임 상태는 전역 객체에서 이미 관리되고 있음
    // 새로고침 시 자동으로 초기화되므로 별도 초기화 코드 불필요

    this.mirrorGame.initialize();
    this.copierGame.initialize();

    // 디버깅용 로그
    console.log('거울 미니게임 상태:', this.mirrorCompleted ? '완료' : '미완료');
    console.log('복합기 미니게임 상태:', this.copierCompleted ? '완료' : '미완료');
  }

  render(): void {
    // 기존 렌더링 코드 유지...
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

    // 3. 쓰레기통 검색 버튼
    const trashButton = new CreateSearchBtn({
      iconSrc: '/assets/icon/search.svg',
      altText: '쓰레기통 조사하기',
      position: { top: '72%', left: '11%' },
      id: 'search-trash',
      type: 'clue',
      clueImgSrc: this.towelCollected ? '' : '/assets/img/towel.webp',
      clueMessage: this.towelCollected ? '더 이상 볼 것이 없다.' : '쓰다 버린 수건같다. 무언가를 닦는데 사용할 수 있을까?',
      itemInfo: this.towelCollected
        ? undefined
        : {
            id: 'towel',
            name: '수건',
            description: '쓰레기통에서 발견한 수건이다.',
            image: '/assets/img/towel.webp',
            isSelected: false,
          },
      onFound: (item: IInventoryItem) => {
        if (!this.towelCollected) {
          itemManagerInstance.addItem(item);
          this.towelCollected = true;
        }
      },
    });

    // DOM에 버튼 추가
    mirrorButton.appendTo(btnBox);
    copierButton.appendTo(btnBox);
    trashButton.appendTo(btnBox);

    console.log('버튼 추가 완료');
  }

  cleanup(): void {
    console.log('북쪽 방 정리됨');
    this.mirrorGame.close();
    this.copierGame.close();
  }
}

/**
 * north_room.ts
 *
 * 북쪽 방 구현
 * - 방 배경, 상호작용 포인트, 미니게임 등을 정의
 * - 다른 방향 방 구현 시 이 클래스를 템플릿으로 활용 가능
 */

import { IRoom, IInteractionPoint } from '../../../src/types/type';
import { InteractionManager } from './interaction_manager';
import { InventoryManager } from './inventory_manager';
import { MinigameManager } from './minigame_manager';

export class NorthRoom implements IRoom {
  private backgroundElement: HTMLElement | null;
  private interactionPoints: IInteractionPoint[];
  private hasCleanedMirror: boolean = false;
  private hasCopierFixed: boolean = false;

  constructor(
    private interactionManager: InteractionManager,
    private inventoryManager: InventoryManager,
    private minigameManager: MinigameManager,
  ) {
    this.backgroundElement = document.getElementById('room-background');
    this.interactionPoints = this.createInteractionPoints();
  }

  private createInteractionPoints = (): IInteractionPoint[] => {
    return [
      {
        id: 'trash-can',
        x: 225,
        y: 790,
        type: 'item',
        requiredItem: null,
        itemToGive: 'towel',
        onetime: true,
        action: () => this.onTrashCanInteraction(),
      },
      {
        id: 'copier',
        x: 935,
        y: 600,
        type: 'minigame',
        requiredItem: 'wrench',
        itemToGive: 'clue1',
        onetime: false,
        action: () => this.onCopierInteraction(),
      },
      {
        id: 'mirror',
        x: 1580,
        y: 510,
        type: 'minigame',
        requiredItem: 'towel',
        itemToGive: null,
        onetime: false,
        action: () => this.onMirrorInteraction(),
      },
    ];
  };

  public initialize = () => {
    // 방 초기화 (필요시 추가)
  };

  public render = () => {
    // 배경 이미지 설정
    if (this.backgroundElement) {
      this.backgroundElement.style.backgroundImage = 'url("/src/assets/img/background_north.webp")';
      this.backgroundElement.style.backgroundSize = 'cover';
      this.backgroundElement.style.backgroundPosition = 'center';
    }

    // 상호작용 포인트 설정
    this.interactionManager.setInteractionPoints(this.interactionPoints);
  };

  public cleanup = () => {
    this.interactionManager.clearInteractionPoints();
  };

  // 상호작용 핸들러
  private onTrashCanInteraction = () => {
    this.inventoryManager.addItem({
      id: 'towel',
      name: '천 조각',
      description: '쓰다 버린 수건같다. 무언가를 닦는데 사용할 수 있을까?.',
      image: '/sample/assets/img/towel.webp',
    });

    this.interactionManager.showDialog('쓰다 버린 수건을 발견했다.');
    this.removeInteractionPoint('trash-can');
  };

  private onMirrorInteraction = () => {
    if (!this.inventoryManager.hasItem('towel')) {
      this.interactionManager.showDialog('거울에 피가 부자연스럽게 묻어있다. 하지만 맨 손으로 닦을 수는 없는데...');
      return;
    }

    if (this.hasCleanedMirror) {
      this.interactionManager.showDialog('피를 모두 닦았더니, 314라는 숫자가 나타났다.');
      return;
    }

    this.minigameManager.startGame('mirror', () => {
      this.hasCleanedMirror = true;
      this.interactionManager.showDialog('피를 모두 닦았더니, 314라는 숫자가 나타났다.');
    });
  };

  /**
   * 복합기 상호작용 처리
   * 테스트용으로 렌치 아이템이 없어도 미니게임 접근 가능
   */
  private onCopierInteraction = (): void => {
    console.log('복합기 상호작용');

    // 이미 수리 완료했는지 확인
    if (this.hasCopierFixed) {
      // 단서 아이템 획득
      this.inventoryManager.addItem({
        id: 'clue1',
        name: '범인 단서1',
        description: '범인의 신원과 관련된 중요한 단서입니다.',
        image: '/sample/assets/img/clue1.webp',
      });

      this.interactionManager.showDialog('이건 범인의 단서다!');

      // 상호작용 포인트 제거 (아이템 획득 후에는 사용 불가)
      this.removeInteractionPoint('copier');
      return;
    }

    // 미니게임 시작
    // 테스트를 위해 렌치 검사 제거 (없어도 게임 접근 가능)
    this.minigameManager.startGame('copier', () => {
      // 미니게임 완료 후 호출될 콜백
      this.hasCopierFixed = true;
      this.interactionManager.showDialog('복합기가 고쳐졌습니다!');
    });
  };

  // 포인트 제거 헬퍼 메서드
  private removeInteractionPoint = (id: string) => {
    this.interactionPoints = this.interactionPoints.filter(point => point.id !== id);
    this.interactionManager.setInteractionPoints(this.interactionPoints);
  };
}

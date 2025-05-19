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
      this.backgroundElement.style.backgroundImage = 'url("../../../src/assets/img/background_north.jpg")';
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
      description: '깨끗한 천 조각입니다. 무언가를 닦는데 사용할 수 있을 것 같습니다.',
      image: '../assets/img/towel.png',
    });

    this.interactionManager.showDialog('깨끗한 천 조각을 획득했습니다.');
    this.removeInteractionPoint('trash-can');
  };

  private onMirrorInteraction = () => {
    if (!this.inventoryManager.hasItem('towel')) {
      this.interactionManager.showDialog('거울에 피가 묻어있다. 닦을 수 있는 도구가 필요하다.');
      return;
    }

    if (this.hasCleanedMirror) {
      this.interactionManager.showDialog('피를 모두 닦았더니, 314라는 숫자가 있었다.');
      return;
    }

    this.minigameManager.startGame('mirror', () => {
      this.hasCleanedMirror = true;
      this.interactionManager.showDialog('피를 모두 닦았더니, 314라는 숫자가 있었다.');
    });
  };

  private onCopierInteraction = () => {
    if (!this.inventoryManager.hasItem('wrench')) {
      this.interactionManager.showDialog('복합기가 망가져 있는 것 같은데, 고칠 도구가 있으면 시도해볼 수 있을 것 같다.');
      return;
    }

    if (this.hasCopierFixed) {
      this.inventoryManager.addItem({
        id: 'clue1',
        name: '범인 단서1',
        description: '범인의 신원과 관련된 중요한 단서입니다.',
        image: '../assets/img/clue1.png',
      });

      this.interactionManager.showDialog('이건 범인의 단서다!');
      this.removeInteractionPoint('copier');
      return;
    }

    this.minigameManager.startGame('copier', () => {
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

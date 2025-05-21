/**
 * interaction_manager.ts
 *
 * 상호작용 포인트를 관리하는 클래스
 * - 돋보기 아이콘 생성 및 배치
 * - 상호작용 이벤트 처리
 * - 대화창 표시
 */

import { IInteractionPoint } from '../../../src/types/type';

export class InteractionManager {
  private container: HTMLElement | null = null;
  private dialogBox: HTMLElement | null = null;
  private dialogText: HTMLElement | null = null;
  private interactionPoints: IInteractionPoint[] = [];
  private minigameManager: any = null;

  constructor() {
    this.container = document.getElementById('interaction-elements');
    this.dialogBox = document.getElementById('dialog-box');
    this.dialogText = document.getElementById('dialog-text');

    if (this.container) {
      this.container.style.zIndex = '25';
      this.container.style.pointerEvents = 'auto';
    }

    const closeButton = document.getElementById('dialog-close');
    if (closeButton) {
      closeButton.addEventListener('click', this.onDialogClose);
    }
  }

  public setMinigameManager = (manager: any) => {
    this.minigameManager = manager;
  };

  public setInteractionPoints = (points: IInteractionPoint[]) => {
    this.clearInteractionPoints();
    this.interactionPoints = points;
    this.renderInteractionPoints();
  };

  public clearInteractionPoints = () => {
    this.interactionPoints = [];
    if (this.container) {
      this.container.innerHTML = '';
    }
  };

  private renderInteractionPoints = () => {
    if (!this.container) return;

    this.interactionPoints.forEach(point => {
      this.createInteractionIcon(point);
    });
  };

  // 상호작용 아이콘 생성 함수 (중복 코드 제거)
  private createInteractionIcon = (point: IInteractionPoint) => {
    try {
      const icon = document.createElement('div');
      icon.className = 'interaction-icon';
      icon.style.position = 'absolute';
      icon.style.left = `${point.x}px`;
      icon.style.top = `${point.y}px`;
      icon.style.width = '60px';
      icon.style.height = '60px';
      icon.style.zIndex = '30';
      icon.style.pointerEvents = 'auto';
      icon.style.cursor = 'pointer';

      // 스타일 설정
      Object.assign(icon.style, {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        transition: 'all 0.2s ease',
      });

      icon.dataset.id = point.id;

      // 돋보기 아이콘 이미지
      const img = document.createElement('img');
      img.src = '/src/assets/icon/search.svg';
      img.alt = 'Search';
      img.style.width = '60%';
      img.style.height = '60%';

      // 호버 및 클릭 이벤트
      this.setupIconEvents(icon, point);

      icon.appendChild(img);
      this.container?.appendChild(icon);
    } catch (error) {
      console.error(`상호작용 포인트 ${point.id} 생성 오류`);
    }
  };

  // 아이콘 이벤트 설정 (중복 코드 제거)
  private setupIconEvents = (icon: HTMLElement, point: IInteractionPoint) => {
    // 호버 효과
    icon.addEventListener('mouseover', () => {
      icon.style.transform = 'scale(1.1)';
      icon.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
    });

    icon.addEventListener('mouseout', () => {
      icon.style.transform = 'scale(1)';
      icon.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    });

    // 클릭 이벤트
    icon.addEventListener('click', e => {
      e.stopPropagation();
      if (typeof point.action === 'function') {
        point.action();
      }
    });
  };

  public showDialog = (text: string) => {
    if (!this.dialogBox || !this.dialogText) return;

    this.dialogText.textContent = text;
    this.dialogBox.classList.remove('hidden');
    this.dialogBox.classList.add('block');
  };

  private onDialogClose = () => {
    if (!this.dialogBox) return;
    this.dialogBox.classList.add('hidden');
    this.dialogBox.classList.remove('block');
  };

  public showItem = (itemId: string, message: string) => {
    this.showDialog(message);
  };

  public removeInteractionPoint = (id: string) => {
    this.interactionPoints = this.interactionPoints.filter(point => point.id !== id);

    if (this.container) {
      const element = this.container.querySelector(`[data-id="${id}"]`);
      if (element) element.remove();
    }
  };

  public startMinigame = (gameId: string) => {
    if (this.minigameManager) {
      this.minigameManager.startGame(gameId);
    }
  };
}

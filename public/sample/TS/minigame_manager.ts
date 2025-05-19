/**
 * minigame_manager.ts
 *
 * 미니게임 관리 클래스
 * - 다양한 미니게임 시작 및 종료
 * - 미니게임 성공/실패 처리
 * - 미니게임 UI 표시
 */

import { InventoryManager } from './inventory_manager';

export class MinigameManager {
  private container: HTMLElement | null = null;
  private currentGame: any = null;

  constructor(private inventoryManager: InventoryManager) {
    this.container = document.getElementById('minigame-container');
  }

  public startGame = (gameId: string, onComplete?: () => void) => {
    if (!this.container) return;

    // 컨테이너 표시
    this.showGameContainer();

    // 게임 UI 생성
    const gameContent = this.createGameUI(gameId);
    this.container.innerHTML = gameContent;

    // 버튼 이벤트 설정
    this.setupGameButtons(onComplete);
  };

  private showGameContainer = () => {
    if (!this.container) return;

    this.container.classList.remove('hidden');
    this.container.classList.add('flex');
    this.container.style.display = 'flex';
  };

  private createGameUI = (gameId: string): string => {
    // 미니게임 별 UI 템플릿
    const gameTemplates: Record<string, string> = {
      mirror: `
        <div class="popup-container">
          <h2 class="text-white text-xl mb-4 text-center">거울 닦기</h2>
          <div class="bg-gray-900 w-full h-64 mb-4 relative flex items-center justify-center">
            <div class="text-white">거울에 묻은 피를 닦아내세요</div>
          </div>
          <div class="flex justify-center space-x-4">
            <button id="complete-game" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">완료</button>
            <button id="close-game" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">닫기</button>
          </div>
        </div>
      `,
      copier: `
        <div class="popup-container">
          <h2 class="text-white text-xl mb-4 text-center">복합기 수리</h2>
          <div class="bg-gray-900 w-full h-64 mb-4 relative flex items-center justify-center">
            <div class="text-white">복합기를 수리하세요</div>
          </div>
          <div class="flex justify-center space-x-4">
            <button id="complete-game" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">완료</button>
            <button id="close-game" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">닫기</button>
          </div>
        </div>
      `,
    };

    // 기본 템플릿 또는 게임별 템플릿 반환
    return (
      gameTemplates[gameId] ||
      `
      <div class="popup-container">
        <h2 class="text-white text-xl mb-4 text-center">미니게임: ${gameId}</h2>
        <div class="bg-gray-900 w-full h-64 mb-4 relative flex items-center justify-center">
          <div class="text-white">미니게임 컨텐츠</div>
        </div>
        <div class="flex justify-center space-x-4">
          <button id="complete-game" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">완료</button>
          <button id="close-game" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">닫기</button>
        </div>
      </div>
    `
    );
  };

  private setupGameButtons = (onComplete?: () => void) => {
    const completeBtn = document.getElementById('complete-game');
    const closeBtn = document.getElementById('close-game');

    if (completeBtn) {
      completeBtn.addEventListener('click', this.onGameComplete(onComplete));
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', this.onGameClose);
    }
  };

  private onGameComplete = (onComplete?: () => void) => () => {
    if (onComplete) onComplete();
    this.closeGame();
  };

  private onGameClose = () => {
    this.closeGame();
  };

  public closeGame = () => {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.classList.add('hidden');
    this.container.classList.remove('flex');
    this.container.style.display = 'none';
    this.currentGame = null;
  };
}

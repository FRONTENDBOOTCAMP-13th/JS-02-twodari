/**
 * minigame_manager.ts - 미니게임 관리
 */
import { InventoryManager } from './inventory_manager';
import { MirrorGame, CopierGame } from '../../../src/TS/north_minigames';

export class MinigameManager {
  private container: HTMLElement | null = null;
  private currentGame: any = null;

  /**
   * MinigameManager 생성자
   * @param inventoryManager 인벤토리 관리자 (미니게임 보상 지급용)
   */
  constructor(private inventoryManager: InventoryManager) {
    this.container = document.getElementById('minigame-container');
  }

  /**
   * 미니게임 시작 메서드
   * @param gameId 실행할 미니게임 ID
   * @param onComplete 미니게임 성공 시 실행할 콜백 함수
   */
  public startGame = (gameId: string, onComplete?: () => void): void => {
    if (!this.container) return;

    // 컨테이너 표시
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';

    // 콜백 기본값
    const completeCallback = onComplete || (() => {});

    try {
      // 게임 ID에 따라 다른 게임 생성
      switch (gameId) {
        case 'mirror':
          this.currentGame = new MirrorGame(completeCallback);
          break;
        case 'copier':
          this.currentGame = new CopierGame(completeCallback);
          break;
        default:
          console.error(`지원하지 않는 미니게임 ID: ${gameId}`);
          this.showErrorMessage(gameId);
          return;
      }

      // 게임 초기화 및 시작
      this.currentGame.initialize();
      this.currentGame.start();
    } catch (error) {
      console.error('미니게임 시작 오류:', error);
      this.showErrorMessage('오류 발생: ' + gameId);
    }
  };

  /**
   * 오류 메시지 표시
   */
  private showErrorMessage = (gameId: string): void => {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="popup-container bg-black bg-opacity-90 p-5 rounded text-center">
        <h2 class="text-white text-xl mb-4">오류</h2>
        <p class="text-gray-300 mb-4">지원하지 않는 미니게임입니다: ${gameId}</p>
        <button id="close-game" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">닫기</button>
      </div>
    `;

    const closeButton = document.getElementById('close-game');
    if (closeButton) {
      closeButton.addEventListener('click', this.closeGame);
    }
  };

  /**
   * 게임 종료 이벤트 핸들러
   */
  private onGameClose = (): void => {
    this.closeGame();
  };

  /**
   * 미니게임 종료
   */
  public closeGame = (): void => {
    if (this.currentGame) {
      this.currentGame.close();
      this.currentGame = null;
    }

    if (this.container) {
      this.container.classList.add('hidden');
      this.container.style.display = 'none';
      this.container.innerHTML = '';
    }
  };
}

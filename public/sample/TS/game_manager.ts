/**
 * game_manager.ts
 *
 * 게임의 전체적인 흐름을 관리하는 클래스
 * - 다른 매니저 클래스들을 초기화하고 관리
 * - 화면 크기 조정 및 레이아웃 설정
 * - 타이머 및 게임 종료 조건 관리
 */

import { RoomManager } from './room_manager';
import { UIManager } from './ui_manager';
import { InventoryManager } from './inventory_manager';
import { InteractionManager } from './interaction_manager';
import { MinigameManager } from './minigame_manager';

class GameManager {
  private roomManager: RoomManager;
  private uiManager: UIManager;
  private inventoryManager: InventoryManager;
  private interactionManager: InteractionManager;
  private minigameManager: MinigameManager;
  private timerInterval: number | null = null;
  private timeRemaining: number = 3600; // 60분 (초 단위)

  constructor() {
    // 매니저 초기화 및 연결
    this.inventoryManager = new InventoryManager();
    this.interactionManager = new InteractionManager();
    this.minigameManager = new MinigameManager(this.inventoryManager);
    this.interactionManager.setMinigameManager(this.minigameManager);
    this.roomManager = new RoomManager(this.interactionManager, this.inventoryManager, this.minigameManager);
    this.uiManager = new UIManager(this.roomManager, this.inventoryManager);

    this.initialize();
  }

  private initialize = () => {
    // 레이아웃 조정, UI 초기화, 게임 시작
    this.setupFixedLayout();
    this.uiManager.initialize();
    this.roomManager.goToRoom('west');
    this.startTimer();
  };

  private setupFixedLayout = () => {
    const adjustLayout = () => {
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const baseWidth = 1920;
      const baseHeight = 1080;
      const aspectRatio = baseWidth / baseHeight;
      const minWidth = 1280;
      const minHeight = 720;

      // 윈도우 크기에 맞게 스케일 계산
      let scale;
      const isWideScreen = windowWidth / windowHeight > aspectRatio;

      if (isWideScreen) {
        scale = windowHeight / baseHeight;
      } else {
        scale = windowWidth / baseWidth;
      }

      // 최소 크기 제한 적용
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      if (scaledWidth < minWidth || scaledHeight < minHeight) {
        scale = Math.min(minWidth / baseWidth, minHeight / baseHeight);
      }

      // 스케일 적용 및 저장
      gameContainer.style.transform = `scale(${scale})`;
      gameContainer.dataset.scale = scale.toString();
    };

    // 초기 적용 및 리사이즈 이벤트 설정
    adjustLayout();
    window.addEventListener('resize', adjustLayout);
    setTimeout(adjustLayout, 100); // 일부 브라우저 대응
  };

  private startTimer = () => {
    const timerElement = document.getElementById('time-value');
    if (!timerElement) return;

    this.updateTimerDisplay(timerElement);
    this.timerInterval = window.setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay(timerElement);
      if (this.timeRemaining <= 0) {
        this.endGame(false);
      }
    }, 1000);
  };

  private updateTimerDisplay = (element: HTMLElement) => {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (minutes < 10) {
      element.classList.add('animate-pulse');
    }
  };

  private endGame = (isSuccess: boolean) => {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (isSuccess) {
      alert('성공적으로 게임을 클리어했습니다!');
      // 결과 페이지로 이동
    } else {
      alert('시간이 초과되었습니다. 게임 오버!');
      // 게임오버 페이지로 이동
    }
  };
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => new GameManager());

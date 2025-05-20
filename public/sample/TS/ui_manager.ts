/**
 * ui_manager.ts
 *
 * 게임의 UI 요소를 관리하는 클래스
 * - 방향키, 힌트, 음악, 아이템 버튼 등 공통 UI 관리
 * - 배경 음악 제어
 * - 힌트 표시
 */

import { RoomManager } from './room_manager';
import { InventoryManager } from './inventory_manager';

export class UIManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private isMusicPlaying: boolean = true;

  constructor(
    private roomManager: RoomManager,
    private inventoryManager: InventoryManager,
  ) {}

  public initialize = () => {
    this.setupIconButtons();
    this.setupDirectionButtons();
    this.setupTimerUI();
    this.setupInventoryButtons();
    this.playBackgroundMusic();
  };

  private setupIconButtons = () => {
    const btnBox = document.getElementById('btn-box');
    if (!btnBox) return;

    // 위치 고정
    Object.assign(btnBox.style, {
      position: 'absolute',
      top: '40px',
      left: '40px',
      zIndex: '55',
    });

    // 버튼 생성 및 추가
    const buttons = [
      { icon: '/src/assets/icon/hint.svg', text: 'HINT', onClick: this.onHintButtonClick },
      { icon: '/src/assets/icon/on_music.svg', text: 'MUSIC', onClick: this.onMusicButtonClick },
      { icon: '/src/assets/icon/item.svg', text: 'ITEM', onClick: this.onItemButtonClick },
    ];

    buttons.forEach(btn => {
      btnBox.appendChild(this.createStyledButton(btn.icon, btn.text, btn.onClick));
    });
  };

  private createStyledButton = (iconPath: string, text: string, onClick: () => void) => {
    const button = document.createElement('div');
    button.className = 'bg-black bg-opacity-60 w-14 h-14 rounded-full flex flex-col items-center justify-center cursor-pointer mr-3';

    Object.assign(button.style, {
      border: '2px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.2s ease',
    });

    // 아이콘 이미지
    const icon = document.createElement('img');
    icon.src = iconPath;
    icon.alt = text;
    icon.className = 'w-7 h-7 mb-0.5';

    // 버튼 텍스트
    const label = document.createElement('span');
    label.textContent = text;
    label.className = 'text-white text-xs';

    button.appendChild(icon);
    button.appendChild(label);

    // 호버 효과
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
      button.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
    });

    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    });

    button.addEventListener('click', onClick);
    return button;
  };

  private setupDirectionButtons = () => {
    const nav = document.getElementById('direction-nav');
    if (!nav) return;

    // 네비게이션 스타일 설정
    Object.assign(nav.style, {
      position: 'absolute',
      bottom: '40px',
      right: '40px',
      zIndex: '55',
    });

    // 방향 버튼 설정
    const directions = [
      { id: 'north-btn', dir: 'north' },
      { id: 'east-btn', dir: 'east' },
      { id: 'south-btn', dir: 'south' },
      { id: 'west-btn', dir: 'west' },
    ];

    directions.forEach(({ id, dir }) => {
      this.setupDirectionButton(id, dir as any);
    });

    // 키보드 이벤트
    document.addEventListener('keydown', this.onKeyDown);
  };

  private setupDirectionButton = (btnId: string, direction: string) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    Object.assign(btn.style, {
      pointerEvents: 'auto',
      cursor: 'pointer',
      zIndex: '56',
      padding: '8px',
    });

    // 이벤트 중복 방지를 위해 요소 복제 후 교체
    const newBtn = btn.cloneNode(true) as HTMLElement;
    if (btn.parentNode) {
      btn.parentNode.replaceChild(newBtn, btn);
    }

    const onButtonClick = (e: Event) => {
      e.stopPropagation();
      this.roomManager.goToRoom(direction as any);
    };

    newBtn.addEventListener('click', onButtonClick);
    newBtn.addEventListener('mousedown', onButtonClick);
    newBtn.addEventListener('touchstart', onButtonClick, { passive: true });
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const directionMap: Record<string, any> = {
      ArrowUp: 'north',
      ArrowRight: 'east',
      ArrowDown: 'south',
      ArrowLeft: 'west',
    };

    const direction = directionMap[e.key];
    if (direction) {
      this.roomManager.goToRoom(direction);
    }
  };

  private setupTimerUI = () => {
    const timer = document.getElementById('timer');
    if (!timer) return;

    Object.assign(timer.style, {
      position: 'absolute',
      top: '40px',
      right: '40px',
      zIndex: '55',
    });
  };

  private setupInventoryButtons = () => {
    const closeBtn = document.getElementById('inventory-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', this.onInventoryClose);
    }
  };

  private playBackgroundMusic = () => {
    try {
      this.bgmAudio = new Audio('/effectSound/background.mp3');
      if (this.bgmAudio) {
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.3;
        this.bgmAudio.play().catch(() => {});
      }
    } catch (error) {}
  };

  // 이벤트 핸들러
  private onMusicButtonClick = () => this.toggleMusic();
  private toggleMusic = () => {
    if (!this.bgmAudio) return;
    this.isMusicPlaying = !this.isMusicPlaying;

    if (this.isMusicPlaying) {
      this.bgmAudio.play();
    } else {
      this.bgmAudio.pause();
    }
  };

  private onHintButtonClick = () => this.showHintDialog();
  private showHintDialog = () => {
    const dialogBox = document.getElementById('dialog-box');
    const dialogText = document.getElementById('dialog-text');
    const dialogClose = document.getElementById('dialog-close');

    if (!dialogBox || !dialogText) return;

    // 방향에 따른 힌트 텍스트
    const hintTexts: Record<string, string> = {
      north: '북쪽 방 힌트: 거울에는 중요한 단서가 있을 수 있습니다. 필요한 도구를 찾아보세요.',
      west: '서쪽 방 힌트: 이곳에서 방향키를 사용해 다른 방으로 이동해보세요.',
      east: '동쪽 방 힌트: 아직 준비 중입니다.',
      south: '남쪽 방 힌트: 아직 준비 중입니다.',
    };

    const currentRoom = this.roomManager.getCurrentRoom();
    const hintText = hintTexts[currentRoom] || '이 방에서는 특별한 힌트가 없습니다.';

    dialogText.textContent = hintText;
    dialogBox.classList.remove('hidden');
    dialogBox.classList.add('block');

    if (dialogClose) {
      dialogClose.addEventListener('click', this.onDialogClose, { once: true });
    }
  };

  private onDialogClose = () => {
    const dialogBox = document.getElementById('dialog-box');
    if (dialogBox) {
      dialogBox.classList.add('hidden');
      dialogBox.classList.remove('block');
    }
  };

  private onItemButtonClick = () => this.inventoryManager.toggleInventory();
  private onInventoryClose = () => this.inventoryManager.hideInventory();
}

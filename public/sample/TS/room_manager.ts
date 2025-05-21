/**
 * room_manager.ts
 *
 * 방 관리 및 전환을 담당하는 클래스
 * - 동서남북 4개 방향의 방 객체를 관리
 * - 방 사이 이동을 처리
 * - 새 방 추가 시 이 클래스에 등록해야 함
 */

import { IRoom, TRoomDirection } from '../../../src/types/type';
import { InteractionManager } from './interaction_manager';
import { InventoryManager } from './inventory_manager';
import { MinigameManager } from './minigame_manager';
import { NorthRoom } from './north_room';

export class RoomManager {
  private currentRoom: IRoom | null = null;
  private currentDirection: TRoomDirection = 'west';
  private rooms: Map<TRoomDirection, IRoom> = new Map();

  constructor(
    private interactionManager: InteractionManager,
    private inventoryManager: InventoryManager,
    private minigameManager: MinigameManager,
  ) {
    // 방 객체 초기화 및 등록
    this.rooms.set('north', new NorthRoom(interactionManager, inventoryManager, minigameManager));

    // 임시 방들 - 추후 실제 구현으로 대체
    ['east', 'west', 'south'].forEach(dir => {
      this.rooms.set(dir as TRoomDirection, this.createTempRoom(dir as TRoomDirection));
    });
  }

  private createTempRoom = (direction: TRoomDirection): IRoom => {
    return {
      initialize: () => {},
      render: () => {
        const bg = document.getElementById('room-background');
        if (bg) {
          bg.style.backgroundColor = '#222';
          bg.style.backgroundImage = `url("/src/assets/img/${direction}_background.webp")`;
          bg.style.backgroundSize = 'cover';
          bg.style.backgroundPosition = 'center';
        }
      },
      cleanup: () => {},
    };
  };

  public goToRoom = (direction: TRoomDirection): void => {
    // 현재 방 정리
    if (this.currentRoom) {
      this.currentRoom.cleanup();
    }

    // 새 방으로 이동
    const newRoom = this.rooms.get(direction);
    if (newRoom) {
      this.currentDirection = direction;
      this.currentRoom = newRoom;
      newRoom.initialize();
      newRoom.render();
    }
  };

  public getCurrentRoom = (): TRoomDirection => {
    return this.currentDirection;
  };
}

// src/utils/room_manager.ts
import { TRoomDirection, IRoom } from '../types/type.ts';
import { NorthRoom } from '../TS/pages/room/north_room.ts';
import { SouthRoom } from '../TS/pages/room/south_room.ts';
import { EastRoom } from '../TS/pages/room/east_room.ts';
import { WestRoom } from '../TS/pages/room/west_room.ts';
import { TransitionEffect } from './transition_effect.ts';

export class RoomManager {
  private static rooms: Record<TRoomDirection, IRoom> = {
    north: new NorthRoom(),
    south: new SouthRoom(),
    west: new WestRoom(),
    east: new EastRoom(),
  };

  private static currentRoom: IRoom | null = null;
  private static isInitialized: boolean = false;

  public static async goTo(direction: TRoomDirection): Promise<void> {
    // 이미 전환 중이면 무시
    if (TransitionEffect.isInTransition()) return;

    // 첫 실행 시 TransitionEffect 초기화
    if (!this.isInitialized) {
      TransitionEffect.initialize();
      this.isInitialized = true;
    }

    // 전환 효과를 통해 방 변경
    await TransitionEffect.transition(() => {
      // 현재 방 정리
      if (this.currentRoom) {
        this.currentRoom.cleanup();
      }

      // 새 방 설정
      const room = this.rooms[direction];
      if (room) {
        this.currentRoom = room;
        room.initialize();
        room.render();
      }
    });
  }
}

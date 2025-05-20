import { TRoomDirection, IRoom } from '../types/type.ts';
import { NorthRoom } from './north_room.ts';
import { SouthRoom } from './south_room.ts';
import { EastRoom } from './east_room.ts';
import { WestRoom } from './west_room.ts';

export class RoomManager {
  private static rooms: Record<TRoomDirection, IRoom> = {
    north: new NorthRoom(),
    south: new SouthRoom(),
    west: new WestRoom(),
    east: new EastRoom(),
  };

  private static currentRoom: IRoom | null = null;

  public static goTo(direction: TRoomDirection) {
    if (this.currentRoom) this.currentRoom.cleanup();

    const room = this.rooms[direction];
    if (room) {
      this.currentRoom = room;
      room.initialize();
      room.render();
    }
  }
}

//방향 이동 제어
export type Direction = 'up' | 'down' | 'left' | 'right';

export class MoveController {
  private static moveMap: Map<Direction, () => void> = new Map();

  static register(direction: Direction, callback: () => void) {
    this.moveMap.set(direction, callback);
  }

  static move(direction: Direction) {
    this.moveMap.get(direction)?.();
  }
}

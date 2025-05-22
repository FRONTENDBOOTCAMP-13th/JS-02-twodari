import { TransitionEffect } from './transition_effect.ts';

export type Direction = 'up' | 'down' | 'left' | 'right';

export class MoveController {
  private static moveMap: Map<Direction, () => void> = new Map();

  static register(direction: Direction, callback: () => void) {
    this.moveMap.set(direction, callback);
  }

  static move(direction: Direction) {
    // 암전 중이면 이동 무시
    if (TransitionEffect.isInTransition()) return;

    this.moveMap.get(direction)?.();
  }
}

/**
 * types/type.ts
 *
 * 게임에서 사용되는 타입 정의 파일
 * - 다양한 인터페이스와 타입 정의
 * - 타입 안전성을 위한 설정
 */

/**
 * 대화 텍스트 인터페이스
 */
export interface IStoryText {
  text: string; // 표시할 텍스트
  delay?: number; // 표시 지연 시간 (ms)
}

/**
 * 방 인터페이스
 * 모든 방 클래스는 이 인터페이스를 구현해야 함
 */
export interface IRoom {
  initialize(): void; // 방 초기화 메서드
  render(): void; // 방 렌더링 메서드
  cleanup(): void; // 방 정리 메서드
}

/**
 * 방향 타입 (북, 동, 남, 서)
 */
export type TRoomDirection = 'north' | 'east' | 'south' | 'west';

/**
 * 상호작용 포인트 인터페이스
 * 돋보기 아이콘으로 표시되는 상호작용 지점
 */
export interface IInteractionPoint {
  id: string; // 고유 ID
  x: number; // X 좌표 (픽셀)
  y: number; // Y 좌표 (픽셀)
  type: string; // 상호작용 유형 ('item', 'minigame' 등)
  requiredItem: string | null; // 상호작용에 필요한 아이템 ID (없으면 null)
  itemToGive: string | null; // 상호작용 결과로 얻는 아이템 ID (없으면 null)
  onetime: boolean; // 한 번만 상호작용 가능 여부
  action: () => void; // 상호작용 시 실행할 함수
}

/**
 * 인벤토리 아이템 인터페이스
 */
export interface IInventoryItem {
  id: string; // 고유 ID
  name: string; // 아이템 이름
  description: string; // 아이템 설명
  image: string; // 아이템 이미지 경로
}

/**
 * 미니게임 인터페이스
 */
export interface IMiniGame {
  initialize(): void; // 미니게임 초기화
  start(): void; // 미니게임 시작
  close(): void; // 미니게임 종료
}

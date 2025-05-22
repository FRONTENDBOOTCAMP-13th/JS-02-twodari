// // miniGameManager.ts
// export class MiniGameManager {
//   // 현재 활성화된 미니게임 추적
//   private static activeGame: any = null;
  
//   // 미니게임 시작 전 이전 미니게임 정리
//   public static startGame(game: any): void {
//     console.log('미니게임 시작 요청:', game);
    
//     // 이미 활성화된 게임이 있다면 정리
//     if (MiniGameManager.activeGame) {
//       console.log('이전 미니게임 정리');
//       MiniGameManager.activeGame.close();
//     }
    
//     // 미니게임 컨테이너 초기화
//     const container = document.getElementById('minigame-container');
//     if (container) {
//       container.innerHTML = '';
//       container.style.display = 'flex';
//       container.classList.remove('hidden');
//     }
    
//     // 새 게임 설정 및 시작
//     MiniGameManager.activeGame = game;
//     game.start();
//   }
  
//   // 모든 미니게임 정리
//   public static cleanup(): void {
//     console.log('미니게임 관리자 정리');
    
//     if (MiniGameManager.activeGame) {
//       MiniGameManager.activeGame.close();
//       MiniGameManager.activeGame = null;
//     }
    
//     const container = document.getElementById('minigame-container');
//     if (container) {
//       container.innerHTML = '';
//       container.classList.add('hidden');
//       container.style.display = 'none';
//     }
    
//     const keypadContainer = document.getElementById('keypad-container');
//     if (keypadContainer) {
//       keypadContainer.innerHTML = '';
//       keypadContainer.classList.add('hidden');
//       keypadContainer.style.display = 'none';
//     }
//   }
// }

function scaleGameLayout() {
  const layout = document.getElementById('game-layout') as HTMLElement;
  if (!layout) return;

  const gameWidth = 1280;
  const gameHeight = 720;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 가로/세로 비율 기준으로 최소 스케일값 계산
  const scaleX = windowWidth / gameWidth;
  const scaleY = windowHeight / gameHeight;
  const scale = Math.min(scaleX, scaleY);

  // 스케일 적용
  layout.style.transform = `scale(${scale})`;
  layout.style.transformOrigin = 'top left';

  // 중앙 정렬을 위한 마진 보정
  const marginLeft = (windowWidth - gameWidth * scale) / 2;
  const marginTop = (windowHeight - gameHeight * scale) / 2;
  layout.style.position = 'absolute';
  layout.style.left = `${marginLeft}px`;
  layout.style.top = `${marginTop}px`;
}

window.addEventListener('load', scaleGameLayout);
window.addEventListener('resize', scaleGameLayout);

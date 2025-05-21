interface IClueOptions {
  clueImgSrc?: string; // 단서 이미지
  message?: string; // 메시지 텍스트
  callback?: () => void;
}

//단서 팝업 생성자 함수
export function showCluePopup({ clueImgSrc, message }: IClueOptions): void {
  // 밑에 깔리는 레이어
  const clueLayer = document.createElement('div');
  clueLayer.className = 'clue-layer';

  // 팝업 본체 컨테이너
  const scaleWrapper = document.createElement('div');
  scaleWrapper.className = 'clue-scale-wrapper';

  //단서 이미지
  if (clueImgSrc) {
    const clueImg = document.createElement('img');
    clueImg.src = clueImgSrc;
    clueImg.alt = message ?? '단서 이미지';
    clueImg.className = 'clue-img';
    clueLayer.appendChild(clueImg);
  }
  // 단서 팝업 만들기
  const cluePopup = document.createElement('div');
  cluePopup.className = 'clue-popup';

  //단서 메시지
  const clueMsg = document.createElement('p');
  clueMsg.textContent = message ?? '여긴 아무것도 없는 듯 하다.';
  clueMsg.className = 'clue-message';

  //닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '닫 기';
  closeBtn.className = 'close-btn';
  closeBtn.onclick = () => {
    clueLayer.remove();
  };

  cluePopup.append(clueMsg, closeBtn);
  scaleWrapper.appendChild(cluePopup);
  clueLayer.appendChild(scaleWrapper);

  const layout = document.getElementById('game-layout');
  if (layout) layout.appendChild(clueLayer);
}

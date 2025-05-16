interface ClueOptions {
  clueImgSrc: string; // 단서 이미지
  message: string; // 메시지 텍스트
}

//찾기 버튼 생성자 함수
export function showCluePopup({ clueImgSrc, message }: ClueOptions): void {
  // 밑에 깔리는 레이어
  const clueLayer = document.createElement('div');
  clueLayer.className = 'clue-layer';

  // 단서 팝업 만들기
  const cluePopup = document.createElement('div');
  cluePopup.className = 'clue-popup';

  //단서 이미지
  const clueImg = document.createElement('img');
  clueImg.src = clueImgSrc;
  clueImg.alt = message;
  clueImg.className = 'clue-img';

  //단서 메시지
  const clueMsg = document.createElement('p');
  clueMsg.textContent = message;
  clueMsg.className = 'clue-message';

  //닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '닫 기';
  closeBtn.className = 'close-btn';
  closeBtn.onclick = () => {
    document.body.removeChild(clueLayer);
  };

  cluePopup.append(clueMsg, closeBtn);
  document.body.appendChild(clueLayer);
  clueLayer.appendChild(clueImg);
  clueLayer.appendChild(cluePopup);
}

interface SearchButtonOptions {
  iconSrc: string; // 이미지 경로
  altText: string; // 대체 텍스트
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  id?: string; // 찾기 버튼 ID
}

//찾기 버튼 생성자 함수
export default function createSearchBtn({ iconSrc, altText, position, id }: SearchButtonOptions): HTMLButtonElement {
  //찾기 버튼 만들기
  const btn = document.createElement('button');
  btn.setAttribute('aria-label', altText);
  if (id) btn.id = id;

  btn.className = 'search-btn-style';

  // 버튼 위치 설정
  Object.assign(btn.style, position);

  // 이미지 삽입
  const img = document.createElement('img');
  img.src = iconSrc;
  img.alt = altText;
  img.className = 'search-icon-img';
  btn.appendChild(img);

  return btn;
}

interface MoveButtonOptions {
  iconSrc: string; // 이미지 경로
  altText: string; // 대체 텍스트
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  id?: string; // 찾기 버튼 ID
  onClick: () => void; // 클릭 시 동작
}

// 이동 버튼 생성자 함수
class Movebutton {}

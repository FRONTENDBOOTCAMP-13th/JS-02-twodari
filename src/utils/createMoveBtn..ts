type TMoveType = 'up' | 'down' | 'left' | 'right';

interface IMoveButtonOptions {
  altText: string; // 대체 텍스트
  position: {
    bottom: string;
    right: string;
    position: 'fixed' | 'absolute';
  };
  id: string; // 방향키 버튼 ID
  type: TMoveType; // 이동 타입
  isActive?: boolean; // 활성화 여부
  onClick: () => void; // 클릭 시 동작
  moveText: string; //방향 텍스트
  moveTextPosition: {
    bottom: string;
    right: string;
    position: 'fixed' | 'absolute';
  }; //방향 텍스트 위치
}

// 이동 버튼 생성 클래스
export class CreateMoveBtn {
  //이동 버튼 만들기
  private element: HTMLButtonElement;
  private textElement: HTMLSpanElement;
  private options: IMoveButtonOptions;
  private isActive: boolean = false; // 버튼 활성화 상태

  constructor(options: IMoveButtonOptions) {
    this.options = options;
    this.element = this.createButton();
    this.textElement = this.createMoveText();
    this.element.addEventListener('click', () => this.onClick());
    this.isActive = options.isActive || false;
    this.updateButtonState(); // 버튼 상태 업데이트
  }

  private createButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', this.options.altText);
    btn.id = this.options.id;
    btn.className = 'move-btn-style';

    // 버튼 위치 설정
    Object.assign(btn.style, this.options.position);

    // 이미지 삽입(인라인 svg - 아이콘 색상 채우기 문제)
    btn.innerHTML = `
  <svg class="move-icon-img rotate-${this.options.type} text-(--gray-11) hover:text-(--light-primary) active:text-(--light-primary)"
       viewBox="0 0 148 189"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M140.806 82.1038C149.545 88.0578 149.545 100.942 140.806 106.896L24.1959 186.346C14.2384 193.13 0.749991 185.999 0.749991 173.95L0.749998 15.0504C0.749999 3.00141 14.2384 -4.13014 24.1959 2.65418L140.806 82.1038Z"
          fill="currentColor" />
  </svg>
`;

    return btn;
  }

  // 이동 텍스트 만들기
  private createMoveText(): HTMLSpanElement {
    const moveText = document.createElement('span');
    moveText.className = 'move-text-style';
    moveText.innerText = this.options.moveText;

    // 버튼 텍스트 위치 설정
    Object.assign(moveText.style, this.options.moveTextPosition);

    return moveText;
  }

  //중간에 동그란 원 UI 만들기
  private createCircle(): HTMLDivElement {
    const circle = document.createElement('div');
    circle.className = 'circle-style';
    return circle;
  }

  // 이동 버튼 클릭 핸들러
  private onClick() {}
  // 버튼 활성화 상태 업데이트
  private updateButtonState() {}

  //circle UI flag
  private static circleFlag = false;

  // 버튼과 텍스트를 DOM에 추가
  public appendTo(target: HTMLElement) {
    target.appendChild(this.element);
    document.body.appendChild(this.textElement);

    //circle UI 한번만 생성
    if (!CreateMoveBtn.circleFlag) {
      const circle = this.createCircle();
      document.body.appendChild(circle);
      CreateMoveBtn.circleFlag = true;
    }
  }
}

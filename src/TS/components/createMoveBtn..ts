import { setKeyListener } from '../../utils/keyboardListener.ts';
import { MoveController } from '../../utils/moveController.ts';
import type { TRoomDirection } from '../../types/type.ts';

type TMoveType = 'up' | 'down' | 'left' | 'right';

const directionMap: Record<TMoveType, TRoomDirection> = {
  up: 'north',
  down: 'south',
  left: 'west',
  right: 'east',
};

interface IMoveButtonOptions {
  altText: string; // 대체 텍스트
  position: {
    top: string;
    left: string;
    position: 'fixed' | 'absolute';
  };
  id: string; // 방향키 버튼 ID
  type: TMoveType; // 이동 타입
  isActive?: boolean; // 활성화 여부
  onClick: () => void; // 클릭 시 동작
  moveText: string; //방향 텍스트
}

// 이동 버튼 생성 클래스
export class CreateMoveBtn {
  //이동 버튼 만들기
  private element: HTMLButtonElement;
  private options: IMoveButtonOptions;
  private isActive: boolean = false; // 버튼 활성화 상태
  static instances: Partial<Record<TMoveType, CreateMoveBtn>> = {};

  private static container: HTMLElement | null = null; // 버튼을 추가할 컨테이너(wrapper)
  //circle UI flag
  private static circleFlag = false;
  // 키보드 리스너 초기화 여부
  private static listenerInitialized = false;

  constructor(options: IMoveButtonOptions) {
    this.options = options;
    this.element = this.createButton();
    this.element.addEventListener('click', () => this.onClick());
    this.isActive = options.isActive || false;
    this.updateButtonState(); // 버튼 상태 업데이트

    CreateMoveBtn.instances[this.options.type] = this;
    MoveController.register(this.options.type, () => {
      CreateMoveBtn.setActiveDirection(this.options.type);
      this.options.onClick();
    });
  }

  private createButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', this.options.altText);
    btn.id = this.options.id;
    btn.className = 'move-btn-style group';

    // 버튼 위치 설정
    // Object.assign(btn.style, this.options.position);
    const positionStyle = { ...this.options.position, position: 'absolute' };
    Object.assign(btn.style, positionStyle);

    // 이미지 삽입(인라인 svg - 아이콘 색상 채우기 문제)
    btn.innerHTML = `
  <svg class="move-icon-img rotate-${this.options.type} text-(--gray-11) hover:text-(--light-primary) active:text-(--light-primary)"
       viewBox="0 0 148 189"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M140.806 82.1038C149.545 88.0578 149.545 100.942 140.806 106.896L24.1959 186.346C14.2384 193.13 0.749991 185.999 0.749991 173.95L0.749998 15.0504C0.749999 3.00141 14.2384 -4.13014 24.1959 2.65418L140.806 82.1038Z"
          fill="currentColor" />
  </svg>
`;
    //이동 텍스트 삽입
    const moveText = document.createElement('span');
    moveText.className = 'move-text-style';
    moveText.innerText = this.options.moveText;

    // 버튼 텍스트 위치 설정
    const type = this.options.type;
    const style: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      pointerEvents: 'none',
    };

    // 버튼 위치에 따라(type) 위치 설정
    switch (type) {
      case 'up':
        style.top = '-2px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'down':
        style.bottom = '-2px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'left':
        style.left = '-2px';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        break;
      case 'right':
        style.right = '-2px';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        break;
    }

    Object.assign(moveText.style, style);
    btn.appendChild(moveText);
    return btn;
  }

  //중간에 동그란 원 UI 만들기
  private createCircle(): HTMLDivElement {
    const circle = document.createElement('div');
    circle.className = 'circle-style';
    return circle;
  }

  // 버튼을 추가할 컨테이너 만들기
  private createContainer(): HTMLElement {
    if (CreateMoveBtn.container) {
      return CreateMoveBtn.container;
    }

    const container = document.createElement('div');
    container.id = 'move-btn-container';
    container.className = 'wrapper-style';
    Object.assign(container.style, {
      position: 'absolute',
      bottom: '170px',
      right: '170px',
      width: '100px',
      height: '100px',
      zIndex: '50',
    });
    const layout = document.getElementById('game-layout');
    if (!layout) {
      throw new Error('Game-layout not found');
    }
    layout.appendChild(container);

    CreateMoveBtn.container = container;
    return container;
  }

  // 이동 버튼 클릭 핸들러
  private onClick() {
    CreateMoveBtn.setActiveDirection(this.options.type);
    this.options.onClick();
  }
  // 버튼 활성화 상태 업데이트
  private updateButtonState() {
    if (this.isActive) {
      this.element.classList.add('active');
    } else {
      this.element.classList.remove('active');
    }
  }
  public static setActiveDirection(activeType: TMoveType) {
    for (const [type, instance] of Object.entries(CreateMoveBtn.instances)) {
      if (!instance) continue;
      instance.isActive = type === activeType;
      instance.updateButtonState();
    }
  }

  // 키보드 이벤트 리스너 설정
  public static setupKeyListener() {
    if (CreateMoveBtn.listenerInitialized) return;
    setKeyListener();
    CreateMoveBtn.listenerInitialized = true;
  }

  // 버튼과 텍스트를 DOM에 추가
  public appendTo() {
    const wrapper = this.createContainer();
    wrapper.appendChild(this.element);

    //circle UI 한번만 생성
    if (!CreateMoveBtn.circleFlag) {
      const circle = this.createCircle();
      wrapper.appendChild(circle);
      CreateMoveBtn.circleFlag = true;
    }
  }
}
export { directionMap };

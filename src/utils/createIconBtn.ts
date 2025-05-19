interface IButtonOptions {
  type: 'hint' | 'music' | 'item';
  iconSrc: string;
  altText?: string;
  text: 'HINT' | 'MUSIC' | 'ITEM';
  isActive?: boolean;
  onClick?: () => void;
}
//버튼 생성자 class
class CreateIconBtn {
  private element: HTMLButtonElement;
  private options: IButtonOptions;
  public itemBox?: HTMLElement;

  constructor(options: IButtonOptions) {
    this.options = {
      altText: `${options.text} 버튼`,
      isActive: false,
      ...options,
    };

    this.element = this.createButtonElement();
    this.setupEventListeners();
  }

  private createButtonElement(): HTMLButtonElement {
    const button = document.createElement('button');

    button.className = 'btn-style';
    if (this.options.isActive) {
      button.classList.add('active');
    }

    button.setAttribute('data-type', this.options.type);

    const iconImg = document.createElement('img');
    iconImg.className = 'icon-img';
    iconImg.src = this.options.iconSrc;
    iconImg.alt = this.options.altText || '';

    const textSpan = document.createElement('span');
    textSpan.className = 'text-white';
    textSpan.textContent = this.options.text;

    button.appendChild(iconImg);
    button.appendChild(textSpan);

    return button;
  }

  private setupEventListeners(): void {
    if (this.options.onClick) {
      this.element.addEventListener('click', () => {
        this.toggle();

        this.options.onClick?.();
      });
    }
  }

  public toggle(): void {
    this.options.isActive = !this.options.isActive; //false면 true, true면 false로 바꿔줌
    this.element.classList.toggle('active'); //active를 넣거나 빼거나

    //bgm 아이콘 변경
    const iconImg = this.element.querySelector('img');
    if (iconImg && 'music'.includes(this.options.type)) {
      const currentSrc = iconImg.src;
      const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('/') + 1);
      const fileName = this.options.isActive ? 'on_music.svg' : 'off_music.svg';

      iconImg.src = basePath + fileName;
    }
  }

  //toggle의 상태를 명시적으로 설정
  public setActive(active: boolean): void {
    if (this.options.isActive !== active) {
      this.options.isActive = active;
      this.element.classList.toggle('active', active);

      // 텍스트 변경 (ON/OFF 토글 버튼인 경우)
      // const textSpan = this.element.querySelector('span');
      // if (textSpan && 'music'.includes(this.options.type)) {
      //   textSpan.textContent = active ? 'ON' : 'OFF';
      // }
    }
  }

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.element);

    if (this.options.type === 'item') {
      const itemBox = document.createElement('div');
      itemBox.className = 'w-[80px] h-[80px] mt-3 p-5 bg-[url(/src/assets/icon/no_use.svg)] bg-size-[auto_50px] bg-no-repeat bg-center bg-cover';
      // 아이템 박스 참조 저장
      this.itemBox = itemBox;

      // 버튼 바로 다음에 추가
      parent.insertBefore(itemBox, this.element.nextSibling);
    }
  }
  public getElement(): HTMLButtonElement {
    return this.element;
  }
}

export default CreateIconBtn;

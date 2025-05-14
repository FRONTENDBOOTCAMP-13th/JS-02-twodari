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

  constructor(options: IButtonOptions) {
    this.options = {
      altText: options.text,
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
    textSpan.textContent = this.options.text === 'MUSIC' ? 'ON' : this.options.text;

    button.appendChild(iconImg);
    button.appendChild(textSpan);

    return button;
  }

  private setupEventListeners(): void {
    if (this.options.onClick) {
      this.element.addEventListener('click', () => {
        if (this.options.type === 'music') {
          this.toggle();
        }
        this.options.onClick?.();
      });
    }
  }

  public toggle(): void {
    this.options.isActive = !this.options.isActive;
    this.element.classList.toggle('active');

    const textSpan = this.element.querySelector('span');
    if (textSpan && 'music'.includes(this.options.type)) {
      textSpan.textContent = this.options.isActive ? 'OFF' : 'ON';
    }
  }

  public setActive(active: boolean): void {
    if (this.options.isActive !== active) {
      this.options.isActive = active;
      this.element.classList.toggle('active', active);

      // 텍스트 변경 (ON/OFF 토글 버튼인 경우)
      const textSpan = this.element.querySelector('span');
      if (textSpan && 'music'.includes(this.options.type)) {
        textSpan.textContent = active ? 'ON' : 'OFF';
      }
    }
  }

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.element);
  }
  public getElement(): HTMLButtonElement {
    return this.element;
  }
}

export default CreateIconBtn;

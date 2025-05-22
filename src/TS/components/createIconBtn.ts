import itemManagerInstance from '../../utils/itemManagerInstance';
import { ITEM_SELECTED_EVENT } from './itemManager';

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
  public itemBox?: HTMLDivElement;
  private itemSelectionListener: EventListener;

  constructor(options: IButtonOptions) {
    this.options = {
      altText: `${options.text} 버튼`,
      isActive: false,
      ...options,
    };

    this.element = this.createButtonElement();
    this.setupEventListeners();

    // 아이템 선택 이벤트 리스너 생성
    this.itemSelectionListener = this.handleItemSelection.bind(this);

    // 아이템 버튼인 경우 이벤트 리스너 등록
    if (this.options.type === 'item') {
      itemManagerInstance.addEventListener(ITEM_SELECTED_EVENT, this.itemSelectionListener);
    }
  }

  // Clean up method (중요: 클래스 인스턴스 제거 전 호출)
  public destroy() {
    if (this.options.type === 'item') {
      itemManagerInstance.removeEventListener(ITEM_SELECTED_EVENT, this.itemSelectionListener);
    }
  }

  // 아이템 선택 이벤트 핸들러
  private handleItemSelection() {
    if (this.options.type === 'item') {
      this.updateItemBox();
    }
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

        if (this.options.type === 'item') {
          this.updateItemBox();
        }
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
    }
  }

  public updateItemBox(): void {
    if (!this.itemBox || this.options.type !== 'item') return;

    const selectedItem = itemManagerInstance.getSelectedItem();

    if (selectedItem) {
      this.itemBox.innerHTML = ''; // 기존 내용 지우기

      const itemImg = document.createElement('img');
      itemImg.src = selectedItem.image;
      itemImg.alt = selectedItem.name;
      itemImg.className = 'w-full h-full object-contain';
      this.itemBox.appendChild(itemImg);
    }
  }

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.element);

    if (this.options.type === 'item') {
      const itemBox = document.createElement('div');
      itemBox.className = 'w-[80px] h-[80px] mt-3 rounded-2xl bg-black/20';
      this.itemBox = itemBox;
      parent.insertBefore(itemBox, this.element.nextSibling);
      this.updateItemBox();
    }
  }

  public getElement(): HTMLButtonElement {
    return this.element;
  }
}

export default CreateIconBtn;

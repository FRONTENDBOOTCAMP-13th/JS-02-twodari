import { showCluePopup } from './showCluePopup';

type ClueTtype = 'clue' | 'game';

interface SearchButtonOptions {
  iconSrc: string; // 이미지 경로
  altText: string; // 대체 텍스트
  position: {
    //위치
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  id: string; // ID
  type: ClueTtype; // 단서 타입
  clueImgSrc?: string; // 단서 이미지
  clueMessage?: string; // 단서 메시지
  emptyMessage?: string; //단서 없을 때 메시지
  gameCallback?: () => void; // 게임 콜백
}

//찾기 버튼 생성 클래스
export class CreateSearchBtn {
  //찾기 버튼 만들기
  private element: HTMLButtonElement;
  private options: SearchButtonOptions;
  private isFound: boolean = false; // 단서 찾았는지 확인

  constructor(options: SearchButtonOptions) {
    this.options = options;
    this.element = this.createButton();
    this.element.addEventListener('click', () => this.onClick());
  }

  private createButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', this.options.altText);
    btn.id = this.options.id;
    btn.className = 'search-btn-style';

    // 버튼 위치 설정
    Object.assign(btn.style, this.options.position);

    // 이미지 삽입
    const img = document.createElement('img');
    img.src = this.options.iconSrc;
    img.alt = this.options.altText;
    img.className = 'search-icon-img';
    btn.appendChild(img);

    return btn;
  }
  //찾기 버튼 클릭 핸들러
  private onClick() {
    //타입이 게임일 때
    if (this.options.type === 'game') {
      this.options.gameCallback?.();
    }
    //타입이 단서일 때
    else if (this.options.type === 'clue') {
      //단서를 안 찾았을때
      if (!this.isFound) {
        this.isFound = true;
        showCluePopup({
          clueImgSrc: this.options.clueImgSrc,
          message: this.options.clueMessage,
        });
        //단서를 이미 찾았을 때
      } else {
        showCluePopup({
          clueImgSrc: '',
          message: this.options.emptyMessage,
        });
      }
    }
  }

  //DOM에 붙이기
  public appendTo(target: HTMLElement) {
    target.appendChild(this.element);
  }
}

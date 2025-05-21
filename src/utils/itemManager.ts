import type { IInventoryItem } from '../types/type';

// 커스텀 이벤트 연결
export const ITEM_SELECTED_EVENT = 'item-selected';

class ItemManager {
  private itemList: IInventoryItem[] = [];
  private inventoryElement: HTMLDialogElement;
  private selectedItem: IInventoryItem | null;
  private eventTarget: EventTarget;

  constructor() {
    this.inventoryElement = this.createInventory();
    this.selectedItem = null;
    this.eventTarget = new EventTarget();
  }
  //인벤토리 요소 생성
  private createInventory(): HTMLDialogElement {
    const inventory = document.createElement('dialog');
    inventory.className = 'inventory-style';

    const slotBox = document.createElement('div');
    slotBox.className = 'slot-box-style';
    inventory.appendChild(slotBox);

    for (let i = 0; i < 6; i++) {
      const itemSlot = document.createElement('div');
      itemSlot.className = 'item-slot-style';
      itemSlot.setAttribute('data-slot-id', i.toString());

      slotBox.appendChild(itemSlot);
    }

    const btnContainer = document.createElement('div');
    btnContainer.className = 'mx-auto flex justify-between items-center w-10/12 mt-4';
    inventory.appendChild(btnContainer);

    const closeButton = document.createElement('button');
    closeButton.className = 'w-50 h-15 border-4 rounded-2xl border-[#464646] bg-[#ff3b3b] text-white';
    closeButton.textContent = '닫기';
    closeButton.addEventListener('click', () => {
      this.closeInventory();
    });

    const usedItemButton = document.createElement('button');
    usedItemButton.className = 'w-50 h-15 border-4 rounded-2xl border-[#464646] bg-[#14AB00] text-white';
    usedItemButton.textContent = '사용하기';
    usedItemButton.addEventListener('click', () => {
      // 선택된 아이템 찾기
      const selectedItem = this.itemList.find(item => item.isSelected);

      if (selectedItem) {
        // 선택된 아이템을 selectedItem으로 설정
        this.setSelectedItem(selectedItem);
        console.log('아이템 사용: ', selectedItem.name);
      } else {
        console.log('사용할 아이템이 선택되지 않았습니다.');
      }

      this.closeInventory();
    });

    btnContainer.appendChild(usedItemButton);
    btnContainer.appendChild(closeButton);
    return inventory;
  }
  //인벤토리 열기 닫기
  public openInventory() {
    // 이미 선택된 아이템이 있다면 isSelected 속성 업데이트
    if (this.selectedItem) {
      this.itemList.forEach(item => {
        item.isSelected = item.id === this.selectedItem?.id;
      });
    }

    this.renderItems();
    this.inventoryElement.showModal();
  }
  public closeInventory() {
    console.log('인벤토리 닫기');
    this.inventoryElement.close();
  }
  //인벤토리에 아이템이 있는지 확인

  //인벤토리 아이템 추가
  public addItem(item: IInventoryItem) {
    this.itemList.push(item);
    this.renderItems(); // 아이템 렌더링 호출
    console.log(this.itemList);
  }
  //인벤토리 아이템 삭제
  // public removeItem(item: IInventoryItem) {}

  //인벤토리 아이템 렌더링
  private renderItems() {
    const slotBox = this.inventoryElement.querySelector('.slot-box-style');
    if (!slotBox) return;

    const slots = slotBox.querySelectorAll('.item-slot-style');
    slots.forEach(slot => {
      slot.innerHTML = '';
    });

    this.itemList.forEach((item, index) => {
      if (index >= slots.length) return;

      const slot = slots[index];
      const itemElement = document.createElement('div');

      // 현재 선택된 아이템이 있다면 그 아이템에만 active 클래스 추가
      if (this.selectedItem && this.selectedItem.id === item.id) {
        itemElement.className = 'border-4 rounded-2xl active';
        // selectedItem과 일치하는 경우에도 UI에서만 보여주는 isSelected 속성은 그대로 유지
      } else if (item.isSelected) {
        // 실제 selectedItem은 아니지만 UI에서 선택된 상태
        itemElement.className = 'border-4 rounded-2xl active';
      } else {
        itemElement.className = 'border-4 rounded-2xl';
        item.isSelected = false;
      }

      itemElement.setAttribute('data-item-id', item.id);
      const itemImg = document.createElement('img');
      itemImg.src = item.image;
      itemImg.alt = item.name;
      itemImg.className = 'w-full h-full object-contain';
      itemElement.addEventListener('click', () => {
        // 모든 아이템 선택 해제
        this.itemList.forEach(i => {
          i.isSelected = false;
        });

        // 현재 아이템에 대한 토글 로직
        item.isSelected = !item.isSelected;

        // UI 표시만 업데이트 (실제 selectedItem은 설정하지 않음)
        if (item.isSelected) {
          console.log('아이템 UI 선택');
        } else {
          console.log('아이템 UI 선택 해제');
        }

        // 선택 상태 변경 후 다시 렌더링
        this.renderItems();
      });

      itemElement.appendChild(itemImg);
      slot.appendChild(itemElement);
    });
  }
  public setSelectedItem(item: IInventoryItem | null) {
    this.selectedItem = item;

    // 셀렉트 아이템 변경 이벤트 감지
    const event = new CustomEvent(ITEM_SELECTED_EVENT, {
      detail: { selectedItem: this.selectedItem },
    });
    this.eventTarget.dispatchEvent(event);
  }

  public getSelectedItem() {
    return this.selectedItem;
  }

  public addEventListener(type: string, listener: EventListener) {
    this.eventTarget.addEventListener(type, listener);
  }

  public removeEventListener(type: string, listener: EventListener) {
    this.eventTarget.removeEventListener(type, listener);
  }

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.inventoryElement);
  }

  public checkItem(itemId: string): boolean {
    return this.itemList.some(item => item.id === itemId);
  }
}

export default ItemManager;

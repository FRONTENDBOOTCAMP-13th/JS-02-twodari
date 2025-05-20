import type { IInventoryItem } from '../types/type';

class ItemManager {
  private itemList: IInventoryItem[] = [];
  private inventoryElement: HTMLDialogElement;

  constructor() {
    this.inventoryElement = this.createInventory();
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

    btnContainer.appendChild(usedItemButton);
    btnContainer.appendChild(closeButton);
    return inventory;
  }
  //인벤토리 열기 닫기
  public openInventory() {
    this.inventoryElement.showModal();
  }
  public closeInventory() {
    console.log('인벤토리 닫기');
    this.inventoryElement.close();
  }

  //인벤토리 아이템 추가
  public addItem(item: IInventoryItem) {
    this.itemList.push(item);
    console.log(this.itemList);
  }
  //인벤토리 아이템 삭제
  // public removeItem(item: IInventoryItem) {}

  //인벤토리 아이템 렌더링

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.inventoryElement);
  }
}

export default ItemManager;

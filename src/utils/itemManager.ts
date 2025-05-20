interface IItemInfo {
  id: number;
  name: string;
  desc: string;
  imgSrc: string;
}

class ItemManager {
  private itemList: IItemInfo[] = [];
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
      itemSlot.setAttribute('data-id', i.toString());

      slotBox.appendChild(itemSlot);
    }

    // const itemImg = document.createElement('img');
    // itemImg.src = '/src/assets/icon/item.svg'; //item 객체 imgSrc
    // itemImg.alt = 'item 객체 name 들어와야함';

    // itemContainer.appendChild(itemImg);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'mx-auto flex justify-between items-center w-10/12 mt-4';
    inventory.appendChild(btnContainer);

    const closeButton = document.createElement('button');
    closeButton.className = 'w-20 h-10 border-4 rounded-2xl border-[#464646] bg-[#ff3b3b] text-white';
    closeButton.textContent = '닫기';
    closeButton.addEventListener('click', () => {
      this.closeInventory();
    });

    const usedItemButton = document.createElement('button');
    usedItemButton.className = 'w-20 h-10 border-4 rounded-2xl border-[#464646] bg-[#14AB00] text-white';
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
  public addItem(item: IItemInfo) {
    this.itemList.push(item);
  }
  //인벤토리 아이템 삭제
  public removeItem() {}

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.inventoryElement);
  }
}

export default ItemManager;

/**
 * inventory_manager.ts
 *
 * 인벤토리 관리 클래스
 * - 아이템 추가, 제거, 확인
 * - 인벤토리 UI 표시/숨기기
 * - 인벤토리 렌더링 (아이템 목록 표시)
 */

import { IInventoryItem } from '../../../src/types/type';

export class InventoryManager {
  private inventory: IInventoryItem[] = [];
  private inventoryElement: HTMLElement | null = null;
  private inventoryGridElement: HTMLElement | null = null;

  constructor() {
    this.inventoryElement = document.getElementById('inventory');
    this.inventoryGridElement = document.getElementById('inventory-grid');

    const closeButton = document.getElementById('inventory-close');
    if (closeButton) {
      closeButton.addEventListener('click', this.onInventoryClose);
    }
  }

  public addItem = (item: IInventoryItem) => {
    if (this.hasItem(item.id)) return;

    this.inventory.push(item);
    this.renderInventory();
  };

  public removeItem = (id: string) => {
    this.inventory = this.inventory.filter(item => item.id !== id);
    this.renderInventory();
  };

  public hasItem = (id: string): boolean => {
    return this.inventory.some(item => item.id === id);
  };

  public toggleInventory = () => {
    if (!this.inventoryElement) return;

    if (this.inventoryElement.classList.contains('hidden-element')) {
      this.showInventory();
    } else {
      this.hideInventory();
    }
  };

  public showInventory = () => {
    if (!this.inventoryElement) return;

    this.inventoryElement.classList.remove('hidden-element');
    this.inventoryElement.style.display = 'block';
    this.inventoryElement.style.zIndex = '80';

    this.renderInventory();
  };

  private onInventoryClose = () => {
    this.hideInventory();
  };

  public hideInventory = () => {
    if (!this.inventoryElement) return;

    this.inventoryElement.classList.add('hidden-element');
    this.inventoryElement.style.display = 'none';
  };

  private renderInventory = () => {
    if (!this.inventoryGridElement) return;

    // 기존 아이템 제거
    this.inventoryGridElement.innerHTML = '';

    // 아이템이 없는 경우
    if (this.inventory.length === 0) {
      this.renderEmptyInventory();
      return;
    }

    // 아이템 렌더링
    this.inventory.forEach(item => {
      this.renderInventoryItem(item);
    });
  };

  private renderEmptyInventory = () => {
    if (!this.inventoryGridElement) return;

    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'text-gray-400 col-span-4 text-center py-8';
    emptyMessage.textContent = '아이템이 없습니다';
    this.inventoryGridElement.appendChild(emptyMessage);
  };

  private renderInventoryItem = (item: IInventoryItem) => {
    if (!this.inventoryGridElement) return;

    const itemElement = document.createElement('div');
    itemElement.className = 'bg-gray-800 p-2 rounded flex flex-col items-center';

    // 이미지
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.className = 'w-16 h-16 object-contain mb-2';

    // 이름
    const nameElement = document.createElement('span');
    nameElement.textContent = item.name;
    nameElement.className = 'text-white text-sm text-center';

    itemElement.appendChild(img);
    itemElement.appendChild(nameElement);
    itemElement.addEventListener('click', this.onItemClick(item));
    this.inventoryGridElement.appendChild(itemElement);
  };

  private onItemClick = (item: IInventoryItem) => () => {
    alert(`${item.name}: ${item.description}`);
  };
}

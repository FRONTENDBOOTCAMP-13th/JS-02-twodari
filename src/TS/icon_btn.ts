import CreateIconBtn from '../utils/createIconBtn';
import ItemManager from '../utils/itemManager';

const btnBox = document.getElementById('btn-box');
const inventoryBox = document.getElementById('inventory-box');

const hintButton = new CreateIconBtn({
  type: 'hint',
  iconSrc: '/src/assets/icon/hint.svg',
  altText: '힌트 획득 버튼',
  text: 'HINT',
  isActive: false,
  onClick: () => {
    console.log('힌트 클릭');
    // showHint()
  },
});

const musicButton = new CreateIconBtn({
  type: 'music',
  iconSrc: '/src/assets/icon/on_music.svg',
  altText: 'BGM 재생 버튼',
  text: 'MUSIC',
  isActive: false,
  onClick: (() => {
    const bgm = new Audio('/effectSound/backGround.mp3');
    bgm.loop = true;
    bgm.volume = 0.3;

    return () => {
      const isActive = musicButton.getElement().classList.contains('active');

      if (isActive) {
        bgm.play();
      } else {
        bgm.pause();
        bgm.currentTime = 0;
      }
    };
  })(),
});

const inventory = new ItemManager();
const itemButton = new CreateIconBtn({
  type: 'item',
  iconSrc: '/src/assets/icon/item.svg',
  altText: '인벤토리 버튼',
  text: 'ITEM',
  isActive: false,
  onClick: () => {
    console.log('인벤토리 오픈');
    inventory.openInventory();
    // openItem()
  },
});

if (inventoryBox) {
  inventory.appendTo(inventoryBox);
}

if (btnBox) {
  hintButton.appendTo(btnBox);
  musicButton.appendTo(btnBox);
  itemButton.appendTo(btnBox);
} else {
  console.error('박스가 없습니다.');
}

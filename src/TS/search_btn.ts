import createSearchBtn from '../utils/createSearchBtn';
import { showCluePopup } from '../utils/showCluePopup';

const searchButtonBox = document.getElementById('search-btn-box');

if (searchButtonBox) {
  //첫번째 찾기 버튼
  const searchButton1 = createSearchBtn({
    iconSrc: '/src/assets/icon/search.svg',
    altText: '쓰레기통 단서 찾기',
    position: { top: '30%', left: '10%' },
    id: 'search-btn-1',
  });

  //두번째 찾기 버튼
  const searchButton2 = createSearchBtn({
    iconSrc: '/src/assets/icon/search.svg',
    altText: '쓰레기통 단서 찾기',
    position: { top: '20%', left: '20%' },
    id: 'search-btn-2',
  });

  //세번째 찾기 버튼
  const searchButton3 = createSearchBtn({
    iconSrc: '/src/assets/icon/search.svg',
    altText: '쓰레기통 단서 찾기',
    position: { top: '70%', left: '70%' },
    id: 'search-btn-3',
  });

  //이벤트 연결
  searchButton1.addEventListener('click', () => {
    showCluePopup({
      clueImgSrc: '/src/assets/img/clue_1.png',
      message: '단서1 을(를) 획득했다.',
    });
  });

  searchButton2.addEventListener('click', () => {
    showCluePopup({
      clueImgSrc: '/src/assets/img/clue_2.png',
      message: '단서2 을(를) 획득했다.',
    });
  });

  searchButton3.addEventListener('click', () => {
    showCluePopup({
      clueImgSrc: '/src/assets/img/clue_3.png',
      message: '단서3 을(를) 획득했다.',
    });
  });

  searchButtonBox.append(searchButton1, searchButton2, searchButton3);
}

// src/TS/ControlTower.ts
import '../style.css';
import './components/scale_game';
import './components/move_btn';
import './components/icon_btn';
import './components/timer';
import { TransitionEffect } from '../utils/transition_effect';

// 페이지 로드 시 TransitionEffect 초기화
document.addEventListener('DOMContentLoaded', () => {
  TransitionEffect.initialize();
});

import './style.css';
import { Game } from './game/Game';

const app = document.getElementById('app');
if (!app) {
  throw new Error('App container not found');
}

const game = new Game('app');
game.start();

import type { GameState } from '../types';

type StateCallback = (from: GameState | null, to: GameState) => void;

export class StateMachine {
  private state: GameState = 'menu';
  private listeners: StateCallback[] = [];

  get current(): GameState {
    return this.state;
  }

  transition(to: GameState) {
    const from = this.state;
    this.state = to;
    this.listeners.forEach((cb) => cb(from, to));
  }

  onTransition(cb: StateCallback) {
    this.listeners.push(cb);
  }

  is(state: GameState): boolean {
    return this.state === state;
  }
}

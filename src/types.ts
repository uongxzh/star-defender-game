import { Vector2 } from './utils/Vector2';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface Entity {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  active: boolean;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface EnemyType {
  name: string;
  speed: number;
  health: number;
  damage: number;
  score: number;
  radius: number;
  color: string;
}

export interface PowerUpType {
  name: string;
  color: string;
  duration?: number;
}

export interface ParticleData {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameStats {
  score: number;
  wave: number;
  kills: number;
  time: number;
}

export type WeaponKind = 'firepower' | 'spread' | 'rapid' | 'pierce';

export interface WeaponUpgradeState {
  kind: WeaponKind;
  level: number; // 1-3
}

export interface WeaponConfig {
  name: string;
  color: string;
  icon: string;
  maxLevel: number;
  fireRateMultiplier(level: number): number;
  bulletCount(level: number): number;
  piercing(level: number): number;
}

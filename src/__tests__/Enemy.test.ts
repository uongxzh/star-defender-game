import { describe, it, expect } from 'vitest';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Input } from '../game/Input';

describe('Enemy', () => {
  it('spawns with correct stats for chaser type', () => {
    const enemy = new Enemy();
    const canvas = document.createElement('canvas');
    const input = new Input(canvas);
    const player = new Player(input);

    enemy.spawn('CHASER');
    enemy.setTarget(player);

    expect(enemy.typeName).toBe('chaser');
    expect(enemy.health).toBe(30);
    expect(enemy.speed).toBe(150);
    expect(enemy.damage).toBe(10);
    expect(enemy.score).toBe(10);
    expect(enemy.active).toBe(true);
  });

  it('spawns with correct stats for tank type', () => {
    const enemy = new Enemy();
    const canvas = document.createElement('canvas');
    const input = new Input(canvas);
    const player = new Player(input);

    enemy.spawn('TANK');
    enemy.setTarget(player);

    expect(enemy.typeName).toBe('tank');
    expect(enemy.health).toBe(80);
    expect(enemy.speed).toBe(80);
  });

  it('spawns with correct stats for fast type', () => {
    const enemy = new Enemy();
    const canvas = document.createElement('canvas');
    const input = new Input(canvas);
    const player = new Player(input);

    enemy.spawn('FAST');
    enemy.setTarget(player);

    expect(enemy.typeName).toBe('fast');
    expect(enemy.health).toBe(15);
    expect(enemy.speed).toBe(280);
  });

  it('takes damage and dies when health reaches zero', () => {
    const enemy = new Enemy();
    const canvas = document.createElement('canvas');
    const input = new Input(canvas);
    const player = new Player(input);

    enemy.spawn('CHASER');
    enemy.setTarget(player);

    expect(enemy.takeDamage(10)).toBe(false);
    expect(enemy.health).toBe(20);
    expect(enemy.takeDamage(20)).toBe(true);
    expect(enemy.health).toBe(0);
  });
});

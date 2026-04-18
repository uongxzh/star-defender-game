import { Canvas } from './Canvas';
import { Input } from './Input';
import { AudioSystem } from './Audio';
import { StateMachine } from './StateMachine';
import { GameLoop } from './GameLoop';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { PowerUp } from '../entities/PowerUp';
import { ParticleSystem } from '../systems/ParticleSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ObjectPool } from '../systems/ObjectPool';
import { Vector2 } from '../utils/Vector2';
import {
  GAME_WIDTH, GAME_HEIGHT, FIXED_DT, COLORS,
  PLAYER_FIRE_RATE, POWERUP_TYPES, ENEMY_TYPES,
} from '../utils/constants';
import type { GameStats } from '../types';

export class Game {
  canvas: Canvas;
  input: Input;
  audio: AudioSystem;
  state: StateMachine;
  loop: GameLoop;

  player: Player;
  bullets: Bullet[] = [];
  enemies: Enemy[] = [];
  powerUps: PowerUp[] = [];

  particleSystem: ParticleSystem;
  waveSystem: WaveSystem;
  collisionSystem: CollisionSystem;

  bulletPool: ObjectPool<Bullet>;
  enemyPool: ObjectPool<Enemy>;
  powerUpPool: ObjectPool<PowerUp>;

  stats: GameStats = { score: 0, wave: 0, kills: 0, time: 0 };
  totalTime = 0;

  constructor(containerId: string) {
    this.canvas = new Canvas(containerId);
    this.input = new Input(this.canvas.element);
    this.audio = new AudioSystem();
    this.state = new StateMachine();

    this.player = new Player(this.input);
    this.particleSystem = new ParticleSystem();
    this.waveSystem = new WaveSystem((type, wave) => this.spawnEnemy(type, wave));
    this.collisionSystem = new CollisionSystem();

    this.bulletPool = new ObjectPool<Bullet>(
      () => new Bullet(),
      (b) => { b.active = false; },
      50
    );
    this.enemyPool = new ObjectPool<Enemy>(
      () => new Enemy(),
      (e) => { e.active = false; },
      50
    );
    this.powerUpPool = new ObjectPool<PowerUp>(
      () => new PowerUp(),
      (p) => { p.active = false; },
      20
    );

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      FIXED_DT
    );

    this.state.onTransition((from, to) => {
      if (to === 'playing') {
        this.audio.startBGM();
        if (from === 'menu' || from === 'gameover') {
          this.resetGame();
        }
      }
      if (to === 'paused') {
        this.audio.stopBGM();
      }
      if (to === 'gameover') {
        this.audio.stopBGM();
        this.audio.playGameOver();
      }
      if (to === 'menu') {
        this.audio.stopBGM();
      }
    });
  }

  start() {
    this.loop.start();
  }

  private resetGame() {
    this.player.reset();
    this.bullets.forEach((b) => this.bulletPool.release(b));
    this.bullets = [];
    this.enemies.forEach((e) => this.enemyPool.release(e));
    this.enemies = [];
    this.powerUps.forEach((p) => this.powerUpPool.release(p));
    this.powerUps = [];
    this.particleSystem.clear();
    this.waveSystem.reset();
    this.stats = { score: 0, wave: 0, kills: 0, time: 0 };
    this.totalTime = 0;
    this.waveSystem.startWave();
  }

  private spawnEnemy(type: keyof typeof ENEMY_TYPES, wave: number = 1) {
    const enemy = this.enemyPool.acquire();
    enemy.spawn(type, wave);
    enemy.setTarget(this.player);
    this.enemies.push(enemy);
  }

  private spawnBullet(pos: Vector2, direction: Vector2, damage: number) {
    const bullet = this.bulletPool.acquire();
    bullet.spawn(pos, direction, damage);
    this.bullets.push(bullet);
    this.audio.playShoot();
    this.particleSystem.spawnTrail(pos, direction.mul(-1), 1);
  }

  private update(dt: number) {
    this.input.resetFrame();
    this.totalTime += dt;
    this.stats.time = this.totalTime;

    switch (this.state.current) {
      case 'menu':
        this.updateMenu();
        break;
      case 'playing':
        this.updatePlaying(dt);
        break;
      case 'paused':
        this.updatePaused();
        break;
      case 'gameover':
        this.updateGameOver();
        break;
    }
  }

  private updateMenu() {
    if (this.input.mousePressed || this.input.isPressed('enter') || this.input.isPressed(' ')) {
      this.state.transition('playing');
    }
  }

  private updatePlaying(dt: number) {
    if (this.input.isPressed('escape') || this.input.isPressed('p')) {
      this.state.transition('paused');
      return;
    }
    this.player.update(dt);

    if (this.player.canShoot()) {
      const dirs = this.player.getFirePattern();
      const spawnPos = this.player.position.clone();
      for (const dir of dirs) {
        this.spawnBullet(spawnPos, dir, 10);
      }
    }

    this.waveSystem.update(dt);
    this.stats.wave = this.waveSystem.wave;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt);
      if (!enemy.active) {
        this.enemyPool.release(enemy);
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(dt);
      if (!bullet.active) {
        this.bulletPool.release(bullet);
        this.bullets.splice(i, 1);
      }
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.update(dt);
      if (!pu.active) {
        this.powerUpPool.release(pu);
        this.powerUps.splice(i, 1);
      }
    }

    this.particleSystem.update(dt);

    const { bulletHits, playerHits, powerUpCollects } = this.collisionSystem.checkCollisions(
      this.player, this.bullets, this.enemies, this.powerUps
    );

    for (const { bullet, enemy } of bulletHits) {
      bullet.active = false;
      if (enemy.takeDamage(bullet.damage)) {
        enemy.active = false;
        this.stats.score += enemy.score;
        this.stats.kills++;
        this.waveSystem.enemiesKilled++;
        this.audio.playExplosion();
        this.particleSystem.spawnExplosion(enemy.position, 15, enemy.typeName === 'fast' ? '#22c55e' : undefined);

        if (Math.random() < 0.15) {
          const pu = this.powerUpPool.acquire();
          pu.spawn(enemy.position);
          this.powerUps.push(pu);
        }
      } else {
        this.particleSystem.spawnHit(enemy.position, '#fff');
        this.audio.playHit();
      }
    }

    for (const enemy of playerHits) {
      if (this.player.takeDamage(enemy.damage)) {
        this.audio.playHit();
        this.particleSystem.spawnExplosion(this.player.position, 8, '#3b82f6');
      }
      enemy.active = false;
      this.particleSystem.spawnExplosion(enemy.position, 10);
    }

    for (const pu of powerUpCollects) {
      pu.active = false;
      this.applyPowerUp(pu.typeName);
      this.audio.playPowerUp();
      this.particleSystem.spawnExplosion(pu.position, 8, pu.getType().color);
    }

    if (this.player.isDead()) {
      this.state.transition('gameover');
    }
  }

  private applyPowerUp(typeName: string) {
    const type = POWERUP_TYPES[typeName as keyof typeof POWERUP_TYPES];
    if (!type) return;

    switch (typeName) {
      case 'double_shot':
        this.player.weapon = { type: 'double', timer: type.duration, fireRate: PLAYER_FIRE_RATE };
        break;
      case 'triple_shot':
        this.player.weapon = { type: 'triple', timer: type.duration, fireRate: PLAYER_FIRE_RATE };
        break;
      case 'rapid_fire':
        this.player.weapon = { type: 'rapid', timer: type.duration, fireRate: PLAYER_FIRE_RATE * 0.4 };
        break;
      case 'shield':
        this.player.shieldTimer = type.duration;
        break;
    }
  }

  private updatePaused() {
    if (this.input.isPressed('p')) {
      this.state.transition('playing');
    }
    if (this.input.isPressed('escape')) {
      this.resetGame();
      this.state.transition('menu');
    }
  }

  private updateGameOver() {
    if (this.input.isPressed('r')) {
      this.resetGame();
      this.start();
    }
    if (this.input.isPressed('escape')) {
      this.resetGame();
      this.state.transition('menu');
    }
  }

  private render() {
    this.canvas.fill(COLORS.background);
    this.renderBackground();

    switch (this.state.current) {
      case 'menu':
        this.renderMenu();
        break;
      case 'playing':
      case 'paused':
        this.renderPlaying();
        break;
      case 'gameover':
        this.renderGameOver();
        break;
    }
  }

  private renderBackground() {
    const ctx = this.canvas.ctx;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    const offsetX = (this.totalTime * 0.02) % gridSize;
    const offsetY = (this.totalTime * 0.01) % gridSize;

    for (let x = -gridSize; x < GAME_WIDTH + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - offsetX, 0);
      ctx.lineTo(x - offsetX, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = -gridSize; y < GAME_HEIGHT + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y - offsetY);
      ctx.lineTo(GAME_WIDTH, y - offsetY);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPlaying() {
    const ctx = this.canvas.ctx;

    this.particleSystem.render(ctx);

    for (const pu of this.powerUps) pu.render(ctx);
    for (const bullet of this.bullets) bullet.render(ctx);
    for (const enemy of this.enemies) enemy.render(ctx);
    this.player.render(ctx);

    this.renderHUD(ctx);

    if (this.state.current === 'paused') {
      this.renderOverlay(ctx, '游戏暂停', '按 P 或 ESC 继续');
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`分数: ${this.stats.score}`, 20, 30);
    ctx.fillText(`波次: ${this.stats.wave}`, 20, 55);
    ctx.fillText(`击杀: ${this.stats.kills}`, 20, 80);

    const timeSec = Math.floor(this.stats.time / 1000);
    const mins = Math.floor(timeSec / 60);
    const secs = timeSec % 60;
    ctx.textAlign = 'right';
    ctx.fillText(
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      GAME_WIDTH - 20, 30
    );

    const barW = 200;
    const barH = 12;
    const barX = GAME_WIDTH - barW - 20;
    const barY = 50;
    ctx.fillStyle = COLORS.healthBarBg;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = COLORS.healthBar;
    ctx.fillRect(barX, barY, barW * (this.player.health / this.player.maxHealth), barH);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    if (this.player.weapon.type !== 'single') {
      ctx.textAlign = 'right';
      ctx.fillStyle = POWERUP_TYPES[this.player.weapon.type.toUpperCase() as keyof typeof POWERUP_TYPES]?.color || '#fff';
      ctx.font = 'bold 16px monospace';
      const secsLeft = Math.ceil(this.player.weapon.timer / 1000);
      ctx.fillText(`${this.getWeaponName()} (${secsLeft}s)`, GAME_WIDTH - 20, 80);
    }

    ctx.restore();
  }

  private getWeaponName(): string {
    const names: Record<string, string> = {
      double: '双发',
      triple: '三发',
      rapid: '速射',
    };
    return names[this.player.weapon.type] || '';
  }

  private renderMenu() {
    const ctx = this.canvas.ctx;
    this.renderOverlay(ctx, '星际防御者', '点击鼠标或按空格键开始游戏');

    ctx.save();
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WASD / 方向键移动  |  鼠标瞄准射击  |  P / ESC 暂停', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
    ctx.restore();
  }

  private renderGameOver() {
    const ctx = this.canvas.ctx;
    this.renderOverlay(ctx, '游戏结束', '点击鼠标或按空格键重新开始');

    ctx.save();
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`最终分数: ${this.stats.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
    ctx.fillText(`存活波次: ${this.stats.wave}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90);
    ctx.fillText(`击杀敌人: ${this.stats.kills}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120);

    const timeSec = Math.floor(this.stats.time / 1000);
    const mins = Math.floor(timeSec / 60);
    const secs = timeSec % 60;
    ctx.fillText(
      `存活时间: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150
    );
    ctx.restore();
  }

  private renderOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.shadowBlur = 20;
    ctx.shadowColor = COLORS.playerGlow;
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);

    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '20px monospace';
    ctx.fillText(subtitle, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    ctx.restore();
  }
}

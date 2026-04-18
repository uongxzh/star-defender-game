# 星际防御者 (Star Defender)

一个基于 HTML5 Canvas 的 2D 射击类网页小游戏。

## 在线体验

构建产物为纯静态文件，可直接部署到任何静态托管服务。

## 功能特性

- **流畅操控**：WASD / 方向键移动，鼠标瞄准射击，支持移动端触摸控制
- **敌人波次系统**：难度逐波递增， spawn 间隔逐渐缩短
- **三种敌人类型**：
  - 追击者 (Chaser)：均衡型，红色圆形
  - 坦克 (Tank)：高血量低移速，紫色方块
  - 快速者 (Fast)：低血量高移速，绿色三角
- **武器升级系统**：
  - 双发射击 (2X)
  - 三发散射 (3X)
  - 速射 (R)
  - 护盾 (S)
- **粒子特效**：爆炸、尾焰、受击粒子效果
- **音效系统**：使用 Web Audio API 生成射击、爆炸、拾取等音效
- **完整的游戏循环**：开始菜单 → 游戏中 → 暂停 → 游戏结束 → 重新开始
- **响应式设计**：自适应不同屏幕尺寸

## 技术栈

- **前端框架**：原生 HTML5 Canvas + TypeScript
- **构建工具**：Vite
- **音频**：Web Audio API
- **部署**：静态文件，支持 GitHub Pages / Vercel / Netlify

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 项目结构

```
src/
  main.ts              # 入口文件
  types.ts             # 类型定义
  style.css            # 全局样式
  game/
    Game.ts            # 游戏主控制器与状态机
    GameLoop.ts        # 固定时间步游戏循环
    Canvas.ts          # Canvas 初始化与响应式缩放
    Input.ts           # 键盘、鼠标、触摸输入处理
    Audio.ts           # Web Audio API 音效系统
    StateMachine.ts    # 游戏状态管理
  entities/
    Entity.ts          # 实体基类
    Player.ts          # 玩家飞船
    Enemy.ts           # 敌人（3 种类型）
    Bullet.ts          # 子弹
    PowerUp.ts         # 武器升级道具
    Particle.ts        # 粒子
  systems/
    CollisionSystem.ts # 碰撞检测
    WaveSystem.ts      # 敌人波次生成
    ParticleSystem.ts  # 粒子效果管理
    ObjectPool.ts      # 对象池（减少 GC）
  utils/
    Vector2.ts         # 二维向量数学
    constants.ts       # 游戏常量与配置
```

## 浏览器兼容性

- Chrome / Edge (推荐)
- Firefox
- Safari

需要支持 ES2023 和 HTML5 Canvas 的现代浏览器。

## 控制说明

| 操作 | 键位 |
|------|------|
| 移动 | WASD / 方向键 |
| 瞄准 | 鼠标 |
| 射击 | 鼠标左键按住 |
| 暂停 | P / ESC |
| 移动端 | 左侧触摸拖动移动，右侧触摸瞄准射击 |

## License

MIT

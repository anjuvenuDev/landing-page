import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { parseAvatarSprite } from "../avatar/cssPixelSprite";
import type { GameLevel } from "../data/portfolio";

type MemoryQuestGameProps = {
  level: GameLevel;
  reducedMotion: boolean;
  onComplete: (sectionId: GameLevel["id"]) => void;
  paused?: boolean;
};

type LevelTheme = {
  key: string;
  sky: number;
  horizon: number;
  cloud: number;
  far: number;
  mid: number;
  near: number;
  soil: number;
  grass: number;
  water: number;
  accent: number;
  obstacle: string;
  dressing: "canyon" | "moonForest" | "sunset" | "deepForest" | "crystal" | "guild" | "garden" | "archive";
};

const levelThemes: LevelTheme[] = [
  { key: "canyon", sky: 0x68c6b4, horizon: 0xcfe68e, cloud: 0xf3f0a2, far: 0xb5c57d, mid: 0x9b7a4d, near: 0x5a3527, soil: 0x6d432f, grass: 0xf3dda4, water: 0x236ca8, accent: 0x8ccf61, obstacle: "obstacle-cactus", dressing: "canyon" },
  { key: "night-jungle", sky: 0x1b6498, horizon: 0x633b9a, cloud: 0x264c93, far: 0x8b4f35, mid: 0x405d35, near: 0x23311f, soil: 0x5d3c2e, grass: 0x93b96a, water: 0x1f5f85, accent: 0xf5f5b8, obstacle: "obstacle-log", dressing: "moonForest" },
  { key: "sunset-grove", sky: 0xe96847, horizon: 0xffb451, cloud: 0xffd06f, far: 0xb95a2c, mid: 0x71331f, near: 0x301817, soil: 0x4b261e, grass: 0xf0b236, water: 0x8a5a42, accent: 0xffe08a, obstacle: "obstacle-stump", dressing: "sunset" },
  { key: "blue-woods", sky: 0x0b263c, horizon: 0x16455a, cloud: 0x2d6c79, far: 0x0d3144, mid: 0x123f4d, near: 0x061122, soil: 0x0f2630, grass: 0x5fb8b4, water: 0x174c66, accent: 0x80ffdb, obstacle: "obstacle-bramble", dressing: "deepForest" },
  { key: "crystal", sky: 0x172034, horizon: 0x334c78, cloud: 0x7aa6c5, far: 0x334c78, mid: 0x1f6f88, near: 0x10242b, soil: 0x233144, grass: 0x80ffdb, water: 0x2a7fa0, accent: 0x80ffdb, obstacle: "obstacle-crystal", dressing: "crystal" },
  { key: "guild", sky: 0x88c9a5, horizon: 0xd7e792, cloud: 0xf3f0a2, far: 0xa88750, mid: 0x7a5232, near: 0x243a2d, soil: 0x5d3b26, grass: 0xfacc15, water: 0x2f7185, accent: 0xfacc15, obstacle: "obstacle-banner", dressing: "guild" },
  { key: "moon-garden", sky: 0x1c2130, horizon: 0x46617b, cloud: 0x8197a8, far: 0x46617b, mid: 0x4a6234, near: 0x17251e, soil: 0x35442f, grass: 0xa7f3d0, water: 0x356f8d, accent: 0xa7f3d0, obstacle: "obstacle-mushroom", dressing: "garden" },
  { key: "archive", sky: 0x201820, horizon: 0x5b4b66, cloud: 0xb891a8, far: 0x5b4b66, mid: 0x7a5735, near: 0x211a1d, soil: 0x5d3c2e, grass: 0xf9a8d4, water: 0x553a58, accent: 0xf9a8d4, obstacle: "obstacle-trophy", dressing: "archive" },
];

class MemoryQuestScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<string, Phaser.Input.Keyboard.Key>;
  private level: GameLevel;
  private completeCallback: (sectionId: GameLevel["id"]) => void;
  private completed = false;
  private reducedMotion = false;
  private progressBar?: Phaser.GameObjects.Rectangle;
  private questText?: Phaser.GameObjects.Text;
  private chest?: Phaser.Physics.Arcade.Sprite;

  constructor(
    level: GameLevel,
    reducedMotion: boolean,
    completeCallback: (sectionId: GameLevel["id"]) => void,
  ) {
    super("memory-quest");
    this.level = level;
    this.reducedMotion = reducedMotion;
    this.completeCallback = completeCallback;
  }

  preload() {
    this.load.image("figma-forest", "/assets/figma-magic-cliffs.png");
    this.createPixelTextures();
  }

  create() {
    const { width, height } = this.scale;
    const theme = this.currentTheme();
    this.physics.world.setBounds(0, 0, 2300, height);
    this.cameras.main.setBounds(0, 0, 2300, height);

    this.createForest(width, height);
    this.createHud(width);

    const ground = this.physics.add.staticGroup();
    for (let x = 0; x < 2400; x += 64) {
      const tile = ground.create(x + 32, height - 52, "ground-tile");
      tile.setOrigin(0.5, 0.5).setVisible(false).refreshBody();
    }

    this.player = this.physics.add.sprite(140, height - 172, "anjana-avatar");
    this.player.setScale(0.72);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1200);
    this.player.setMaxVelocity(360, 720);
    this.player.body?.setSize(54, 84).setOffset(100, 156);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -160, 70);
    this.physics.add.collider(this.player, ground);

    const obstacles = this.physics.add.staticGroup();
    const gap = 500;
    for (let index = 0; index < this.level.obstacleCount; index += 1) {
      const obstacle = obstacles.create(560 + index * gap, height - 118, theme.obstacle);
      obstacle.setScale(1.14);
      obstacle.setDepth(9);
      obstacle.refreshBody();
    }
    this.physics.add.collider(this.player, obstacles, () => this.resetPlayer());

    const shard = this.physics.add.staticSprite(1780, height - 174, "memory-shard");
    shard.refreshBody();
    this.physics.add.overlap(this.player, shard, () => {
      if (this.completed) return;
      shard.disableBody(true, true);
      this.revealTreasure(height);
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D") as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;

    this.add.text(92, height - 96, "Move: arrows/A-D   Jump: space/W/up", {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "16px",
      color: "#f9e7b7",
      backgroundColor: "#211a1d",
      padding: { x: 12, y: 8 },
    }).setScrollFactor(0);
  }

  update() {
    if (!this.player || !this.cursors || !this.wasd) return;

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const jump =
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.W);

    if (left) {
      this.player.setAccelerationX(-900);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setAccelerationX(900);
      this.player.setFlipX(false);
    } else {
      this.player.setAccelerationX(0);
    }

    if (jump && this.player.body?.blocked.down) {
      this.player.setVelocityY(-520);
    }

    const progress = Phaser.Math.Clamp(this.player.x / 1840, 0, 1);
    this.progressBar?.setDisplaySize(184 * progress, 10);
  }

  private createPixelTextures() {
    const theme = this.currentTheme();
    const avatarSprite = parseAvatarSprite();
    const avatar = this.make.graphics({ x: 0, y: 0 }, false);
    avatarSprite.pixels.forEach((pixel) => {
      avatar.fillStyle(pixel.color, pixel.alpha);
      avatar.fillRect(pixel.x, pixel.y, avatarSprite.cellSize, avatarSprite.cellSize);
    });
    avatar.generateTexture("anjana-avatar", avatarSprite.width, avatarSprite.height);

    const ground = this.make.graphics({ x: 0, y: 0 }, false);
    ground.fillStyle(theme.near);
    ground.fillRect(0, 0, 64, 40);
    ground.fillStyle(theme.mid);
    ground.fillRect(0, 0, 64, 10);
    ground.fillStyle(theme.accent);
    ground.fillRect(8, 0, 8, 8);
    ground.fillRect(38, 2, 12, 6);
    ground.fillStyle(theme.far);
    ground.fillRect(12, 18, 12, 6);
    ground.fillRect(44, 24, 10, 6);
    ground.generateTexture("ground-tile", 64, 40);

    const stump = this.make.graphics({ x: 0, y: 0 }, false);
    stump.fillStyle(0x44231d);
    stump.fillRect(18, 18, 28, 44);
    stump.fillStyle(0x7f3f2f);
    stump.fillRect(14, 8, 36, 16);
    stump.fillStyle(0x211a1d);
    stump.fillRect(8, 4, 10, 12);
    stump.fillRect(46, 6, 8, 12);
    stump.fillStyle(0xff6f91);
    stump.fillRect(20, 0, 8, 8);
    stump.fillRect(36, 2, 8, 8);
    stump.generateTexture("thorn-stump", 64, 72);
    this.createObstacleTextures();

    const shard = this.make.graphics({ x: 0, y: 0 }, false);
    shard.fillStyle(0xffd166);
    shard.fillRect(18, 0, 14, 8);
    shard.fillRect(10, 8, 30, 12);
    shard.fillRect(16, 20, 18, 18);
    shard.fillRect(22, 38, 6, 10);
    shard.fillStyle(0xffffff);
    shard.fillRect(20, 10, 8, 8);
    shard.generateTexture("memory-shard", 52, 56);

    const chest = this.make.graphics({ x: 0, y: 0 }, false);
    chest.fillStyle(0x050505, 0.95);
    chest.fillRect(9, 30, 108, 74);
    chest.fillStyle(0xffc247, 1);
    chest.fillRect(13, 20, 18, 74);
    chest.fillRect(96, 20, 18, 74);
    chest.fillRect(27, 14, 72, 18);
    chest.fillRect(13, 52, 104, 12);
    chest.fillStyle(0x5a2418, 1);
    chest.fillRect(31, 24, 65, 26);
    chest.fillRect(31, 66, 65, 28);
    chest.fillStyle(0x8a3f25, 1);
    chest.fillRect(36, 28, 54, 8);
    chest.fillRect(36, 72, 54, 8);
    chest.fillStyle(0x2a120e, 1);
    chest.fillRect(38, 40, 50, 6);
    chest.fillRect(38, 84, 50, 6);
    chest.fillStyle(0xffe08a, 1);
    chest.fillRect(17, 24, 10, 16);
    chest.fillRect(101, 24, 9, 14);
    chest.fillRect(32, 18, 18, 6);
    chest.fillRect(70, 18, 20, 6);
    chest.fillStyle(0x211a1d, 1);
    chest.fillRect(75, 54, 24, 30);
    chest.fillStyle(0xf9e7b7, 1);
    chest.fillRect(82, 62, 7, 8);
    chest.fillStyle(0x9a5f3f, 1);
    chest.fillRect(39, 30, 8, 8);
    chest.fillRect(58, 30, 8, 8);
    chest.fillRect(77, 30, 8, 8);
    chest.fillRect(39, 74, 8, 8);
    chest.fillRect(58, 74, 8, 8);
    chest.fillRect(77, 74, 8, 8);
    chest.generateTexture("memory-chest", 128, 112);

    this.createTreeTexture("forest-tree-mid", 172, 264, 0x3b2419, 0x0f3f2b, 0x8ccf61);
    this.createTreeTexture("forest-tree-front", 212, 338, 0x4a2a1b, 0x165133, 0xe5f76a);
    this.createRoundTreeTexture("forest-tree-round", 158, 216);
  }

  private currentTheme() {
    return levelThemes[(this.level.level - 1) % levelThemes.length];
  }

  private createObstacleTextures() {
    const makeObstacle = (key: string, base: number, accent: number, dark: number) => {
      const obstacle = this.make.graphics({ x: 0, y: 0 }, false);
      obstacle.fillStyle(0x050505, 0.86);
      obstacle.fillRect(7, 68, 74, 9);
      obstacle.fillStyle(base, 1);
      obstacle.fillRect(14, 36, 52, 34);
      obstacle.fillStyle(dark, 0.95);
      obstacle.fillRect(20, 46, 40, 9);
      obstacle.fillStyle(accent, 1);
      obstacle.fillRect(26, 16, 10, 24);
      obstacle.fillRect(48, 20, 10, 20);
      obstacle.fillRect(34, 10, 18, 10);
      obstacle.generateTexture(key, 88, 82);
    };

    const cactus = this.make.graphics({ x: 0, y: 0 }, false);
    cactus.fillStyle(0x050505, 0.8);
    cactus.fillRect(10, 70, 72, 9);
    cactus.fillStyle(0x2f7a4d, 1);
    cactus.fillRect(38, 20, 18, 52);
    cactus.fillRect(22, 42, 18, 12);
    cactus.fillRect(18, 32, 12, 24);
    cactus.fillRect(54, 36, 16, 12);
    cactus.fillRect(66, 26, 12, 24);
    cactus.fillStyle(0x9ee26f, 0.85);
    cactus.fillRect(44, 24, 5, 42);
    cactus.fillRect(23, 36, 4, 16);
    cactus.fillRect(68, 30, 4, 16);
    cactus.fillStyle(0xf3dda4, 1);
    cactus.fillRect(16, 64, 62, 8);
    cactus.generateTexture("obstacle-cactus", 92, 84);

    const log = this.make.graphics({ x: 0, y: 0 }, false);
    log.fillStyle(0x050505, 0.8);
    log.fillRect(8, 70, 82, 8);
    log.fillStyle(0x5d3c2e, 1);
    log.fillRect(14, 46, 72, 24);
    log.fillStyle(0x8a5a42, 1);
    log.fillRect(20, 38, 60, 14);
    log.fillStyle(0x2b1711, 1);
    log.fillRect(24, 52, 18, 6);
    log.fillRect(56, 52, 16, 6);
    log.fillStyle(0xf5f5b8, 1);
    log.fillRect(30, 16, 8, 28);
    log.fillRect(54, 20, 8, 24);
    log.generateTexture("obstacle-log", 98, 84);

    const stump = this.make.graphics({ x: 0, y: 0 }, false);
    stump.fillStyle(0x050505, 0.8);
    stump.fillRect(8, 70, 78, 9);
    stump.fillStyle(0x71331f, 1);
    stump.fillRect(28, 30, 38, 42);
    stump.fillStyle(0xb95a2c, 1);
    stump.fillRect(22, 22, 50, 18);
    stump.fillStyle(0xffe08a, 1);
    stump.fillRect(36, 14, 8, 16);
    stump.fillRect(54, 12, 8, 18);
    stump.fillStyle(0x301817, 1);
    stump.fillRect(36, 44, 22, 7);
    stump.generateTexture("obstacle-stump", 94, 84);

    makeObstacle("obstacle-bramble", 0x44231d, 0xff6f91, 0x211a1d);
    makeObstacle("obstacle-crystal", 0x17475b, 0x80ffdb, 0x0e2430);
    makeObstacle("obstacle-pillar", 0x7a6b58, 0xc084fc, 0x2f2930);
    makeObstacle("obstacle-neon", 0x1f2b44, 0x7dd3fc, 0x0e1116);
    makeObstacle("obstacle-thorn", 0x4a1f36, 0xff8fab, 0x21131f);
    makeObstacle("obstacle-banner", 0x7a5232, 0xfacc15, 0x211a1d);
    makeObstacle("obstacle-mushroom", 0x315a45, 0xa7f3d0, 0x17251e);
    makeObstacle("obstacle-trophy", 0x6a4424, 0xf9a8d4, 0x211a1d);
  }

  private createTreeTexture(
    key: string,
    width: number,
    height: number,
    trunkColor: number,
    canopyColor: number,
    highlightColor: number,
  ) {
    const tree = this.make.graphics({ x: 0, y: 0 }, false);
    const center = Math.floor(width / 2);
    const trunkWidth = Math.floor(width * 0.12);
    const trunkX = center - Math.floor(trunkWidth / 2);
    const baseY = height - 16;

    tree.fillStyle(0x111111, 0.95);
    tree.fillRect(trunkX - 5, Math.floor(height * 0.3), trunkWidth + 10, Math.floor(height * 0.66));
    tree.fillStyle(trunkColor, 1);
    tree.fillRect(trunkX, Math.floor(height * 0.28), trunkWidth, Math.floor(height * 0.68));
    tree.fillStyle(0x7c4a22, 0.82);
    tree.fillRect(trunkX + 5, Math.floor(height * 0.34), 7, Math.floor(height * 0.55));
    tree.fillStyle(0x25140d, 0.78);
    tree.fillRect(trunkX + trunkWidth - 8, Math.floor(height * 0.38), 7, Math.floor(height * 0.5));
    tree.fillRect(trunkX - 20, Math.floor(height * 0.66), trunkWidth + 36, 10);
    tree.fillRect(trunkX + trunkWidth - 2, Math.floor(height * 0.78), 34, 9);

    [
      { y: 18, half: 24, body: 20 },
      { y: 48, half: 43, body: 28 },
      { y: 82, half: 64, body: 32 },
      { y: 122, half: 82, body: 35 },
      { y: 166, half: 96, body: 38 },
    ].forEach((tier, index) => {
      const top = Math.min(tier.y, baseY - tier.body);
      tree.fillStyle(0x07130d, 0.9);
      tree.fillRect(center - tier.half - 8, top + tier.body - 4, tier.half * 2 + 16, 11);
      tree.fillStyle(canopyColor, 0.98);
      tree.fillRect(center - tier.half, top + 10, tier.half * 2, tier.body);
      tree.fillRect(center - tier.half + 16, top, tier.half * 2 - 32, tier.body + 12);
      tree.fillRect(center - tier.half - 10, top + tier.body - 8, 24, 12);
      tree.fillRect(center + tier.half - 14, top + tier.body - 10, 26, 12);

      tree.fillStyle(highlightColor, index < 2 ? 0.92 : 0.76);
      tree.fillRect(center - Math.floor(tier.half * 0.58), top + 10, 18 + index * 4, 8);
      tree.fillRect(center - Math.floor(tier.half * 0.22), top + 20, 24 + index * 6, 7);
      tree.fillRect(center + Math.floor(tier.half * 0.22), top + 14, 18 + index * 4, 7);

      tree.fillStyle(0x0b2418, 0.86);
      tree.fillRect(center - tier.half + 8, top + tier.body - 2, 38 + index * 6, 9);
      tree.fillRect(center + tier.half - 46 - index * 3, top + tier.body + 2, 32 + index * 4, 8);
      tree.fillStyle(0x36a05f, 0.52);
      tree.fillRect(center - tier.half + 28, top + tier.body - 18, 12, 8);
      tree.fillRect(center + tier.half - 36, top + tier.body - 20, 10, 8);
    });

    tree.fillStyle(0x9de35f, 0.8);
    tree.fillRect(center - 7, 6, 14, 9);
    tree.fillRect(center - 18, 24, 12, 7);
    tree.fillStyle(0x07130d, 0.95);
    tree.fillRect(center - 64, baseY - 4, 128, 8);
    tree.generateTexture(key, width, height);
  }

  private createRoundTreeTexture(key: string, width: number, height: number) {
    const tree = this.make.graphics({ x: 0, y: 0 }, false);
    const center = Math.floor(width / 2);
    tree.fillStyle(0x111111, 0.92);
    tree.fillRect(center - 12, Math.floor(height * 0.42), 25, Math.floor(height * 0.54));
    tree.fillStyle(0x5a311f, 1);
    tree.fillRect(center - 8, Math.floor(height * 0.4), 16, Math.floor(height * 0.56));
    tree.fillStyle(0x83b342, 1);
    tree.fillRect(center - 48, 22, 92, 34);
    tree.fillRect(center - 62, 48, 120, 42);
    tree.fillRect(center - 52, 84, 104, 38);
    tree.fillStyle(0xf3ef64, 0.86);
    tree.fillRect(center - 36, 24, 28, 10);
    tree.fillRect(center + 8, 42, 34, 10);
    tree.fillRect(center - 48, 68, 24, 9);
    tree.fillStyle(0x0d4a3f, 0.82);
    tree.fillRect(center - 62, 78, 36, 13);
    tree.fillRect(center + 28, 88, 24, 12);
    tree.fillStyle(0x24a45d, 0.72);
    tree.fillRect(center - 14, 58, 18, 10);
    tree.fillRect(center + 46, 62, 10, 10);
    tree.generateTexture(key, width, height);
  }

  private createForest(width: number, height: number) {
    const theme = this.currentTheme();
    this.cameras.main.setBackgroundColor(theme.sky);

    this.add.rectangle(width / 2, 0, width * 2, Math.ceil(height * 0.58), theme.sky)
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.add.rectangle(width / 2, Math.ceil(height * 0.32), width * 2, Math.ceil(height * 0.68), theme.horizon, 0.94)
      .setOrigin(0.5, 0)
      .setScrollFactor(0.02);
    const backdropAlpha = theme.dressing === "canyon" ? 0.28 : theme.dressing === "sunset" ? 0.2 : 0.64;
    this.add.image(width / 2, height / 2 + 22, "figma-forest")
      .setDisplaySize(width * 1.16, height * 1.16)
      .setScrollFactor(0.02)
      .setAlpha(backdropAlpha)
      .setDepth(-30);

    const cloud = (x: number, y: number, scale = 1, alpha = 0.82) => {
      const parts = [
        [-44, 8, 72, 12],
        [-10, -10, 96, 18],
        [58, 8, 62, 12],
        [16, -22, 44, 14],
        [-84, 20, 52, 10],
        [112, 20, 32, 8],
      ];
      parts.forEach(([dx, dy, w, h]) => {
        this.add.rectangle(x + dx * scale, y + dy * scale, w * scale, h * scale, theme.cloud, alpha)
          .setOrigin(0, 0)
          .setScrollFactor(0.05);
      });
    };

    const hill = (x: number, y: number, w: number, h: number, color: number, alpha: number, scroll: number) => {
      this.add.rectangle(x, y, w, h, color, alpha).setOrigin(0.5, 1).setScrollFactor(scroll).setDepth(-24);
      this.add.rectangle(x - w * 0.22, y - h * 0.22, w * 0.42, h * 0.2, color, alpha * 0.72)
        .setOrigin(0.5, 1)
        .setScrollFactor(scroll)
        .setDepth(-23);
    };

    const dirtPlatform = (x: number, y: number, w: number, h: number, scroll = 0.48) => {
      this.add.rectangle(x, y, w, 18, theme.grass).setOrigin(0, 0).setScrollFactor(scroll).setDepth(-2);
      this.add.rectangle(x, y + 18, w, h, theme.soil).setOrigin(0, 0).setScrollFactor(scroll).setDepth(-2);
      this.add.rectangle(x, y + 14, w, 8, 0x4a2d1f, 0.44).setOrigin(0, 0).setScrollFactor(scroll).setDepth(-1);
      for (let px = x; px < x + w; px += 22) {
        const lipHeight = px % 44 === 0 ? 8 : 5;
        this.add.rectangle(px, y + 13, 14, lipHeight, 0xf7e1a7, 0.7)
          .setOrigin(0, 0)
          .setScrollFactor(scroll)
          .setDepth(-1);
      }
      for (let px = x + 12; px < x + w - 8; px += 34) {
        const rockY = y + 30 + ((px + this.level.level * 13) % Math.max(24, h - 24));
        this.add.rectangle(px, rockY, 18, 12, 0xb98b58, 0.62).setScrollFactor(scroll).setDepth(-1);
        this.add.rectangle(px + 10, rockY + 10, 14, 8, 0x3c241a, 0.48).setScrollFactor(scroll).setDepth(-1);
      }
    };

    const water = (x: number, y: number, w: number) => {
      this.add.rectangle(x, y, w, 56, theme.water, 0.88).setOrigin(0, 0).setScrollFactor(0.58).setDepth(-3);
      for (let px = x; px < x + w; px += 42) {
        this.add.rectangle(px, y + 8, 26, 5, 0x9fd6df, 0.72).setOrigin(0, 0).setScrollFactor(0.58).setDepth(-2);
        this.add.rectangle(px + 10, y + 26, 26, 5, 0x174c66, 0.52).setOrigin(0, 0).setScrollFactor(0.58).setDepth(-2);
      }
    };

    const deadTree = (x: number, y: number, color = theme.mid, scroll = 0.46) => {
      this.add.rectangle(x, y - 112, 12, 112, color, 0.72).setOrigin(0.5, 0).setScrollFactor(scroll);
      this.add.rectangle(x - 22, y - 90, 44, 8, color, 0.65).setOrigin(0.5, 0).setAngle(-28).setScrollFactor(scroll);
      this.add.rectangle(x + 20, y - 76, 42, 8, color, 0.62).setOrigin(0.5, 0).setAngle(35).setScrollFactor(scroll);
      this.add.rectangle(x + 8, y - 126, 34, 7, color, 0.66).setOrigin(0.5, 0).setAngle(48).setScrollFactor(scroll);
    };

    const palm = (x: number, y: number) => {
      this.add.rectangle(x, y - 110, 16, 112, 0x7a5232, 0.95).setOrigin(0.5, 0).setScrollFactor(0.42);
      this.add.rectangle(x - 40, y - 118, 80, 16, 0x2f7a4d, 0.9).setAngle(-20).setScrollFactor(0.42);
      this.add.rectangle(x + 32, y - 124, 74, 16, 0x2f7a4d, 0.9).setAngle(24).setScrollFactor(0.42);
      this.add.rectangle(x - 16, y - 144, 72, 14, 0x4ea765, 0.9).setAngle(-54).setScrollFactor(0.42);
      this.add.rectangle(x + 6, y - 146, 70, 14, 0x4ea765, 0.9).setAngle(54).setScrollFactor(0.42);
    };

    const leafyTree = (x: number, y: number, scroll = 0.42) => {
      this.add.rectangle(x, y - 136, 18, 140, 0x5d3c2e, 0.95).setOrigin(0.5, 0).setScrollFactor(scroll);
      this.add.rectangle(x - 52, y - 178, 112, 40, theme.mid, 0.92).setScrollFactor(scroll);
      this.add.rectangle(x - 34, y - 214, 120, 42, theme.grass, 0.86).setScrollFactor(scroll);
      this.add.rectangle(x + 20, y - 184, 108, 38, theme.mid, 0.82).setScrollFactor(scroll);
      this.add.rectangle(x - 18, y - 226, 44, 14, 0xe3e98e, 0.48).setScrollFactor(scroll);
    };

    if (theme.dressing === "canyon" || theme.dressing === "sunset" || theme.dressing === "guild") {
      cloud(330, 64, 1.25);
      cloud(980, 118, 0.9, 0.66);
      cloud(1560, 82, 1.12, 0.7);
      cloud(2080, 132, 0.75, 0.52);
    }

    for (let x = -120; x < 2500; x += 420) {
      hill(x, height - 156, 320, 180, theme.far, 0.42, 0.09);
      hill(x + 185, height - 126, 260, 120, theme.mid, 0.22, 0.14);
    }

    if (theme.dressing === "moonForest") {
      this.add.rectangle(430, 95, 80, 128, theme.accent, 0.88).setAngle(18).setScrollFactor(0.03);
      [90, 820, 1380, 2120].forEach((x) => leafyTree(x, height - 74, 0.36));
    } else if (theme.dressing === "sunset") {
      this.add.rectangle(width - 310, 130, 126, 126, 0xffcf70, 0.8).setScrollFactor(0.03);
      [180, 620, 1180, 1720, 2200].forEach((x) => leafyTree(x, height - 74, 0.42));
    } else if (theme.dressing === "deepForest") {
      [80, 440, 880, 1340, 1780, 2200].forEach((x) => {
        this.add.rectangle(x, height - 270, 20, 260, theme.near, 0.92).setOrigin(0.5, 0).setScrollFactor(0.22);
        this.add.rectangle(x + 42, height - 260, 16, 240, theme.mid, 0.62).setOrigin(0.5, 0).setScrollFactor(0.28);
      });
    } else if (theme.dressing === "canyon") {
      [250, 1510, 2180].forEach((x) => deadTree(x, height - 74, 0xb69b60, 0.4));
      [120, 1280].forEach((x) => palm(x, height - 76));
    } else if (theme.dressing === "crystal") {
      for (let x = 180; x < 2300; x += 380) {
        this.add.triangle(x, height - 82, 0, 96, 36, 0, 72, 96, theme.accent, 0.64).setScrollFactor(0.42);
        this.add.triangle(x + 54, height - 74, 0, 72, 24, 0, 48, 72, 0xffffff, 0.22).setScrollFactor(0.42);
      }
    } else {
      [240, 880, 1540, 2140].forEach((x) => deadTree(x, height - 74, theme.mid, 0.42));
    }

    if (theme.dressing === "canyon") {
      water(515, height - 74, 390);
      dirtPlatform(0, height - 74, 440, 190, 0.6);
      dirtPlatform(520, height - 198, 290, 96, 0.5);
      dirtPlatform(910, height - 74, 420, 190, 0.6);
      dirtPlatform(1420, height - 214, 300, 112, 0.48);
      dirtPlatform(1820, height - 74, 520, 190, 0.6);
      this.add.rectangle(620, height - 122, 120, 14, 0x7a5232, 0.95).setScrollFactor(0.5);
      this.add.rectangle(620, height - 150, 120, 10, 0x7a5232, 0.95).setScrollFactor(0.5);
      this.add.rectangle(564, height - 160, 10, 54, 0x5d3c2e, 0.95).setScrollFactor(0.5);
      this.add.rectangle(682, height - 160, 10, 54, 0x5d3c2e, 0.95).setScrollFactor(0.5);
    } else {
      dirtPlatform(0, height - 74, 2400, 190, 0.58);
      dirtPlatform(520, height - 210, 260, 92, 0.42);
      dirtPlatform(1250, height - 230, 300, 108, 0.42);
      if (theme.dressing === "moonForest" || theme.dressing === "deepForest") {
        water(860, height - 74, 300);
      }
    }

    if (theme.dressing === "moonForest" || theme.dressing === "deepForest" || theme.dressing === "crystal") {
      for (let index = 0; index < 14; index += 1) {
        const x = Phaser.Math.Between(80, 2240);
        const y = Phaser.Math.Between(90, height - 230);
        const dot = this.add.rectangle(x, y, 4, 4, theme.accent)
          .setAlpha(0.58)
          .setScrollFactor(0.75);
        if (!this.reducedMotion) {
          this.tweens.add({
            targets: dot,
            alpha: 0.18,
            duration: Phaser.Math.Between(900, 1600),
            yoyo: true,
            repeat: -1,
          });
        }
      }
    }
  }

  private createHud(width: number) {
    const theme = this.currentTheme();
    const panel = this.add.rectangle(24, 22, 330, 88, 0x211a1d, 0.86)
      .setOrigin(0, 0)
      .setScrollFactor(0);
    panel.setStrokeStyle(4, theme.accent);

    this.add.text(44, 38, `LEVEL ${this.level.level}`, {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "18px",
      color: `#${theme.accent.toString(16).padStart(6, "0")}`,
    }).setScrollFactor(0);
    this.add.text(44, 62, this.level.title.toUpperCase(), {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "18px",
      color: "#f9e7b7",
      wordWrap: { width: 280 },
    }).setScrollFactor(0);

    this.add.rectangle(154, 40, 196, 18, 0x0e1116).setOrigin(0, 0).setScrollFactor(0);
    this.progressBar = this.add.rectangle(160, 44, 0, 10, theme.accent).setOrigin(0, 0).setScrollFactor(0);
    this.add.rectangle(width / 2, 92, 460, 58, 0x211a1d, 0.84)
      .setStrokeStyle(3, theme.accent)
      .setScrollFactor(0);
    this.questText = this.add.text(width / 2, 92, this.level.quest, {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "16px",
      color: "#f9e7b7",
      align: "center",
      wordWrap: { width: 410 },
    }).setOrigin(0.5, 0.5).setScrollFactor(0);
  }

  private revealTreasure(height: number) {
    const theme = this.currentTheme();
    const glow = this.add.rectangle(2040, height - 136, 148, 172, theme.accent, 0.28)
      .setDepth(10)
      .setScrollFactor(1);
    const beam = this.add.rectangle(2040, height - 220, 56, 210, theme.accent, 0.16)
      .setDepth(8)
      .setScrollFactor(1);
    const label = this.add.text(2040, height - 236, "OPEN", {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "22px",
      color: `#${theme.accent.toString(16).padStart(6, "0")}`,
      backgroundColor: "#211a1d",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(11);
    this.chest = this.physics.add.staticSprite(2040, height - 136, "memory-chest");
    this.chest.setDepth(12);
    this.chest.setScale(1.08);
    this.chest.refreshBody();
    this.chest.setInteractive({ useHandCursor: true });
    this.chest.on("pointerdown", () => this.openTreasure());
    if (!this.reducedMotion) {
      this.tweens.add({
        targets: [this.chest, glow],
        scaleX: 1.28,
        scaleY: 1.28,
        duration: 520,
        yoyo: true,
        repeat: -1,
      });
      this.tweens.add({
        targets: [beam, label],
        alpha: 0.42,
        y: "-=8",
        duration: 650,
        yoyo: true,
        repeat: -1,
      });
    }
    this.questText?.setText(`${this.level.rewardName} found. Touch the glowing chest.`);
    this.physics.add.overlap(this.player!, this.chest, () => this.openTreasure());
  }

  private openTreasure() {
    if (this.completed || !this.chest) return;
    this.completed = true;
    this.chest.setTint(0xffd166);
    this.questText?.setText(`${this.level.rewardName} is opening...`);
    this.cameras.main.flash(420, 255, 209, 102);
    this.time.delayedCall(520, () => this.completeLevel());
  }

  private resetPlayer() {
    if (!this.player || this.completed) return;
    this.player.setPosition(Math.max(140, this.player.x - 260), this.scale.height - 172);
    this.player.setVelocity(0, 0);
    this.cameras.main.shake(120, 0.004);
  }

  private completeLevel() {
    this.questText?.setText(`${this.level.rewardName} unlocked.`);
    this.completeCallback(this.level.id);
  }
}

export function MemoryQuestGame({
  level,
  reducedMotion,
  onComplete,
  paused = false,
}: MemoryQuestGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const sendKey = (type: "keydown" | "keyup", key: string, code: string) => {
    window.dispatchEvent(
      new KeyboardEvent(type, {
        key,
        code,
        bubbles: true,
      }),
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    gameRef.current?.destroy(true);
    containerRef.current.innerHTML = "";

    const scene = new MemoryQuestScene(level, reducedMotion, onComplete);
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: level.palette.sky,
      pixelArt: true,
      roundPixels: true,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 1150 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene,
    });
    gameRef.current = game;

    return () => {
      game.destroy(true);
      if (gameRef.current === game) {
        gameRef.current = null;
      }
    };
  }, [level, onComplete, reducedMotion]);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene("memory-quest");
    if (!scene) return;
    if (paused) {
      scene.scene.pause();
    } else {
      scene.scene.resume();
    }
  }, [paused]);

  return (
    <div className="game-wrap">
      <div ref={containerRef} className="game-canvas" aria-label="Anjana Memory Quest game" />
      <div className="touch-controls" aria-label="Touch game controls">
        <button
          type="button"
          aria-label="Move left"
          onPointerDown={() => sendKey("keydown", "ArrowLeft", "ArrowLeft")}
          onPointerUp={() => sendKey("keyup", "ArrowLeft", "ArrowLeft")}
          onPointerLeave={() => sendKey("keyup", "ArrowLeft", "ArrowLeft")}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Jump"
          onPointerDown={() => sendKey("keydown", " ", "Space")}
          onPointerUp={() => sendKey("keyup", " ", "Space")}
          onPointerLeave={() => sendKey("keyup", " ", "Space")}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Move right"
          onPointerDown={() => sendKey("keydown", "ArrowRight", "ArrowRight")}
          onPointerUp={() => sendKey("keyup", "ArrowRight", "ArrowRight")}
          onPointerLeave={() => sendKey("keyup", "ArrowRight", "ArrowRight")}
        >
          →
        </button>
      </div>
    </div>
  );
}

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
  dressing:
    | "sunset"
    | "moonMountain"
    | "jungle"
    | "tealForest"
    | "blueMoon"
    | "mistForest"
    | "pineForest"
    | "emberArchive";
};

const levelThemes: LevelTheme[] = [
  { key: "sunset", sky: 0xf36b48, horizon: 0xff9c3d, cloud: 0xffbd59, far: 0xc24824, mid: 0x7b2c1f, near: 0x2f1114, soil: 0x4b1918, grass: 0xf7a928, water: 0x7d4334, accent: 0xffd166, obstacle: "obstacle-stump", dressing: "sunset" },
  { key: "moon-mountain", sky: 0x1c65a0, horizon: 0x6343a2, cloud: 0x274e8c, far: 0xa2643e, mid: 0x5f412b, near: 0x1e211f, soil: 0x3d3029, grass: 0x8eb06a, water: 0x245f86, accent: 0xf8f3b8, obstacle: "obstacle-log", dressing: "moonMountain" },
  { key: "jungle", sky: 0x293b23, horizon: 0xa5d51b, cloud: 0xd2ff38, far: 0x587323, mid: 0x1f4429, near: 0x07151b, soil: 0x9a4326, grass: 0x69bd21, water: 0x224d3d, accent: 0xc7fb31, obstacle: "obstacle-bramble", dressing: "jungle" },
  { key: "teal-forest", sky: 0x0e504f, horizon: 0x8fbfc0, cloud: 0x2b6864, far: 0x275754, mid: 0x1b3c39, near: 0x071918, soil: 0x5d3c2e, grass: 0x1fd69d, water: 0x215e61, accent: 0x8cebd4, obstacle: "obstacle-mushroom", dressing: "tealForest" },
  { key: "blue-moon", sky: 0x03132a, horizon: 0x0b5361, cloud: 0x1e8491, far: 0x0e3546, mid: 0x0b2639, near: 0x020719, soil: 0x08101f, grass: 0x5fb8b4, water: 0x174c66, accent: 0xeaf9f5, obstacle: "obstacle-crystal", dressing: "blueMoon" },
  { key: "mist-forest", sky: 0x0c1220, horizon: 0x5d7085, cloud: 0x324155, far: 0x35475a, mid: 0x1c2a36, near: 0x08131a, soil: 0x1a2530, grass: 0x37b06c, water: 0x253d4b, accent: 0x6ee7b7, obstacle: "obstacle-pillar", dressing: "mistForest" },
  { key: "pine-forest", sky: 0x48b0a7, horizon: 0xd7f0d2, cloud: 0xb8ddd1, far: 0x6fb8ad, mid: 0x1b6f75, near: 0x092d4e, soil: 0x1e2d31, grass: 0x7bec8d, water: 0x267c87, accent: 0xb8ff7a, obstacle: "obstacle-banner", dressing: "pineForest" },
  { key: "ember-archive", sky: 0x201820, horizon: 0x5b4b66, cloud: 0xb891a8, far: 0x5b4b66, mid: 0x7a5735, near: 0x211a1d, soil: 0x5d3c2e, grass: 0xf9a8d4, water: 0x553a58, accent: 0xf9a8d4, obstacle: "obstacle-trophy", dressing: "emberArchive" },
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
    this.createPixelTextures();
  }

  create() {
    const { width, height } = this.scale;
    const theme = this.currentTheme();
    this.physics.world.setBounds(0, 0, 2300, height);
    this.cameras.main.setBounds(0, 0, 2300, height);

    this.createForest(width, height);
    this.createHud(width, height);

    const ground = this.physics.add.staticGroup();
    for (let x = 0; x < 2400; x += 64) {
      const tile = ground.create(x + 32, height - 52, "ground-tile");
      tile.setOrigin(0.5, 0.5).setVisible(false).refreshBody();
    }

    this.player = this.physics.add.sprite(140, height - 172, "anjana-avatar");
    this.player.setScale(0.72);
    this.player.setDepth(20);
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
    const movingHazards = this.createMovingHazards(height, theme);
    if (movingHazards) {
      this.physics.add.overlap(this.player, movingHazards, () => this.resetPlayer());
    }

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

    this.add.text(width - 450, height - 62, "Move: arrows/A-D   Jump: space/W/up", {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "16px",
      color: "#f9e7b7",
      backgroundColor: "#211a1d",
      padding: { x: 12, y: 8 },
    }).setScrollFactor(0).setDepth(80);
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
    const worldWidth = 2400;
    const groundY = height - 92;
    this.cameras.main.setBackgroundColor(theme.sky);

    const fixedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: number,
      alpha = 1,
      depth = -40,
    ) => {
      this.add.rectangle(x, y, w, h, color, alpha).setOrigin(0, 0).setScrollFactor(0).setDepth(depth);
    };

    const worldRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: number,
      alpha = 1,
      depth = -2,
    ) => {
      this.add.rectangle(x, y, w, h, color, alpha).setOrigin(0, 0).setDepth(depth);
    };

    const cloud = (x: number, y: number, color: number, alpha = 0.7) => {
      [
        [0, 14, 72, 14],
        [38, 0, 96, 18],
        [126, 16, 64, 12],
        [76, 28, 122, 10],
      ].forEach(([dx, dy, w, h]) => fixedRect(x + dx, y + dy, w, h, color, alpha, -36));
    };

    const sun = (x: number, y: number, size: number, color: number, depth = -35) => {
      for (let row = 0; row < size; row += 10) {
        const inset = Math.abs(row - size / 2) * 0.45;
        fixedRect(x + inset, y + row, size - inset * 2, 10, color, 0.92, depth);
      }
    };

    const mountain = (x: number, y: number, color: number, shadow: number) => {
      this.add.triangle(x, y, 0, 260, 170, 0, 360, 260, color, 0.98)
        .setOrigin(0, 1)
        .setScrollFactor(0)
        .setDepth(-31);
      this.add.triangle(x + 124, y, 0, 220, 110, 10, 232, 220, shadow, 0.58)
        .setOrigin(0, 1)
        .setScrollFactor(0)
        .setDepth(-30);
      fixedRect(x + 155, y - 202, 68, 18, 0xd08b5d, 0.52, -29);
      fixedRect(x + 204, y - 156, 48, 16, 0x2d5e3a, 0.44, -29);
    };

    const trunk = (x: number, y: number, h: number, color: number, high: number, depth = -20) => {
      fixedRect(x, y - h, 34, h, color, 1, depth);
      fixedRect(x + 9, y - h + 10, 7, h - 20, high, 0.54, depth + 1);
      fixedRect(x + 26, y - h + 16, 6, h - 28, 0x120b0a, 0.36, depth + 1);
    };

    const leafyCrown = (x: number, y: number, color: number, high: number, shadow: number, depth = -18) => {
      fixedRect(x - 74, y - 24, 150, 34, shadow, 0.92, depth);
      fixedRect(x - 62, y - 58, 132, 42, color, 0.98, depth + 1);
      fixedRect(x - 35, y - 88, 92, 38, color, 0.96, depth + 1);
      fixedRect(x + 18, y - 46, 86, 30, shadow, 0.74, depth + 2);
      fixedRect(x - 42, y - 76, 34, 10, high, 0.58, depth + 3);
      fixedRect(x + 12, y - 66, 44, 10, high, 0.54, depth + 3);
      fixedRect(x + 55, y - 28, 28, 8, high, 0.36, depth + 3);
    };

    const forestTree = (
      x: number,
      base: number,
      h: number,
      trunkColor: number,
      leaf: number,
      leafHigh: number,
      leafShadow: number,
      depth = -18,
    ) => {
      trunk(x, base, h, trunkColor, 0xb0703d, depth);
      leafyCrown(x + 16, base - h + 18, leaf, leafHigh, leafShadow, depth + 1);
    };

    const pine = (x: number, base: number, scale: number, dark: number, high: number, depth = -22) => {
      fixedRect(x + 26 * scale, base - 112 * scale, 12 * scale, 112 * scale, 0x5a3b2b, 1, depth);
      for (let tier = 0; tier < 5; tier += 1) {
        const y = base - (122 - tier * 24) * scale;
        const w = (72 + tier * 24) * scale;
        this.add.triangle(x + 32 * scale - w / 2, y + 40 * scale, 0, 42 * scale, w / 2, 0, w, 42 * scale, dark, 0.96)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(depth + tier);
        fixedRect(x + 12 * scale, y + 26 * scale, 18 * scale, 7 * scale, high, 0.55, depth + tier + 1);
      }
    };

    const ground = (grass: number, soil: number, rock: number) => {
      worldRect(0, groundY, worldWidth, 18, grass, 1, -1);
      worldRect(0, groundY + 18, worldWidth, height - groundY, soil, 1, -1);
      worldRect(0, groundY + 30, worldWidth, 18, 0x1a0f12, 0.45, 0);
      for (let x = 0; x < worldWidth; x += 42) {
        const bump = x % 84 === 0 ? 0 : 7;
        worldRect(x, groundY + 8 + bump, 24, 8, 0xf6c56a, 0.48, 0);
        worldRect(x + 10, groundY + 46 + ((x / 42) % 3) * 12, 24, 14, rock, 0.72, 0);
        worldRect(x + 32, groundY + 66 + ((x / 42) % 2) * 18, 18, 10, 0x120b0a, 0.42, 0);
      }
    };

    fixedRect(0, 0, width, height, theme.sky, 1, -44);
    fixedRect(0, height * 0.34, width, height * 0.66, theme.horizon, 1, -43);

    if (theme.dressing === "sunset") {
      fixedRect(0, 0, width, height * 0.42, 0xf36b48, 1, -44);
      fixedRect(0, height * 0.26, width, height * 0.5, 0xff8a35, 0.9, -43);
      sun(width * 0.62, height * 0.24, 118, 0xffd166, -37);
      [80, 430, 840, 1260, 1660].forEach((x) => cloud(x, 92 + (x % 3) * 28, 0xffb04f, 0.46));
      [40, 290, 560, 910, 1240, 1580, 1880].forEach((x) => forestTree(x, groundY + 8, 260 - (x % 3) * 34, 0x4f1f18, 0x9f381e, 0xff8a2d, 0x661e1c));
      ground(0xf0a01e, 0x4b1918, 0x9d4d25);
    } else if (theme.dressing === "moonMountain") {
      fixedRect(0, 0, width, height * 0.58, 0x1c65a0, 1, -44);
      fixedRect(0, height * 0.36, width, height * 0.34, 0x6343a2, 0.82, -43);
      this.add.triangle(170, 92, 0, 130, 42, 0, 88, 130, 0xf8f3b8, 1).setScrollFactor(0).setDepth(-36);
      fixedRect(205, 110, 48, 74, 0x1c65a0, 1, -35);
      mountain(width - 560, groundY + 8, 0x9e6342, 0x4c2c22);
      [55, 520, 960, 1460, 1860].forEach((x) => forestTree(x, groundY, 210, 0x3d271f, 0x7ca05e, 0xc3d88c, 0x456239));
      ground(0x8eb06a, 0x3d3029, 0x7b5d4a);
    } else if (theme.dressing === "jungle") {
      fixedRect(0, 0, width, height, 0x293b23, 1, -44);
      fixedRect(0, height * 0.16, width, height * 0.62, 0xa5d51b, 0.9, -43);
      [0, 240, 520, 850, 1180, 1510, 1840].forEach((x) => {
        trunk(x + 80, groundY + 4, 440, 0x234f5f, 0x5f95a4, -30);
        fixedRect(x + 18, 54, 230, 74, 0x61b31e, 0.88, -29);
        fixedRect(x - 20, 112, 240, 86, 0x1e3d25, 0.7, -28);
      });
      [60, 430, 820, 1280, 1720].forEach((x) => fixedRect(x, groundY - 86, 142, 32, 0x1c541d, 0.94, -3));
      ground(0x69bd21, 0x9a4326, 0xd86931);
    } else if (theme.dressing === "tealForest") {
      fixedRect(0, 0, width, height, 0x0e504f, 1, -44);
      fixedRect(0, height * 0.2, width, height * 0.5, 0x8fbfc0, 0.5, -43);
      [0, 260, 560, 880, 1200, 1540, 1880].forEach((x) => forestTree(x + 20, groundY, 330, 0x7f5a35, 0x0d544d, 0x1fd69d, 0x092b28, -29));
      [80, 460, 920, 1420, 1840].forEach((x) => fixedRect(x, groundY - 34, 94, 26, 0x0d544d, 0.86, -3));
      ground(0x1fd69d, 0x19362f, 0x5b785f);
    } else if (theme.dressing === "blueMoon") {
      fixedRect(0, 0, width, height, 0x03132a, 1, -44);
      sun(width * 0.52, 78, 56, 0xeaf9f5, -36);
      fixedRect(width * 0.28, height * 0.2, width * 0.46, height * 0.42, 0x0b5361, 0.5, -42);
      [70, 360, 720, 1060, 1390, 1710, 1980].forEach((x) => {
        trunk(x, groundY + 6, 420, 0x082044, 0x255c7a, -28);
        fixedRect(x - 30, 78, 120, 32, 0x03132a, 0.94, -27);
      });
      ground(0x5fb8b4, 0x08101f, 0x2f6072);
    } else if (theme.dressing === "mistForest") {
      fixedRect(0, 0, width, height, 0x0c1220, 1, -44);
      fixedRect(0, height * 0.22, width, height * 0.52, 0x5d7085, 0.7, -43);
      [120, 420, 780, 1120, 1460, 1780].forEach((x) => pine(x, groundY + 2, 1.1, 0x10251f, 0x31a05f, -26));
      [0, 320, 680, 1040, 1380, 1720].forEach((x) => trunk(x, groundY + 6, 360, 0x263848, 0x52667a, -32));
      ground(0x37b06c, 0x1a2530, 0x435565);
    } else if (theme.dressing === "pineForest") {
      fixedRect(0, 0, width, height, 0x48b0a7, 1, -44);
      fixedRect(0, height * 0.34, width, height * 0.42, 0xd7f0d2, 0.72, -43);
      [20, 220, 420, 660, 900, 1120, 1360, 1600, 1840].forEach((x, index) => {
        pine(x, groundY + 10, 0.82 + (index % 3) * 0.14, index % 2 ? 0x1b6f75 : 0x092d4e, 0x7bec8d, -30 + (index % 3));
      });
      ground(0x7bec8d, 0x1e2d31, 0x4b6f62);
    } else {
      fixedRect(0, 0, width, height, 0x201820, 1, -44);
      fixedRect(0, height * 0.2, width, height * 0.52, 0x5b4b66, 0.72, -43);
      [150, 520, 890, 1260, 1630].forEach((x) => forestTree(x, groundY, 240, 0x5d3c2e, 0x7a5735, 0xf9a8d4, 0x211a1d, -26));
      ground(0xf9a8d4, 0x5d3c2e, 0x8d6a52);
    }
  }

  private createMovingHazards(height: number, theme: LevelTheme) {
    if (this.level.level < 3) return undefined;

    const group = this.physics.add.group({ allowGravity: false, immovable: true });
    const count = Math.min(2, Math.ceil((this.level.level - 2) / 3));
    for (let index = 0; index < count; index += 1) {
      const hazard = group.create(880 + index * 620, height - 154, theme.obstacle) as Phaser.Physics.Arcade.Sprite;
      hazard.setScale(0.88);
      hazard.setDepth(18);
      hazard.setImmovable(true);
      if (hazard.body instanceof Phaser.Physics.Arcade.Body) {
        hazard.body.setAllowGravity(false);
        hazard.body.setSize(62, 54);
      }
      this.tweens.add({
        targets: hazard,
        x: hazard.x + 130 + index * 34,
        duration: 1450 - Math.min(this.level.level, 6) * 80,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
    return group;
  }

  private createHud(width: number, height: number) {
    const theme = this.currentTheme();
    const panel = this.add.rectangle(24, 22, 286, 72, 0x101419, 0.82)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(70);
    panel.setStrokeStyle(3, theme.accent);

    this.add.text(44, 38, `LEVEL ${this.level.level}`, {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "16px",
      color: `#${theme.accent.toString(16).padStart(6, "0")}`,
    }).setScrollFactor(0).setDepth(71);
    this.add.text(44, 62, this.level.title.toUpperCase(), {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "15px",
      color: "#f9e7b7",
      wordWrap: { width: 230 },
    }).setScrollFactor(0).setDepth(71);

    this.add.rectangle(44, 84, 232, 5, 0x050505).setOrigin(0, 0).setScrollFactor(0).setDepth(71);
    this.progressBar = this.add.rectangle(44, 84, 0, 5, theme.accent).setOrigin(0, 0).setScrollFactor(0).setDepth(72);
    this.add.rectangle(width / 2, height - 132, 540, 48, 0x101419, 0.82)
      .setStrokeStyle(3, theme.accent)
      .setScrollFactor(0)
      .setDepth(70);
    this.questText = this.add.text(width / 2, height - 132, this.level.quest, {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "16px",
      color: "#f9e7b7",
      align: "center",
      wordWrap: { width: 490 },
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(71);
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

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
  far: number;
  mid: number;
  near: number;
  accent: number;
  obstacle: string;
  dressing: "forest" | "crystal" | "ruins" | "neon" | "thorn" | "guild" | "garden" | "archive";
};

const levelThemes: LevelTheme[] = [
  { key: "mistwood", sky: 0x83d6e8, far: 0x4a8f8f, mid: 0x1f5a3d, near: 0x14251d, accent: 0xffd166, obstacle: "obstacle-bramble", dressing: "forest" },
  { key: "crystal", sky: 0x172034, far: 0x334c78, mid: 0x1f6f88, near: 0x10242b, accent: 0x80ffdb, obstacle: "obstacle-crystal", dressing: "crystal" },
  { key: "ruins", sky: 0x20162f, far: 0x51405f, mid: 0x6a553f, near: 0x211a1d, accent: 0xc084fc, obstacle: "obstacle-pillar", dressing: "ruins" },
  { key: "neon", sky: 0x10242b, far: 0x18475b, mid: 0x213b54, near: 0x0e1116, accent: 0x7dd3fc, obstacle: "obstacle-neon", dressing: "neon" },
  { key: "rose", sky: 0x25172a, far: 0x6f3e5a, mid: 0x4a5536, near: 0x221821, accent: 0xff8fab, obstacle: "obstacle-thorn", dressing: "thorn" },
  { key: "guild", sky: 0x14251d, far: 0x3b644f, mid: 0x7a5232, near: 0x243a2d, accent: 0xfacc15, obstacle: "obstacle-banner", dressing: "guild" },
  { key: "moon", sky: 0x1c2130, far: 0x46617b, mid: 0x4a6234, near: 0x17251e, accent: 0xa7f3d0, obstacle: "obstacle-mushroom", dressing: "garden" },
  { key: "archive", sky: 0x201820, far: 0x5b4b66, mid: 0x7a5735, near: 0x211a1d, accent: 0xf9a8d4, obstacle: "obstacle-trophy", dressing: "archive" },
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
      tile.setOrigin(0.5, 0.5).refreshBody();
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
      const obstacle = obstacles.create(560 + index * gap, height - 116, theme.obstacle);
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
    chest.fillStyle(0x3a2118);
    chest.fillRect(8, 30, 80, 44);
    chest.fillStyle(0x9a5f3f);
    chest.fillRect(14, 22, 68, 22);
    chest.fillStyle(0xffd166);
    chest.fillRect(8, 42, 80, 8);
    chest.fillRect(42, 22, 12, 52);
    chest.fillStyle(0x211a1d);
    chest.fillRect(20, 34, 20, 8);
    chest.fillRect(58, 34, 16, 8);
    chest.fillStyle(0xf9e7b7);
    chest.fillRect(46, 46, 8, 10);
    chest.generateTexture("memory-chest", 96, 86);

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

    const backdrop = this.add.image(width / 2, height / 2, "figma-forest")
      .setDisplaySize(width * 1.28, height * 1.28)
      .setScrollFactor(0.02)
      .setAlpha(theme.dressing === "forest" ? 0.72 : 0.22);
    backdrop.setDepth(-30);

    for (let x = -120; x < 2500; x += 380) {
      this.add.rectangle(x, height - 210, 260, 160, theme.far, 0.5)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.08)
        .setDepth(-24);
      this.add.rectangle(x + 80, height - 250, 130, 120, theme.mid, 0.34)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.12)
        .setDepth(-23);
    }

    if (theme.dressing === "forest") {
      for (let x = 90; x < 2300; x += 520) {
        this.add.image(x, height - 48, "forest-tree-mid")
          .setOrigin(0.5, 1)
          .setScrollFactor(0.22)
          .setAlpha(0.74);
      }
      for (let x = 430; x < 2300; x += 700) {
        this.add.image(x, height - 46, "forest-tree-round")
          .setOrigin(0.5, 1)
          .setScrollFactor(0.34)
          .setAlpha(0.82);
      }
      for (let x = 760; x < 2300; x += 620) {
        this.add.image(x, height - 44, "forest-tree-front")
          .setOrigin(0.5, 1)
          .setScrollFactor(0.48)
          .setAlpha(0.84);
      }
    }

    if (theme.dressing === "crystal") {
      for (let x = 180; x < 2300; x += 360) {
        this.add.triangle(x, height - 84, 0, 88, 34, 0, 68, 88, theme.accent, 0.68)
          .setScrollFactor(0.42)
          .setDepth(-4);
        this.add.rectangle(x + 38, height - 128, 16, 70, 0xffffff, 0.18).setScrollFactor(0.42);
      }
    }

    if (theme.dressing === "ruins" || theme.dressing === "archive") {
      for (let x = 210; x < 2300; x += 420) {
        this.add.rectangle(x, height - 148, 54, 150, theme.mid, 0.76)
          .setOrigin(0.5, 1)
          .setScrollFactor(0.38);
        this.add.rectangle(x, height - 300, 90, 24, theme.accent, 0.42)
          .setOrigin(0.5, 1)
          .setScrollFactor(0.38);
      }
    }

    if (theme.dressing === "neon") {
      for (let x = 140; x < 2300; x += 300) {
        this.add.rectangle(x, height - 160, 22, 160, theme.accent, 0.54)
          .setOrigin(0.5, 1)
          .setScrollFactor(0.34);
        this.add.rectangle(x + 42, height - 96, 72, 12, 0xff6f91, 0.55).setScrollFactor(0.42);
      }
    }

    if (theme.dressing === "thorn" || theme.dressing === "garden") {
      for (let x = 120; x < 2300; x += 330) {
        this.add.rectangle(x, height - 76, 120, 18, theme.mid, 0.7).setScrollFactor(0.42);
        this.add.rectangle(x - 34, height - 112, 12, 58, theme.accent, 0.48).setScrollFactor(0.42);
        this.add.rectangle(x + 36, height - 128, 16, 78, theme.accent, 0.36).setScrollFactor(0.42);
      }
    }

    if (theme.dressing === "guild") {
      for (let x = 180; x < 2300; x += 380) {
        this.add.rectangle(x, height - 172, 16, 130, theme.near, 0.9)
          .setOrigin(0.5, 1)
          .setScrollFactor(0.42);
        this.add.rectangle(x + 38, height - 250, 86, 62, theme.accent, 0.72)
          .setOrigin(0.5, 0)
          .setScrollFactor(0.42);
      }
    }

    this.add.rectangle(width / 2, height / 2, width * 2, height, theme.near, 0.08)
      .setScrollFactor(0.12);
    for (let x = 100; x < 2300; x += 460) {
      this.add.rectangle(x, height - 44, 112, 8, theme.accent, 0.52)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.65);
    }

    for (let index = 0; index < 18; index += 1) {
      const x = Phaser.Math.Between(40, 2240);
      const y = Phaser.Math.Between(70, height - 180);
      const dot = this.add.rectangle(x, y, 5, 5, theme.accent)
        .setAlpha(0.75)
        .setScrollFactor(0.75);
      if (!this.reducedMotion) {
        this.tweens.add({
          targets: dot,
          alpha: 0.25,
          duration: Phaser.Math.Between(900, 1600),
          yoyo: true,
          repeat: -1,
        });
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
    this.chest = this.physics.add.staticSprite(2040, height - 124, "memory-chest");
    this.chest.setDepth(12);
    this.chest.setScale(1.18);
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

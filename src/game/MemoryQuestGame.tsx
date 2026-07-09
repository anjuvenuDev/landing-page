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
  background: string;
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

type PlatformTexture = "course-platform-long" | "course-platform-bridge";
type ObstacleTexture = "course-field-shrub" | "course-field-post" | "course-rock";

type PlatformSpec = {
  x: number;
  y: number;
  width: number;
  texture: PlatformTexture;
};

type ObstacleSpec = {
  x: number;
  y: number;
  texture: ObstacleTexture;
  scale: number;
};

type CourseLayout = {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  obstacles: ObstacleSpec[];
  spawn: Phaser.Math.Vector2;
  shard: Phaser.Math.Vector2;
  chest: Phaser.Math.Vector2;
  hazardY: number;
};

const levelThemes: LevelTheme[] = [
  { key: "asset-forest-night", sky: 0x1a2530, horizon: 0x5d7085, cloud: 0x324155, far: 0x35475a, mid: 0x1c2a36, near: 0x08131a, soil: 0x1a2530, grass: 0x37b06c, water: 0x253d4b, accent: 0x6ee7b7, obstacle: "obstacle-pillar", background: "level-bg-asset-forest-night", dressing: "mistForest" },
  { key: "asset-jungle", sky: 0x0e504f, horizon: 0x8fbfc0, cloud: 0x2b6864, far: 0x275754, mid: 0x1b3c39, near: 0x071918, soil: 0x5d3c2e, grass: 0x1fd69d, water: 0x215e61, accent: 0x8cebd4, obstacle: "obstacle-mushroom", background: "level-bg-asset-jungle", dressing: "tealForest" },
  { key: "asset-canopy", sky: 0x76d1f2, horizon: 0xd7f0d2, cloud: 0xb8ddd1, far: 0x6fb8ad, mid: 0x1b6f75, near: 0x092d4e, soil: 0x1e2d31, grass: 0x7bec8d, water: 0x267c87, accent: 0xb8ff7a, obstacle: "obstacle-banner", background: "level-bg-asset-canopy", dressing: "pineForest" },
  { key: "asset-stars", sky: 0x2f5f93, horizon: 0x6ea4cf, cloud: 0x274e8c, far: 0x23446f, mid: 0x1d3557, near: 0x101419, soil: 0x2a2f45, grass: 0x8fb3d9, water: 0x245f86, accent: 0xf8f3b8, obstacle: "obstacle-log", background: "level-bg-asset-stars", dressing: "moonMountain" },
  { key: "asset-cloud-one", sky: 0xa7dded, horizon: 0x9dd6ee, cloud: 0xd7f5ff, far: 0x8bc8dc, mid: 0x4b91a3, near: 0x1e3a46, soil: 0x4d5d62, grass: 0x6ee7b7, water: 0x3fa7c9, accent: 0xf9e7b7, obstacle: "obstacle-crystal", background: "level-bg-asset-cloud-one", dressing: "blueMoon" },
  { key: "asset-cloud-two", sky: 0x6fc0ed, horizon: 0xb9eaff, cloud: 0xd7f5ff, far: 0x78bde2, mid: 0x327a9a, near: 0x17475b, soil: 0x2f4654, grass: 0x9ee26f, water: 0x267c87, accent: 0xffd166, obstacle: "obstacle-neon", background: "level-bg-asset-cloud-two", dressing: "blueMoon" },
  { key: "asset-forest-return", sky: 0x0c1220, horizon: 0x5d7085, cloud: 0x324155, far: 0x35475a, mid: 0x1c2a36, near: 0x08131a, soil: 0x1a2530, grass: 0x37b06c, water: 0x253d4b, accent: 0xf9a8d4, obstacle: "obstacle-thorn", background: "level-bg-asset-forest-night", dressing: "mistForest" },
  { key: "asset-star-archive", sky: 0x201820, horizon: 0x5b4b66, cloud: 0xb891a8, far: 0x5b4b66, mid: 0x7a5735, near: 0x211a1d, soil: 0x5d3c2e, grass: 0xf9a8d4, water: 0x553a58, accent: 0xf9a8d4, obstacle: "obstacle-trophy", background: "level-bg-asset-stars", dressing: "emberArchive" },
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
  private chestPoint = new Phaser.Math.Vector2(2040, 0);
  private spawnPoint = new Phaser.Math.Vector2(140, 0);
  private hazardY = 0;

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
    this.load.image("level-bg-asset-forest-night", "/assets/levels/asset-pack/forest-night.png");
    this.load.image("level-bg-asset-jungle", "/assets/levels/asset-pack/jungle-parallax.png");
    this.load.image("level-bg-asset-canopy", "/assets/levels/asset-pack/tree-canopy.png");
    this.load.image("level-bg-asset-stars", "/assets/levels/asset-pack/stringstar-fields.png");
    this.load.image("level-bg-asset-cloud-one", "/assets/levels/asset-pack/clouds-one.png");
    this.load.image("level-bg-asset-cloud-two", "/assets/levels/asset-pack/clouds-two.png");
    this.load.image("course-platform-long", "/assets/course/jungle-platform-long.png");
    this.load.image("course-platform-bridge", "/assets/course/jungle-bridge.png");
    this.load.image("course-field-bank", "/assets/course/field-bank.png");
    this.load.image("course-field-tree", "/assets/course/field-tree.png");
    this.load.image("course-field-shrub", "/assets/course/field-shrub.png");
    this.load.image("course-field-post", "/assets/course/field-post.png");
    this.load.image("course-rock", "/assets/course/mine-rock.png");
    this.createPixelTextures();
  }

  create() {
    const { width, height } = this.scale;
    const theme = this.currentTheme();
    this.physics.world.setBounds(0, 0, 2300, height);
    this.cameras.main.setBounds(0, 0, 2300, height);

    this.createForest(width, height);
    this.createHud(width, height);

    const course = this.createCourse(height);
    this.chestPoint = course.chest;
    this.spawnPoint = course.spawn;
    this.hazardY = course.hazardY;

    this.player = this.physics.add.sprite(course.spawn.x, course.spawn.y, "anjana-avatar");
    this.player.setScale(0.72);
    this.player.setDepth(30);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1200);
    this.player.setMaxVelocity(360, 720);
    this.player.body?.setSize(54, 84).setOffset(100, 156);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -160, 70);
    this.physics.add.collider(this.player, course.platforms);

    const obstacles = this.physics.add.staticGroup();
    course.obstacles.forEach((item) => {
      const obstacle = obstacles.create(item.x, item.y, item.texture);
      obstacle.setScale(item.scale);
      obstacle.setDepth(22);
      obstacle.refreshBody();
    });
    this.physics.add.collider(this.player, obstacles, () => this.resetPlayer());
    const movingHazards = this.createMovingHazards(theme);
    if (movingHazards) {
      this.physics.add.overlap(this.player, movingHazards, () => this.resetPlayer());
    }

    const shard = this.physics.add.staticSprite(course.shard.x, course.shard.y, "memory-shard");
    shard.refreshBody();
    this.physics.add.overlap(this.player, shard, () => {
      if (this.completed) return;
      shard.disableBody(true, true);
      this.revealTreasure();
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.input.keyboard?.addCapture(["SPACE", "UP", "W", "A", "D", "LEFT", "RIGHT"]);
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

    const body = this.player.body;
    const velocityY = body instanceof Phaser.Physics.Arcade.Body ? body.velocity.y : 0;
    const nearGround = this.player.y >= this.scale.height - 200 && Math.abs(velocityY) < 4;
    const grounded =
      Boolean(body?.blocked.down) ||
      Boolean(body?.touching.down) ||
      nearGround;

    if (jump && grounded) {
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

    const courseBody = this.make.graphics({ x: 0, y: 0 }, false);
    courseBody.fillStyle(0xffffff, 0.01);
    courseBody.fillRect(0, 0, 16, 16);
    courseBody.generateTexture("course-body", 16, 16);

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

    const texture = this.textures.get(theme.background);
    const source = texture.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
    const sourceWidth = source.width;
    const sourceHeight = source.height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);

    this.add.image(width / 2, height / 2, theme.background)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(sourceWidth * scale, sourceHeight * scale)
      .setScrollFactor(0)
      .setDepth(-40);
  }

  private createCourse(height: number): CourseLayout {
    const baseY = height - 114;
    const lift = Math.min(this.level.level - 1, 5) * 10;
    const pattern = (this.level.level - 1) % 4;
    const platformSets: PlatformSpec[][] = [
      [
        { x: 0, y: baseY, width: 520, texture: "course-platform-long" },
        { x: 620, y: baseY - 54, width: 310, texture: "course-platform-bridge" },
        { x: 1040, y: baseY - 94, width: 380, texture: "course-platform-long" },
        { x: 1540, y: baseY - 54, width: 310, texture: "course-platform-bridge" },
        { x: 1950, y: baseY, width: 420, texture: "course-platform-long" },
      ],
      [
        { x: 0, y: baseY, width: 460, texture: "course-platform-long" },
        { x: 570, y: baseY - 78 - lift, width: 280, texture: "course-platform-long" },
        { x: 980, y: baseY - 32, width: 340, texture: "course-platform-bridge" },
        { x: 1470, y: baseY - 104 - lift, width: 330, texture: "course-platform-long" },
        { x: 1950, y: baseY - 22, width: 420, texture: "course-platform-long" },
      ],
      [
        { x: 0, y: baseY, width: 430, texture: "course-platform-long" },
        { x: 540, y: baseY - 46, width: 260, texture: "course-platform-bridge" },
        { x: 900, y: baseY - 118 - lift, width: 320, texture: "course-platform-long" },
        { x: 1370, y: baseY - 70, width: 290, texture: "course-platform-bridge" },
        { x: 1840, y: baseY - 8, width: 520, texture: "course-platform-long" },
      ],
      [
        { x: 0, y: baseY, width: 500, texture: "course-platform-long" },
        { x: 620, y: baseY - 116 - lift, width: 300, texture: "course-platform-long" },
        { x: 1040, y: baseY - 58, width: 270, texture: "course-platform-bridge" },
        { x: 1480, y: baseY - 138 - lift, width: 320, texture: "course-platform-long" },
        { x: 1940, y: baseY - 26, width: 430, texture: "course-platform-long" },
      ],
    ];
    const platforms = platformSets[pattern];
    const platformGroup = this.physics.add.staticGroup();

    platforms.forEach((platform, index) => {
      const visualHeight = platform.texture === "course-platform-bridge" ? 72 : 92;
      this.add.tileSprite(platform.x, platform.y, platform.width, visualHeight, platform.texture)
        .setOrigin(0, 0)
        .setDepth(8 + index);
      const body = platformGroup.create(platform.x + platform.width / 2, platform.y + 18, "course-body");
      body.setDisplaySize(platform.width - 10, 30);
      body.setVisible(false);
      body.refreshBody();
    });

    [
      { x: 88, platform: platforms[0], texture: "course-field-tree", scale: 0.8 },
      { x: 330, platform: platforms[0], texture: "course-field-shrub", scale: 0.9 },
      { x: 1140, platform: platforms[2], texture: "course-field-bank", scale: 0.84 },
      { x: 2040, platform: platforms[4], texture: "course-field-tree", scale: 0.7 },
    ].forEach((prop) => {
      this.add.image(prop.x, prop.platform.y + 6, prop.texture)
        .setOrigin(0.5, 1)
        .setScale(prop.scale)
        .setDepth(6);
    });

    const obstacleSlots = [
      { platform: platforms[1], offset: 130, texture: "course-field-shrub" as const, scale: 0.72 },
      { platform: platforms[2], offset: 250, texture: "course-rock" as const, scale: 0.86 },
      { platform: platforms[3], offset: 155, texture: "course-field-post" as const, scale: 0.7 },
      { platform: platforms[4], offset: 170, texture: "course-field-shrub" as const, scale: 0.78 },
    ];
    const obstacles = obstacleSlots.slice(0, Math.min(this.level.obstacleCount, 4)).map((slot) => ({
      x: slot.platform.x + Math.min(slot.offset, slot.platform.width - 80),
      y: slot.platform.y - 18,
      texture: slot.texture,
      scale: slot.scale,
    }));

    const finalPlatform = platforms[4];
    const midPlatform = platforms[3];
    return {
      platforms: platformGroup,
      obstacles,
      spawn: new Phaser.Math.Vector2(140, platforms[0].y - 82),
      shard: new Phaser.Math.Vector2(midPlatform.x + midPlatform.width - 62, midPlatform.y - 42),
      chest: new Phaser.Math.Vector2(finalPlatform.x + finalPlatform.width - 128, finalPlatform.y - 46),
      hazardY: platforms[2].y - 42,
    };
  }

  private createMovingHazards(theme: LevelTheme) {
    if (this.level.level < 3) return undefined;

    const group = this.physics.add.group({ allowGravity: false, immovable: true });
    const count = Math.min(2, Math.ceil((this.level.level - 2) / 3));
    for (let index = 0; index < count; index += 1) {
      const hazard = group.create(880 + index * 620, this.hazardY, theme.obstacle) as Phaser.Physics.Arcade.Sprite;
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

  private revealTreasure() {
    const theme = this.currentTheme();
    const glow = this.add.rectangle(this.chestPoint.x, this.chestPoint.y, 148, 172, theme.accent, 0.28)
      .setDepth(10)
      .setScrollFactor(1);
    const beam = this.add.rectangle(this.chestPoint.x, this.chestPoint.y - 84, 56, 210, theme.accent, 0.16)
      .setDepth(8)
      .setScrollFactor(1);
    const label = this.add.text(this.chestPoint.x, this.chestPoint.y - 100, "OPEN", {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "22px",
      color: `#${theme.accent.toString(16).padStart(6, "0")}`,
      backgroundColor: "#211a1d",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(11);
    this.chest = this.physics.add.staticSprite(this.chestPoint.x, this.chestPoint.y, "memory-chest");
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
    this.player.setPosition(Math.max(this.spawnPoint.x, this.player.x - 260), this.spawnPoint.y);
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

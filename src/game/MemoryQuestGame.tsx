import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { challenges } from "./levels";
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
  mode: "sunny" | "tall";
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

type PlatformSpec = {
  x: number;
  y: number;
  tiles: number;
};

type SafeSurface = {
  left: number;
  right: number;
  y: number;
  margin: number;
};

type ObstacleSpec = {
  x: number;
  y: number;
  texture: string;
  scale: number;
};

type CourseLayout = {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  obstacles: ObstacleSpec[];
  safeSurfaces: SafeSurface[];
  spawn: Phaser.Math.Vector2;
  triggerBox: Phaser.Math.Vector2;
  chest: Phaser.Math.Vector2;
  itemScale: number;
};

const levelThemes: LevelTheme[] = [
  { key: "sunnyland-forest", mode: "sunny", sky: 0x9aa01f, horizon: 0xdde868, cloud: 0xb7c84c, far: 0x7d7723, mid: 0x4c4216, near: 0x2b1b0b, soil: 0x4b2d10, grass: 0xd9e45a, water: 0x5b7330, accent: 0xffd166, obstacle: "sunny-slug", background: "sunny-bg", dressing: "pineForest" },
  { key: "sunnyland-tall", mode: "tall", sky: 0x1c332e, horizon: 0xb9f50e, cloud: 0x7ab51c, far: 0x28463f, mid: 0x1c3939, near: 0x0e1f22, soil: 0x44251c, grass: 0x75bf35, water: 0x21414a, accent: 0x9ef01a, obstacle: "sunny-slug", background: "tall-back", dressing: "mistForest" },
];

const avatarScale = 0.62;
const platformSurfaceInset = 16;
const maxRunVelocity = 360;
const jumpVelocity = 520;
const moveAcceleration = 900;
class MemoryQuestScene extends Phaser.Scene {
  private forestImage?: Phaser.GameObjects.Image;
  private forestShade?: Phaser.GameObjects.Rectangle;
  private sparks = 0;
  private totalSparks = 0;
  private sparkText?: Phaser.GameObjects.Text;
  private touch = { left: false, right: false, jump: false };
  private lastGrounded = -1000;
  private jumpQueued = -1000;
  private hazards: { sprite: Phaser.Physics.Arcade.Sprite; start: number; range: number; phase: number }[] = [];
  public setTouch(key: 'left' | 'right' | 'jump', down: boolean) { this.touch[key] = down; }
  public ensureKeyboardFocus() {
    const canvas = this.game.canvas;
    if (!canvas) return;
    canvas.setAttribute("tabindex", "0");
    canvas.style.outline = "none";
    try {
      canvas.focus({ preventScroll: true });
    } catch {
      canvas.focus();
    }
  }
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
  private lastSafePosition = new Phaser.Math.Vector2(140, 0);
  private safeSurfaces: SafeSurface[] = [];
  private respawning = false;
  private avatarBodyBottomOffset = 0;

  constructor(
    level: GameLevel,
    reducedMotion: boolean,
    completeCallback: (sectionId: GameLevel["id"]) => void,
    private shouldPause: () => boolean = () => false,
  ) {
    super("memory-quest");
    this.level = level;
    this.reducedMotion = reducedMotion;
    this.completeCallback = completeCallback;
  }

  preload() {
    this.load.image("sunny-bg", "/assets/sunnyland/forest/background.png");
    this.load.image("sunny-mid", "/assets/sunnyland/forest/middleground.png");
    this.load.image("tall-back", "/assets/sunnyland/tall/back.png");
    this.load.image("tall-far", "/assets/sunnyland/tall/far.png");
    this.load.image("tall-middle", "/assets/sunnyland/tall/middle.png");
    this.load.image("tall-platform-left", "/assets/sunnyland/tall/platform-left.png");
    this.load.image("tall-platform-mid", "/assets/sunnyland/tall/platform-mid.png");
    this.load.image("tall-platform-right", "/assets/sunnyland/tall/platform-right.png");
    this.load.image("tall-block", "/assets/sunnyland/tall/block.png");
    this.load.image("sunny-crate-plain", "/assets/sunnyland/crate-plain.png");
    this.load.image("sunny-crate-ornate", "/assets/sunnyland/crate-ornate.png");
    this.load.image("sunny-tree", "/assets/sunnyland/tree.png");
    this.load.image("sunny-plant", "/assets/sunnyland/plant.png");
    this.load.image("sunny-rock", "/assets/sunnyland/rock.png");
    this.load.image("tall-plant", "/assets/sunnyland/tall/plant.png");
    this.load.image("tall-rock", "/assets/sunnyland/tall/rock.png");
    this.load.image("sunny-slug", "/assets/sunnyland/slug.png");
    this.load.image("sunny-chest", "/assets/sunnyland/chest.png");
    this.load.image("chapter-bg", `/assets/levels/${challenges[this.level.level - 1].background}.png`);
    this.createPixelTextures();
  }

  create() {
    const { width, height } = this.scale;
    const theme = this.currentTheme();
    const plan = challenges[this.level.level - 1];
    const end = plan.platforms[plan.platforms.length - 1];
    const worldWidth = (end.x + end.tiles + 1) * 16 * this.courseScale(height);
    this.physics.world.setBounds(0, 0, worldWidth, height + 420);
    this.cameras.main.setBounds(0, 0, worldWidth, height);

    this.createForest(width, height);
    this.createHud(width);

    const avatarSprite = parseAvatarSprite();
    const bodyWidth = Math.max(48, Math.floor(avatarSprite.width * 0.34));
    const bodyHeight = Math.max(78, Math.floor(avatarSprite.height * 0.34));
    const bodyOffsetX = Math.floor((avatarSprite.width - bodyWidth) / 2);
    const bodyOffsetY = Math.max(0, avatarSprite.height - bodyHeight);
    this.avatarBodyBottomOffset = (bodyOffsetY + bodyHeight - avatarSprite.height) * avatarScale;

    const course = this.createCourse(height);
    this.chestPoint = course.chest;
    this.safeSurfaces = course.safeSurfaces;
    this.lastSafePosition = course.spawn.clone();

    this.player = this.physics.add.sprite(course.spawn.x, course.spawn.y, "anjana-avatar");
    this.player.setScale(avatarScale);
    this.player.setDepth(30);
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1200);
    this.player.setMaxVelocity(maxRunVelocity, 720);
    this.player.body?.setSize(bodyWidth, bodyHeight).setOffset(bodyOffsetX, bodyOffsetY);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -Math.min(160, width * .18), 35);
    this.physics.add.collider(this.player, course.platforms);
    this.totalSparks = course.safeSurfaces.length - 1;
    const sparkGroup = this.physics.add.staticGroup();
    course.safeSurfaces.slice(1).forEach((surface, index) => {
      const x = (surface.left + surface.right) / 2;
      const spark = sparkGroup.create(x, surface.y - 90, 'spark') as Phaser.Physics.Arcade.Sprite;
      spark.setDepth(25).setScale(1.3).refreshBody();
      if (!this.reducedMotion) this.tweens.add({ targets: spark, alpha: .5, duration: 800, yoyo: true, repeat: -1 });
      if (index < plan.hazards) {
        const guardian = this.physics.add.sprite(x + 80, surface.y - 19, 'sunny-slug').setScale(1.6).setDepth(23);
        (guardian.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        guardian.setSize(20, 16);
        this.hazards.push({ sprite: guardian, start: x + 45, range: 24 + this.level.level * 3, phase: index });
        this.physics.add.overlap(this.player!, guardian, () => this.resetPlayer());
      }
    });
    this.physics.add.overlap(this.player, sparkGroup, (_player, item) => {
      const spark = item as Phaser.Physics.Arcade.Sprite;
      if (!spark.active) return;
      spark.disableBody(true, true);
      this.sparks++;
      this.sparkText?.setText(`SPARKS ${this.sparks}/${this.totalSparks}`);
      if (this.sparks === this.totalSparks) this.questText?.setText('All sparks found! Reach the rune box →');
    });
    this.sparkText?.setText(`SPARKS 0/${this.totalSparks}`);

    const obstacles = this.physics.add.staticGroup();
    course.obstacles.forEach((item) => {
      const obstacle = obstacles.create(item.x, item.y, item.texture);
      obstacle.setScale(item.scale);
      obstacle.setDepth(22);
      obstacle.refreshBody();
    });
    this.physics.add.collider(this.player, obstacles, () => this.resetPlayer());

    const unlockPrompt = this.createUnlockPrompt(course.triggerBox, theme);
    const unlockBox = this.physics.add.staticSprite(course.triggerBox.x, course.triggerBox.y, "sunny-crate-ornate");
    unlockBox.setOrigin(0.5, 1);
    unlockBox.setScale(course.itemScale);
    unlockBox.setDepth(22);
    unlockBox.refreshBody();
    this.physics.add.overlap(this.player, unlockBox, () => {
      if (this.completed) return;
      if (this.sparks < this.totalSparks) {
        this.questText?.setText(`Find ${this.totalSparks - this.sparks} more sparks before opening the rune box.`);
        return;
      }
      unlockBox.disableBody(true, true);
      unlockPrompt.forEach((item) => item.destroy());
      this.revealTreasure();
    });

    this.armControls();
    // Defer pause so React's pause effect can sync after the scene is fully ready.
    if (this.shouldPause()) {
      this.time.delayedCall(0, () => {
        if (this.shouldPause() && this.sys.settings.active) this.scene.pause();
      });
    }
  }

  /** Bind or re-arm Phaser keyboard after boot / resume so move keys stay live. */
  public armControls() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    keyboard.enabled = true;
    keyboard.clearCaptures();
    keyboard.resetKeys();
    if (!this.cursors) this.cursors = keyboard.createCursorKeys();
    if (!this.wasd) this.wasd = keyboard.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;
    keyboard.addCapture(["SPACE", "UP", "W", "A", "D", "LEFT", "RIGHT"]);
    if (!this.shouldPause()) this.ensureKeyboardFocus();
  }

  update(time: number) {
    this.hazards.forEach(h => {
      const x = h.start + Math.sin(time / (1500 - this.level.level * 65) + h.phase) * h.range;
      h.sprite.setFlipX(x < h.sprite.x);
      (h.sprite.body as Phaser.Physics.Arcade.Body).reset(x, h.sprite.y);
    });
    if (!this.player) return;

    if (this.respawning) {
      this.holdPlayerAtCheckpoint();
      return;
    }

    const left = this.touch.left || !!this.cursors?.left.isDown || !!this.wasd?.A.isDown;
    const right = this.touch.right || !!this.cursors?.right.isDown || !!this.wasd?.D.isDown;
    const jump = this.touch.jump ||
      (!!this.cursors?.space && Phaser.Input.Keyboard.JustDown(this.cursors.space)) ||
      (!!this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (!!this.wasd?.W && Phaser.Input.Keyboard.JustDown(this.wasd.W));

    if (left) {
      this.player.setAccelerationX(-moveAcceleration);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setAccelerationX(moveAcceleration);
      this.player.setFlipX(false);
    } else {
      this.player.setAccelerationX(0);
    }

    const body = this.player.body;
    const grounded = Boolean(body?.blocked.down) || Boolean(body?.touching.down);

    const activeSurface = grounded && !this.respawning ? this.findSafeSurface() : undefined;
    if (activeSurface) {
      const safeX = Phaser.Math.Clamp(
        this.player.x,
        activeSurface.left + activeSurface.margin,
        activeSurface.right - activeSurface.margin,
      );
      const nearHazard = this.hazards.some(h => Math.abs(safeX - h.start) < h.range + 60);
      if (!nearHazard) this.lastSafePosition.set(safeX, this.playerYForSurface(activeSurface.y));
    }

    if (grounded) this.lastGrounded = time;
    if (jump) { this.jumpQueued = time; this.touch.jump = false; }
    if (time - this.jumpQueued < 130 && time - this.lastGrounded < 100) {
      this.player.setVelocityY(-jumpVelocity);
      this.lastGrounded = -1000;
      this.jumpQueued = -1000;
    }

    if (this.player.x < 32) {
      this.player.setX(32);
      this.player.setVelocityX(Math.max(0, this.player.body?.velocity.x ?? 0));
    }

    if (this.player.y > this.scale.height + 160) {
      this.resetPlayer();
    }

    const progress = Phaser.Math.Clamp(this.player.x / this.chestPoint.x, 0, 1);
    this.progressBar?.setDisplaySize(140 * progress, 4);
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

    const spark = this.make.graphics({ x: 0, y: 0 }, false);
    spark.fillStyle(0xffe2a0); spark.fillPoints([{x:12,y:0},{x:24,y:12},{x:12,y:24},{x:0,y:12}], true);
    spark.fillStyle(0xffffff); spark.fillRect(10,6,4,8);
    spark.generateTexture('spark',24,24);
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
    this.cameras.main.setBackgroundColor(0x192132);
    // Cover-fit a single image: uniform scale, no stretch, no tiling/replay, no empty bands.
    this.forestImage = this.add.image(width / 2, height / 2, "chapter-bg").setScrollFactor(0).setDepth(-50);
    this.forestShade = this.add.rectangle(0, 0, width, height, 0x121927, .08).setOrigin(0).setScrollFactor(0).setDepth(-40);
    const fit = (size: { width: number; height: number }) => {
      const bg = this.forestImage!;
      const source = bg.texture.getSourceImage() as HTMLImageElement;
      const scale = Math.max(size.width / source.width, size.height / source.height);
      bg.setPosition(size.width / 2, size.height / 2);
      bg.setScale(scale);
      this.forestShade?.setSize(size.width, size.height);
      this.cameras.main.setSize(size.width, size.height);
      this.cameras.main.setFollowOffset(-Math.min(160, size.width * .18), 35);
      this.questText?.setX(size.width - 18).setWordWrapWidth(Math.max(100, Math.min(350, size.width - 175)));
    };
    fit({ width, height });
    this.scale.on("resize", fit);
    this.events.once("shutdown", () => this.scale.off("resize", fit));
  }

  private createCourse(height: number): CourseLayout {
    const tileScale = this.courseScale(height);
    const unit = 16 * tileScale;
    const baseY = height - Math.max(126, unit * 2.2);
    const pattern = challenges[this.level.level - 1].platforms;
    const platforms: PlatformSpec[] = pattern.map((platform) => ({
      x: platform.x * unit,
      y: baseY - platform.rise * unit,
      tiles: platform.tiles,
    }));
    const platformGroup = this.physics.add.staticGroup();
    const safeSurfaces: SafeSurface[] = [];

    platforms.forEach((platform) => {
      safeSurfaces.push(this.drawPlatform(platformGroup, platform, tileScale));
    });

    const finalPlatform = platforms[platforms.length - 1];
    const finalSurfaceY = finalPlatform.y + platformSurfaceInset * tileScale;
    const triggerX = finalPlatform.x + unit * Math.min(2.4, finalPlatform.tiles - 4.2);
    const chestX = finalPlatform.x + unit * Math.min(6.5, finalPlatform.tiles - 2.2);
    return {
      platforms: platformGroup,
      obstacles: [],
      safeSurfaces,
      spawn: new Phaser.Math.Vector2(unit * 2.1, this.playerYForSurface(safeSurfaces[0].y)),
      triggerBox: new Phaser.Math.Vector2(triggerX, finalSurfaceY),
      chest: new Phaser.Math.Vector2(chestX, finalSurfaceY),
      itemScale: tileScale / 1.45,
    };
  }

  private courseScale(height: number) {
    return Phaser.Math.Clamp(Math.round(height / 260), 3, 4);
  }

  private drawPlatform(
    platformGroup: Phaser.Physics.Arcade.StaticGroup,
    platform: PlatformSpec,
    tileScale: number,
  ): SafeSurface {
    const unit = 16 * tileScale;
    const width = platform.tiles * unit;
    const surfaceY = platform.y + platformSurfaceInset * tileScale;
    this.add.image(platform.x, platform.y, "tall-platform-left")
      .setOrigin(0, 0)
      .setScale(tileScale)
      .setDepth(12);
    for (let index = 1; index < platform.tiles - 1; index += 1) {
      this.add.image(platform.x + index * unit, platform.y, "tall-platform-mid")
        .setOrigin(0, 0)
        .setScale(tileScale)
        .setDepth(12);
    }
    this.add.image(platform.x + (platform.tiles - 1) * unit, platform.y, "tall-platform-right")
      .setOrigin(0, 0)
      .setScale(tileScale)
      .setDepth(12);

    const bodyHeight = unit * 0.42;
    const bodyWidth = width - unit * 0.16;
    const body = platformGroup.create(platform.x + width / 2, surfaceY + bodyHeight / 2, "course-body");
    body.setDisplaySize(bodyWidth, bodyHeight);
    body.setVisible(false);
    body.refreshBody();

    const left = platform.x + (width - bodyWidth) / 2;
    const right = left + bodyWidth;
    return {
      left,
      right,
      y: surfaceY,
      margin: Math.max(24, unit * 0.72),
    };
  }

  private createHud(width: number) {
    const style = { fontFamily: 'Pixelify Sans', fontSize: '18px', color: '#f3e5b8', backgroundColor: '#142b2be6', padding: { x: 12, y: 9 } };
    this.sparkText = this.add.text(18, 18, 'SPARKS', style).setScrollFactor(0).setDepth(71);
    this.add.rectangle(18, 56, 140, 4, 0x18372d).setOrigin(0).setScrollFactor(0).setDepth(71);
    this.progressBar = this.add.rectangle(18, 56, 1, 4, 0xe4c66e).setOrigin(0).setScrollFactor(0).setDepth(72);
    this.questText = this.add.text(width - 18, 18, 'Collect sparks → Find the rune box', { ...style, fontSize: '16px', wordWrap: { width: Math.max(120, Math.min(350, width - 215)) } }).setOrigin(1, 0).setScrollFactor(0).setDepth(71);
  }

  private createUnlockPrompt(point: Phaser.Math.Vector2, theme: LevelTheme) {
    const label = this.add.text(point.x, point.y - 118, "TOUCH THIS", {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "18px",
      color: "#211a1d",
      backgroundColor: `#${theme.accent.toString(16).padStart(6, "0")}`,
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setDepth(32);
    const arrow = this.add.triangle(point.x, point.y - 72, 0, 0, 28, 0, 14, 28, theme.accent, 1)
      .setOrigin(0.5)
      .setDepth(32);

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: [label, arrow],
        y: "-=8",
        duration: 620,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }

    return [label, arrow];
  }

  private revealTreasure() {
    this.chest = this.physics.add.staticSprite(this.chestPoint.x, this.chestPoint.y, "sunny-chest");
    this.chest.setOrigin(0.5, 1);
    this.chest.setDepth(24);
    this.chest.setScale(this.courseScale(this.scale.height) / 1.15);
    this.chest.refreshBody();
    this.chest.setInteractive({ useHandCursor: true });
    this.chest.on("pointerdown", () => this.openTreasure());
    this.questText?.setText(`${this.level.rewardName} found. Touch the chest.`);
    this.physics.add.overlap(this.player!, this.chest, () => this.openTreasure());
  }

  private openTreasure() {
    if (this.completed || !this.chest) return;
    this.completed = true;
    this.chest.setTint(0xffd166);
    this.questText?.setText(`${this.level.rewardName} is opening...`);
    if (!this.reducedMotion) this.cameras.main.flash(200, 120, 140, 100);
    this.time.delayedCall(520, () => this.completeLevel());
  }

  private findSafeSurface() {
    if (!this.player?.body) return undefined;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const footX = this.player.x;
    const footY = body.bottom;
    return this.safeSurfaces.find((surface) => {
      const inside = footX >= surface.left + surface.margin && footX <= surface.right - surface.margin;
      const aligned = Math.abs(footY - surface.y) <= 14;
      return inside && aligned;
    });
  }

  private resetPlayer() {
    if (!this.player || this.completed || this.respawning) return;
    this.respawning = true;
    this.holdPlayerAtCheckpoint();
    if (!this.reducedMotion) this.cameras.main.shake(120, 0.004);
    this.time.delayedCall(120, () => {
      this.respawning = false;
    });
  }

  private holdPlayerAtCheckpoint() {
    if (!this.player) return;
    this.player.setPosition(this.lastSafePosition.x, this.lastSafePosition.y);
    if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
      this.player.body.reset(this.lastSafePosition.x, this.lastSafePosition.y);
    }
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setAngularVelocity(0);
  }

  private completeLevel() {
    this.questText?.setText(`${this.level.rewardName} unlocked.`);
    this.completeCallback(this.level.id);
  }

  private playerYForSurface(surfaceY: number) {
    return surfaceY - this.avatarBodyBottomOffset;
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
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const sendKey = (type: "keydown" | "keyup", key: string) => {
    const scene = gameRef.current?.scene.getScene('memory-quest') as MemoryQuestScene | undefined;
    scene?.setTouch(key === 'ArrowLeft' ? 'left' : key === 'ArrowRight' ? 'right' : 'jump', type === 'keydown');
  };

useEffect(() => {
  if (!containerRef.current) return;

  let cancelled = false;
  let game: Phaser.Game | null = null;
  let observer: ResizeObserver | null = null;
  const canvasHost = containerRef.current;
  // Phaser.destroy is deferred to the next step; two frames lets a remount avoid fighting the previous instance's window keyboard/focus handlers.
  let bootRaf2 = 0;
  const bootRaf1 = window.requestAnimationFrame(() => {
    bootRaf2 = window.requestAnimationFrame(() => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";

      const scene = new MemoryQuestScene(level, reducedMotion, onComplete, () => pausedRef.current);

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
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
          mode: Phaser.Scale.RESIZE, // canvas resolution == real container size, always. No virtual-then-stretch step.
          parent: containerRef.current,
          width: "100%",
          height: "100%",
        },
        scene,
      });
      gameRef.current = game;

      observer = new ResizeObserver(() => {
        if (!game) return;
        const w = canvasHost.clientWidth;
        const h = canvasHost.clientHeight;
        if (w > 0 && h > 0) {
          game.scale.resize(w, h);
        }
      });
      observer.observe(canvasHost);

      game.events.once(Phaser.Core.Events.READY, () => {
        if (cancelled) return;
        const active = game?.scene.getScene("memory-quest") as MemoryQuestScene | undefined;
        window.requestAnimationFrame(() => active?.armControls());
      });
    });
  });

  const focusGame = () => {
    const active = gameRef.current?.scene.getScene("memory-quest") as MemoryQuestScene | undefined;
    active?.ensureKeyboardFocus();
  };
  canvasHost.addEventListener("pointerdown", focusGame);

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(bootRaf1);
    window.cancelAnimationFrame(bootRaf2);
    canvasHost.removeEventListener("pointerdown", focusGame);
    observer?.disconnect();
    if (game) {
      game.destroy(true);
      if (gameRef.current === game) gameRef.current = null;
    }
  };
}, [level, onComplete, reducedMotion]);

  useEffect(() => {
    const syncPause = () => {
      const game = gameRef.current;
      if (!game) return false;
      const scene = game.scene.getScene("memory-quest") as MemoryQuestScene | undefined;
      // Wait until create() has finished so pause/resume and keyboard arming stick.
      const status = scene?.sys?.settings?.status;
      if (!scene || status === undefined || status < Phaser.Scenes.RUNNING) return false;
      if (paused) {
        scene.setTouch("left", false);
        scene.setTouch("right", false);
        scene.setTouch("jump", false);
        scene.input.keyboard?.resetKeys();
        if (scene.sys.isActive()) scene.scene.pause();
        return scene.sys.isPaused();
      }
      if (scene.sys.isPaused()) scene.scene.resume();
      scene.armControls();
      return !scene.sys.isPaused() && !!scene.input.keyboard?.enabled;
    };

    if (syncPause()) return;
    const timer = window.setInterval(() => {
      if (syncPause()) window.clearInterval(timer);
    }, 32);
    return () => window.clearInterval(timer);
  }, [paused, level, reducedMotion]);

  return (
    <div className="game-wrap">
      <div ref={containerRef} className="game-canvas" aria-label="Anjana Memory Quest game" />
      <div className="touch-controls" aria-label="Touch game controls">
        <button
          type="button"
          aria-label="Move left"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); sendKey("keydown", "ArrowLeft"); }}
          onPointerUp={() => sendKey("keyup", "ArrowLeft")}
          onPointerCancel={() => sendKey("keyup", "ArrowLeft")}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Jump"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); sendKey("keydown", " "); }}
          onPointerUp={() => sendKey("keyup", " ")}
          onPointerCancel={() => sendKey("keyup", " ")}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Move right"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); sendKey("keydown", "ArrowRight"); }}
          onPointerUp={() => sendKey("keyup", "ArrowRight")}
          onPointerCancel={() => sendKey("keyup", "ArrowRight")}
        >
          →
        </button>
      </div>
    </div>
  );
}

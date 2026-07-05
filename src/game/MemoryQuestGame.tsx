import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { GameLevel } from "../data/portfolio";

type MemoryQuestGameProps = {
  level: GameLevel;
  reducedMotion: boolean;
  onComplete: (sectionId: GameLevel["id"]) => void;
};

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
    this.physics.world.setBounds(0, 0, 2300, height);
    this.cameras.main.setBounds(0, 0, 2300, height);

    this.createForest(width, height);
    this.createHud(width);

    const ground = this.physics.add.staticGroup();
    for (let x = 0; x < 2400; x += 64) {
      const tile = ground.create(x + 32, height - 52, "ground-tile");
      tile.setOrigin(0.5, 0.5).refreshBody();
    }

    this.player = this.physics.add.sprite(120, height - 148, "anjana-avatar");
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1200);
    this.player.setMaxVelocity(360, 720);
    this.player.body?.setSize(34, 52).setOffset(10, 8);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -160, 70);
    this.physics.add.collider(this.player, ground);

    const obstacles = this.physics.add.staticGroup();
    const gap = 430;
    for (let index = 0; index < this.level.obstacleCount; index += 1) {
      const stump = obstacles.create(520 + index * gap, height - 118, "thorn-stump");
      stump.refreshBody();
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
    const avatar = this.make.graphics({ x: 0, y: 0 }, false);
    avatar.fillStyle(0x3a2118);
    avatar.fillRect(18, 8, 26, 26);
    avatar.fillStyle(0x9a5f3f);
    avatar.fillRect(16, 18, 30, 26);
    avatar.fillStyle(0x221915);
    avatar.fillRect(12, 8, 10, 34);
    avatar.fillRect(42, 10, 8, 32);
    avatar.fillStyle(0xf8c49a);
    avatar.fillRect(18, 20, 26, 24);
    avatar.fillStyle(0x111111);
    avatar.fillRect(20, 27, 8, 5);
    avatar.fillRect(34, 27, 8, 5);
    avatar.fillRect(27, 29, 8, 3);
    avatar.fillStyle(0xff6f91);
    avatar.fillRect(25, 39, 11, 4);
    avatar.fillStyle(0x5f3dc4);
    avatar.fillRect(16, 48, 30, 24);
    avatar.fillStyle(0xffd166);
    avatar.fillRect(12, 48, 8, 20);
    avatar.fillRect(42, 48, 8, 20);
    avatar.fillStyle(0x263238);
    avatar.fillRect(18, 72, 10, 18);
    avatar.fillRect(34, 72, 10, 18);
    avatar.generateTexture("anjana-avatar", 64, 96);

    const ground = this.make.graphics({ x: 0, y: 0 }, false);
    ground.fillStyle(0x17251e);
    ground.fillRect(0, 0, 64, 40);
    ground.fillStyle(0x5b8c45);
    ground.fillRect(0, 0, 64, 10);
    ground.fillStyle(0x8ccf61);
    ground.fillRect(8, 0, 8, 8);
    ground.fillRect(38, 2, 12, 6);
    ground.fillStyle(0x3a4f2e);
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
  }

  private createForest(width: number, height: number) {
    this.cameras.main.setBackgroundColor(this.level.palette.sky);

    this.add.rectangle(width / 2, height / 2, width * 2, height, 0x1f5a3d, 0.16)
      .setScrollFactor(0.12);
    for (let x = 40; x < 2300; x += 170) {
      this.add.rectangle(x, height - 250, 52, 320, 0x14251d)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.22);
      this.add.rectangle(x - 28, height - 400, 116, 96, 0x1f5a3d)
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0.22);
    }

    for (let x = 90; x < 2300; x += 230) {
      this.add.rectangle(x, height - 170, 44, 260, 0x211a1d)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.55);
      this.add.rectangle(x + 34, height - 320, 126, 84, 0x315a45)
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0.55);
    }

    for (let index = 0; index < 34; index += 1) {
      const x = Phaser.Math.Between(40, 2240);
      const y = Phaser.Math.Between(70, height - 180);
      const dot = this.add.rectangle(x, y, 5, 5, Phaser.Display.Color.HexStringToColor(this.level.palette.glow).color)
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
    const panel = this.add.rectangle(24, 22, 330, 88, 0x211a1d, 0.86)
      .setOrigin(0, 0)
      .setScrollFactor(0);
    panel.setStrokeStyle(4, 0xf9e7b7);

    this.add.text(44, 38, `LEVEL ${this.level.level}`, {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "18px",
      color: "#ffd166",
    }).setScrollFactor(0);
    this.add.text(44, 62, this.level.title.toUpperCase(), {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "20px",
      color: "#f9e7b7",
    }).setScrollFactor(0);

    this.add.rectangle(154, 40, 196, 18, 0x0e1116).setOrigin(0, 0).setScrollFactor(0);
    this.progressBar = this.add.rectangle(160, 44, 0, 10, 0xff6f91).setOrigin(0, 0).setScrollFactor(0);
    this.add.rectangle(width / 2, 28, 380, 46, 0x211a1d, 0.82)
      .setStrokeStyle(3, 0xffd166)
      .setScrollFactor(0);
    this.questText = this.add.text(width / 2, 28, this.level.quest, {
      fontFamily: "\"Pixelify Sans\", monospace",
      fontSize: "16px",
      color: "#f9e7b7",
      align: "center",
      wordWrap: { width: 340 },
    }).setOrigin(0.5, 0.5).setScrollFactor(0);
  }

  private revealTreasure(height: number) {
    this.chest = this.physics.add.staticSprite(2040, height - 124, "memory-chest");
    this.chest.refreshBody();
    this.chest.setInteractive({ useHandCursor: true });
    this.chest.on("pointerdown", () => this.openTreasure());
    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.chest,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 520,
        yoyo: true,
        repeat: -1,
      });
    }
    this.questText?.setText(`${this.level.rewardName} found. Press the chest.`);
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
    this.player.setPosition(Math.max(120, this.player.x - 260), this.scale.height - 148);
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
      width: 960,
      height: 540,
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
        mode: Phaser.Scale.FIT,
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

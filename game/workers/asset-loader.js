import { loadAsset } from '../utils.js';
import Map from '../models/map.js';
import Sprite, { AnimatableSprite, AvatarSprite, SlicedSprite } from '../models/sprites.js';
import MapManager from '../managers/map-manager.js';
import SpriteManager from '../managers/sprite-manager.js';

export default function loadAssets() {
  return new Promise((resolve) => {
    // Rabbit
    const load1 = loadAsset('Images/avatars/rabbit.png')
      .then((rabbitSheet) => {
        const rabbitSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 118, 24, 36, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 159, 36, 36, 40, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 38, 24, 36, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 79, 36, 36, 40, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('rabbit-avatar', rabbitSprite);
      });

    const load7 = loadAsset('Images/avatars/rabbit-brown.png')
      .then((rabbitSheet) => {
        const rabbitSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 118, 24, 36, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 159, 36, 36, 40, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 38, 24, 36, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 79, 36, 36, 40, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('rabbit-brown-avatar', rabbitSprite);
      });

    const load8 = loadAsset('Images/avatars/chick.png')
      .then((chickSheet) => {
        const chickSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(chickSheet, 1, 81, 25, 25, 25, 0, 7),
          AnimatableSprite.generateFromTiledFrames(chickSheet, 4, 108, 25, 25, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(chickSheet, 1, 28, 25, 25, 25, 0, 7),
          AnimatableSprite.generateFromTiledFrames(chickSheet, 4, 55, 25, 25, 33, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('chick-avatar', chickSprite);
      });

    const load9 = loadAsset('Images/avatars/cat.png')
      .then((catSheet) => {
        const catSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(catSheet, 1, 105, 31, 33, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(catSheet, 1, 140, 34, 33, 36, 0, 7),
          AnimatableSprite.generateFromTiledFrames(catSheet, 1, 35, 31, 33, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(catSheet, 1, 70, 34, 33, 36, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('cat-avatar', catSprite);
      });

    const load10 = loadAsset('Images/avatars/red-panda.png')
      .then((redPandaSheet) => {
        const redPandaSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(redPandaSheet, 1, 108, 31, 41, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(redPandaSheet, 1, 149, 39, 31, 41, 0, 7),
          AnimatableSprite.generateFromTiledFrames(redPandaSheet, 1, 40, 31, 41, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(redPandaSheet, 1, 75, 39, 31, 41, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('red-panda-avatar', redPandaSprite);
      });

    const load11 = loadAsset('Images/avatars/worm.png')
      .then((wormSheet) => {
        const wormSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(wormSheet, 1, 78, 31, 27, 25, 0, 7),
          AnimatableSprite.generateFromTiledFrames(wormSheet, 1, 104, 31, 23, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(wormSheet, 1, 26, 31, 27, 26, 0, 7),
          AnimatableSprite.generateFromTiledFrames(wormSheet, 1, 53, 31, 23, 33, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('worm-avatar', wormSprite);
      });


    const load2 = loadAsset('Images/chat-bubble.png')
      .then((x) => {
        const sprite = SlicedSprite.from(x, [
          [0, 0, 14, 5],
          [14, 0, 9, 5],
          [23, 0, 5, 5],
          [0, 5, 14, 11],
          [14, 5, 9, 11],
          [23, 5, 5, 11],
          [0, 16, 14, 10],
          [14, 16, 9, 10],
          [23, 16, 5, 10],
        ]);
        SpriteManager.getInstance().registerSprite('chat-bubble', sprite);
      });

    // Map
    const load3 = loadAsset(['Images/template1.png', 'Images/template1_collision.png'])
      .then(([map, colli]) => {
        const map1 = new Map(map, colli, 3300, 1200, 66, 24);
        MapManager.getInstance().registerMap('testMap', map1);
      });

    const load4 = loadAsset('Images/ui.png')
      .then((x) => {
        const spriteManager = SpriteManager.getInstance();
        spriteManager.registerSprite('button', new Sprite(x, 1, 1, 36, 36));
        spriteManager.registerSprite('button-shaded', new Sprite(x, 1, 39, 36, 36));
        spriteManager.registerSprite('icon-mic', new Sprite(x, 39, 1, 36, 36));
        spriteManager.registerSprite('icon-mic-muted', new Sprite(x, 77, 1, 36, 36));
        spriteManager.registerSprite('icon-speaker', new Sprite(x, 115, 1, 36, 36));
        spriteManager.registerSprite('icon-speaker-muted', new Sprite(x, 153, 1, 36, 36));
        spriteManager.registerSprite('icon-hamburger', new Sprite(x, 39, 39, 36, 36));
        spriteManager.registerSprite('icon-tick', new Sprite(x, 77, 39, 36, 36));
        spriteManager.registerSprite('icon-cross', new Sprite(x, 115, 39, 36, 36));
        const longBtn = SlicedSprite.from(x, [
          [1, 77, 18, 15],
          [19, 77, 28, 15],
          [47, 77, 18, 15],
          [1, 92, 18, 2],
          [19, 92, 28, 2],
          [47, 92, 18, 2],
          [1, 94, 18, 19],
          [19, 94, 28, 19],
          [47, 94, 18, 19],
        ]);
        spriteManager.registerSprite('button-long', longBtn);
        const longBtnDark = SlicedSprite.from(x, [
          [1, 115, 18, 15],
          [19, 115, 28, 15],
          [47, 115, 18, 15],
          [1, 130, 18, 2],
          [19, 130, 28, 2],
          [47, 130, 18, 2],
          [1, 132, 18, 19],
          [19, 132, 28, 19],
          [47, 132, 18, 19],
        ]);
        spriteManager.registerSprite('button-long-shaded', longBtnDark);
        const panel = SlicedSprite.from(x, [
          [67, 77, 12, 25],
          [79, 77, 84, 25],
          [163, 77, 12, 25],
          [67, 102, 18, 28],
          [79, 102, 28, 28],
          [163, 102, 18, 28],
          [67, 130, 18, 25],
          [79, 130, 28, 25],
          [163, 130, 18, 25],
        ]);
        spriteManager.registerSprite('panel', panel);
      });

    const load5 = loadAsset('Images/battleship.png')
      .then((x) => {
        const spriteManager = SpriteManager.getInstance();
        spriteManager.registerSprite('battleship-board', new Sprite(x, 0, 0, 512, 512));

        spriteManager.registerSprite('battleship-bb-90', new Sprite(x, 514, 0, 46, 184));
        spriteManager.registerSprite('battleship-dd-90', new Sprite(x, 562, 0, 46, 138));
        spriteManager.registerSprite('battleship-cl-90', new Sprite(x, 562, 140, 46, 138));
        spriteManager.registerSprite('battleship-cv-90', new Sprite(x, 610, 0, 46, 230));
        spriteManager.registerSprite('battleship-ao-90', new Sprite(x, 658, 0, 46, 92));

        spriteManager.registerSprite('battleship-bb', new Sprite(x, 514, 466, 184, 46));
        spriteManager.registerSprite('battleship-cv', new Sprite(x, 514, 418, 230, 46));
        spriteManager.registerSprite('battleship-cl', new Sprite(x, 514, 370, 138, 46));
        spriteManager.registerSprite('battleship-dd', new Sprite(x, 514, 322, 138, 46));
        spriteManager.registerSprite('battleship-ao', new Sprite(x, 654, 322, 92, 46));

        const explosion = AnimatableSprite.generateFromTiledFrames(x, 0, 514, 48, 48, 50, 0, 15);
        spriteManager.registerSprite('battleship-explosion', explosion);

        spriteManager.registerSprite('battleship-fire', new Sprite(x, 688, 94, 62, 100));
        spriteManager.registerSprite('battleship-receive', new Sprite(x, 658, 94, 30, 100));
        spriteManager.registerSprite('battleship-plane', new Sprite(x, 694, 216, 46, 45));
      });

    const load6 = loadAsset('Images/checkers.png')
      .then((x) => {
        const spriteManager = SpriteManager.getInstance();
        spriteManager.registerSprite('checkers-grid-brown', new Sprite(x, 0, 0, 147, 144));
        spriteManager.registerSprite('checkers-grid-black', new Sprite(x, 147, 0, 144, 144));
        spriteManager.registerSprite('checkers-piece-red-normal', new Sprite(x, 205, 173, 187, 187));
        spriteManager.registerSprite('checkers-piece-black-normal', new Sprite(x, 0, 170, 187, 187));
        spriteManager.registerSprite('checkers-piece-red-king', new Sprite(x, 0, 385, 187, 187));
        spriteManager.registerSprite('checkers-piece-black-king', new Sprite(x, 210, 383, 187, 187));
      });

    Promise.all([load1, load2, load3, load4, load5, load6, load7, load8, load9, load10, load11])
      .then(resolve);
  });
}

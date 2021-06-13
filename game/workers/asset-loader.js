import { loadAsset } from '../utils.js';
import Map from '../models/map.js';
import { AnimatableSprite, AvatarSprite, SlicedSprite } from '../models/sprites.js';
import MapManager from '../managers/map-manager.js';
import SpriteManager from '../managers/sprite-manager.js';

export default function loadAssets() {
  return new Promise((resolve) => {
    // Rabbit
    const load1 = loadAsset('Images/rabbit.png')
      .then((rabbitSheet) => {
        const rabbitSprite = new AvatarSprite(
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 118, 24, 36, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 159, 36, 36, 40, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 38, 24, 36, 33, 0, 7),
          AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 79, 36, 36, 40, 0, 7),
        );
        SpriteManager.getInstance().registerSprite('rabbit-avatar', rabbitSprite);
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

    Promise.all([load1, load2, load3]).then(resolve);
  });
}

import Sprite, {AnimatableSprite, AvatarSprite, SlicedSprite} from '../models/sprites.js';
import NetworkManager from '../net/network-manager.js';
import { timeout, loadAsset } from '../net/utils.js'

let networkManager = NetworkManager.getInstance();
loadAsset('../Images/SliceTest.jpg')
.then(x => {
  let sprite = SlicedSprite.from(x, [
    [1, 1, 52, 52],
    [53, 1, 420, 52],
    [473, 1, 52, 52],
    [1, 53, 52, 419],
    [53, 53, 420, 419],
    [473, 53, 52, 419],
    [1, 472, 52, 52],
    [53, 472, 420, 52],
    [473, 472, 52, 52]
  ]);

  let ctx = document.getElementById('game').getContext('2d');
  sprite.drawAt(ctx, 0, 0, 625, 500);
});

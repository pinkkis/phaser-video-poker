import { BaseScene } from './BaseScene';
import { Colors } from '../config/Colors';

export class BootScene extends BaseScene {
	private rt: Phaser.GameObjects.RenderTexture;

	constructor(key: string, options: any) {
		super('BootScene');
	}

	public preload(): void {
		this.load.atlas('suits', 'assets/suits.png', 'assets/suits.json');
		this.load.atlas('suits8', 'assets/suits-8.png', 'assets/suits-8.json');
		this.load.image('cardback-graphic', 'assets/cardback.png');
		this.load.image('joker', 'assets/joker.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
	}

	public create(): void {
		console.info('BootScene - create()');

		this.createTexture();

		this.scene.start('GameScene', {});
	}

	private createTexture() {
		this.rt = this.add.renderTexture(-100, -10, 32, 48);

		const graphics = this.add.graphics()
			.fillStyle(Colors.CARD_COLOR, 1)
			.fillRoundedRect(0, 0, 32, 48, 2);

		const cardback = this.add.image(16, 24, 'cardback-graphic').setOrigin(.5);

		this.rt.draw(graphics)
			.draw(cardback)
			.saveTexture('cardback');

		cardback.destroy();
		graphics.destroy();
	}
}

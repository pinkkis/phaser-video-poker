import { BaseScene } from './BaseScene';
import { Colors } from '../config/Colors';
import { cardWidth, cardHeight } from '../components/CardSprite';

export class LoaderScene extends BaseScene {
	private rt: Phaser.GameObjects.RenderTexture;

	constructor(key: string, options: any) {
		super('LoaderScene');
	}

	public preload(): void {
		const progress = this.add.graphics();

		this.add
			.bitmapText(
				this.scale.gameSize.width / 2,
				this.scale.gameSize.height / 2 - 40,
				'arcade',
				'LOADING',
			)
			.setOrigin(0.5);

		this.load.on('progress', (value: number) => {
			progress.clear();
			progress.fillStyle(0xffffff, 1);
			progress.fillRect(
				0,
				this.scale.gameSize.height / 2,
				this.scale.gameSize.width * value,
				60,
			);
		});

		this.load.on('complete', () => {
			progress.destroy();
		});

		this.load.atlas('suits', 'assets/suits.png', 'assets/suits.json');
		this.load.atlas('suits8', 'assets/suits-8.png', 'assets/suits-8.json');
		this.load.atlas('volume', 'assets/volume.png', 'assets/volume.json');
		this.load.image('cardback-graphic', 'assets/cardback.png');
		this.load.image('joker', 'assets/joker.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');

		this.load.audio('bet', ['assets/sounds/bet.wav']);
		this.load.audio('coin', ['assets/sounds/coin.wav']);
		this.load.audio('deal', ['assets/sounds/deal.wav']);
		this.load.audio('kosh', ['assets/sounds/kosh.wav']);
		this.load.audio('win', ['assets/sounds/win.wav']);
		this.load.audio('shuffle1', ['assets/sounds/shuffle1.wav']);
		this.load.audio('shuffle2', ['assets/sounds/shuffle2.wav']);
		this.load.audio('reveal-short', ['assets/sounds/reveal-short.wav']);
		this.load.audio('reveal-long', ['assets/sounds/reveal-long.wav']);
		this.load.audio('thock', ['assets/sounds/thock.wav']);
	}

	public create(): void {
		this.createTexture();

		this.scene.start('GameScene', {});
	}

	private createTexture() {
		this.rt = this.add.renderTexture(-100, -10, cardWidth, cardHeight);

		const graphics = this.add.graphics()
			.fillStyle(Colors.CARD_COLOR.color, 1)
			.lineStyle(2, Colors.WHITE.color, 1)
			.fillRoundedRect(0, 0, cardWidth, cardHeight, 2)
			.strokeRoundedRect(0, 0, cardWidth, cardHeight, 2);

		const cardback = this.add.image(cardWidth / 2, cardHeight / 2, 'cardback-graphic').setOrigin(.5).setScale(2);

		this.rt.draw(graphics)
			.draw(cardback)
			.saveTexture('cardback');

		cardback.destroy();
		graphics.destroy();
	}
}

import { BaseScene } from './BaseScene';
import { Colors } from '../config/Colors';
import { cardWidth, cardHeight } from '../components/CardSprite';
import { Deck } from '../components/Deck';
import { Card } from '../components/Card';

export class LoaderScene extends BaseScene {
	private rt: Phaser.GameObjects.RenderTexture;

	constructor(key: string, options: any) {
		super('LoaderScene');
	}

	public preload(): void {
		const progress = this.add.graphics();

		const loading = this.add
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
			loading.destroy();
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
		this.createCardBackTexture();
		this.scene.start('GameScene', {});
	}

	private createCardBackTexture() {
		this.rt = this.add.renderTexture(0, this.scale.gameSize.height + 10, 1024, 1024);

		const graphics = this.add.graphics()
			.fillStyle(Colors.CARD_COLOR.color, 1)
			.lineStyle(2, Colors.WHITE.color, 1)
			.fillRoundedRect(0, 0, cardWidth, cardHeight, 3)
			.strokeRoundedRect(0, 0, cardWidth, cardHeight, 3);

		const cardback = this.add.image(cardWidth / 2, cardHeight / 2, 'cardback-graphic').setOrigin(.5).setScale(2);

		this.rt.draw(graphics)
			.draw(cardback)
			.saveTexture('card')
			.add('back', 0, 0, 0, cardWidth, cardHeight);

		cardback.destroy();

		// create card faces
		this.createCardTextures(graphics);

		graphics.destroy();
	}

	private getTexturePosition(index: number): {x: number, y: number} {
		const x = (index % 9) * cardWidth + (index % 9) * 2;
		const y = Math.floor(index / 9) * cardHeight + Math.floor(index / 9) * 2;

		return {x, y};
	}

	private createCardTextures(graphics: Phaser.GameObjects.Graphics) {
		new Deck(1).cards.forEach( (card: Card, index: number) => {
			const texLoc = this.getTexturePosition(index + 1);

			this.rt.draw(graphics, texLoc.x, texLoc.y);

			if (card.isJoker) {
				const joker = this.add.image(texLoc.x + cardWidth / 2, texLoc.y + 25, 'joker').setOrigin(0.5);
				const value = this.add.bitmapText(texLoc.x + cardWidth / 2, texLoc.y + cardHeight - 12, 'arcade', 'joker', 8)
					.setTint(Colors.UI_BLUE.color).setOrigin(.5);

				// this.rt.draw(graphics, texLoc.x, texLoc.y);
				this.rt.draw(joker);
				this.rt.draw(value);

				joker.destroy();
				value.destroy();

			} else {
				if (card.rank.value === 1) {
					const suit = this.add.image(texLoc.x + cardWidth / 2, texLoc.y + cardHeight / 2, 'suits', card.suit)
					.setOrigin(0.5);

					this.rt.draw(suit);

					suit.destroy();
				} else {
					const suit = this.add.image(texLoc.x + 4, texLoc.y + 15, 'suits8', card.suit)
					.setOrigin(0);

					const suit2 = this.add.image(texLoc.x + 45, texLoc.y + 50, 'suits8', card.suit)
					.setOrigin(0).setRotation(Phaser.Math.DegToRad(180));

					this.rt.draw([suit, suit2]);

					suit.destroy();
					suit2.destroy();
				}

				const value = this.add.bitmapText(texLoc.x + 4, texLoc.y + 3, 'arcade', card.rank.symbol, 8).setOrigin(0)
					.setTint(card.isBlack ? Colors.BLACK.color : Colors.RED.color);

				const value2 = this.add.bitmapText(texLoc.x + 45, texLoc.y + 61, 'arcade', card.rank.symbol, 8).setOrigin(0)
					.setRotation(Phaser.Math.DegToRad(180)).setTint(card.isBlack ? Colors.BLACK.color : Colors.RED.color);

				this.rt.draw([value, value2]);

				value.destroy();
				value2.destroy();

				this.rt.texture.add(card.textureKey, 0, texLoc.x, texLoc.y, cardWidth, cardHeight);
			}
		});

		graphics.destroy();
	}
}

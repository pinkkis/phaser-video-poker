import { Card } from './Card';
import { Colors } from '../config/Colors';
import { ScaleModes } from 'phaser';

export class CardSprite extends Phaser.GameObjects.Sprite {
	public rt: Phaser.GameObjects.RenderTexture;
	public faceUp: boolean;
	public card: Card | null;

	constructor(scene: Phaser.Scene, x: number, y: number, card: Card) {
		super(scene, x, y, 'cardback');
		this.card = card;
		this.faceUp = false;
		this.createTexture();
		this.scene.add.existing(this);
	}

	public flipCard(faceUp: boolean) {
		this.faceUp = faceUp;
		this.setTexture(faceUp ? this.card.textureKey : 'cardback');
	}

	public discard() {
		this.destroy();
	}

	// private methods -------------------------------------------

	private createTexture() {
		this.rt = this.scene.add.renderTexture(-100, -10, 32, 48);

		const graphics = this.scene.add.graphics()
			.fillStyle(Colors.CARD_COLOR, 1)
			.fillRoundedRect(0, 0, 32, 48, 2);

		if (this.card.isJoker) {
			const joker = this.scene.add.image(16, 20, 'joker');
			const value = this.scene.add.bitmapText(16, 41, 'arcade', 'joker', 8).setTint(Colors.UI_BLUE).setOrigin(.5);

			this.rt.draw([graphics, joker, value]);

			joker.destroy();
			value.destroy();

		} else {
			const suit = this.scene.add.image(4, 15, 'suits8', this.card.suit)
				.setOrigin(0);
			const suit2 = this.scene.add.image(29, 34, 'suits8', this.card.suit)
				.setOrigin(0).setRotation(Phaser.Math.DegToRad(180));

			const value = this.scene.add.bitmapText(4, 3, 'arcade', this.card.rank.symbol, 8).setOrigin(0)
				.setTint(this.card.isBlack ? Colors.BLACK : Colors.RED);

			const value2 = this.scene.add.bitmapText(30, 45, 'arcade', this.card.rank.symbol, 8).setOrigin(0)
				.setRotation(Phaser.Math.DegToRad(180)).setTint(this.card.isBlack ? Colors.BLACK : Colors.RED);

			this.rt.draw([graphics, suit, suit2, value, value2]);

			value.destroy();
			value2.destroy();
			suit2.destroy();
			suit.destroy();
		}

		graphics.destroy();
		this.rt.saveTexture(this.card.textureKey);
	}
}

import { Card } from './Card';
import { Colors } from '../config/Colors';

export const cardWidth: number = 48;
export const cardHeight: number = 64;

export class CardSprite extends Phaser.GameObjects.Sprite {
	public rt: Phaser.GameObjects.RenderTexture;
	public faceUp: boolean;
	public card: Card | null;

	constructor(scene: Phaser.Scene, x: number, y: number, card: Card) {
		super(scene, x, y, 'cardback');
		this.card = card;
		this.faceUp = false;
		this.scene.add.existing(this);
	}

	public flipCard(faceUp: boolean): CardSprite {
		this.faceUp = faceUp;
		this.setTexture(faceUp ? this.card.textureKey : 'cardback');

		return this;
	}

	public setCard(card: Card): CardSprite {
		if (card) {
			this.card = card;

			if (this.faceUp) {
				this.setTexture(this.card.textureKey);
			}
		}

		return this;
	}

	public discard() {
		this.destroy();
	}
}

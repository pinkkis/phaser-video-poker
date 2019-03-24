import { CardSprite } from './CardSprite';
import { Card } from './Card';

export class ShuffleDeck extends Phaser.GameObjects.Container {
	public mainPosition: Phaser.Math.Vector2;

	constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
		super(scene, x, y);
		this.mainPosition = new Phaser.Math.Vector2(x, y);
		this.createCards();
		scene.add.existing(this);
	}

	public shuffleAnimation(): void {
		for (const cardSprite of this.getAll() as CardSprite[]) {
			if (!this.scene.tweens.isTweening(cardSprite)) {
				this.scene.tweens.add({
					targets: cardSprite,
					x: {
						getEnd: () => Phaser.Math.Between(-5, 33),
					},
					y: {
						getEnd: () => Phaser.Math.Between(-10, 10),
					},
					ease: 'Power1',
					repeat: 3,
					duration: 125,
					yoyo: true,
					onYoyo: () => {
						if (cardSprite.card.suit === 'spade') {
							this.scene.sound.play('shuffle2', {volume: .33});
						}
					},
					onComplete: () => {
						this.emit('shufflecomplete');
					},
				});
			}
		}
	}

	// private ---------

	private createCards() {
		this.add([
			new CardSprite(this.scene, 0, 0, new Card('spade', {symbol: '', value: 0})),
			new CardSprite(this.scene, 0, 0, new Card('heart', {symbol: '', value: 0})),
			new CardSprite(this.scene, 0, 0, new Card('heart', {symbol: '', value: 0})),
			new CardSprite(this.scene, 0, 0, new Card('heart', {symbol: '', value: 0})),
			new CardSprite(this.scene, 0, 0, new Card('heart', {symbol: '', value: 0})),
		]);
	}
}

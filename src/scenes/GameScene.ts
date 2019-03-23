import { BaseScene } from './BaseScene';
import { IGameSettings, gameSettings } from '../config/GameSettings';
import { Colors } from '../config/Colors';
import { CardSprite, cardWidth, cardHeight } from '../components/CardSprite';
import { PokerGame } from '../services/PokerGame';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { HoldLabel } from '../components/HoldLabel';

export class GameScene extends BaseScene {
	private rts: Phaser.GameObjects.RenderTexture[];

	private gameSettings: IGameSettings;
	private pokerGame: PokerGame;

	private backgroundGroup: Phaser.GameObjects.Group;
	private winningsGroup: Phaser.GameObjects.Group;
	private uiGroup: Phaser.GameObjects.Group;
	private buttonsGroup: Phaser.GameObjects.Group;
	private cardsGroup: Phaser.GameObjects.Group;

	constructor() {
		super('GameScene');
	}

	public create(data: any): void {
		console.info('GameScene - create()');

		this.rts = [];
		this.gameSettings = gameSettings;
		this.pokerGame = new PokerGame(this.gameSettings);

		this.pokerGame.deck.shuffle();

		this.createCardTextures();
		this.createUI();
		this.bindEvents();
	}

	public update(time: number, delta: number): void {
		// empty
	}

	// -- private methods -----------------------------

	private bindEvents() {
		//
	}

	private createCardTextures() {
		this.pokerGame.deck.cards.forEach( (card: Card, index: number) => {
			const rt = this.add.renderTexture(-100, -10, cardWidth, cardHeight);

			const graphics = this.add.graphics()
				.fillStyle(Colors.CARD_COLOR.color, 1)
				.lineStyle(2, Colors.WHITE.color, 1)
				.fillRoundedRect(0, 0, cardWidth, cardHeight, 3)
				.strokeRoundedRect(0, 0, cardWidth, cardHeight, 3);

			rt.draw([graphics]);

			if (card.isJoker) {
				const joker = this.add.image(cardWidth / 2, 25, 'joker').setOrigin(0.5);
				const value = this.add.bitmapText(cardWidth / 2, cardHeight - 12, 'arcade', 'joker', 8)
					.setTint(Colors.UI_BLUE.color).setOrigin(.5);

				rt.draw([graphics, joker, value]);

				joker.destroy();
				value.destroy();

			} else {
				if (card.rank.value === 1) {
					const suit = this.add.image(cardWidth / 2, cardHeight / 2, 'suits', card.suit)
					.setOrigin(0.5);

					rt.draw([suit]);

					suit.destroy();
				} else {
					const suit = this.add.image(4, 15, 'suits8', card.suit)
					.setOrigin(0);

					const suit2 = this.add.image(45, 50, 'suits8', card.suit)
					.setOrigin(0).setRotation(Phaser.Math.DegToRad(180));

					rt.draw([suit, suit2]);

					suit.destroy();
					suit2.destroy();
				}

				const value = this.add.bitmapText(4, 3, 'arcade', card.rank.symbol, 8).setOrigin(0)
					.setTint(card.isBlack ? Colors.BLACK.color : Colors.RED.color);

				const value2 = this.add.bitmapText(45, 61, 'arcade', card.rank.symbol, 8).setOrigin(0)
					.setRotation(Phaser.Math.DegToRad(180)).setTint(card.isBlack ? Colors.BLACK.color : Colors.RED.color);

				rt.draw([value, value2]);

				value.destroy();
				value2.destroy();
			}

			graphics.destroy();
			rt.saveTexture(card.textureKey);
			this.rts.push(rt);
		});
	}

	private createUI() {
		// create groups
		this.uiGroup = this.add.group();
		this.cardsGroup = this.add.group();
		this.backgroundGroup = this.add.group();
		this.buttonsGroup = this.add.group();
		this.winningsGroup = this.add.group();

		// background
		this.backgroundGroup.addMultiple([
			this.add.rectangle(0, 0, this.scale.gameSize.width, this.scale.gameSize.height, Colors.BACKGROUND.color)
				.setOrigin(0),

			this.add.rectangle(0, 0, this.scale.gameSize.width, 30, Colors.GRAY.color, 1).setOrigin(0),
			this.add.rectangle(0, this.scale.gameSize.height - 50, this.scale.gameSize.width, 50, Colors.GRAY.color, 1)
				.setOrigin(0),
		]);

		let counter = 0;
		for (const hand of this.gameSettings.hands) {
			this.winningsGroup.addMultiple([
				this.add.bitmapText(135, 34 + 9 * counter, 'arcade', `${hand.name}`.padEnd(17, ' '), 8),
				this.add.bitmapText(270, 34 + 9 * counter, 'arcade', `${hand.multiplier}`.padStart(3, ' '), 8),
			]);
			counter++;
		}

		this.uiGroup.addMultiple([
			this.add.rectangle(3, 3, 122, 24, Colors.WHITE.color).setOrigin(0),
			this.add.rectangle(4, 4, 120, 22, Colors.UI_BLUE.color).setOrigin(0),

			this.add.circle(182, 10, 12, Colors.COIN_YELLOW.clone().darken(20).color).setOrigin(0),
			this.add.circle(180, 9, 12, Colors.COIN_YELLOW.color).setOrigin(0),

			this.add.bitmapText(5, 11, 'arcade', `money`, 8),
			this.add.bitmapText(150, 10, 'arcade', `bet`, 8),

			this.add.bitmapText(122, 6, 'arcade', `9999`, 16).setOrigin(1, 0),
			this.add.bitmapText(180, 6, 'arcade', `1`, 16).setTint(Colors.BLACK.color),

			// add hold labels
			new HoldLabel(this, 35,  170, Colors.HOLD_LABEL, 'held').setDepth(100),
			new HoldLabel(this, 90,  170, Colors.HOLD_LABEL, 'held').setDepth(100),
			new HoldLabel(this, 145, 170, Colors.HOLD_LABEL, 'held').setDepth(100),
			new HoldLabel(this, 200, 170, Colors.HOLD_LABEL, 'held').setDepth(100),
			new HoldLabel(this, 255, 170, Colors.HOLD_LABEL, 'held').setDepth(100),
		]);

		this.cardsGroup.addMultiple([
			new CardSprite(this, 40, 70, new Card('heart', {symbol: '2', value: 2})),
			new CardSprite(this, 45, 78, new Card('heart', {symbol: '2', value: 2})),
			new CardSprite(this, 55, 65, new Card('heart', {symbol: '2', value: 2})),

			new CardSprite(this, 55,  150, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 110, 150, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 165, 150, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 220, 150, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 275, 150, this.pokerGame.deck.draw()).flipCard(true),
		]);

		this.buttonsGroup.addMultiple([
			// hold buttons
			new Button(this, 35,  195, Colors.BUTTON_RED, 'hold'),
			new Button(this, 90,  195, Colors.BUTTON_RED, 'hold'),
			new Button(this, 145, 195, Colors.BUTTON_RED, 'hold'),
			new Button(this, 200, 195, Colors.BUTTON_RED, 'hold'),
			new Button(this, 255, 195, Colors.BUTTON_RED, 'hold'),

			// other buttons
			new Button(this, 15,  220, Colors.BUTTON_YELLOW, 'pay'),
			new Button(this, 65,  220, Colors.BUTTON_ORANGE, 'dbl'),
			new Button(this, 115, 220, Colors.BUTTON_ORANGE, 'small'),
			new Button(this, 165, 220, Colors.BUTTON_ORANGE, 'large'),
			new Button(this, 215, 220, Colors.BUTTON_BLUE,   'bet'),
			new Button(this, 265, 220, Colors.BUTTON_GREEN,  'deal'),
		]);

	}

}

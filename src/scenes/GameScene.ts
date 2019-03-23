import { BaseScene } from './BaseScene';
import { IGameSettings, gameSettings } from '../config/GameSettings';
import { Colors } from '../config/Colors';
import { cardWidth, cardHeight } from '../components/CardSprite';
import { PokerGame } from '../services/PokerGame';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { HoldLabel } from '../components/HoldLabel';
import { CardSlots } from '../components/CardSlots';
import { ShuffleDeck } from '../components/ShuffleDeck';
import { ButtonController } from '../components/ButtonController';

export class GameScene extends BaseScene {
	private rts: Phaser.GameObjects.RenderTexture[];

	private gameSettings: IGameSettings;
	private pokerGame: PokerGame;

	private backgroundGroup: Phaser.GameObjects.Group;
	private winningsGroup: Phaser.GameObjects.Group;
	private uiGroup: Phaser.GameObjects.Group;
	private buttonsGroup: Phaser.GameObjects.Group;
	private shuffleDeck: ShuffleDeck;
	private cardSlots: any = CardSlots;
	private buttonController: ButtonController;

	constructor() {
		super('GameScene');
	}

	public create(): void {
		console.info('GameScene - create()');

		this.bindEvents();

		this.rts = [];
		this.gameSettings = gameSettings;

		this.pokerGame = new PokerGame(this.gameSettings);
		this.pokerGame.deck.shuffle();

		this.shuffleDeck = new ShuffleDeck(this, 10, 40).setDepth(30);

		this.createCardTextures();
		this.createMainUI();
	}

	// -- private methods -----------------------------

	private bindEvents() {
		this.events.on('', () => {}, this);

		// game start
		this.events.on('game:ready', () => {
			console.log('ready');
			this.buttonController.deal.lit = true;
		}, this);

		// deal button
		this.events.on('btn:deal', () => {
			this.shuffleDeck.shuffleAnimation();
		}, this);
	}

	private createMainUI() {
		// create groups
		this.uiGroup = this.add.group();
		this.backgroundGroup = this.add.group();
		this.buttonsGroup = this.add.group();
		this.winningsGroup = this.add.group();

		this.createBackground();
		this.createButtons();
		this.createWinnings();
		this.createUi();
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

	private createBackground() {
		// background
		this.backgroundGroup.addMultiple([
			this.add.rectangle(0, 0, this.scale.gameSize.width, this.scale.gameSize.height, Colors.BACKGROUND.color)
				.setOrigin(0).setDepth(0),

			this.add.rectangle(0, 0, this.scale.gameSize.width, 30, Colors.GRAY.color, 1).setOrigin(0).setDepth(50),
			this.add.rectangle(0, this.scale.gameSize.height - 50, this.scale.gameSize.width, 50, Colors.GRAY.color, 1)
				.setOrigin(0).setDepth(50),
		]);
	}

	private createWinnings() {
		let counter = 0;
		for (const hand of this.gameSettings.hands) {
			this.winningsGroup.addMultiple([
				this.add.bitmapText(135, 34 + 9 * counter, 'arcade', `${hand.name}`.padEnd(17, ' '), 8),
				this.add.bitmapText(270, 34 + 9 * counter, 'arcade', `${hand.multiplier}`.padStart(3, ' '), 8),
			]);
			counter++;
		}
	}

	private createUi() {
		this.cardSlots[0].HoldLabel = new HoldLabel(this, this.cardSlots[0].x + 4, 170, 'held').setDepth(100);
		this.cardSlots[1].HoldLabel = new HoldLabel(this, this.cardSlots[1].x + 4, 170, 'held').setDepth(100);
		this.cardSlots[2].HoldLabel = new HoldLabel(this, this.cardSlots[2].x + 4, 170, 'held').setDepth(100);
		this.cardSlots[3].HoldLabel = new HoldLabel(this, this.cardSlots[3].x + 4, 170, 'held').setDepth(100);
		this.cardSlots[4].HoldLabel = new HoldLabel(this, this.cardSlots[4].x + 4, 170, 'held').setDepth(100);

		this.uiGroup.addMultiple([
			this.add.rectangle(3, 3, 122, 24, Colors.WHITE.color).setOrigin(0).setDepth(51),
			this.add.rectangle(4, 4, 120, 22, Colors.UI_BLUE.color).setOrigin(0).setDepth(51),

			this.add.circle(182, 10, 12, Colors.COIN_YELLOW.clone().darken(20).color).setOrigin(0).setDepth(51),
			this.add.circle(180, 9, 12, Colors.COIN_YELLOW.color).setOrigin(0).setDepth(51),

			this.add.bitmapText(5, 11, 'arcade', `money`, 8).setDepth(51),
			this.add.bitmapText(150, 10, 'arcade', `bet`, 8).setDepth(51),

			this.add.bitmapText(122, 6, 'arcade', `9999`, 16).setOrigin(1, 0).setDepth(51),
			this.add.bitmapText(180, 6, 'arcade', `1`, 16).setTint(Colors.BLACK.color).setDepth(51),

			// add hold labels
			this.cardSlots[0].HoldLabel,
			this.cardSlots[1].HoldLabel,
			this.cardSlots[2].HoldLabel,
			this.cardSlots[3].HoldLabel,
			this.cardSlots[4].HoldLabel,
		]);
	}

	private createButtons() {
		// create buttons
		// TODO: move to controller
		const payBtn = new Button(this, 15, 220, Colors.BUTTON_YELLOW, 'pay');
		const doubleBtn = new Button(this, 65, 220, Colors.BUTTON_ORANGE, 'dbl');
		const lowBtn = new Button(this, 115, 220, Colors.BUTTON_ORANGE, 'low');
		const highBtn = new Button(this, 165, 220, Colors.BUTTON_ORANGE, 'high');
		const betBtn = new Button(this, 215, 220, Colors.BUTTON_BLUE, 'bet');
		const dealBtn = new Button(this, 265, 220, Colors.BUTTON_GREEN, 'deal');

		this.cardSlots[0].holdBtn = new Button(this, this.cardSlots[0].x + 3, 195, Colors.BUTTON_RED, 'hold');
		this.cardSlots[1].holdBtn = new Button(this, this.cardSlots[1].x + 3, 195, Colors.BUTTON_RED, 'hold');
		this.cardSlots[2].holdBtn = new Button(this, this.cardSlots[2].x + 3, 195, Colors.BUTTON_RED, 'hold');
		this.cardSlots[3].holdBtn = new Button(this, this.cardSlots[3].x + 3, 195, Colors.BUTTON_RED, 'hold');
		this.cardSlots[4].holdBtn = new Button(this, this.cardSlots[4].x + 3, 195, Colors.BUTTON_RED, 'hold');

		this.buttonController = new ButtonController(this, dealBtn, doubleBtn, lowBtn, highBtn, payBtn, betBtn,
			this.cardSlots[0].holdBtn, this.cardSlots[1].holdBtn, this.cardSlots[2].holdBtn, this.cardSlots[3].holdBtn, this.cardSlots[4].holdBtn);

		this.buttonsGroup.addMultiple([
			// hold buttons
			this.cardSlots[0].holdBtn, this.cardSlots[1].holdBtn, this.cardSlots[2].holdBtn, this.cardSlots[3].holdBtn, this.cardSlots[4].holdBtn,

			// other buttons
			payBtn, doubleBtn, lowBtn, highBtn, betBtn, dealBtn,
		]).setDepth(70, 0);
	}

}

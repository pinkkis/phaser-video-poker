import { BaseScene } from './BaseScene';
import { IGameSettings, gameSettings } from '../config/GameSettings';
import { Colors } from '../config/Colors';
import { cardWidth, cardHeight, CardSprite } from '../components/CardSprite';
import { PokerGame } from '../services/PokerGame';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { HoldLabel } from '../components/HoldLabel';
import { SlotManager } from '../components/SlotManager';
import { ShuffleDeck } from '../components/ShuffleDeck';
import { ButtonController } from '../components/ButtonController';
import { CardSlot } from '../components/CardSlot';

export class GameScene extends BaseScene {
	public slotManager: SlotManager;
	public buttonController: ButtonController;

	private rts: Phaser.GameObjects.RenderTexture[];

	private gameSettings: IGameSettings;
	private pokerGame: PokerGame;

	private backgroundGroup: Phaser.GameObjects.Group;
	private winningsGroup: Phaser.GameObjects.Group;
	private uiGroup: Phaser.GameObjects.Group;
	private buttonsGroup: Phaser.GameObjects.Group;
	private shuffleDeck: ShuffleDeck;

	private moneyText: Phaser.GameObjects.BitmapText;
	private betText: Phaser.GameObjects.BitmapText;
	private moneyTween: Phaser.Tweens.Tween;
	private moneyOldValue: number;

	constructor() {
		super('GameScene');
	}

	public create(): void {
		console.info('GameScene - create()');

		this.rts = [];
		this.gameSettings = gameSettings;
		this.shuffleDeck = new ShuffleDeck(this, 10, 40).setDepth(30);

		this.slotManager = new SlotManager();

		this.pokerGame = new PokerGame(this.gameSettings);
		this.pokerGame.deck.shuffle();

		this.registry.set('state', 'none');
		this.registry.set('money', 0);
		this.registry.set('money-old', 0);
		this.registry.set('bet', 1);

		this.createCardTextures();
		this.createMainUI();

		this.bindEvents();

		this.registry.set('state', 'start');
	}

	public update(): void {
		if (this.moneyTween) {
			this.moneyOldValue = this.moneyOldValue || 0;
			const newValue: number = Math.floor(this.moneyTween.getValue());
			if (newValue - this.moneyOldValue > 1) {
				this.sound.play('coin', {volume: .5});
				this.moneyOldValue = newValue;
			}

			this.moneyText.setText(`${newValue}`);
		}
	}

	// -- private methods -----------------------------

	private bindEvents() {
		// this.events.on('', () => {}, this);

		// game start
		this.registry.events.on('changedata', (parent: any, key: string, data: any) => {
			console.log('registrychange', key, data);

			if (key === 'state') {
				this.stateChange(key, data);
			}

			if (key === 'money') {
				this.moneyTween = this.tweens.addCounter({
					from: this.registry.get('money-old'),
					to: data,
					onComplete: () => {
						this.moneyText.setText(data);
						this.moneyTween = null;
						this.registry.set('money-old', data);
					},
				});
			}

			if (key === 'bet') {
				this.betText.setText(data);
				this.winningsGroup.clear(false, true);
				this.createWinnings();
				this.sound.play('bet', {volume: .5});
			}
		}, this);

		// deal button
		this.events.on('btn:deal', () => {
			this.registry.set('state', 'dealing');
			this.registry.set('money', this.registry.get('money') - this.registry.get('bet'));
			this.shuffleDeck.shuffleAnimation();

			const dealtHand = this.pokerGame.deal(5);
			this.slotManager.slot(0).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[0]));
			this.slotManager.slot(1).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[1]));
			this.slotManager.slot(2).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[2]));
			this.slotManager.slot(3).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[3]));
			this.slotManager.slot(4).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[4]));

			this.shuffleDeck.once('shufflecomplete', () => {
				const timeline = this.tweens.createTimeline({});

				this.slotManager.cards.forEach( (card: CardSprite, index: number) => {
					timeline.add({
						targets: card,
						x: this.slotManager.slot(index).x,
						y: this.slotManager.slot(index).y,
						duration: 200,
					});
				});

				timeline.setCallback('onComplete', () => {
					this.slotManager.cards.forEach( (c: CardSprite) => c.flipCard(true) );
					this.registry.set('state', 'discard');
				}, null, this);

				timeline.play();
			});

		}, this);

		// bet button
		this.events.on('btn:bet', () => {
			let currentBet = this.registry.get('bet');
			this.registry.set('bet', currentBet < Math.min(5, this.registry.get('money')) ? ++currentBet : 1);
		}, this);

		// payout button
		this.events.on('btn:payout', () => {
			// payout
		}, this);

		// double button
		this.events.on('btn:double', () => {
			// double
		}, this);

		// hold buttons
		this.events.on('btn:hold', (slot: CardSlot) => {
			slot.setHeld(!slot.held);
		}, this);
	}

	// -----------------------------

	private stateChange(key: string, data: any) {
		console.log('stateChange', key, data);

		if (data === 'attract') {
			this.registry.set('money', 0);
		}

		if (data === 'start') {
			this.registry.set('money', this.gameSettings.startMoney);
			this.registry.set('state', 'default');
		}

		if (data === 'default') {
			if (this.registry.get('money') > 0) {
				this.buttonController.dimAll();
				this.slotManager.unHoldAll();
				this.buttonController.bet.lit = true;
				this.buttonController.deal.lit = true;
			} else {
				this.registry.set('state', 'attract');
			}
		}

		if (data === 'dealing') {
			this.buttonController.dimAll();
		}

		if (data === 'discard') {
			this.buttonController.deal.lit = true;
			this.slotManager.unHoldAll();
			this.slotManager.buttons.forEach( (b: Button) => b.lit = true );
		}
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
				this.add.bitmapText(270, 34 + 9 * counter, 'arcade', `${hand.multiplier * this.registry.get('bet')}`.padStart(3, ' '), 8),
			]);
			counter++;
		}
	}

	private createUi() {

		this.slotManager.slot(0).setLabel(new HoldLabel(this, this.slotManager.slot(0).x + 4, 170, 'held').setDepth(100));
		this.slotManager.slot(1).setLabel(new HoldLabel(this, this.slotManager.slot(1).x + 4, 170, 'held').setDepth(100));
		this.slotManager.slot(2).setLabel(new HoldLabel(this, this.slotManager.slot(2).x + 4, 170, 'held').setDepth(100));
		this.slotManager.slot(3).setLabel(new HoldLabel(this, this.slotManager.slot(3).x + 4, 170, 'held').setDepth(100));
		this.slotManager.slot(4).setLabel(new HoldLabel(this, this.slotManager.slot(4).x + 4, 170, 'held').setDepth(100));

		this.uiGroup.addMultiple([
			this.add.rectangle(3, 3, 122, 24, Colors.WHITE.color).setOrigin(0).setDepth(51),
			this.add.rectangle(4, 4, 120, 22, Colors.UI_BLUE.color).setOrigin(0).setDepth(51),

			this.add.circle(182, 10, 12, Colors.COIN_YELLOW.clone().darken(20).color).setOrigin(0).setDepth(51),
			this.add.circle(180, 9, 12, Colors.COIN_YELLOW.color).setOrigin(0).setDepth(51),

			this.add.bitmapText(5, 11, 'arcade', `money`, 8).setDepth(51),
			this.add.bitmapText(150, 10, 'arcade', `bet`, 8).setDepth(51),

			this.moneyText = this.add.bitmapText(122, 6, 'arcade', `${this.registry.get('money')}`, 16).setOrigin(1, 0).setDepth(51),
			this.betText = this.add.bitmapText(179, 6, 'arcade', `${this.registry.get('bet')}`, 16).setTint(Colors.BLACK.color).setDepth(51),

			// add hold labels
			this.slotManager.slot(0).holdLabel,
			this.slotManager.slot(1).holdLabel,
			this.slotManager.slot(2).holdLabel,
			this.slotManager.slot(3).holdLabel,
			this.slotManager.slot(4).holdLabel,
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

		this.slotManager.slot(0).setBtn(new Button(this, this.slotManager.slot(0).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotManager.slot(1).setBtn(new Button(this, this.slotManager.slot(1).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotManager.slot(2).setBtn(new Button(this, this.slotManager.slot(2).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotManager.slot(3).setBtn(new Button(this, this.slotManager.slot(3).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotManager.slot(4).setBtn(new Button(this, this.slotManager.slot(4).x + 3, 195, Colors.BUTTON_RED, 'hold'));


		this.buttonController = new ButtonController(this, dealBtn, doubleBtn, lowBtn, highBtn, payBtn, betBtn,
			this.slotManager.slot(0).holdBtn, this.slotManager.slot(1).holdBtn, this.slotManager.slot(2).holdBtn, this.slotManager.slot(3).holdBtn, this.slotManager.slot(4).holdBtn);

		// hold buttons
		this.buttonsGroup.addMultiple(this.slotManager.buttons);

		// other buttons
		this.buttonsGroup.addMultiple([payBtn, doubleBtn, lowBtn, highBtn, betBtn, dealBtn]).setDepth(70, 0);
	}

}

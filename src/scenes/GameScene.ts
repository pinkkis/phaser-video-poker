import { BaseScene } from './BaseScene';
import { IGameSettings, gameSettings } from '../config/GameSettings';
import { Colors } from '../config/Colors';
import { cardWidth, cardHeight, CardSprite } from '../components/CardSprite';
import { PokerGame } from '../services/PokerGame';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { HoldLabel } from '../components/HoldLabel';
import { SlotController } from '../components/SlotController';
import { ShuffleDeck } from '../components/ShuffleDeck';
import { ButtonController } from '../components/ButtonController';
import { CardSlot } from '../components/CardSlot';
import { GameState } from '../components/EnumGameState';

export class GameScene extends BaseScene {
	public slotController: SlotController;
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
	private moneyTweenOldValue: number;

	constructor() {
		super('GameScene');
	}

	public create(): void {
		console.info('GameScene - create()');

		this.rts = [];
		this.gameSettings = gameSettings;
		this.shuffleDeck = new ShuffleDeck(this, 10, 40).setDepth(30);

		this.slotController = new SlotController();

		this.pokerGame = new PokerGame(this.gameSettings);
		this.pokerGame.deck.shuffle();

		this.registry.set('state', 'none');
		this.registry.set('money', { current: 0, previous: 0});
		this.registry.set('bet', 1);
		this.registry.set('winnings', { current: 0, previous: 0});

		this.createCardTextures();
		this.createMainUI();

		this.bindEvents();

		this.registry.set('state', 'start');
	}

	public update(): void {
		if (this.moneyTween) {
			this.moneyTweenOldValue = this.moneyTweenOldValue || 0;
			const newValue: number = Math.floor(this.moneyTween.getValue());
			if (newValue - this.moneyTweenOldValue > 1) {
				this.sound.play('coin', {volume: .5});
				this.moneyTweenOldValue = newValue;
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
				if (data.current > this.registry.get('money').old ) {
					this.moneyTween = this.tweens.addCounter({
						from: this.registry.get('money').old,
						to: data.current,
						onComplete: () => {
							this.moneyText.setText(data.current);
							this.moneyTween = null;
						},
					});
				} else {
					this.moneyText.setText(data.current);
				}
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
			const curState = this.registry.get('state');
			if (curState === GameState.DEFAULT) {
				this.registry.set('money', { current: this.registry.get('money').current - this.registry.get('bet'), old: this.registry.get('money').current });
				this.registry.set('state', GameState.SHUFFLING);
			} else if ( curState === GameState.DISCARD) {
				// have to hold at least one
				if (this.slotController.freeSlots.length < 5) {
					this.buttonController.dimAll();
					const discardTimeline = this.tweens.createTimeline({});
					const drawTimeline = this.tweens.createTimeline({});

					this.slotController.freeSlots.forEach( (slot: CardSlot) => {
						discardTimeline.add({
							targets: slot.card,
							y: '+=100',
							onStart: () => { slot.card.flipCard(false); this.sound.play('reveal-short', { volume: 0.5 }); },
							onComplete: () => slot.discard(),
							duration: 250,
						});
					});

					discardTimeline.setCallback('onComplete', () => {
						this.registry.set('state', GameState.DRAWING);

						const newCards = this.pokerGame.deal(this.slotController.freeSlots.length);
						const newSlots: CardSlot[] = [];

						newCards.forEach( (card: Card) => {
							const cardSlot = this.slotController.slotCard( new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, card) );
							newSlots.push(cardSlot);
							drawTimeline.add({
								targets: cardSlot.card,
								x: cardSlot.x,
								y: cardSlot.y,
								duration: 200,
								onStart: () => { this.sound.play('deal', {volume: 0.5}); },
							});
						});

						drawTimeline.play();
					});

					drawTimeline.setCallback('onComplete', () => {
						this.slotController.flipAll(true);
						this.slotController.unHoldAll();
						this.registry.set('state', GameState.WINNING);
					});

					discardTimeline.play();
				}
			} else {
				console.warn('unknown state for deal button');
			}

		}, this);

		// bet button
		this.events.on('btn:bet', () => {
			let currentBet = this.registry.get('bet');
			this.registry.set('bet', currentBet < Math.min(5, this.registry.get('money').current) ? ++currentBet : 1);
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

		switch (data) {
			case GameState.ATTRACT:
				this.registry.set('money', {current: 0, old: 0});
				break;

			case GameState.START:
				this.registry.set('money', { current: this.gameSettings.startMoney, old: this.registry.get('money').current });
				this.registry.set('state', 'default');
				break;

			case GameState.DEFAULT:
				if (this.registry.get('money').current > 0) {
					this.buttonController.dimAll();
					this.slotController.unHoldAll();
					this.buttonController.bet.lit = true;
					this.buttonController.deal.lit = true;
				} else {
					this.registry.set('state', 'attract');
				}
				break;

			case GameState.DEALING:
				this.buttonController.dimAll();
				break;

			case GameState.DRAWING:
				this.buttonController.dimAll();
				break;

			case GameState.WINNING:
				this.buttonController.dimAll();
				const handResult = this.pokerGame.checkHand(this.slotController.hand);

				if (handResult) {
					this.buttonController.payout.lit = true;
					this.buttonController.double.lit = true;
				} else {
					this.registry.set('state', GameState.DEFAULT);
				}

				break;

			case GameState.DISCARD:
				this.buttonController.deal.lit = true;
				this.slotController.unHoldAll();
				this.slotController.buttons.forEach((b: Button) => b.lit = true);
				break;

			case GameState.DOUBLING:
				this.buttonController.dimAll();
				break;

			case GameState.SHUFFLING:
				this.buttonController.dimAll();
				this.registry.set('state', GameState.DEALING);

				if (!this.slotController.emptySlots.length) {
					this.slotController.flipAll(false);

					const preShuffleTimeline = this.tweens.createTimeline({});

					preShuffleTimeline.add({
						targets: this.shuffleDeck,
						x: this.scale.gameSize.width / 2 - 24,
						y: this.scale.gameSize.height / 2 - 32,
						duration: 200,
					});

					this.slotController.slots.forEach( (slot: CardSlot) => {
						preShuffleTimeline.add({
							targets: slot.card,
							x: this.scale.gameSize.width / 2 - 24,
							y: this.scale.gameSize.height / 2 - 32,
							duration: 150,
							onStart: () => { this.sound.play('deal', {volume: 0.5}); },
							onComplete: () => { slot.discard(); },
						});
					});

					preShuffleTimeline.add({
						targets: this.shuffleDeck,
						x: this.shuffleDeck.mainPosition.x,
						y: this.shuffleDeck.mainPosition.y,
						duration: 200,
					});

					preShuffleTimeline.setCallback('onComplete', () => {
						this.shuffleDeck.shuffleAnimation();
					});

					preShuffleTimeline.play();
				} else {
					this.shuffleDeck.shuffleAnimation();
				}

				this.shuffleDeck.once('shufflecomplete', () => {
					this.pokerGame.deck.shuffle();
					const dealtHand = this.pokerGame.deal(5);
					this.slotController.slot(0).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[0]));
					this.slotController.slot(1).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[1]));
					this.slotController.slot(2).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[2]));
					this.slotController.slot(3).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[3]));
					this.slotController.slot(4).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, dealtHand[4]));

					const timeline = this.tweens.createTimeline({});

					this.slotController.cards.forEach( (card: CardSprite, index: number) => {
						timeline.add({
							targets: card,
							x: this.slotController.slot(index).x,
							y: this.slotController.slot(index).y,
							duration: 200,
							onStart: () => { this.sound.play('deal', {volume: 0.5}); },
						});
					});

					timeline.setCallback('onComplete', () => {
						this.slotController.cards.forEach( (c: CardSprite) => c.flipCard(true) );
						this.registry.set('state', GameState.DISCARD);
					}, null, this);

					timeline.play();
				});

				break;

			default:
				console.warn('Unknown state received: ', data);
				this.registry.set('state', GameState.ATTRACT);
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

		this.slotController.slot(0).setLabel(new HoldLabel(this, this.slotController.slot(0).x + 4, 170, 'held').setDepth(100));
		this.slotController.slot(1).setLabel(new HoldLabel(this, this.slotController.slot(1).x + 4, 170, 'held').setDepth(100));
		this.slotController.slot(2).setLabel(new HoldLabel(this, this.slotController.slot(2).x + 4, 170, 'held').setDepth(100));
		this.slotController.slot(3).setLabel(new HoldLabel(this, this.slotController.slot(3).x + 4, 170, 'held').setDepth(100));
		this.slotController.slot(4).setLabel(new HoldLabel(this, this.slotController.slot(4).x + 4, 170, 'held').setDepth(100));

		this.uiGroup.addMultiple([
			this.add.rectangle(3, 3, 122, 24, Colors.WHITE.color).setOrigin(0).setDepth(51),
			this.add.rectangle(4, 4, 120, 22, Colors.UI_BLUE.color).setOrigin(0).setDepth(51),

			this.add.circle(182, 10, 12, Colors.COIN_YELLOW.clone().darken(20).color).setOrigin(0).setDepth(51),
			this.add.circle(180, 9, 12, Colors.COIN_YELLOW.color).setOrigin(0).setDepth(51),

			this.add.bitmapText(5, 11, 'arcade', `money`, 8).setDepth(51),
			this.add.bitmapText(150, 10, 'arcade', `bet`, 8).setDepth(51),

			this.moneyText = this.add.bitmapText(122, 6, 'arcade', `${this.registry.get('money').current}`, 16).setOrigin(1, 0).setDepth(51),
			this.betText = this.add.bitmapText(179, 6, 'arcade', `${this.registry.get('bet')}`, 16).setTint(Colors.BLACK.color).setDepth(51),

			// add hold labels
			this.slotController.slot(0).holdLabel,
			this.slotController.slot(1).holdLabel,
			this.slotController.slot(2).holdLabel,
			this.slotController.slot(3).holdLabel,
			this.slotController.slot(4).holdLabel,
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

		this.slotController.slot(0).setBtn(new Button(this, this.slotController.slot(0).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotController.slot(1).setBtn(new Button(this, this.slotController.slot(1).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotController.slot(2).setBtn(new Button(this, this.slotController.slot(2).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotController.slot(3).setBtn(new Button(this, this.slotController.slot(3).x + 3, 195, Colors.BUTTON_RED, 'hold'));
		this.slotController.slot(4).setBtn(new Button(this, this.slotController.slot(4).x + 3, 195, Colors.BUTTON_RED, 'hold'));


		this.buttonController = new ButtonController(this, dealBtn, doubleBtn, lowBtn, highBtn, payBtn, betBtn,
			this.slotController.slot(0).holdBtn, this.slotController.slot(1).holdBtn, this.slotController.slot(2).holdBtn, this.slotController.slot(3).holdBtn, this.slotController.slot(4).holdBtn);

		// hold buttons
		this.buttonsGroup.addMultiple(this.slotController.buttons);

		// other buttons
		this.buttonsGroup.addMultiple([payBtn, doubleBtn, lowBtn, highBtn, betBtn, dealBtn]).setDepth(70, 0);
	}

}

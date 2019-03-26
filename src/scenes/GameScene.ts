import { BaseScene } from './BaseScene';
import { IGameSettings, gameSettings, IHand } from '../config/GameSettings';
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
import { GameState, Hands, Volume } from '../components/Enums';

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
	private doubleGroup: Phaser.GameObjects.Group;
	private attractContainer: Phaser.GameObjects.Container;

	private shuffleDeck: ShuffleDeck;
	private volumeSprite: Phaser.GameObjects.Sprite;

	private moneyText: Phaser.GameObjects.BitmapText;
	private betText: Phaser.GameObjects.BitmapText;
	private moneyTween: Phaser.Tweens.Tween;
	private moneyTweenOldValue: number;

	private doubleBetText: Phaser.GameObjects.BitmapText;
	private doubleTween: Phaser.Tweens.Tween;
	private doubleTweenOldValue: number;

	constructor() {
		super('GameScene');
	}

	public create(): void {
		this.rts = [];
		this.gameSettings = gameSettings;
		this.shuffleDeck = new ShuffleDeck(this, 10, 40).setDepth(30);

		this.slotController = new SlotController();

		this.pokerGame = new PokerGame(this.gameSettings);
		this.pokerGame.deck.shuffle();

		this.registry.set('volume', Volume.MUTE);
		this.registry.set('state', GameState.NONE);
		this.registry.set('money', { current: 0, previous: 0});
		this.registry.set('bet', 1);
		this.registry.set('winnings', { current: 0, previous: 0});

		this.createCardTextures();
		this.createMainUI();

		this.bindEvents();

		this.registry.set('volume', Volume.LOW);

		// Start states
		this.registry.set('state', GameState.ATTRACT);
	}

	public update(): void {
		if (this.moneyTween) {
			this.moneyTweenOldValue = this.moneyTweenOldValue || 0;
			const newValue: number = Math.floor(this.moneyTween.getValue());
			if (newValue - this.moneyTweenOldValue > 1) {
				this.sound.play('coin');
				this.moneyTweenOldValue = newValue;
			}

			this.moneyText.setText(`${newValue}`);
		}

		if (this.doubleTween) {
			this.doubleTweenOldValue = this.doubleTweenOldValue || 0;
			const newValue: number = Math.floor(this.doubleTween.getValue());
			if (newValue - this.doubleTweenOldValue > 1) {
				this.sound.play('coin');
				this.doubleTweenOldValue = newValue;
			}

			this.doubleBetText.setText(`${newValue}`);
		}
	}

	// -- private methods -----------------------------

	private bindEvents() {
		// game start
		this.registry.events.on('changedata', (parent: any, key: string, data: any) => {
			console.info('registrychange', key, data);

			if (key === 'state') {
				this.stateChange(data);
			}

			if (key === 'money') {
				if (data.current > this.registry.get('money').old ) {
					if (this.moneyTween) {
						this.moneyTween.complete();
						this.moneyText.setText(this.registry.get('money').old);
					}

					this.moneyTween = this.tweens.addCounter({
						from: this.registry.get('money').old,
						to: data.current,
						onComplete: () => {
							this.moneyText.setText(data.current);
							this.moneyTween = null;
							this.moneyTweenOldValue = 0;
						},
					});
				} else {
					this.moneyText.setText(data.current);
				}
			}

			if (key === 'winnings') {
				if (data.current > this.registry.get('winnings').old ) {
					if (this.doubleTween) {
						this.doubleTween.complete();
						this.doubleBetText.setText(this.registry.get('winnings').old);
					}

					this.doubleTween = this.tweens.addCounter({
						from: this.registry.get('winnings').old,
						to: data.current,
						onComplete: () => {
							this.doubleBetText.setText(data.current);
							this.doubleTween = null;
							this.doubleTweenOldValue = 0;
						},
					});
				}
			}

			if (key === 'bet') {
				this.betText.setText(data);
				this.createWinnings();
				this.sound.play('bet', { detune: data * 100 - 100 });
			}

			if (key === 'volume') {
				this.sound.volume = data;
				this.sound.play('coin');
			}
		}, this);

		// deal button
		this.events.on('btn:deal', () => {
			console.info('Deal press');
			const curState = this.registry.get('state');
			if (curState === GameState.WINNING || curState === GameState.DOUBLE_REPEAT) {
				// emulate payout pressed
				this.events.emit('btn:payout');
				this.events.emit('btn:deal');
			} else if (curState === GameState.DEFAULT) {
				this.registry.set('money', { current: this.registry.get('money').current - this.registry.get('bet'), old: this.registry.get('money').current });
				this.registry.set('state', GameState.SHUFFLING);
			} else if ( curState === GameState.DISCARD) {
				// have to hold at least one
				if (this.slotController.unheldSlots.length < 5) {
					this.buttonController.dimAll();
					const discardTimeline = this.tweens.createTimeline({});
					const drawTimeline = this.tweens.createTimeline({});

					this.slotController.unheldSlots.forEach( (slot: CardSlot) => {
						discardTimeline.add({
							targets: slot.card,
							y: '+=100',
							onStart: () => { slot.card.flipCard(false); this.sound.play('reveal-short'); },
							onComplete: () => slot.discard(),
							duration: 250,
						});
					});

					discardTimeline.setCallback('onComplete', () => {
						this.registry.set('state', GameState.DRAWING);

						const newCards = this.pokerGame.deal(this.slotController.unheldSlots.length);
						const newSlots: CardSlot[] = [];

						newCards.forEach( (card: Card) => {
							const cardSlot = this.slotController.slotCard( new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, card) );
							newSlots.push(cardSlot);
							drawTimeline.add({
								targets: cardSlot.card,
								x: cardSlot.x,
								y: cardSlot.y,
								duration: 200,
								onStart: () => { this.sound.play('deal'); },
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
			console.info('Bet press');
			const currentBet = this.registry.get('bet');
			this.registry.set('bet', currentBet < Math.min(this.gameSettings.maxBet, this.registry.get('money').current)
									? currentBet + this.gameSettings.betStep
									: this.gameSettings.betStart);
		}, this);

		// payout button
		this.events.on('btn:payout', () => {
			console.info('Payout press');
			this.registry.set('money', { current: this.registry.get('winnings').current + this.registry.get('money').current, old: this.registry.get('money').current});
			this.registry.set('winnings', { current: 0, old: 0 });
			this.registry.set('state', GameState.DEFAULT);
		}, this);

		// double buttons
		this.events.on('btn:double', () => {
			console.info('Double press');
			this.registry.set('state', GameState.DOUBLE_START);
		}, this);
		this.events.on('btn:low', () => {
			console.info('Low press');
			if (this.registry.get('state') === GameState.DOUBLING) {
				this.checkDoubleResult('low');
				this.buttonController.high.lit = false;
			}
		}, this);
		this.events.on('btn:high', () => {
			console.info('High press');
			if (this.registry.get('state') === GameState.DOUBLING) {
				this.checkDoubleResult('high');
				this.buttonController.low.lit = false;
			}
		}, this);

		// hold buttons
		this.events.on('btn:hold', (slot: CardSlot) => {
			console.info('Hold press');
			slot.setHeld(!slot.held);
		}, this);
	}

	// -----------------------------

	private stateChange(data: any) {
		switch (data) {
			case GameState.ATTRACT:
				this.buttonController.dimAll();
				this.registry.set('money', {current: 0, old: 0});
				this.registry.set('bet', 1);
				this.registry.set('winnings', {current: 0, old: 0});
				this.doubleGroup.clear(false, true);
				this.showAttract(true);
				break;

			case GameState.START:
				this.buttonController.dimAll();
				this.doubleGroup.clear(false, true);
				this.createWinnings();
				this.showAttract(false);
				this.registry.set('money', { current: this.gameSettings.startMoney, old: this.registry.get('money').current });
				this.registry.set('state', 'default');
				break;

			case GameState.DEFAULT:
				this.doubleGroup.clear(false, true);
				this.createWinnings();
				if (this.registry.get('money').current > 0) {
					if (this.registry.get('money').current < this.registry.get('bet')) {
						this.registry.set('bet', this.registry.get('money').current);
					}

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
				console.info('Winning: ', Hands[handResult]);
				if (handResult) {
					const hand: IHand = this.getHand(handResult);
					this.sound.play('win');
					this.registry.set('winnings', { current: hand.multiplier * this.registry.get('bet'), old: 0 });
					this.createWinnings(handResult);
					this.createDoubling();
					this.buttonController.payout.lit = true;
					this.buttonController.double.lit = true;
					this.buttonController.deal.lit = true;
				} else {
					this.registry.set('state', GameState.DEFAULT);
				}

				break;

			case GameState.DISCARD:
				this.buttonController.dimAll();
				this.buttonController.deal.lit = true;
				this.slotController.unHoldAll();
				this.slotController.buttons.forEach((b: Button) => b.lit = true);
				break;

			case GameState.DOUBLE_REPEAT:
				this.buttonController.dimAll();

				// can't overdouble
				if (this.registry.get('winnings').current >= this.gameSettings.maxDouble) {
					this.registry.set('state', GameState.DEFAULT);
				}

				this.buttonController.deal.lit = true;
				this.buttonController.double.lit = true;
				this.buttonController.payout.lit = true;
				break;

			case GameState.DOUBLE_START:
				this.buttonController.dimAll();
				this.winningsGroup.clear(false, true);
				this.registry.set('winnings', {current: this.registry.get('winnings').current * 2 , old: this.registry.get('winnings').current});
				this.registry.set('state', GameState.DOUBLE_SHUFFLE);
				break;

			case GameState.DOUBLING:
				this.buttonController.dimAll();
				this.buttonController.low.lit = true;
				this.buttonController.high.lit = true;

				break;

			case GameState.DOUBLE_SHUFFLE:
				this.buttonController.dimAll();

				this.shuffleDeck.once('shufflecomplete', () => {
					this.pokerGame.deck.shuffle();
					const doubleCard = this.pokerGame.deal(1);
					this.slotController.slot(2).setCard(new CardSprite(this, this.shuffleDeck.x, this.shuffleDeck.y, doubleCard[0]));

					const timeline = this.tweens.createTimeline({});

					timeline.add({
						targets: this.slotController.slot(2).card,
						x: this.slotController.slot(2).x,
						y: this.slotController.slot(2).y,
						duration: 200,
						onStart: () => { this.sound.play('deal'); },
					}).setCallback('onComplete', () => {
						this.registry.set('state', GameState.DOUBLING);
					}, null, this);

					timeline.play();
				});

				// shuffle
				this.playShuffle();

				break;

			case GameState.SHUFFLING:
				this.buttonController.dimAll();
				this.registry.set('state', GameState.DEALING);

				this.playShuffle();

				this.shuffleDeck.once('shufflecomplete', () => {
					console.info('Shuffle complete');
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
							onStart: () => { this.sound.play('deal'); },
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
				this.buttonController.dimAll();
				console.warn('Unknown state received: ', data);
				this.registry.set('state', GameState.ATTRACT);
		}

	}

	private checkDoubleResult(guess: string) {
		const sprite = this.slotController.slot(2).card;
		sprite.flipCard(true);

		if ( (guess === 'high' && sprite.card.isHigh) || (guess === 'low' && sprite.card.isLow)) {
			this.sound.play('win');
			this.registry.set('state', GameState.DOUBLE_REPEAT);
			this.events.emit('doubling:win');
		} else {
			this.registry.set('winnings', {current: 0, old: 0});
			this.sound.play('kosh');

			this.tweens.add({
				targets: sprite,
				y: '+=100',
				easing: 'Power1',
				duration: 500,
				completeDelay: 500,
				delay: 1000,
				onComplete: () => {
					this.slotController.slot(2).discard();
					this.registry.set('state', GameState.DEFAULT);
				},
			});
		}
	}

	private playShuffle() {
		if (this.slotController.emptySlots.length < 5) {
			this.slotController.flipAll(false);

			const preShuffleTimeline = this.tweens.createTimeline({});

			preShuffleTimeline.add({
				targets: this.shuffleDeck,
				x: this.scale.gameSize.width / 2 - 24,
				y: this.scale.gameSize.height / 2 - 32,
				duration: 200,
			});

			this.slotController.filledSlots.forEach( (slot: CardSlot) => {
				preShuffleTimeline.add({
					targets: slot.card,
					x: this.scale.gameSize.width / 2 - 24,
					y: this.scale.gameSize.height / 2 - 32,
					duration: 150,
					onStart: () => { this.sound.play('deal'); },
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
	}

	private createMainUI() {
		// create groups
		this.uiGroup = this.add.group();
		this.backgroundGroup = this.add.group();
		this.buttonsGroup = this.add.group();
		this.winningsGroup = this.add.group();
		this.doubleGroup = this.add.group();
		this.attractContainer = this.add.container(0, 0);

		this.createVolumeControl();
		this.createBackground();
		this.createButtons();
		this.createWinnings();
		this.createUi();
		this.createDoubling();
		this.createAttract();
	}

	private createAttract() {
		const dimmer = this.add.rectangle(0, 0, this.scale.gameSize.width, this.scale.gameSize.height, Colors.BLACK.color, 0.50).setOrigin(0).setInteractive();
		this.attractContainer.add([dimmer]);

		for (const card of this.pokerGame.deal(8)) {
			const cardSprite: CardSprite = new CardSprite(this,
					Phaser.Math.Between(5, this.scale.gameSize.width - cardWidth - 5),
					Phaser.Math.Between(this.scale.gameSize.height / 2 - cardHeight, this.scale.gameSize.height - cardHeight - 20 ),
					card);

			cardSprite.flipCard(Phaser.Math.Between(0, 1) === 0);

			const physicsCard = this.physics.add.existing(cardSprite, false);
			(physicsCard.body as Phaser.Physics.Arcade.Body)
				.setCollideWorldBounds(true)
				.setVelocityX(Phaser.Math.Between(-50, 50))
				.setDrag(0, 0)
				.setBounce(1, 1);

			this.attractContainer.add(cardSprite);
		}

		const versionText = this.add.bitmapText(this.scale.gameSize.width - 5, this.scale.gameSize.height - 13, 'arcade', `ver ${window.env.version}`, 8).setOrigin(1, 0);
		const poisonvialText = this.add.bitmapText(5, this.scale.gameSize.height - 13, 'arcade', `poison vial`, 8);

		const title1 = this.add.bitmapText(this.scale.gameSize.width / 2, 20, 'arcade', 'VIDEO\n   POKER', 32).setOrigin(0.5, 0);
		const title2 = this.add.bitmapText(this.scale.gameSize.width / 2 + 2, 22, 'arcade', 'VIDEO\n   POKER', 32).setOrigin(0.5, 0).setTint(Colors.UI_BLUE.color);
		const title3 = this.add.bitmapText(this.scale.gameSize.width / 2 + 4, 23, 'arcade', 'VIDEO\n   POKER', 32).setOrigin(0.5, 0).setTint(Colors.RED.color);

		this.tweens.add({
			ease: 'Sine.easeInOut',
			targets: [title1, title2, title3],
			y: '+=12',
			duration: 1333,
			yoyo: true,
			repeat: -1,
		});

		const button = new Button(this, this.scale.gameSize.width / 2 - 44, 110, Colors.BUTTON_GREEN, 'start').setScale(2);
		button.lit = true;
		button.events.on('click', () => {
			this.registry.set('state', GameState.START);
		});

		this.attractContainer.add([title3, title2, title1, button, versionText, poisonvialText]);
		this.attractContainer.setDepth(200);

		this.showAttract(false);
	}

	private showAttract(show: boolean) {
		this.attractContainer.setActive(show).setVisible(show);
		if (show) {
			this.physics.resume();
		} else {
			this.physics.pause();
		}
	}

	private createDoubling() {
		const emitterShape = new Phaser.Geom.Rectangle(
			this.slotController.slot(2).x,
			this.slotController.slot(2).y,
			cardWidth, cardHeight);

		const emitter = this.add.particles('suits8').createEmitter({
			frame: ['heart', 'club', 'diamond', 'spade'],
			speed: { min: 70, max: 150 },
			lifespan: 1500,
			gravityY: 150,
			quantity: 0,
			emitZone: { source: emitterShape },
		});

		this.events.on('doubling:win', () => {
			emitter.emitParticle(15);
		}, this);

		this.doubleGroup.addMultiple([
			this.add.rectangle(0, this.scale.gameSize.height - 50, this.scale.gameSize.width, 25, Colors.PURPLE.color, 1)
				.setOrigin(0),

			this.add.rectangle(40, this.scale.gameSize.height - 46, 50, 16, Colors.UI_BLUE.color, 1)
				.setStrokeStyle(2, Colors.WHITE.color)
				.setOrigin(0),

				this.add.bitmapText(10, this.scale.gameSize.height - 42, 'arcade', `bet`, 8),
				this.add.bitmapText(130, this.scale.gameSize.height - 42, 'arcade', `low (A-6)   high (8-K)`, 8),
		]).setDepth(80, 0);

		this.doubleBetText = this.add.bitmapText(85, this.scale.gameSize.height - 42, 'arcade', `${this.registry.get('winnings').current}`, 8).setOrigin(1, 0);
		this.doubleGroup.add(this.doubleBetText.setDepth(81));
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

	private createWinnings(highlightHand?: Hands) {
		this.winningsGroup.clear(false, true);
		let counter = 0;
		for (const hand of this.gameSettings.hands) {
			this.winningsGroup.addMultiple([
				this.add.bitmapText(135, 34 + 9 * counter, 'arcade', `${hand.name}`.padEnd(17, ' '), 8)
					.setTint(highlightHand && highlightHand === hand.key ? Colors.YELLOW_TEXT.color : Colors.WHITE.color),

				this.add.bitmapText(270, 34 + 9 * counter, 'arcade', `${hand.multiplier * this.registry.get('bet')}`.padStart(3, ' '), 8)
					.setTint(highlightHand && highlightHand === hand.key ? Colors.YELLOW_TEXT.color : Colors.WHITE.color),
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

			this.add.bitmapText(6, 11, 'arcade', `money`, 8).setDepth(51),
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

	private createVolumeControl(): void {
		this.volumeSprite = this.add.sprite(this.scale.gameSize.width - 24, 8, 'volume', 'low')
			.setOrigin(0)
			.setInteractive({cursor: 'pointer'})
			.setDepth(250);

		this.volumeSprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
			const curVol = this.registry.get('volume');
			if (curVol === Volume.LOW) { this.registry.set('volume', Volume.MUTE); this.volumeSprite.setFrame('mute'); }
			if (curVol === Volume.MUTE) { this.registry.set('volume', Volume.HIGH); this.volumeSprite.setFrame('high'); }
			if (curVol === Volume.HIGH) { this.registry.set('volume', Volume.LOW); this.volumeSprite.setFrame('low'); }
		}, this);
	}

	private createButtons() {
		// create buttons
		const payBtn = 		new Button(this, 15,  218, Colors.BUTTON_YELLOW, 'pay');
		const lowBtn = 		new Button(this, 65,  218, Colors.BUTTON_ORANGE, 'low');
		const highBtn = 	new Button(this, 115, 218, Colors.BUTTON_ORANGE, 'high');
		const doubleBtn = 	new Button(this, 165, 218, Colors.BUTTON_ORANGE, 'dbl');
		const betBtn = 		new Button(this, 215, 218, Colors.BUTTON_BLUE, 'bet');
		const dealBtn = 	new Button(this, 265, 218, Colors.BUTTON_GREEN, 'deal');

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

	private getHand(hand: Hands) {
		const result = this.gameSettings.hands.filter( (h: IHand) => h.key === hand);
		return result.length ? result[0] : null;
	}

}

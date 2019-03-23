import { BaseScene } from './BaseScene';
import { IGameSettings, gameSettings } from '../config/GameSettings';
import { Colors } from '../config/Colors';
import { CardSprite } from '../components/CardSprite';
import { PokerGame } from '../services/PokerGame';
import { Card } from '../components/Card';

export class GameScene extends BaseScene {
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

		this.gameSettings = gameSettings;
		this.pokerGame = new PokerGame(this.gameSettings);

		this.pokerGame.deck.shuffle();

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

	private createUI() {
		// create groups
		this.uiGroup = this.add.group();
		this.cardsGroup = this.add.group();
		this.backgroundGroup = this.add.group();
		this.winningsGroup = this.add.group();

		// background
		this.backgroundGroup.addMultiple([
			this.add.rectangle(0, 0, this.scale.gameSize.width, this.scale.gameSize.height, Colors.BACKGROUND).setOrigin(0),
			this.add.rectangle(0, 0, this.scale.gameSize.width, 22, Colors.GRAY, 1).setOrigin(0),
			this.add.rectangle(0, this.scale.gameSize.height - 14, this.scale.gameSize.width, 14, Colors.GRAY, 1).setOrigin(0),
		]);

		let counter = 0;
		for (const hand of this.gameSettings.hands) {
			this.winningsGroup.addMultiple([
				this.add.bitmapText(125, 24 + 9 * counter, 'arcade', `${hand.name}`.padEnd(17, ' '), 8),
				this.add.bitmapText(260, 24 + 9 * counter, 'arcade', `${hand.multiplier}`.padStart(3, ' '), 8),
			]);
			counter++;
		}

		this.uiGroup.addMultiple([
			this.add.rectangle(2, 2, 150, 18, Colors.UI_BLUE).setOrigin(0),
			this.add.circle(200, 6, 10, Colors.BUTTON_YELLOW).setOrigin(0),

			this.add.bitmapText(5, 6, 'arcade', `money`, 8),
			this.add.bitmapText(170, 6, 'arcade', `bet`, 8),

			this.add.bitmapText(110, 2, 'arcade', `20`, 16),
			this.add.bitmapText(199, 2, 'arcade', `1`, 16).setTint(Colors.BLACK),
		]);

		this.cardsGroup.addMultiple([
			new CardSprite(this, 40, 60, new Card('heart', {symbol: '2', value: 2})),
			new CardSprite(this, 45, 68, new Card('heart', {symbol: '2', value: 2})),
			new CardSprite(this, 55, 55, new Card('heart', {symbol: '2', value: 2})),

			new CardSprite(this, 55,  145, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 110, 145, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 165, 145, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 220, 145, this.pokerGame.deck.draw()).flipCard(true),
			new CardSprite(this, 275, 145, this.pokerGame.deck.draw()).flipCard(true),
		]);

	}

}

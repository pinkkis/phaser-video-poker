import { BaseScene } from './BaseScene';
import { Deck } from '../components/Deck';
import { IGameSettings, gameSettings } from '../config/GameSettings';
import { Colors } from '../config/Colors';
import { CardSprite } from '../components/CardSprite';

export class GameScene extends BaseScene {
	private deck: Deck;
	private settings: IGameSettings;

	constructor() {
		super('GameScene');
	}

	public init(data: any): void {
		this.settings = data;
	}

	public create(data: any): void {
		console.info('GameScene - create()');

		this.createUI();
		this.createDeck();

		let card = this.deck.drawSpecific('joker');
		let cardSprite = new CardSprite(this, 50, 50, card).flipCard(true);

		// this.setTimerEvent(2000, 2000, () => cardSprite.flipCard(true));

		// cardSprite.discard();
	}

	public update(time: number, delta: number): void {
		// empty
	}

	// -- private methods -----------------------------

	private createUI() {
		// background
		this.add.rectangle(0, 0, this.scale.gameSize.width, this.scale.gameSize.height, Colors.BACKGROUND)
			.setOrigin(0);

		// top gray bar
		this.add.rectangle(0, 0, this.scale.gameSize.width, 35, Colors.GRAY, 1)
			.setOrigin(0);

		// bottom gray bar
		this.add.rectangle(0, this.scale.gameSize.height - 35, this.scale.gameSize.width, 35, Colors.GRAY, 1)
			.setOrigin(0);


	}

	private createDeck() {
		this.deck = new Deck(1);
	}

}

import { IGameSettings } from '../config/GameSettings';
import { Card } from '../components/Card';
import { Deck } from '../components/Deck';

export class PokerGame extends Phaser.Events.EventEmitter {
	public deck: Deck;
	public settings: IGameSettings;

	constructor(settings: IGameSettings) {
		super();

		this.settings = settings;
		this.deck = new Deck(this.settings.jokers);

		this.bindEvents();
		this.emit('game:ready');
	}

	public checkHand(cards: Card[]): any {

		return null;
	}

	public deal(count: number): Card[] {
		const cards: Card[] = [];

		for (let i = 0; i < count; i++) {
			cards.push(this.deck.draw());
		}

		return cards;
	}

	// private

	private bindEvents() {
		//
	}

}

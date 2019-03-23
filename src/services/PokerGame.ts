import { IGameSettings } from '../config/GameSettings';
import { Card } from '../components/Card';
import { Deck } from '../components/Deck';

export type StateName = 'none'|'attract'|'dealing'|'select'|'doubling';

export interface IGameState {
	state: StateName;
	balance: number;
	bet: number;
}

export class PokerGame extends Phaser.Events.EventEmitter {
	public deck: Deck;
	public settings: IGameSettings;
	public gameState: IGameState;

	constructor(settings: IGameSettings) {
		super();
		this.gameState = {
			state: 'none',
			balance: 0,
			bet: 0.2,
		};

		this.settings = settings;
		this.deck = new Deck(this.settings.jokers);

		this.bindEvents();

		this.emit('game:ready');
	}

	public checkHand(hand: Card[]): any {

		return null;
	}

	public dealNewHand() {
		//

		this.emit('deal:initial', []);
		this.changeState('select');
	}

	public dealChange() {
		//

		this.emit('deal:change', []);
	}

	// private

	private changeState(state: StateName) {
		const oldState = this.gameState.state;
		this.gameState.state = state;
		this.emit('statechange', state, oldState);
	}

	private bindEvents() {
		//
	}

}

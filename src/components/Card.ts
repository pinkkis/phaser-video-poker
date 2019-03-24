import { Suit, IRank } from './CardTypes';

export class Card {
	public textureKey: string;
	public suit: string;
	public rank: IRank;

	constructor(suit: Suit, rank: IRank) {
		this.suit = suit;
		this.rank = rank;
		this.textureKey = `card_${suit}_${rank.symbol}`;
	}

	public get isJoker(): boolean {
		return this.suit === 'joker';
	}

	public get isBlack(): boolean {
		return this.isJoker || this.suit === 'club' || this.suit === 'spade';
	}

	public get isHigh(): boolean {
		return this.isJoker || this.rank.value > 7 && this.rank.value < 14;
	}

	public get isLow(): boolean {
		return this.isJoker || this.rank.value > 0 && this.rank.value < 7;
	}

	public isSuit(suit: string): boolean {
		return this.isJoker || this.suit === suit;
	}

	public toString() {
		return `[Card ${this.rank.symbol} of ${this.suit}]`;
	}

	public get value() {
		return this.rank.value;
	}
}

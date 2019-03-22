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
		return this.suit === 'club' || this.suit === 'spade';
	}

	public get isBig(): boolean {
		return this.rank.value > 7 && this.rank.value < 14;
	}

	public get isSmall(): boolean {
		return this.rank.value > 0 && this.rank.value < 7;
	}
}

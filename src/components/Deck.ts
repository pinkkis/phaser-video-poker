import { Card } from './Card';
import { Suit, cardValues, IRank } from './CardTypes';

export class Deck {
	public cards: Card[] = [];
	public rt: Phaser.GameObjects.RenderTexture;

	private usedCards: Card[];

	constructor(jokers: number = 1) {
		// create a joker
		for (let i = 0; i < jokers; i++) {
			this.cards.push(new Card('joker', { value: 99, symbol: 'J' } as IRank));
		}

		// create suits
		const suits = ['club', 'diamond', 'heart', 'spade'] as Suit[];
		suits.forEach((suit: Suit) => {
			for (let i = 1; i < cardValues.length; i++) {
				this.cards.push(new Card(suit, cardValues[i]));
			}
		});

		this.shuffle();
	}

	public shuffle(): void {
		let currentIndex = this.cards.length;
		let temporaryValue;
		let randomIndex;

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = this.cards[currentIndex];
			this.cards[currentIndex] = this.cards[randomIndex];
			this.cards[randomIndex] = temporaryValue;
		}

		this.usedCards = [];
	}

	public draw(includeJoker: boolean = true): Card {
		const card = this.cards[0];
		this.usedCards.push(card);
		return card;
	}

	public drawSpecific(suit: Suit, value?: number) {
		const cards = this.cards.filter( (card: Card) => {
			return value ? card.suit === suit && card.rank.value === value : card.suit === suit;
		});

		if (cards.length) {
			this.usedCards.push(cards[0]);
			return cards[0];
		} else {
			return null;
		}
	}

	// private methods ----------------

}

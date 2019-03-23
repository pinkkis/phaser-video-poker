import { Card } from './Card';
import { Suit, cardValues, IRank } from './CardTypes';

export class Deck {
	public cards: Card[] = [];
	public rt: Phaser.GameObjects.RenderTexture;

	private usedCards: Card[] = [];
	private lastDrawnIndex: number = 0;

	constructor(jokers: number = 1) {
		// create a joker
		for (let i = 0; i < jokers; i++) {
			this.cards.push(new Card('joker', { value: 99, symbol: 'J' } as IRank));
		}

		// create suits
		const suits = ['club', 'diamond', 'heart', 'spade'] as Suit[];
		suits.forEach((suit: Suit) => {
			for (const value of cardValues) {
				this.cards.push(new Card(suit, value));
			}
		});
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
		this.lastDrawnIndex = 0;
	}

	/**
	 * Draw next card, and put it into used deck, remember to shuffle
	 * @param includeJoker should jokers be included
	 */
	public draw(includeJoker: boolean = true): Card {
		if (this.lastDrawnIndex === this.cards.length) {
			console.warn('tried to draw too many cards, shuffle the deck');
			return null;
		}

		const card = this.cards[this.lastDrawnIndex++];
		this.usedCards.push(card);
		return card;
	}

	/**
	 * Pulls a specific card. This does not update usedCards and is more for testing
	 * @param suit Suit of card
	 * @param value optional value of card
	 */
	public drawSpecific(suit: Suit, value?: number) {
		const cards = this.cards.filter( (card: Card) => {
			return value ? card.suit === suit && card.rank.value === value : card.suit === suit;
		});

		if (cards.length) {
			return cards[0];
		} else {
			return null;
		}
	}
}

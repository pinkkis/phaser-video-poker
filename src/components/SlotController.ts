import { CardSlot } from './CardSlot';
import { CardSprite } from './CardSprite';

export class SlotController {
	private cardSlots: CardSlot[];

	constructor() {
		this.cardSlots = [
			new CardSlot(null, false, null, null, 30, 120),
			new CardSlot(null, false, null, null, 85, 120),
			new CardSlot(null, false, null, null, 140, 120),
			new CardSlot(null, false, null, null, 195, 120),
			new CardSlot(null, false, null, null, 250, 120),
		];
	}

	public slot(index: number): CardSlot {
		if (index >= 0 && index < this.cardSlots.length) {
			return this.cardSlots[index];
		}

		return null;
	}

	public get slots() {
		return this.cardSlots;
	}

	public get freeSlots() {
		return this.cardSlots.filter( (slot: CardSlot) => !slot.held);
	}

	public get emptySlots() {
		return this.cardSlots.filter( (slot: CardSlot) => !slot.card);
	}

	public get cards() {
		return this.cardSlots.map( (slot: CardSlot) => {
			return slot.card;
		});
	}

	public get labels() {
		return this.cardSlots.map( (slot: CardSlot) => {
			return slot.holdLabel;
		});
	}

	public get buttons() {
		return this.cardSlots.map( (slot: CardSlot) => {
			return slot.holdBtn;
		});
	}

	public get hand() {
		return this.cards.map( (card: CardSprite) => {
			return card.card;
		});
	}

	public unHoldAll() {
		this.slots.forEach( (slot: CardSlot) => slot.setHeld(false) );
	}

	public flipAll(faceUp: boolean) {
		this.slots.forEach( (slot: CardSlot) => slot.card.flipCard(faceUp) );
	}

	public slotCard(card: CardSprite): CardSlot {
		if (this.emptySlots.length > 0) {
			const slot = this.emptySlots[0];
			slot.setCard(card);
			return slot;
		}

		return null;
	}

}

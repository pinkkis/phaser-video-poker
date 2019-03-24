import { CardSlot } from './CardSlot';
import { HoldLabel } from './HoldLabel';
import { Button } from './Button';

export class SlotManager {
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

	public unHoldAll() {
		this.slots.forEach( (slot: CardSlot) => slot.setHeld(false) );
	}

}

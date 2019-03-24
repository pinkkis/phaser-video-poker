import { CardSprite } from './CardSprite';
import { Button } from './Button';
import { HoldLabel } from './HoldLabel';

export class CardSlot {
	public card: CardSprite;
	public held: boolean;
	public holdBtn: Button;
	public holdLabel: HoldLabel;
	public x: number;
	public y: number;

	constructor(card: CardSprite, held: boolean, holdBtn: Button, holdLabel: HoldLabel, x: number, y: number) {
		this.card = card;
		this.held = held;
		this.holdBtn = holdBtn;
		this.holdLabel = holdLabel;
		this.x = x;
		this.y = y;
	}

	public setCard(card: CardSprite): CardSlot {
		this.card = card;
		return this;
	}

	public setHeld(held: boolean): CardSlot {
		this.held = held;
		if (this.holdLabel) { this.holdLabel.setVisible(held); }

		return this;
	}

	public setBtn(btn: Button): CardSlot {
		this.holdBtn = btn;
		return this;
	}

	public setLabel(lbl: HoldLabel): CardSlot {
		this.holdLabel = lbl;
		return this;
	}

	public discard() {
		this.card.discard();
		this.card = null;
	}

}

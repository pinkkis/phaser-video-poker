import { Button } from './Button';
import { GameScene } from '../scenes/GameScene';

export class ButtonController {
	public scene: Phaser.Scene;
	public deal: Button;
	public double: Button;
	public low: Button;
	public high: Button;
	public payout: Button;
	public bet: Button;
	public hold1: Button;
	public hold2: Button;
	public hold3: Button;
	public hold4: Button;
	public hold5: Button;

	constructor(
		scene: Phaser.Scene,
		deal: Button,
		double: Button,
		low: Button,
		high: Button,
		payout: Button,
		bet: Button,
		hold1: Button,
		hold2: Button,
		hold3: Button,
		hold4: Button,
		hold5: Button,
	) {
		this.deal = deal;
		this.scene = scene;
		this.double = double;
		this.low = low;
		this.high = high;
		this.payout = payout;
		this.bet = bet;
		this.hold1 = hold1;
		this.hold2 = hold2;
		this.hold3 = hold3;
		this.hold4 = hold4;
		this.hold5 = hold5;

		this.bindEvents();
	}

	public dimAll() {
		this.deal.lit = false;
		this.double.lit = false;
		this.low.lit = false;
		this.high.lit = false;
		this.payout.lit = false;
		this.bet.lit = false;
		this.hold1.lit = false;
		this.hold2.lit = false;
		this.hold3.lit = false;
		this.hold4.lit = false;
		this.hold5.lit = false;
	}

	// private ------------------

	private bindEvents() {
		this.deal.events.on('click', () => {
			this.scene.events.emit('btn:deal');
		}, this);

		this.double.events.on('click', () => {
			this.scene.events.emit('btn:double');
		}, this);

		this.low.events.on('click', () => {
			this.scene.events.emit('btn:low');
		}, this);

		this.high.events.on('click', () => {
			this.scene.events.emit('btn:high');
		}, this);

		this.payout.events.on('click', () => {
			this.scene.events.emit('btn:payout');
		}, this);

		this.bet.events.on('click', () => {
			this.scene.events.emit('btn:bet');
		}, this);

		this.hold1.events.on('click', () => {
			this.scene.sound.play('thock', { volume: 0.5});
			this.scene.events.emit('btn:hold', (this.scene as GameScene).slotManager.slot(0) );
		}, this);

		this.hold2.events.on('click', () => {
			this.scene.sound.play('thock', { volume: 0.5});
			this.scene.events.emit('btn:hold', (this.scene as GameScene).slotManager.slot(1) );
		}, this);

		this.hold3.events.on('click', () => {
			this.scene.sound.play('thock', { volume: 0.5});
			this.scene.events.emit('btn:hold', (this.scene as GameScene).slotManager.slot(2) );
		}, this);

		this.hold4.events.on('click', () => {
			this.scene.sound.play('thock', { volume: 0.5});
			this.scene.events.emit('btn:hold', (this.scene as GameScene).slotManager.slot(3) );
		}, this);

		this.hold5.events.on('click', () => {
			this.scene.sound.play('thock', { volume: 0.5});
			this.scene.events.emit('btn:hold', (this.scene as GameScene).slotManager.slot(4) );
		}, this);
	}
}

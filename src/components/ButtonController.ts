import { Button } from './Button';

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
			this.scene.events.emit('btn:hold1');
		}, this);

		this.hold2.events.on('click', () => {
			this.scene.events.emit('btn:hold2');
		}, this);

		this.hold3.events.on('click', () => {
			this.scene.events.emit('btn:hold3');
		}, this);

		this.hold4.events.on('click', () => {
			this.scene.events.emit('btn:hold4');
		}, this);

		this.hold5.events.on('click', () => {
			this.scene.events.emit('btn:hold5');
		}, this);
	}
}

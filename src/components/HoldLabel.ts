import { Colors } from "../config/Colors";

export class HoldLabel extends Phaser.GameObjects.Container {
	private bg: Phaser.GameObjects.Rectangle;
	private label: Phaser.GameObjects.BitmapText;

	constructor(scene: Phaser.Scene, x: number, y: number, color: Phaser.Display.Color, text: string) {
		super(scene, x, y);
		this.createLabel(color, text);
		scene.add.existing(this);
	}

	private createLabel(color: Phaser.Display.Color, text: string) {
		this.bg = this.scene.add.rectangle(0, 0, 40, 16, color.color, 1).setOrigin(0).setStrokeStyle(1, Colors.RED.color);
		this.label = this.scene.add.bitmapText(20, 8, 'arcade', text, 8).setTint(0x000000).setOrigin(0.5);

		this.add(this.bg);
		this.add(this.label);
	}
}

export class Button extends Phaser.GameObjects.Container {
	public events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
	public button: Phaser.GameObjects.Rectangle;
	public bitmapText: Phaser.GameObjects.BitmapText;

	private text: string;
	private buttonColor: Phaser.Display.Color;
	private colorLit: Phaser.Display.Color;
	private borderColor: Phaser.Display.Color;
	private borderColorLit: Phaser.Display.Color;

	private buttonWidth: number;
	private buttonHeight: number;

	private isLit: boolean = false;

	constructor(scene: Phaser.Scene, x: number, y: number, color: Phaser.Display.Color, text: string, buttonWidth: number = 44, buttonHeight: number = 16) {
		super(scene, x, y);

		this.text = text;
		this.buttonColor = color;
		this.colorLit = color.clone().lighten(40);
		this.borderColor = color.clone().darken(10);
		this.borderColorLit = color.clone();

		this.buttonWidth = buttonWidth;
		this.buttonHeight = buttonHeight;

		this.width = buttonWidth;
		this.height = buttonHeight;

		this.createButton();
		this.button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
			this.events.emit('click');
		}, this);

		scene.add.existing(this);
	}

	public get lit() {
		return this.isLit;
	}

	public set lit(value: boolean) {
		this.isLit = value;
		this.button
			.setStrokeStyle(2, this.isLit ? this.borderColorLit.color : this.borderColor.color)
			.setFillStyle(this.isLit ? this.colorLit.color : this.buttonColor.color);

		if (this.isLit) {
			this.button.setInteractive({ cursor: 'pointer' });
		} else {
			this.button.disableInteractive();
		}
	}

	private createButton() {
		this.button = this.scene.add.rectangle(0, 0, this.buttonWidth, this.buttonHeight, this.buttonColor.color, 1)
						.setStrokeStyle(2, this.borderColor.color)
						.setOrigin(0);
		this.bitmapText = this.scene.add.bitmapText(this.buttonWidth / 2, this.buttonHeight / 2, 'arcade', this.text, 8)
							.setTint(0x000000)
							.setOrigin(0.5);

		this.add([this.button, this.bitmapText]);
	}
}

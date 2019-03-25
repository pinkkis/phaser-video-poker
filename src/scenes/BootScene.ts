import { BaseScene } from './BaseScene';

export class BootScene extends BaseScene {
	private rt: Phaser.GameObjects.RenderTexture;

	constructor(key: string, options: any) {
		super('BootScene');
	}

	public preload(): void {
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
	}

	public create(): void {
		this.scene.start('LoaderScene', {});
	}
}

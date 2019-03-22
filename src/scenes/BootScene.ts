import { BaseScene } from './BaseScene';

export class BootScene extends BaseScene {
	constructor(key: string, options: any) {
		super('BootScene');
	}

	public preload(): void {
		// empty
	}

	public init(): void {
		// empty
	}

	public create(): void {
		console.info('BootScene - create()');
		this.add.text(100, 100, 'Boot Scene Loaded', { fontSize: '20px' });
		// this.scene.start('LoadScene', {});
	}

	public update(time: number, delta: number): void {
		// empty
	}
}

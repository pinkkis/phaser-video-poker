// phaser game config
export const gameConfig: GameConfig = {
	type: Phaser.AUTO,
	scale: {
		parent: 'game-container',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 320,
		height: 240,
	},
	render: {
		pixelArt: true,
		roundPixels: true,
	},
	physics: {
		default: 'arcade',
		arcade: {
			// debug: window.env.buildType !== 'production',
			gravity: { y: 200 },
		}
	},
	plugins: {
		global: [] as any[],
	},
};

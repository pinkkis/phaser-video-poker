// phaser game config
export const gameConfig: GameConfig = {
	type: Phaser.AUTO,
	scale: {
		parent: 'game-container',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 320,
		height: 200,
	},
	render: {
		pixelArt: true,
		roundPixels: true,
	},
	plugins: {
		global: [] as any[],
	},
};

import 'phaser';
import '@csstools/normalize.css';
import './css/styles.css';
import { BootScene } from './scenes/BootScene';
import { gameConfig } from './config/GameConfig';

// set up game class, and global stuff
export class KokoGame extends Phaser.Game {
	private debug: boolean = false;

	constructor(config: GameConfig) {
		super(config);
	}
}

// start the game
window.onload = () => {
	const game = new KokoGame(gameConfig);

	// set up stats
	if (window.env.buildType !== 'production') {
		const Stats = require('stats-js');
		const stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		document.body.appendChild(stats.domElement);

		game.events.on('prestep', () => stats.begin());
		game.events.on('postrender', () => stats.end());
	}

	game.scene.add('BootScene', BootScene, true);
};

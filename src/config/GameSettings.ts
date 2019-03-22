export interface IGameSettings {
	[key: string]: any;
}

export const gameSettings: IGameSettings = {
	bets: [.2, .4, .6, .8, 1],
	hands: {
		royalFlush: {
			multiplier: 100,
			name: 'Royal Flush',
		},
		straightFlush: {
			multiplier: 50,
			name: 'Straight Flush',
		},
		fourOfAKind: {
			multiplier: 30,
			name: 'Four of a Kind',
		},
		fullHouse: {
			multiplier: 13,
			name: 'Full House',
		},
		flush: {
			multiplier: 7,
			name: 'Flush',
		},
		straight: {
			multiplier: 6,
			name: 'Straight',
		},
		threeOfAKind: {
			multiplier: 3,
			name: 'Three of a Kind',
		},
		twoPair: {
			multiplier: 1,
			name: 'Two Pair',
		},
	},
};

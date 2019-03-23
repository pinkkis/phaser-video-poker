export interface IGameSettings {
	[key: string]: any;
}

interface IHand {
	key: string;
	multiplier: number;
	name: string;
}

export const gameSettings: IGameSettings = {
	bets: [.2, .4, .6, .8, 1],
	jokers: 1,
	hands: [
		{
			key: 'fiveOfAKind',
			multiplier: 100,
			name: '5 of a Kind',
		},
		{
			key: 'royalFlush',
			multiplier: 100,
			name: 'Royal Flush',
		},
		{
			key: 'straightFlush',
			multiplier: 50,
			name: 'Straight Flush',
		},
		{
			key: 'fourOfAKind',
			multiplier: 30,
			name: '4 of a Kind',
		},
		{
			key: 'fullHouse',
			multiplier: 13,
			name: 'Full House',
		},
		{
			key: 'flush',
			multiplier: 7,
			name: 'Flush',
		},
		{
			key: 'straight',
			multiplier: 6,
			name: 'Straight',
		},
		{
			key: 'threeOfAKind',
			multiplier: 3,
			name: '3 of a Kind',
		},
		{
			key: 'twoPair',
			multiplier: 1,
			name: 'Two Pair',
		},
	] as IHand[],
};

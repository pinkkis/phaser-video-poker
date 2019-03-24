import { Hands } from '../components/Enums';

export interface IGameSettings {
	[key: string]: any;
}

export interface IHand {
	key: Hands;
	multiplier: number;
	name: string;
}

export const gameSettings: IGameSettings = {
	maxBet: 5,
	betStep: 1,
	betStart: 1,
	startMoney: 20,
	maxDouble: 333,
	jokers: 1,
	hands: [
		{
			key: Hands.FIVE_OF_A_KIND,
			multiplier: 100,
			name: '5 of a Kind',
		},
		{
			key: Hands.ROYAL_FLUSH,
			multiplier: 100,
			name: 'Royal Flush',
		},
		{
			key: Hands.STRAIGHT_FLUSH,
			multiplier: 50,
			name: 'Straight Flush',
		},
		{
			key: Hands.FOUR_OF_A_KIND,
			multiplier: 30,
			name: '4 of a Kind',
		},
		{
			key: Hands.FULL_HOUSE,
			multiplier: 13,
			name: 'Full House',
		},
		{
			key: Hands.FLUSH,
			multiplier: 7,
			name: 'Flush',
		},
		{
			key: Hands.STRAIGHT,
			multiplier: 6,
			name: 'Straight',
		},
		{
			key: Hands.THREE_OF_A_KIND,
			multiplier: 3,
			name: '3 of a Kind',
		},
	] as IHand[],
};

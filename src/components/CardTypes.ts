export type Suit = 'heart' | 'spade' | 'diamond' | 'club' | 'joker';

export interface IRank {
	value: number;
	symbol: string;
}

export const cardValues: IRank[] = [
	{value: 1, symbol: 'A'},
	{value: 2, symbol: '2'},
	{value: 3, symbol: '3'},
	{value: 4, symbol: '4'},
	{value: 5, symbol: '5'},
	{value: 6, symbol: '6'},
	{value: 7, symbol: '7'},
	{value: 8, symbol: '8'},
	{value: 9, symbol: '9'},
	{value: 10, symbol: '10'},
	{value: 11, symbol: 'J'},
	{value: 12, symbol: 'Q'},
	{value: 13, symbol: 'K'},
];

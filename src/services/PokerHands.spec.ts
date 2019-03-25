import test from 'ava';

import {PokerGame} from './PokerGame';
import { Deck } from '../components/Deck';
import { Card } from '../components/Card';
import { Hands } from '../components/Enums';

test.before( (t) => {
	(t.context as any).deck = new Deck(1);
});

// --------------

test('Royal flush - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '10', value: 10}),
		new Card('heart', {symbol: 'J', value: 11}),
		new Card('heart', {symbol: 'Q', value: 12}),
		new Card('joker', {symbol: 'J', value: 99}),
		new Card('heart', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.ROYAL_FLUSH);
});

test('Royal flush - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '10', value: 10}),
		new Card('heart', {symbol: 'J', value: 11}),
		new Card('heart', {symbol: 'Q', value: 12}),
		new Card('heart', {symbol: 'K', value: 13}),
		new Card('heart', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.ROYAL_FLUSH);
});

test('Straight flush - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '4', value: 4}),
		new Card('heart', {symbol: '5', value: 5}),
		new Card('heart', {symbol: '6', value: 6}),
		new Card('joker', {symbol: 'J', value: 99}),
		new Card('heart', {symbol: '8', value: 8}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT_FLUSH);
});

test('Straight flush - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '4', value: 4}),
		new Card('heart', {symbol: '5', value: 5}),
		new Card('heart', {symbol: '6', value: 6}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '8', value: 8}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT_FLUSH);
});

test('Full house - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '5', value: 5}),
		new Card('club',  {symbol: '5', value: 5}),
		new Card('spade', {symbol: '5', value: 5}),
		new Card('club', {symbol: '2', value: 2}),
		new Card('diamond', {symbol: '2', value: 2}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FULL_HOUSE);
});

test('Full house - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '5', value: 5}),
		new Card('club',  {symbol: '5', value: 5}),
		new Card('joker', {symbol: 'J', value: 99}),
		new Card('club', {symbol: '2', value: 2}),
		new Card('diamond', {symbol: '2', value: 2}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FULL_HOUSE);
});

test('Straight - low ace joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '5', value: 5}),
		new Card('club',  {symbol: '4', value: 4}),
		new Card('heart', {symbol: '3', value: 3}),
		new Card('club', {symbol: '2', value: 2}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - high ace joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '10', value: 10}),
		new Card('club', {symbol: 'J', value: 11}),
		new Card('club', {symbol: 'Q', value: 12}),
		new Card('heart', {symbol: 'K', value: 13}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - bug #3', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '9', value: 9}),
		new Card('club',  {symbol: '7', value: 7}),
		new Card('club',  {symbol: '8', value: 8}),
		new Card('club',  {symbol: 'K', value: 13}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.not(result, Hands.STRAIGHT);
});

test('Straight - bug #3 - positive', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '9', value: 9}),
		new Card('club',  {symbol: '7', value: 7}),
		new Card('club',  {symbol: '8', value: 8}),
		new Card('club',  {symbol: 'J', value: 11}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - bug #3 - random', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: 'J', value: 11}),
		new Card('club',  {symbol: '7', value: 7}),
		new Card('club',  {symbol: '8', value: 8}),
		new Card('club',  {symbol: '10', value: 10}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - low - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '5', value: 5}),
		new Card('club',  {symbol: '4', value: 4}),
		new Card('heart', {symbol: '3', value: 3}),
		new Card('joker', {symbol: 'J', value: 99}),
		new Card('spade', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - high - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '10', value: 10}),
		new Card('club', {symbol: 'J', value: 11}),
		new Card('joker', {symbol: 'J', value: 99}),
		new Card('heart', {symbol: 'K', value: 13}),
		new Card('spade', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - mid - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '4', value: 4}),
		new Card('diamond', {symbol: '5', value: 5}),
		new Card('joker', {symbol: 'J', value: 99}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('spade', {symbol: '8', value: 8}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - low - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '5', value: 5}),
		new Card('club',  {symbol: '4', value: 4}),
		new Card('heart', {symbol: '3', value: 3}),
		new Card('heart', {symbol: '2', value: 2}),
		new Card('spade', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - high - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '10', value: 10}),
		new Card('club', {symbol: 'J', value: 11}),
		new Card('heart', {symbol: 'Q', value: 12}),
		new Card('heart', {symbol: 'K', value: 13}),
		new Card('spade', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - mid - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '4', value: 4}),
		new Card('diamond', {symbol: '5', value: 5}),
		new Card('heart', {symbol: '6', value: 6}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('spade', {symbol: '8', value: 8}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Straight - mid - no joker - not sorted', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '4', value: 4}),
		new Card('heart', {symbol: '6', value: 6}),
		new Card('spade', {symbol: '8', value: 8}),
		new Card('diamond', {symbol: '5', value: 5}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.STRAIGHT);
});

test('Flush - hearts - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('heart', {symbol: '4', value: 4}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('heart', {symbol: 'J', value: 11}),
		new Card('heart', {symbol: '2', value: 2}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FLUSH);
});

test('Flush - diamonds - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('diamond', {symbol: '2', value: 2}),
		new Card('diamond', {symbol: '3', value: 3}),
		new Card('diamond', {symbol: '4', value: 4}),
		new Card('diamond', {symbol: '8', value: 8}),
		new Card('diamond', {symbol: 'Q', value: 12}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FLUSH);
});

test('3 of a kind - 7s - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('club', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('joker', {symbol: 'J', value: 99}),

		new Card('diamond', {symbol: '2', value: 2}),
		new Card('spade', {symbol: 'J', value: 11}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.THREE_OF_A_KIND);
});

test('3 of a kind - 7s - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('club', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('spade', {symbol: '7', value: 7}),

		new Card('diamond', {symbol: '2', value: 2}),
		new Card('spade', {symbol: 'A', value: 1}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.THREE_OF_A_KIND);
});

test('4 of a kind - 7s - no joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('club', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('spade', {symbol: '7', value: 7}),
		new Card('diamond', {symbol: '7', value: 7}),

		new Card('spade', {symbol: 'J', value: 11}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FOUR_OF_A_KIND);
});

test('4 of a kind - 7s - joker', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('club', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('spade', {symbol: '7', value: 7}),
		new Card('joker', {symbol: 'J', value: 99}),

		new Card('diamond', {symbol: 'Q', value: 12}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FOUR_OF_A_KIND);
});

test('5 of a kind - 7s', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('club', {symbol: '7', value: 7}),
		new Card('heart', {symbol: '7', value: 7}),
		new Card('spade', {symbol: '7', value: 7}),
		new Card('diamond', {symbol: '7', value: 7}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FIVE_OF_A_KIND);
});

test('5 of a kind - aces', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const hand: Card[] = [
		new Card('club', {symbol: 'A', value: 1}),
		new Card('heart', {symbol: 'A', value: 1}),
		new Card('spade', {symbol: 'A', value: 1}),
		new Card('diamond', {symbol: 'A', value: 1}),
		new Card('joker', {symbol: 'J', value: 99}),
	];

	const result = pg.checkHand(hand);

	t.is(result, Hands.FIVE_OF_A_KIND);
});

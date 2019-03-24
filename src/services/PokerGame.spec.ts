import test from 'ava';

import {PokerGame} from './PokerGame';
import { Deck } from '../components/Deck';

test.before( (t) => {
	(t.context as any).deck = new Deck(1);
});

test('Creates PokerGame', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	t.truthy(pg);
});

test('Deals card array', (t) => {
	const deck = (t.context as any).deck as Deck;
	const pg = new PokerGame(deck);

	const cards = pg.deal(5);

	t.true(Array.isArray(cards));
	t.is(cards.length, 5);
});

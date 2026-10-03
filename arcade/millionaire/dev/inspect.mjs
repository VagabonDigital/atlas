// Localhost-only entry point, imported by app.mjs only with ?inspect=.
// Uses actual transitions and seed questions; never persists game events.
import { Millionaire } from '../game.mjs';
import { QUESTIONS } from '../questions.mjs';
export function inspectState(name) {
  const supported = ['neutral','selected','locked','correct','incorrect','safety','walk','hypothetical','host','win','summary','narrow'];
  if (!supported.includes(name)) throw new Error(`Unknown inspection state: ${name}`);
  const game = new Millionaire(QUESTIONS, { random: () => .37 });
  game.start();
  const target = name === 'win' ? 10 : name === 'safety' ? 3 : 4;
  while (game.state.rung < target) { game.select(game.state.question.answer); game.lock(); game.reveal(); game.continue(); }
  if (name === 'narrow') game.lifeline('narrow');
  if (name === 'host') game.lifeline('host');
  if (['selected','locked','correct','safety','win','incorrect','summary'].includes(name)) game.select(name === 'incorrect' || name === 'summary' ? (game.state.question.answer + 1) % 4 : game.state.question.answer);
  if (['locked','correct','safety','win','incorrect','summary'].includes(name)) game.lock();
  if (['correct','safety','win','incorrect','summary'].includes(name)) game.reveal();
  if (name === 'summary') game.summary();
  if (['walk','hypothetical'].includes(name)) game.walk();
  if (name === 'hypothetical') game.walk(true);
  return game;
}

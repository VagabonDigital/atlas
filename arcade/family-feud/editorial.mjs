import {boards} from './content.mjs';

// Internal editorial review, not a tutor-facing category selector.
// Every original survey question AND all six answers must meet the standards
// in README.md. Fail closed: unreviewed IDs are never selected for new matches.
const heldByReason = Object.freeze({
  "Intimacy, nudity, body judgement or uncomfortable personal relationship framing": Object.freeze([1,4,6,8,12,18,24,35,36,39,41,47,56,59,60,64,67,70,91,99,107,109,129,134,151,154,160]),
  "Bodily humiliation, age ridicule or unexpectedly graphic/gross answers": Object.freeze([21,26,38,66,79,90,131,147,155,159]),
  "Alcohol/drug responses or an insensitive adult funeral/party joke": Object.freeze([28,46,51,77,110,119,139]),
  "Niche US media, celebrities, brands or culturally inaccessible wordplay": Object.freeze([7,9,10,14,27,76,81,88,94,95,97,115,123,140,161]),
  "Violence, weapons, gambling, deception or unsuitable conduct": Object.freeze([50,61,74,92,117]),
  "Religious/grief awkwardness or profanity": Object.freeze([100,114]),
  "Insults, interpersonal stigmatisation or single-parent stereotyping": Object.freeze([44,98,130]),
  "Too vague for six reliably guessable answers": Object.freeze([152]),
});
const heldReasons = Object.fromEntries(Object.entries(heldByReason).flatMap(
  ([reason,ids]) => ids.map(id=>[id,reason])
));
export const editorialReview = Object.freeze({
  approvedSourceIds: Object.freeze([19,85,111,121,137,3,136,54,104,135,144,153,72,40,82,118,143,29,89,128,145,57,31,48,33,13,158,141,58,62]),
  heldReasons: Object.freeze(heldReasons),
});
const approvedIds = new Set(editorialReview.approvedSourceIds);
export const playableBoards = boards.filter(b=>approvedIds.has(b.sourceSurveyId));

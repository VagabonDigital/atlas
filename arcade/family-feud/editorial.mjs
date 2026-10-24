import {boards} from './content.mjs';
import {season25Boards} from './content-season25.mjs';

// Internal editorial review, not a tutor-facing category selector.
// Every original survey question AND all six answers must meet the standards
// in README.md. Fail closed: unreviewed IDs are never selected for new matches.
const heldByReason = Object.freeze({
  "Adult content or substance references": Object.freeze([1,8,28,38,46,47,56,91,110,119]),
  "Intimate or appearance-based prompts": Object.freeze([6,18,24,41,59,67,134,139,151,154,160]),
  "Harm, humiliation or distress": Object.freeze([26,44,50,51,66,74,79,90,98,155]),
  "Niche prerequisite knowledge or weak guessing": Object.freeze([7,10,14,88,94,97,123,152,161]),
});
const heldReasons = Object.fromEntries(Object.entries(heldByReason).flatMap(
  ([reason,ids]) => ids.map(id=>[id,reason])
));
export const editorialReview = Object.freeze({
  approvedSourceIds: Object.freeze([19,85,111,121,137,3,136,54,104,135,144,153,72,40,82,118,143,29,89,128,145,57,31,48,33,13,158,141,58,62,4,12,35,36,39,60,64,70,99,107,109,129,21,131,147,159,77,9,27,76,81,95,115,140,61,92,117,100,114,130,183,187,188,252,282,172,205,224,256,273,189,225,247,291,313,176,193,212,229,262]),
  heldReasons: Object.freeze(heldReasons),
});
const approvedIds = new Set(editorialReview.approvedSourceIds);
export const playableBoards = [...boards,...season25Boards].filter(b=>approvedIds.has(b.sourceSurveyId));

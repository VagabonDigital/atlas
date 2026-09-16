/* Authored Drafts, as data. No engine module may import from here, except the
   tests and the workbench. */

import rA from './reference/r-a-belonging.js';
import rB from './reference/r-b-order.js';
import rC from './reference/r-c-load.js';
import { hostileFixtures } from './hostile/index.js';

export const references = { 'r-a': rA, 'r-b': rB, 'r-c': rC };
export { hostileFixtures };

export const allDrafts = { ...references, ...hostileFixtures };

/* R-C runs headless in B1: the Vessel painter it needs to be played arrives in
   B5. It is here now because it is the only reference that stresses two
   resources at once through the model and the analyser. */
export const playableInB1 = ['r-a', 'r-b'];

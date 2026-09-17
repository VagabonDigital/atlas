/* Engine One — mark identities.

   A mark keeps its id for as long as the thing it stands for exists, so two
   frames can be diffed mark by mark and a snapshot can be compared with the next
   one. Ids are built from contract keys and never from positions. */

export const markId = Object.freeze({
    place: (key) => `place:${key}`,
    socket: (place, index) => `socket:${place}:${index}`,
    piece: (key) => `piece:${key}`,
    tether: (rule) => `tether:${rule}`,
    affinity: (owner, index) => `affinity:${owner}:${index}`,
    voice: (key) => `voice:${key}`,
    goal: (key) => `goal:${key}`,
    omen: (beat) => `omen:${beat}`,
    threshold: () => `threshold`,
    margin: () => `margin`
});

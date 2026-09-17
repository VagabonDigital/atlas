/* Engine One — the Table form.

   A room with tables in it. The Ground is a floor, each Place stands on a
   surface with a setting under every socket, the Threshold is the passage people
   wait in and the Margin is where things are set aside.

   A form says what the space is made of and how a link bends through it. It
   draws no text, never sees a World View, and every mark around it is shared
   with every other form. Its shapes carry generic roles, so the same stylesheet
   paints any form. */

import { LAYOUT } from '../../layout/index.js';

const round = (n) => Math.round(n * 10) / 10;

export const tableForm = Object.freeze({
    id: 'table',
    topology: 'groups',

    /* The static space: the floor, its grain, the passage and the resting place.
       Everything that can come and go is a mark, not ground. */
    paintGround(layout) {
        const ground = layout.regions.ground;
        const passage = layout.regions.threshold;
        const rest = layout.regions.margin;
        const shapes = [
            { shape: 'rect', role: 'field', x: ground.x, y: ground.y, width: ground.width, height: ground.height, rx: 12 }
        ];
        for (let i = 1; i < 5; i += 1) {
            const y = round(ground.y + (ground.height * i) / 5);
            shapes.push({ shape: 'line', role: 'texture', x1: ground.x, y1: y, x2: ground.x + ground.width, y2: y });
        }
        shapes.push({
            shape: 'rect', role: 'passage',
            x: passage.x + 6, y: passage.y + 6, width: passage.width - 12, height: passage.height - 12, rx: 8
        });
        shapes.push({
            shape: 'rect', role: 'rest',
            x: rest.x + 6, y: rest.y + 12, width: rest.width - 12, height: rest.height - 32, rx: 6
        });
        for (const x of [rest.x + 48, rest.x + rest.width - 64]) {
            shapes.push({ shape: 'rect', role: 'support', x, y: rest.y + rest.height - 20, width: 16, height: 14, rx: 2 });
        }
        return shapes;
    },

    /* What a Place stands on: a surface under its sockets, clear of the name, of
       any Voice standing there, and of the load lines along the bottom. */
    placeSurface(place) {
        const { frame, sockets, voiceStrip, loads } = place;
        const radius = LAYOUT.socketRadius;
        const reserved = voiceStrip?.position === 'inside' ? voiceStrip.height + LAYOUT.voiceGap : 0;
        const top = Math.max(
            Math.min(...sockets.map((s) => s.y)) - radius - 16,
            frame.y + LAYOUT.nameBand + reserved
        );
        const bottom = Math.min(
            Math.max(...sockets.map((s) => s.y)) + radius + 16,
            loads.length > 0 ? Math.min(...loads.map((l) => l.y)) - 12 : frame.y + frame.height - LAYOUT.framePadBottom
        );
        return [{
            shape: 'rect',
            role: 'surface',
            x: frame.x + 12,
            y: round(top),
            width: frame.width - 24,
            height: round(Math.max(0, bottom - top)),
            rx: 16
        }];
    },

    /* A setting laid at each socket, so an empty seat still reads as a place
       kept for someone. */
    socketSetting(socket) {
        return [{ shape: 'circle', role: 'setting', cx: socket.x, cy: socket.y, r: socket.radius + 7 }];
    },

    /* A link between two Pieces. Two Pieces side by side in the same band are
       joined underneath, so the line never crosses their names; anything else
       takes a gentle arc across the room. */
    tetherPath(a, b) {
        const centre = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
        if (Math.abs(a.y - b.y) < 2) {
            const y = a.y + a.height;
            const from = centre(a).x;
            const to = centre(b).x;
            return `M ${from} ${y} Q ${round((from + to) / 2)} ${y + 22} ${to} ${y}`;
        }
        const p = centre(a);
        const q = centre(b);
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const length = Math.hypot(dx, dy) || 1;
        const bow = Math.min(60, length * 0.18);
        return `M ${round(p.x)} ${round(p.y)} Q ${round((p.x + q.x) / 2 - (dy / length) * bow)} ${round((p.y + q.y) / 2 + (dx / length) * bow)} ${round(q.x)} ${round(q.y)}`;
    }
});

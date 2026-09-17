/* Engine One — rendering marks.

   A MarkSet becomes DOM here: SVG for geometry, real elements for every piece of
   text. Marks are keyed by id, so a frame that follows another rebuilds only the
   marks that changed, which is what choreography will animate later.

   This module knows the mark vocabulary and nothing else. It never learns which
   game, which Rule or which Stage Form it is drawing: a form's contribution
   arrives as plain shapes inside a mark's geometry. */

import { STAGE, SCALE_ROLES } from '../../layout/index.js';
import { LAYERS } from '../marks/build.js';
import { ensureStylesheets } from './styles.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* How tightly each scale sets, matching the line heights the layout reserves. */
const LINE_HEIGHT = Object.freeze({ name: 1.1, micro: 1.15, claim: 1.25, goal: 1.15, inscription: 1.2, headline: 1.1 });

function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value !== null && value !== undefined) node.setAttribute(key, String(value));
    }
    return node;
}

function htmlEl(tag, attrs = {}) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value !== null && value !== undefined) node.setAttribute(key, String(value));
    }
    return node;
}

function shapeNode(shape) {
    const cls = `sp-shape sp-shape--${shape.role}`;
    switch (shape.shape) {
        case 'rect':
            return svgEl('rect', { class: cls, x: shape.x, y: shape.y, width: shape.width, height: shape.height, rx: shape.rx ?? 0 });
        case 'circle':
            return svgEl('circle', { class: cls, cx: shape.cx, cy: shape.cy, r: shape.r });
        case 'line':
            return svgEl('line', { class: cls, x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 });
        case 'path':
            return svgEl('path', { class: cls, d: shape.d });
        default:
            throw new Error(`A form drew a shape the Stage does not know: ${shape.shape}`);
    }
}

function textNode(entry, className) {
    const node = htmlEl('p', {
        class: `sp-text ${className}`,
        'data-align': entry.align,
        'data-valign': entry.valign,
        'data-emphasis': String(entry.emphasis)
    });
    const scale = SCALE_ROLES[entry.scale];
    node.style.setProperty('--x', String(entry.box.x));
    node.style.setProperty('--y', String(entry.box.y));
    node.style.setProperty('--w', String(entry.box.width));
    node.style.setProperty('--h', String(entry.box.height));
    node.style.setProperty('--fs', String(scale.fontSize));
    node.style.setProperty('--lh', String(LINE_HEIGHT[entry.scale] ?? 1.15));
    node.textContent = entry.value;
    return node;
}

/* A regular shape centred on a point, for the marks a Piece shares with the
   Places it may enter. */
function affinityNode(geometry) {
    const { x, y, size, shape } = geometry;
    const r = size / 2;
    if (shape === 'circle') return svgEl('circle', { class: 'sp-affinity__shape', cx: x, cy: y, r });
    const sides = { square: 4, triangle: 3, diamond: 4, pentagon: 5, hexagon: 6 }[shape] ?? 6;
    const turn = shape === 'square' ? Math.PI / 4 : -Math.PI / 2;
    const points = Array.from({ length: sides }, (_, i) => {
        const angle = turn + (i * 2 * Math.PI) / sides;
        return `${(x + r * Math.cos(angle)).toFixed(1)},${(y + r * Math.sin(angle)).toFixed(1)}`;
    });
    return svgEl('polygon', { class: 'sp-affinity__shape', points: points.join(' ') });
}

const RENDERERS = Object.freeze({
    place(mark) {
        const { frame, surface } = mark.geometry;
        const group = svgEl('g', {
            class: 'sp-place',
            'data-closed': String(mark.state.closed),
            'data-locked': String(mark.state.locked),
            'data-stranded': String(mark.state.stranded)
        });
        group.append(svgEl('rect', { class: 'sp-place__zone', x: frame.x, y: frame.y, width: frame.width, height: frame.height, rx: 14 }));
        for (const shape of surface) group.append(shapeNode(shape));
        return { svg: [group], html: [textNode(mark.text.name, 'sp-place__name')] };
    },

    socket(mark) {
        const group = svgEl('g', { class: 'sp-socket', 'data-occupied': String(mark.state.occupied) });
        for (const shape of mark.geometry.setting) group.append(shapeNode(shape));
        group.append(svgEl('circle', { class: 'sp-socket__ring', cx: mark.geometry.x, cy: mark.geometry.y, r: mark.geometry.radius }));
        return { svg: [group], html: [] };
    },

    piece(mark) {
        const { box } = mark.geometry;
        const group = svgEl('g', {
            class: 'sp-piece',
            'data-material': mark.state.material,
            'data-pinned': String(mark.state.pinned),
            'data-locked': String(mark.state.locked),
            'data-unavailable': String(mark.state.unavailable)
        });
        group.append(svgEl('rect', {
            class: 'sp-piece__chip', x: box.x, y: box.y, width: box.width, height: box.height, rx: box.height / 2
        }));
        return { svg: [group], html: [textNode(mark.text.name, 'sp-piece__name')] };
    },

    tether(mark) {
        const group = svgEl('g', {
            class: 'sp-tether',
            'data-relation': mark.state.relation,
            'data-relevant': String(mark.state.relevant)
        });
        group.append(svgEl('path', { class: 'sp-tether__path', d: mark.geometry.path }));
        return { svg: [group], html: [] };
    },

    affinity(mark) {
        const group = svgEl('g', { class: 'sp-affinity' });
        group.append(affinityNode(mark.geometry));
        return { svg: [group], html: [] };
    },

    voice(mark) {
        const { box, medallion, connector } = mark.geometry;
        const group = svgEl('g', { class: 'sp-voice', 'data-brightened': String(mark.state.brightened), 'data-position': mark.geometry.position });
        if (connector) {
            group.append(svgEl('line', { class: 'sp-voice__connector', x1: connector.x1, y1: connector.y1, x2: connector.x2, y2: connector.y2 }));
        }
        group.append(svgEl('rect', { class: 'sp-voice__card', x: box.x, y: box.y, width: box.width, height: box.height, rx: 10 }));
        group.append(svgEl('circle', { class: 'sp-voice__medallion', cx: medallion.x, cy: medallion.y, r: medallion.radius }));
        return {
            svg: [group],
            html: [
                textNode(mark.text.initials, 'sp-voice__initials'),
                textNode(mark.text.name, 'sp-voice__name'),
                textNode(mark.text.role, 'sp-voice__role'),
                textNode(mark.text.claim, 'sp-voice__claim')
            ]
        };
    },

    goal(mark) {
        const { box } = mark.geometry;
        const group = svgEl('g', { class: 'sp-goal', 'data-crossed': String(mark.state.crossed) });
        const y = box.y + box.height - 6;
        const half = Math.min(28, box.width / 3);
        const centre = box.x + box.width / 2;
        group.append(svgEl('line', { class: 'sp-goal__rule', x1: centre - half, y1: y, x2: centre + half, y2: y }));
        return { svg: [group], html: [textNode(mark.text.label, 'sp-goal__label')] };
    },

    omen(mark) {
        const { box } = mark.geometry;
        const group = svgEl('g', { class: 'sp-omen', 'data-sharpened': String(mark.state.sharpened), 'data-edge': mark.geometry.edge });
        group.append(svgEl('circle', { class: 'sp-omen__sign', cx: box.x + box.width / 2, cy: box.y - 14, r: 9 }));
        return { svg: [group], html: [textNode(mark.text.text, 'sp-omen__text')] };
    },

    threshold(mark) {
        return { svg: [], html: [textNode(mark.text.label, 'sp-band__label')] };
    },

    margin(mark) {
        return { svg: [], html: [textNode(mark.text.label, 'sp-band__label')] };
    }
});

export function createStageView(container, { kit, accent, appearance = 'light', phase, motion = 'off', label = '' }) {
    ensureStylesheets();

    const root = htmlEl('div', {
        class: 'sp-stage',
        'data-kit': kit,
        'data-accent': accent,
        'data-appearance': appearance,
        'data-phase': phase,
        'data-motion': motion
    });
    const frame = htmlEl('div', { class: 'sp-stage__frame', role: 'group', 'aria-label': label });
    const viewBox = `0 0 ${STAGE.width} ${STAGE.height}`;
    const groundLayer = svgEl('svg', { class: 'sp-stage__layer sp-stage__ground', viewBox, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    const markLayer = svgEl('svg', { class: 'sp-stage__layer sp-stage__marks', viewBox, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    const textLayer = htmlEl('div', { class: 'sp-stage__layer sp-stage__text' });

    const svgGroups = new Map();
    const textGroups = new Map();
    for (const layer of LAYERS) {
        svgGroups.set(layer, markLayer.appendChild(svgEl('g', { 'data-layer': layer })));
        textGroups.set(layer, textLayer.appendChild(htmlEl('div', { 'data-layer': layer })));
    }

    frame.append(groundLayer, markLayer, textLayer);
    root.append(frame);
    container.append(root);

    const rendered = new Map();

    const attach = (entry, mark) => {
        for (const node of entry.svg) svgGroups.get(mark.layer).append(node);
        for (const node of entry.html) textGroups.get(mark.layer).append(node);
    };

    return {
        root,
        frame,

        setGround(shapes) {
            groundLayer.replaceChildren(...shapes.map(shapeNode));
        },

        render(markSet) {
            const seen = new Set();
            for (const mark of markSet.marks.values()) {
                seen.add(mark.id);
                const signature = JSON.stringify(mark);
                const existing = rendered.get(mark.id);
                if (existing && existing.signature === signature) {
                    attach(existing, mark);
                    continue;
                }
                if (existing) for (const node of [...existing.svg, ...existing.html]) node.remove();

                const renderer = RENDERERS[mark.type];
                if (!renderer) throw new Error(`The Stage has no renderer for a ${mark.type} mark.`);
                const drawn = renderer(mark);
                const entry = { signature, svg: drawn.svg ?? [], html: drawn.html ?? [] };
                const carrier = entry.svg[0] ?? entry.html[0];
                for (const node of [...entry.svg, ...entry.html]) node.setAttribute('data-mark-id', mark.id);
                if (carrier) carrier.setAttribute('data-mark-type', mark.type);
                rendered.set(mark.id, entry);
                attach(entry, mark);
            }
            for (const [id, entry] of rendered) {
                if (seen.has(id)) continue;
                for (const node of [...entry.svg, ...entry.html]) node.remove();
                rendered.delete(id);
            }
            root.dataset.phase = markSet.phase;
            root.dataset.ready = 'true';
        },

        setAppearance(next) {
            root.dataset.appearance = next;
        },

        destroy() {
            rendered.clear();
            root.remove();
        }
    };
}

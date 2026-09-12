/* ============================================================
   ATLAS SUBJECT ARTWORK
   Shared contract for tutor-owned Compass card artwork.

   Owns:
   - artwork metadata normalization
   - SVG allow-list validation / sanitization
   - artwork color normalization

   Does NOT own:
   - AI generation
   - subject persistence
   - Compass UI
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectArtwork) return;

    const SCHEMA_VERSION = 1;
    const TYPE = 'atlas-svg';
    const VIEWBOX = '0 0 180 140';
    const MAX_SVG_LENGTH = 16000;
    const MAX_ELEMENTS = 90;
    const MAX_IDEA_LENGTH = 240;

    const ALLOWED_TAGS = new Set([
        'svg',
        'g',
        'path',
        'circle',
        'ellipse',
        'rect',
        'line',
        'polyline',
        'polygon'
    ]);

    const ALLOWED_ATTRIBUTES = new Set([
        'xmlns',
        'viewBox',
        'fill',
        'stroke',
        'stroke-width',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-dasharray',
        'stroke-dashoffset',
        'pathLength',
        'vector-effect',
        'opacity',
        'class',
        'transform',
        'd',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'x',
        'y',
        'width',
        'height',
        'x1',
        'y1',
        'x2',
        'y2',
        'points'
    ]);

    function cleanString(value) {
        return String(value ?? '').trim();
    }

    function normalizeViewBox(value) {
        return cleanString(value)
            .split(/\s+/)
            .join(' ');
    }

    function normalizeColor(value) {
        const raw = cleanString(value);

        if (
            !raw ||
            raw.toLowerCase() === 'atlas' ||
            raw.toLowerCase() === 'default'
        ) {
            return 'atlas';
        }

        if (/^#[0-9a-f]{3}$/i.test(raw)) {
            return (
                '#' +
                raw
                    .slice(1)
                    .split('')
                    .map(char => char + char)
                    .join('')
            ).toLowerCase();
        }

        if (/^#[0-9a-f]{6}$/i.test(raw)) {
            return raw.toLowerCase();
        }

        return 'atlas';
    }

    function hasUnsafeValue(value) {
        return /javascript:|data:|url\s*\(/i.test(
            String(value || '')
        );
    }

    function isAllowedPaint(value) {
        const paint = cleanString(value);

        return (
            paint === 'none' ||
            paint === 'currentColor'
        );
    }

    function sanitizeSvg(value) {
        const source = cleanString(value);

        if (
            !source ||
            source.length > MAX_SVG_LENGTH ||
            typeof DOMParser !== 'function'
        ) {
            return '';
        }

        let document;

        try {
            document = new DOMParser().parseFromString(
                source,
                'image/svg+xml'
            );
        } catch {
            return '';
        }

        if (
            !document ||
            document.querySelector('parsererror')
        ) {
            return '';
        }

        const root = document.documentElement;

        if (
            !root ||
            root.localName !== 'svg' ||
            normalizeViewBox(
                root.getAttribute('viewBox')
            ) !== VIEWBOX
        ) {
            return '';
        }

        const elements = [
            root,
            ...root.querySelectorAll('*')
        ];

        if (elements.length > MAX_ELEMENTS) {
            return '';
        }

        for (const element of elements) {
            if (!ALLOWED_TAGS.has(element.localName)) {
                return '';
            }

            for (const attribute of [
                ...element.attributes
            ]) {
                const name = attribute.name;
                const attrValue = attribute.value;

                if (
                    name.toLowerCase().startsWith('on') ||
                    !ALLOWED_ATTRIBUTES.has(name) ||
                    hasUnsafeValue(attrValue)
                ) {
                    return '';
                }

                if (
                    (
                        name === 'fill' ||
                        name === 'stroke'
                    ) &&
                    !isAllowedPaint(attrValue)
                ) {
                    return '';
                }

                if (
                    name === 'class' &&
                    !/^[a-zA-Z0-9 _-]*$/.test(
                        attrValue
                    )
                ) {
                    return '';
                }
            }
        }

        root.setAttribute(
            'viewBox',
            VIEWBOX
        );

        root.setAttribute(
            'xmlns',
            'http://www.w3.org/2000/svg'
        );

        try {
            return new XMLSerializer()
                .serializeToString(root);
        } catch {
            return '';
        }
    }

    function normalize(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return null;
        }

        const svg = sanitizeSvg(value.svg);

        if (!svg) {
            return null;
        }

        return {
            type: TYPE,
            version: SCHEMA_VERSION,
            svg,
            color: normalizeColor(value.color),
            idea: cleanString(value.idea)
                .slice(0, MAX_IDEA_LENGTH)
        };
    }

    function resolveColor(value) {
        const color = normalizeColor(value);

        return color === 'atlas'
            ? ''
            : color;
    }

    window.AtlasSubjectArtwork =
        Object.freeze({
            schemaVersion: SCHEMA_VERSION,
            type: TYPE,
            viewBox: VIEWBOX,
            normalize,
            sanitizeSvg,
            normalizeColor,
            resolveColor
        });
})();
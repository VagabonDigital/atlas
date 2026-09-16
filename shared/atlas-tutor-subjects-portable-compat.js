/* ============================================================
   ATLAS TUTOR SUBJECTS — PORTABLE COMPATIBILITY

   Supabase stores subject library state as jsonb. jsonb preserves JSON values
   but not JavaScript object insertion order. The legacy Tutor Subjects portable
   validator compares normalized library objects with JSON.stringify(), so a
   semantically identical cloud library can fail validation purely because
   object keys were returned in a different order.

   This compatibility boundary reorders only object keys before delegating to
   the existing strict validator. It does not normalize values, repair invalid
   placement, remove unknown keys, or weaken subject/draft validation.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorSubjectsPortableCompat) return;

    const RETRY_LIMIT = 160;
    let attempts = 0;

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function cloneJson(value) {
        if (value === undefined) return undefined;
        return JSON.parse(JSON.stringify(value));
    }

    function orderedCopy(value, preferredKeys = []) {
        if (!isPlainObject(value)) return cloneJson(value);

        const result = {};
        const seen = new Set();

        preferredKeys.forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(value, key)) return;
            seen.add(key);
            result[key] = cloneJson(value[key]);
        });

        Object.keys(value)
            .filter(key => !seen.has(key))
            .sort()
            .forEach(key => {
                result[key] = cloneJson(value[key]);
            });

        return result;
    }

    function canonicalizeLibrary(library, subjects) {
        if (!isPlainObject(library)) return library;

        const subjectIds = (Array.isArray(subjects) ? subjects : [])
            .map(subject => String(subject?.id || '').trim())
            .filter(Boolean);
        const rawSubjects = isPlainObject(library.subjects)
            ? library.subjects
            : library.subjects;

        let canonicalSubjects = rawSubjects;

        if (isPlainObject(rawSubjects)) {
            canonicalSubjects = {};
            const seen = new Set();

            subjectIds.forEach(subjectId => {
                if (!Object.prototype.hasOwnProperty.call(rawSubjects, subjectId)) {
                    return;
                }

                seen.add(subjectId);
                canonicalSubjects[subjectId] = orderedCopy(
                    rawSubjects[subjectId],
                    ['libraryIncluded', 'categoryId', 'archived']
                );
            });

            Object.keys(rawSubjects)
                .filter(subjectId => !seen.has(subjectId))
                .sort()
                .forEach(subjectId => {
                    canonicalSubjects[subjectId] = orderedCopy(
                        rawSubjects[subjectId],
                        ['libraryIncluded', 'categoryId', 'archived']
                    );
                });
        }

        const categories = Array.isArray(library.categories)
            ? library.categories.map(category =>
                orderedCopy(category, ['id', 'name'])
            )
            : cloneJson(library.categories);

        const result = {};
        const preferred = [
            'schemaVersion',
            'defaultCategoryId',
            'categories',
            'categoryOrder',
            'subjects'
        ];
        const seen = new Set();

        preferred.forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(library, key)) return;
            seen.add(key);

            if (key === 'categories') {
                result[key] = categories;
            } else if (key === 'subjects') {
                result[key] = canonicalSubjects;
            } else {
                result[key] = cloneJson(library[key]);
            }
        });

        Object.keys(library)
            .filter(key => !seen.has(key))
            .sort()
            .forEach(key => {
                result[key] = cloneJson(library[key]);
            });

        return result;
    }

    function install() {
        const Store = window.AtlasTutorSubjects;

        if (!Store || typeof Store.validatePortableData !== 'function') {
            attempts += 1;
            if (attempts < RETRY_LIMIT) {
                window.setTimeout(install, 50);
            }
            return;
        }

        const originalValidate = Store.validatePortableData.bind(Store);

        Store.validatePortableData = function validatePortableData(payload) {
            if (!isPlainObject(payload) || payload.library === undefined) {
                return originalValidate(payload);
            }

            const next = {
                ...payload,
                library: canonicalizeLibrary(
                    payload.library,
                    payload.subjects
                )
            };

            return originalValidate(next);
        };

        window.AtlasTutorSubjectsPortableCompat = Object.freeze({
            active: true
        });
    }

    install();
})();

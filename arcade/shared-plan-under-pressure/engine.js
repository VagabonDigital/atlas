/* ============================================================
   SHARED PLAN UNDER PRESSURE — ENGINE V1
   Definition-driven, deterministic Arcade runtime.
   ============================================================ */

(function () {
    'use strict';

    const Bridge = window.AtlasBridge || null;
    const Definitions = window.SharedPlanDefinitions || {};
    const ENGINE_ID = 'shared-plan-under-pressure';
    const ENGINE_VERSION = 1;
    const HISTORY_LIMIT = 20;
    const PHASE_LABELS = {
        planning: 'Planning',
        committed: 'Committed',
        reacting: 'Reacting',
        revising: 'Revising',
        resolved: 'Resolved'
    };
    const PREDICATE_TYPES = new Set([
        'entity-carried',
        'all-entities-carried',
        'beat-fired'
    ]);
    const EFFECT_TYPES = new Set([
        'set-container-availability',
        'activate-goal'
    ]);

    let definition = null;
    let session = null;
    let state = null;
    let wrapper = null;
    let selectedEntityId = null;
    let started = false;
    let restoreBlocked = false;
    let toastTimer = null;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getDefinitionId() {
        return new URLSearchParams(window.location.search).get('game') ||
            'twenty-kilos';
    }

    function getEntity(id) {
        return definition.entities.find(item => item.id === id) || null;
    }

    function getContainer(id) {
        return definition.containers.find(item => item.id === id) || null;
    }

    function getBeat(id) {
        return definition.beats.find(item => item.id === id) || null;
    }

    function hasResourceLimit(container) {
        return container &&
            container.resourceLimit !== null &&
            container.resourceLimit !== undefined &&
            Number.isFinite(Number(container.resourceLimit));
    }

    function validatePredicate(predicate, context, entityIds, beatIds) {
        if (!predicate || !PREDICATE_TYPES.has(predicate.type)) {
            return context + ' uses an unsupported predicate.';
        }

        if (
            predicate.type === 'entity-carried' &&
            !entityIds.has(predicate.entityId)
        ) {
            return context + ' references an unknown entity.';
        }

        if (predicate.type === 'all-entities-carried') {
            const ids = Array.isArray(predicate.entityIds)
                ? predicate.entityIds
                : [];

            if (!ids.length || ids.some(id => !entityIds.has(id))) {
                return context + ' has invalid entity references.';
            }
        }

        if (
            predicate.type === 'beat-fired' &&
            !beatIds.has(predicate.beatId)
        ) {
            return context + ' references an unknown beat.';
        }

        return null;
    }

    function validateDefinition(candidate) {
        if (!candidate || typeof candidate !== 'object') {
            return ['Definition is missing.'];
        }

        const errors = [];
        const containers = Array.isArray(candidate.containers)
            ? candidate.containers
            : [];
        const entities = Array.isArray(candidate.entities)
            ? candidate.entities
            : [];
        const goals = Array.isArray(candidate.goals)
            ? candidate.goals
            : [];
        const beats = Array.isArray(candidate.beats)
            ? candidate.beats
            : [];
        const containerIds = new Set(containers.map(item => item.id));
        const entityIds = new Set(entities.map(item => item.id));
        const goalIds = new Set(goals.map(item => item.id));
        const beatIds = new Set(beats.map(item => item.id));

        if (candidate.engineId !== ENGINE_ID) {
            errors.push('Definition targets the wrong engine.');
        }

        if (
            !candidate.definitionId ||
            !candidate.definitionHash ||
            !candidate.registry?.registryId
        ) {
            errors.push('Definition identity is incomplete.');
        }

        if (
            containerIds.size !== containers.length ||
            entityIds.size !== entities.length ||
            goalIds.size !== goals.length ||
            beatIds.size !== beats.length
        ) {
            errors.push('Definition IDs must be unique.');
        }

        if (containerIds.has('pool') || containerIds.has('cut')) {
            errors.push('Pool and Cut are reserved engine destinations.');
        }

        if (!entities.length || entities.length > 9) {
            errors.push('V1 requires between 1 and 9 entities.');
        }

        entities.forEach(entity => {
            if (
                !entity.id ||
                !entity.name ||
                !Number.isFinite(Number(entity.resourceCost)) ||
                Number(entity.resourceCost) < 0
            ) {
                errors.push('Every entity needs a valid ID, name and resource cost.');
            }
        });

        (candidate.rules || []).forEach(rule => {
            if (
                rule.type !== 'requires' ||
                !entityIds.has(rule.sourceEntityId) ||
                !entityIds.has(rule.requiredEntityId)
            ) {
                errors.push(
                    'Rule "' + String(rule.id || '') + '" is not valid for V1.'
                );
            }
        });

        goals.forEach(goal => {
            const error = validatePredicate(
                goal.predicate,
                'Goal "' + String(goal.id || '') + '"',
                entityIds,
                beatIds
            );

            if (error) errors.push(error);
        });

        beats.forEach(beat => {
            const variants = Array.isArray(beat.variants)
                ? beat.variants
                : [];

            if (!variants.length) {
                errors.push('Every beat needs at least one variant.');
                return;
            }

            const fallback = variants[variants.length - 1];
            if (!Array.isArray(fallback.when) || fallback.when.length) {
                errors.push('Every beat needs an unconditional final fallback.');
            }

            variants.forEach(variant => {
                (variant.when || []).forEach(predicate => {
                    const error = validatePredicate(
                        predicate,
                        'Beat "' + beat.id + '"',
                        entityIds,
                        beatIds
                    );

                    if (error) errors.push(error);
                });

                (variant.effects || []).forEach(effect => {
                    if (!EFFECT_TYPES.has(effect.type)) {
                        errors.push('Beat "' + beat.id + '" has an unsupported effect.');
                    }

                    if (
                        effect.type === 'set-container-availability' &&
                        !containerIds.has(effect.containerId)
                    ) {
                        errors.push('Beat "' + beat.id + '" references an unknown container.');
                    }

                    if (
                        effect.type === 'activate-goal' &&
                        !goalIds.has(effect.goalId)
                    ) {
                        errors.push('Beat "' + beat.id + '" references an unknown goal.');
                    }
                });
            });
        });

        (candidate.resolution?.outcomeLines || []).forEach(
            (line, index) => {
                (line.when || []).forEach(predicate => {
                    const error = validatePredicate(
                        predicate,
                        'Outcome line ' + (index + 1),
                        entityIds,
                        beatIds
                    );

                    if (error) errors.push(error);
                });
            }
        );

        return Array.from(new Set(errors));
    }

    function createDefaultState() {
        const placements = {};

        definition.entities.forEach(entity => {
            placements[entity.id] = 'pool';
        });

        return {
            schemaVersion: 1,
            engineId: ENGINE_ID,
            engineVersion: ENGINE_VERSION,
            definitionId: definition.definitionId,
            definitionHash: definition.definitionHash,
            phase: 'planning',
            placements,
            firedBeats: [],
            commits: [],
            declaredStake: null,
            history: [],
            completion: null
        };
    }

    function normalizeState(saved) {
        const fallback = createDefaultState();

        if (!saved || typeof saved !== 'object') {
            return fallback;
        }

        if (saved.definitionHash !== definition.definitionHash) {
            restoreBlocked = true;
            return fallback;
        }

        const next = {
            ...fallback,
            ...clone(saved),
            placements: {
                ...fallback.placements,
                ...(saved.placements || {})
            }
        };

        if (!PHASE_LABELS[next.phase]) next.phase = 'planning';

        definition.entities.forEach(entity => {
            const destination = next.placements[entity.id];
            const valid =
                destination === 'pool' ||
                destination === 'cut' ||
                Boolean(getContainer(destination));

            if (!valid) next.placements[entity.id] = 'pool';
        });

        next.firedBeats = Array.isArray(next.firedBeats)
            ? next.firedBeats
            : [];
        next.commits = Array.isArray(next.commits)
            ? next.commits
            : [];
        next.history = Array.isArray(next.history)
            ? next.history.slice(-HISTORY_LIMIT)
            : [];

        return next;
    }

    function getVariant(entry) {
        const beat = getBeat(entry.beatId);

        return beat?.variants?.find(
            variant => variant.id === entry.variantId
        ) || null;
    }

    function deriveWorld(currentState = state) {
        const availability = {};
        const activeGoals = new Set();

        definition.containers.forEach(container => {
            availability[container.id] = true;
        });

        definition.goals.forEach(goal => {
            if (goal.status === 'active') activeGoals.add(goal.id);
        });

        currentState.firedBeats.forEach(entry => {
            const variant = getVariant(entry);

            (variant?.effects || []).forEach(effect => {
                if (effect.type === 'set-container-availability') {
                    availability[effect.containerId] = Boolean(effect.available);
                }

                if (effect.type === 'activate-goal') {
                    activeGoals.add(effect.goalId);
                }
            });
        });

        return { availability, activeGoals };
    }

    function isCarried(destinationId, currentState = state) {
        const container = getContainer(destinationId);
        const world = deriveWorld(currentState);

        return Boolean(container?.carried) &&
            world.availability[destinationId] !== false;
    }

    function evaluatePredicate(
        predicate,
        currentState = state,
        placements = currentState.placements
    ) {
        let result = false;

        if (predicate.type === 'entity-carried') {
            result = isCarried(
                placements[predicate.entityId],
                currentState
            );
        }

        if (predicate.type === 'all-entities-carried') {
            result = (predicate.entityIds || []).every(entityId =>
                isCarried(placements[entityId], currentState)
            );
        }

        if (predicate.type === 'beat-fired') {
            result = currentState.firedBeats.some(
                entry => entry.beatId === predicate.beatId
            );
        }

        return predicate.not ? !result : result;
    }

    function getWeight(containerId, placements = state.placements) {
        return definition.entities.reduce((total, entity) =>
            placements[entity.id] === containerId
                ? total + Number(entity.resourceCost)
                : total,
        0);
    }

    function deriveRuleViolations(currentState = state) {
        return (definition.rules || []).flatMap(rule => {
            if (rule.type !== 'requires') return [];

            const sourceCarried = evaluatePredicate(
                {
                    type: 'entity-carried',
                    entityId: rule.sourceEntityId
                },
                currentState
            );
            const requiredCarried = evaluatePredicate(
                {
                    type: 'entity-carried',
                    entityId: rule.requiredEntityId
                },
                currentState
            );

            return sourceCarried && !requiredCarried
                ? [{ ruleId: rule.id, label: rule.label }]
                : [];
        });
    }

    function deriveGoals(currentState = state) {
        const world = deriveWorld(currentState);

        return definition.goals.map(goal => ({
            ...goal,
            active: world.activeGoals.has(goal.id),
            met: world.activeGoals.has(goal.id)
                ? evaluatePredicate(goal.predicate, currentState)
                : null
        }));
    }

    function getLastCommit() {
        return state.commits[state.commits.length - 1] || null;
    }

    function getLastReveal() {
        const entry = state.firedBeats[state.firedBeats.length - 1];
        if (!entry) return null;

        const beat = getBeat(entry.beatId);
        const variant = getVariant(entry);

        return beat && variant
            ? { entry, beat, variant }
            : null;
    }

    function canManipulate() {
        return state.phase === 'planning' || state.phase === 'revising';
    }

    function sourceLocked(entityId) {
        if (state.phase === 'planning') return false;

        const source = state.placements[entityId];

        if (
            source === 'cut' &&
            definition.commitment?.lockCutAfterCommit
        ) {
            return true;
        }

        return Boolean(getContainer(source)?.lockAfterCommit);
    }

    function destinationAvailable(destinationId) {
        if (destinationId === 'cut') return true;
        if (destinationId === 'pool') return state.phase === 'planning';

        const container = getContainer(destinationId);
        if (!container) return false;

        if (deriveWorld().availability[destinationId] === false) {
            return false;
        }

        if (state.phase !== 'planning' && container.lockAfterCommit) {
            return false;
        }

        return true;
    }

    function placementError(entityId, destinationId) {
        if (!canManipulate()) return 'The board is locked in this phase.';
        if (!getEntity(entityId)) return 'That item is not available.';
        if (sourceLocked(entityId)) return 'That item is locked by the committed plan.';
        if (!destinationAvailable(destinationId)) return 'That destination is not available now.';
        if (state.placements[entityId] === destinationId) return null;

        const container = getContainer(destinationId);

        if (hasResourceLimit(container)) {
            const nextWeight =
                getWeight(destinationId) +
                Number(getEntity(entityId).resourceCost);

            if (nextWeight > Number(container.resourceLimit) + 0.0001) {
                return container.name + ' cannot carry that much weight.';
            }
        }

        return null;
    }

    function chooseVariant(beat, currentState, placements) {
        return beat.variants.find(variant =>
            (variant.when || []).every(predicate =>
                evaluatePredicate(predicate, currentState, placements)
            )
        ) || null;
    }

    function reduce(currentState, action) {
        if (action.type === 'RESTART') return createDefaultState();

        const next = clone(currentState);

        if (action.type === 'PLACE_ENTITY') {
            next.history.push({
                placements: clone(currentState.placements)
            });
            next.history = next.history.slice(-HISTORY_LIMIT);
            next.placements[action.entityId] = action.destinationId;
        }

        if (action.type === 'UNDO') {
            const previous = next.history.pop();
            if (previous?.placements) next.placements = previous.placements;
        }

        if (action.type === 'COMMIT_PLAN') {
            Object.keys(next.placements).forEach(entityId => {
                if (next.placements[entityId] === 'pool') {
                    next.placements[entityId] = 'cut';
                }
            });

            next.commits.push({
                id: 'commit-' + (next.commits.length + 1),
                placements: clone(next.placements),
                declaredStake: next.declaredStake,
                committedAt: Date.now()
            });
            next.history = [];
            next.phase = 'committed';
        }

        if (action.type === 'REVEAL_BEAT') {
            const fired = new Set(next.firedBeats.map(item => item.beatId));
            const beat = definition.beats.find(item => !fired.has(item.id));
            const commit = next.commits[next.commits.length - 1];

            if (beat && commit) {
                const variant = chooseVariant(
                    beat,
                    currentState,
                    commit.placements
                );

                if (variant) {
                    next.firedBeats.push({
                        beatId: beat.id,
                        variantId: variant.id,
                        revealedAt: Date.now()
                    });
                    next.history = [];
                    next.phase = 'reacting';
                }
            }
        }

        if (action.type === 'OPEN_REVISION') {
            next.history = [];
            next.phase = 'revising';
        }

        if (action.type === 'RESOLVE_NOW') {
            next.history = [];
            next.phase = 'resolved';
            next.completion = { resolvedAt: Date.now() };
        }

        return next;
    }

    function actionError(action) {
        if (action.type === 'PLACE_ENTITY') {
            return placementError(action.entityId, action.destinationId);
        }

        if (action.type === 'UNDO') {
            if (!canManipulate()) return 'Undo is not available in this phase.';
            if (!state.history.length) return 'There is nothing to undo.';
        }

        if (action.type === 'COMMIT_PLAN') {
            if (state.phase !== 'planning') return 'This plan is already committed.';

            const simulated = reduce(state, { type: 'COMMIT_PLAN' });
            const violation = deriveRuleViolations(simulated)[0];
            if (violation) return violation.label;
        }

        if (action.type === 'REVEAL_BEAT') {
            if (state.phase !== 'committed') {
                return 'Commit the plan before revealing a change.';
            }

            if (
                !definition.beats.some(beat =>
                    !state.firedBeats.some(item => item.beatId === beat.id)
                )
            ) {
                return 'There are no more prepared changes.';
            }
        }

        if (
            action.type === 'OPEN_REVISION' &&
            state.phase !== 'reacting'
        ) {
            return 'Revision is not ready yet.';
        }

        if (action.type === 'RESOLVE_NOW') {
            if (state.phase === 'planning') {
                return 'Commit the plan before resolving it.';
            }
            if (state.phase === 'resolved') {
                return 'This run is already resolved.';
            }
        }

        return null;
    }

    function dispatch(action) {
        const error = actionError(action);
        if (error) {
            toast(error);
            return false;
        }

        const before = JSON.stringify(state);
        state = reduce(state, action);

        if (action.type === 'PLACE_ENTITY' || action.type === 'UNDO') {
            selectedEntityId = null;
        }

        if (before === JSON.stringify(state)) {
            render();
            return false;
        }

        started = true;
        persist();
        touchActivity();
        render();
        return true;
    }

    function readWrapper() {
        if (!Bridge || !session || !definition) return null;

        try {
            const registry = Bridge.readRegistry();
            return (
                (registry.sessionStates || {})[session.id] || {}
            )[definition.registry.registryId] || null;
        } catch {
            return null;
        }
    }

    function persist() {
        if (!Bridge || !session || !state) return;

        const complete = state.phase === 'resolved';
        const now = Date.now();

        wrapper = Bridge.upsertSessionState(
            session.id,
            definition.registry.registryId,
            {
                status: complete ? 'complete' : 'in-progress',
                completedAt: complete
                    ? (wrapper?.completedAt || now)
                    : null,
                currentLabel: PHASE_LABELS[state.phase],
                progress: {
                    covered: complete ? 1 : 0,
                    total: 1
                },
                engineId: ENGINE_ID,
                engineVersion: ENGINE_VERSION,
                definitionId: definition.definitionId,
                definitionHash: definition.definitionHash,
                engineState: clone(state),
                lastOpenedAt: now,
                lastTouchedAt: now
            }
        );
    }

    function touchActivity() {
        Bridge?.touchRecentActivity({
            sessionId: session.id,
            registryId: definition.registry.registryId,
            title: definition.registry.title,
            launchUrl: window.location.href
        });
    }

    function registerDefinition() {
        Bridge.upsertItem({
            ...definition.registry,
            launchUrl:
                window.location.href.split('?')[0] +
                '?game=' +
                encodeURIComponent(definition.definitionId)
        });
    }

    function loadSessionState() {
        wrapper = readWrapper();
        restoreBlocked = false;
        selectedEntityId = null;
        state = normalizeState(wrapper?.engineState || null);
    }

    function resourceText(value) {
        const decimals = Number(definition.resource?.decimals) || 0;
        return Number(value).toFixed(decimals) +
            (definition.resource?.unit || '');
    }

    function destinationName(id) {
        if (id === 'pool') return 'Available';
        if (id === 'cut') return 'Cut';
        return getContainer(id)?.shortName || getContainer(id)?.name || id;
    }

    function entitiesAt(destinationId) {
        return definition.entities.filter(
            entity => state.placements[entity.id] === destinationId
        );
    }

    function renderEntity(entity) {
        const selected = selectedEntityId === entity.id;
        const locked = sourceLocked(entity.id);
        const commit = getLastCommit();
        const previous = commit?.placements?.[entity.id] || null;
        const changed =
            state.phase === 'revising' &&
            previous &&
            previous !== state.placements[entity.id];

        return '<button class="spp-entity' +
            (selected ? ' is-selected' : '') +
            (locked ? ' is-locked' : '') +
            (changed ? ' is-changed' : '') +
            '" type="button" data-entity-id="' + esc(entity.id) + '"' +
            ' aria-pressed="' + String(selected) + '"' +
            (locked ? ' aria-disabled="true"' : '') + '>' +
            '<span class="spp-entity-copy">' +
            '<span class="spp-entity-name">' + esc(entity.name) + '</span>' +
            '<span class="spp-entity-description">' +
            esc(entity.description || '') +
            '</span>' +
            (changed
                ? '<span class="spp-entity-previous">was ' +
                    esc(destinationName(previous)) +
                    '</span>'
                : '') +
            '</span>' +
            '<span class="spp-entity-cost">' +
            esc(resourceText(entity.resourceCost)) +
            '</span>' +
            '</button>';
    }

    function renderContainer(container) {
        const world = deriveWorld();
        const items = entitiesAt(container.id);
        const unavailable = world.availability[container.id] === false;
        const locked = state.phase !== 'planning' && container.lockAfterCommit;
        const canTarget =
            canManipulate() &&
            selectedEntityId &&
            destinationAvailable(container.id);

        const capacity = hasResourceLimit(container)
            ? resourceText(getWeight(container.id)) +
                ' / ' + resourceText(container.resourceLimit)
            : items.length + (items.length === 1 ? ' item' : ' items');

        return '<section class="spp-zone' +
            (unavailable ? ' is-unavailable' : '') +
            (locked ? ' is-locked' : '') + '">' +
            '<div class="spp-zone-header"><div>' +
            '<h3>' + esc(container.name) + '</h3>' +
            '<p>' + esc(container.description || '') + '</p>' +
            '</div><div class="spp-zone-meta">' +
            '<span class="spp-zone-resource">' + esc(capacity) + '</span>' +
            (unavailable
                ? '<span class="spp-zone-status spp-zone-status--danger">Unavailable</span>'
                : locked
                    ? '<span class="spp-zone-status">Locked</span>'
                    : '') +
            '</div></div>' +
            '<div class="spp-zone-items">' +
            (items.length
                ? items.map(renderEntity).join('')
                : '<div class="spp-zone-empty">Nothing here yet</div>') +
            '</div>' +
            '<button class="spp-target" type="button"' +
            ' data-destination-id="' + esc(container.id) + '"' +
            (canTarget ? '' : ' disabled') + '>' +
            (selectedEntityId ? 'Move selected here' : 'Select an item first') +
            '</button>' +
            '</section>';
    }

    function renderRail(id, title, description) {
        const items = entitiesAt(id);
        const canTarget =
            canManipulate() &&
            selectedEntityId &&
            destinationAvailable(id);
        const locked =
            id === 'cut' &&
            state.phase !== 'planning' &&
            definition.commitment?.lockCutAfterCommit;

        return '<section class="spp-rail' + (locked ? ' is-locked' : '') + '">' +
            '<div class="spp-rail-heading"><div>' +
            '<h3>' + esc(title) + '</h3>' +
            '<p>' + esc(description) + '</p>' +
            '</div><button class="spp-target spp-target--compact" type="button"' +
            ' data-destination-id="' + esc(id) + '"' +
            (canTarget ? '' : ' disabled') + '>' +
            (id === 'cut' ? 'Cut selected' : 'Return selected') +
            '</button></div>' +
            '<div class="spp-rail-items">' +
            (items.length
                ? items.map(renderEntity).join('')
                : '<span class="spp-rail-empty">None</span>') +
            '</div></section>';
    }

    function renderBrief() {
        const violations = deriveRuleViolations();
        const goals = deriveGoals();

        const rules = (definition.rules || []).map(rule => {
            const violated = violations.some(item => item.ruleId === rule.id);
            return '<li class="spp-brief-item' +
                (violated ? ' is-violated' : '') + '">' +
                '<span class="spp-brief-status">' +
                (violated ? '!' : '•') +
                '</span><span>' + esc(rule.label) + '</span></li>';
        }).join('');

        const goalRows = goals.map(goal => {
            const cls = !goal.active
                ? ' is-inactive'
                : goal.met
                    ? ' is-met'
                    : ' is-unmet';
            const marker = !goal.active ? '○' : goal.met ? '✓' : '–';

            return '<li class="spp-brief-item' + cls + '">' +
                '<span class="spp-brief-status">' + marker + '</span>' +
                '<span>' + esc(goal.label) + '</span></li>';
        }).join('');

        const stakes = (definition.stakes || []).map(stake =>
            '<article class="spp-stake">' +
            '<span class="spp-stake-holder">' + esc(stake.holder) + '</span>' +
            '<p>“' + esc(stake.claim) + '”</p></article>'
        ).join('');

        return '<aside class="spp-brief">' +
            '<div class="spp-brief-section">' +
            '<span class="spp-brief-label">Rules</span><ul>' + rules + '</ul></div>' +
            '<div class="spp-brief-section">' +
            '<span class="spp-brief-label">Goals</span><ul>' + goalRows + '</ul></div>' +
            '<div class="spp-brief-section">' +
            '<span class="spp-brief-label">Stake</span>' + stakes + '</div>' +
            '</aside>';
    }

    function renderReveal() {
        const reveal = getLastReveal();
        if (!reveal) return '';

        return '<div class="spp-reveal" role="status">' +
            '<span class="spp-reveal-kicker">' + esc(reveal.beat.label) + '</span>' +
            '<p>' + esc(reveal.variant.reveal) + '</p></div>';
    }

    function renderControls() {
        const byPhase = {
            planning: [
                ['Undo', 'undo', true, !state.history.length],
                ['Commit plan', 'commit', false, false]
            ],
            committed: [
                ['Reveal change', 'reveal', false, false],
                ['Resolve now', 'resolve', true, false]
            ],
            reacting: [
                ['Open revision', 'open-revision', false, false],
                ['Resolve now', 'resolve', true, false]
            ],
            revising: [
                ['Undo', 'undo', true, !state.history.length],
                ['Resolve plan', 'resolve', false, false]
            ],
            resolved: [
                ['Start again', 'restart', false, false]
            ]
        };

        const message = selectedEntityId
            ? 'Selected: ' + getEntity(selectedEntityId).name
            : state.phase === 'reacting'
                ? 'The board is locked. Discuss what the change means.'
                : canManipulate()
                    ? 'Select an item, then choose its destination.'
                    : 'The committed position is locked.';

        const buttons = byPhase[state.phase].map(
            ([label, action, secondary, disabled]) =>
                '<button class="spp-control-btn' +
                (secondary ? ' spp-control-btn--secondary' : '') +
                '" type="button" data-engine-action="' + action + '"' +
                (disabled ? ' disabled' : '') + '>' +
                esc(label) + '</button>'
        ).join('');

        return '<aside class="spp-controls">' +
            '<div class="spp-phase-card">' +
            '<span class="spp-phase-label">Phase</span>' +
            '<strong>' + esc(PHASE_LABELS[state.phase]) + '</strong>' +
            '<p>' + esc(message) + '</p></div>' +
            '<div class="spp-control-actions">' + buttons + '</div>' +
            '<button class="spp-reset-link" type="button"' +
            ' data-engine-action="restart">Restart run</button>' +
            '</aside>';
    }

    function renderOutcome() {
        if (state.phase !== 'resolved') return '';

        const goals = deriveGoals().filter(goal => goal.active);
        const lines = (definition.resolution?.outcomeLines || []).filter(line =>
            (line.when || []).every(predicate => evaluatePredicate(predicate))
        );

        return '<div class="spp-outcome">' +
            '<span class="spp-outcome-kicker">Final position</span>' +
            '<h2>What did the plan become?</h2>' +
            '<p>' + esc(definition.resolution?.prompt || '') + '</p>' +
            '<div class="spp-outcome-goals">' +
            goals.map(goal =>
                '<span class="spp-outcome-goal' +
                (goal.met ? ' is-met' : ' is-unmet') + '">' +
                (goal.met ? '✓ ' : '○ ') + esc(goal.label) + '</span>'
            ).join('') +
            '</div>' +
            lines.map(line =>
                '<p class="spp-outcome-line">' + esc(line.text) + '</p>'
            ).join('') +
            '<button class="spp-control-btn spp-outcome-restart"' +
            ' type="button" data-engine-action="restart">Start again</button>' +
            '</div>';
    }

    function renderBoard() {
        return '<div class="spp-board">' +
            '<div class="spp-board-zones">' +
            definition.containers.map(renderContainer).join('') +
            '</div><div class="spp-board-rails">' +
            renderRail(
                'pool',
                'Available',
                'Items not placed yet. Anything still here is Cut when you commit.'
            ) +
            renderRail(
                'cut',
                state.phase === 'planning' ? 'Cut' : 'Left Behind',
                state.phase === 'planning'
                    ? 'Items you are choosing not to keep in the plan.'
                    : 'These choices are now part of the committed plan history.'
            ) +
            '</div></div>';
    }

    function render() {
        const stage = document.getElementById('shared-plan-stage');
        const phase = document.getElementById('shared-plan-phase');
        if (!stage) return;

        if (phase) phase.textContent = PHASE_LABELS[state.phase];

        stage.innerHTML =
            '<div class="spp-stage-shell">' +
            '<div class="spp-stage-topline"><div>' +
            '<span class="spp-stage-eyebrow">' +
            esc(definition.identity.eyebrow || '') + '</span>' +
            '<h1>' + esc(definition.identity.title) + '</h1></div>' +
            '<p>' + esc(definition.identity.premise) + '</p></div>' +
            renderReveal() +
            '<div class="spp-stage-grid">' +
            renderBrief() + renderBoard() + renderControls() +
            '</div>' +
            renderOutcome() +
            '</div>';
    }

    function renderLaunch() {
        const title = document.getElementById('launch-title');
        const premise = document.getElementById('launch-premise');
        const button = document.getElementById('launch-button');
        const warning = document.getElementById('launch-warning');

        if (title) title.textContent = definition.identity.title;
        if (premise) premise.textContent = definition.identity.premise;

        if (warning) {
            warning.hidden = !restoreBlocked;
            warning.textContent = restoreBlocked
                ? 'This saved run belongs to an older Definition. Start a fresh run to continue safely.'
                : '';
        }

        if (button) {
            button.textContent = restoreBlocked
                ? 'Start fresh'
                : wrapper?.status === 'complete'
                    ? 'Review outcome'
                    : wrapper
                        ? 'Continue expedition'
                        : 'Begin expedition';
        }
    }

    function showGame() {
        document.getElementById('launch-screen').hidden = true;
        document.getElementById('game-screen').hidden = false;
        render();
    }

    function showLaunch() {
        document.getElementById('launch-screen').hidden = false;
        document.getElementById('game-screen').hidden = true;
        renderLaunch();
    }

    function startGame() {
        if (restoreBlocked) {
            state = createDefaultState();
            wrapper = null;
            restoreBlocked = false;
        }

        started = true;
        persist();
        touchActivity();
        window.AtlasAnalytics?.arcadeGameStart(definition.definitionId);
        showGame();
    }

    function toast(message) {
        const node = document.getElementById('shared-plan-toast');
        if (!node) return;

        node.textContent = message;
        node.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(
            () => node.classList.remove('is-visible'),
            2600
        );
    }

    function handleEngineAction(action) {
        const map = {
            undo: 'UNDO',
            commit: 'COMMIT_PLAN',
            reveal: 'REVEAL_BEAT',
            'open-revision': 'OPEN_REVISION',
            resolve: 'RESOLVE_NOW'
        };

        if (action === 'restart') {
            const confirmed = window.confirm(
                'Restart ' + definition.identity.title +
                '? This clears the current run for this learner.'
            );
            if (!confirmed) return;

            selectedEntityId = null;
            dispatch({ type: 'RESTART' });
            return;
        }

        if (map[action]) dispatch({ type: map[action] });
    }

    function handleClick(event) {
        if (event.target.closest('#launch-button')) {
            startGame();
            return;
        }

        const entityButton = event.target.closest('[data-entity-id]');
        if (entityButton) {
            const entityId = entityButton.dataset.entityId;
            if (sourceLocked(entityId)) return;
            if (!canManipulate()) {
                toast('The board is locked in this phase.');
                return;
            }

            selectedEntityId = selectedEntityId === entityId
                ? null
                : entityId;
            render();
            return;
        }

        const destination = event.target.closest('[data-destination-id]');
        if (destination && selectedEntityId) {
            dispatch({
                type: 'PLACE_ENTITY',
                entityId: selectedEntityId,
                destinationId: destination.dataset.destinationId
            });
            return;
        }

        const action = event.target.closest('[data-engine-action]');
        if (action) handleEngineAction(action.dataset.engineAction);
    }

    function mountChrome() {
        window.AtlasSessionPanel?.mount({
            root: '#atlas-session-panel-root',
            initialView: 'manage'
        });

        window.ArcadeGameChrome?.mountLanding({
            root: '#launch-screen',
            onBeforeReturn: () => {
                if (started) persist();
            }
        });

        window.ArcadeGameChrome?.mountGame({
            root: '#shared-plan-header',
            returnRoot: '#arcade-game-return-root',
            actionsRoot: '#arcade-game-actions-root',
            onBeforeReturn: () => {
                if (started) persist();
            }
        });
    }

    function fatal(errors) {
        const launch = document.getElementById('launch-screen');
        launch.innerHTML =
            '<div class="spp-fatal">' +
            '<span class="spp-launch-kicker">Engine One</span>' +
            '<h1>Can’t start this game</h1>' +
            '<p>The hand-authored Definition did not pass V1 mechanical checks.</p>' +
            '<ul>' + errors.map(error => '<li>' + esc(error) + '</li>').join('') + '</ul>' +
            '<a href="../index.html">Back to Arcade</a>' +
            '</div>';
    }

    function init() {
        if (!Bridge) {
            fatal(['AtlasBridge did not load.']);
            return;
        }

        definition = Definitions[getDefinitionId()] || null;
        if (!definition) {
            fatal(['The requested Game Definition is not registered.']);
            return;
        }

        const errors = validateDefinition(definition);
        if (errors.length) {
            fatal(errors);
            return;
        }

        document.documentElement.dataset.theme = Bridge.readAppearanceMode();
        session = Bridge.readActiveSession();
        registerDefinition();
        loadSessionState();
        mountChrome();
        showLaunch();
        document.addEventListener('click', handleClick);

        window.addEventListener('atlas:appearance-change', event => {
            document.documentElement.dataset.theme =
                event.detail?.mode || Bridge.readAppearanceMode();
        });

        window.addEventListener('atlas:session-change', event => {
            if (started) persist();

            const wasPlaying =
                !document.getElementById('game-screen').hidden;

            session = event.detail?.session || Bridge.readActiveSession();
            loadSessionState();
            started = Boolean(wrapper) || wasPlaying;

            if (wasPlaying) showGame();
            else showLaunch();
        });

        window.addEventListener('pagehide', () => {
            if (started) persist();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

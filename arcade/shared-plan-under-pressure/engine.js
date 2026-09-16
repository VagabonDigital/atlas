/* ============================================================
   SHARED PLAN UNDER PRESSURE — ENGINE V1
   Deterministic runtime for the first Arcade interaction engine.

   V1 owns:
   - Definition validation
   - canonical Session state
   - reducer/state transitions
   - Rules / Goals / Stakes presentation
   - authored perturbation beats
   - rendering and persistence

   V1 does not own:
   - AI generation
   - generic Arcade Core
   - arbitrary expressions
   - arbitrary generated layout or code
   ============================================================ */

(function () {
    'use strict';

    const Bridge = window.AtlasBridge || null;
    const Definitions = window.SharedPlanDefinitions || {};
    const ENGINE_ID = 'shared-plan-under-pressure';
    const ENGINE_VERSION = 1;
    const HISTORY_LIMIT = 20;
    const SYSTEM_DESTINATIONS = ['pool', 'cut'];
    const CARRIED_CONTAINER_IDS = ['pack', 'sled'];
    const SUPPORTED_PREDICATES = [
        'entity-carried',
        'all-entities-carried',
        'beat-fired'
    ];
    const SUPPORTED_EFFECTS = [
        'set-container-availability',
        'activate-goal'
    ];
    const SUPPORTED_RULES = [
        'requires'
    ];
    const PHASE_LABELS = {
        planning: 'Planning',
        committed: 'Committed',
        reacting: 'Reacting',
        revising: 'Revising',
        resolved: 'Resolved'
    };

    let definition = null;
    let session = null;
    let state = null;
    let selectedEntityId = null;
    let gameStarted = false;
    let restoreBlocked = false;
    let lastPersistedWrapper = null;
    let toastTimer = null;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getDefinitionId() {
        const requested = new URLSearchParams(
            window.location.search
        ).get('game');

        return requested || 'twenty-kilos';
    }

    function getEntity(entityId) {
        return definition.entities.find(
            entity => entity.id === entityId
        ) || null;
    }

    function getContainer(containerId) {
        return definition.containers.find(
            container => container.id === containerId
        ) || null;
    }

    function getGoal(goalId) {
        return definition.goals.find(
            goal => goal.id === goalId
        ) || null;
    }

    function getBeat(beatId) {
        return definition.beats.find(
            beat => beat.id === beatId
        ) || null;
    }

    function validatePredicate(predicate, context) {
        if (!predicate || typeof predicate !== 'object') {
            return context + ' has an invalid predicate.';
        }

        if (!SUPPORTED_PREDICATES.includes(predicate.type)) {
            return context + ' uses unsupported predicate "' +
                String(predicate.type || '') + '".';
        }

        if (
            predicate.type === 'entity-carried' &&
            !getEntity(predicate.entityId)
        ) {
            return context + ' references unknown entity "' +
                String(predicate.entityId || '') + '".';
        }

        if (predicate.type === 'all-entities-carried') {
            const ids = Array.isArray(predicate.entityIds)
                ? predicate.entityIds
                : [];

            if (
                !ids.length ||
                ids.some(entityId => !getEntity(entityId))
            ) {
                return context + ' has invalid entity references.';
            }
        }

        if (
            predicate.type === 'beat-fired' &&
            !getBeat(predicate.beatId)
        ) {
            return context + ' references unknown beat "' +
                String(predicate.beatId || '') + '".';
        }

        return null;
    }

    function validateDefinition(candidate) {
        const errors = [];

        if (!candidate || typeof candidate !== 'object') {
            return ['Definition is missing.'];
        }

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

        const containerIds = new Set();
        const entityIds = new Set();
        const goalIds = new Set();
        const beatIds = new Set();

        (candidate.containers || []).forEach(container => {
            if (!container?.id || containerIds.has(container.id)) {
                errors.push('Container IDs must be unique and non-empty.');
                return;
            }

            containerIds.add(container.id);
        });

        (candidate.entities || []).forEach(entity => {
            if (!entity?.id || entityIds.has(entity.id)) {
                errors.push('Entity IDs must be unique and non-empty.');
                return;
            }

            entityIds.add(entity.id);

            if (!entity.name || Number(entity.resourceCost) < 0) {
                errors.push(
                    'Entity "' + entity.id + '" has invalid content.'
                );
            }
        });

        (candidate.goals || []).forEach(goal => {
            if (!goal?.id || goalIds.has(goal.id)) {
                errors.push('Goal IDs must be unique and non-empty.');
                return;
            }

            goalIds.add(goal.id);
        });

        (candidate.beats || []).forEach(beat => {
            if (!beat?.id || beatIds.has(beat.id)) {
                errors.push('Beat IDs must be unique and non-empty.');
                return;
            }

            beatIds.add(beat.id);
        });

        if (containerIds.has('pool') || containerIds.has('cut')) {
            errors.push('Pool and Cut are reserved engine destinations.');
        }

        if (!entityIds.size || entityIds.size > 9) {
            errors.push('V1 requires between 1 and 9 entities.');
        }

        (candidate.rules || []).forEach(rule => {
            if (!SUPPORTED_RULES.includes(rule.type)) {
                errors.push(
                    'Rule "' + String(rule.id || '') +
                    '" uses unsupported type "' +
                    String(rule.type || '') + '".'
                );
                return;
            }

            if (
                rule.type === 'requires' &&
                (
                    !entityIds.has(rule.sourceEntityId) ||
                    !entityIds.has(rule.requiredEntityId)
                )
            ) {
                errors.push(
                    'Rule "' + String(rule.id || '') +
                    '" has broken entity references.'
                );
            }
        });

        (candidate.goals || []).forEach(goal => {
            const error = validatePredicate(
                goal.predicate,
                'Goal "' + String(goal.id || '') + '"'
            );

            if (error) errors.push(error);
        });

        (candidate.beats || []).forEach(beat => {
            const variants = Array.isArray(beat.variants)
                ? beat.variants
                : [];

            if (!variants.length) {
                errors.push(
                    'Beat "' + beat.id + '" needs at least one variant.'
                );
                return;
            }

            const fallback = variants[variants.length - 1];

            if (
                !Array.isArray(fallback.when) ||
                fallback.when.length !== 0
            ) {
                errors.push(
                    'Beat "' + beat.id +
                    '" needs an unconditional final fallback.'
                );
            }

            variants.forEach(variant => {
                (variant.when || []).forEach(predicate => {
                    const error = validatePredicate(
                        predicate,
                        'Beat "' + beat.id + '" variant "' +
                            String(variant.id || '') + '"'
                    );

                    if (error) errors.push(error);
                });

                (variant.effects || []).forEach(effect => {
                    if (!SUPPORTED_EFFECTS.includes(effect.type)) {
                        errors.push(
                            'Beat "' + beat.id +
                            '" uses unsupported effect "' +
                            String(effect.type || '') + '".'
                        );
                        return;
                    }

                    if (
                        effect.type === 'set-container-availability' &&
                        !containerIds.has(effect.containerId)
                    ) {
                        errors.push(
                            'Beat "' + beat.id +
                            '" references unknown container "' +
                            String(effect.containerId || '') + '".'
                        );
                    }

                    if (
                        effect.type === 'activate-goal' &&
                        !goalIds.has(effect.goalId)
                    ) {
                        errors.push(
                            'Beat "' + beat.id +
                            '" references unknown goal "' +
                            String(effect.goalId || '') + '".'
                        );
                    }
                });
            });
        });

        (candidate.resolution?.outcomeLines || []).forEach(
            (line, index) => {
                (line.when || []).forEach(predicate => {
                    const error = validatePredicate(
                        predicate,
                        'Outcome line ' + (index + 1)
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
            ...clone(saved)
        };

        if (!PHASE_LABELS[next.phase]) {
            next.phase = 'planning';
        }

        definition.entities.forEach(entity => {
            const destination = next.placements?.[entity.id];
            const valid =
                SYSTEM_DESTINATIONS.includes(destination) ||
                Boolean(getContainer(destination));

            if (!valid) {
                next.placements[entity.id] = 'pool';
            }
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

    function getFiredBeatVariant(entry) {
        const beat = getBeat(entry.beatId);

        if (!beat) return null;

        const variant = (beat.variants || []).find(
            item => item.id === entry.variantId
        );

        return variant || null;
    }

    function deriveWorld(currentState) {
        const availability = {};
        const activeGoalIds = new Set();

        definition.containers.forEach(container => {
            availability[container.id] = true;
        });

        definition.goals.forEach(goal => {
            if (goal.status === 'active') {
                activeGoalIds.add(goal.id);
            }
        });

        currentState.firedBeats.forEach(entry => {
            const variant = getFiredBeatVariant(entry);

            if (!variant) return;

            (variant.effects || []).forEach(effect => {
                if (effect.type === 'set-container-availability') {
                    availability[effect.containerId] =
                        Boolean(effect.available);
                }

                if (effect.type === 'activate-goal') {
                    activeGoalIds.add(effect.goalId);
                }
            });
        });

        return {
            availability,
            activeGoalIds
        };
    }

    function isCarriedDestination(destinationId, world) {
        return CARRIED_CONTAINER_IDS.includes(destinationId) &&
            world.availability[destinationId] !== false;
    }

    function evaluatePredicate(
        predicate,
        currentState = state,
        placementsOverride = null
    ) {
        if (!predicate) return false;

        const placements = placementsOverride || currentState.placements;
        const world = deriveWorld(currentState);
        let result = false;

        if (predicate.type === 'entity-carried') {
            result = isCarriedDestination(
                placements[predicate.entityId],
                world
            );
        }

        if (predicate.type === 'all-entities-carried') {
            result = (predicate.entityIds || []).every(entityId =>
                isCarriedDestination(
                    placements[entityId],
                    world
                )
            );
        }

        if (predicate.type === 'beat-fired') {
            result = currentState.firedBeats.some(
                entry => entry.beatId === predicate.beatId
            );
        }

        return predicate.not ? !result : result;
    }

    function getContainerWeight(
        containerId,
        placements = state.placements
    ) {
        return definition.entities.reduce((total, entity) => {
            return placements[entity.id] === containerId
                ? total + Number(entity.resourceCost || 0)
                : total;
        }, 0);
    }

    function deriveRuleViolations(currentState = state) {
        const violations = [];

        definition.rules.forEach(rule => {
            if (rule.type !== 'requires') return;

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

            if (sourceCarried && !requiredCarried) {
                violations.push({
                    ruleId: rule.id,
                    label: rule.label
                });
            }
        });

        return violations;
    }

    function deriveGoals(currentState = state) {
        const world = deriveWorld(currentState);

        return definition.goals.map(goal => {
            const active = world.activeGoalIds.has(goal.id);

            return {
                ...goal,
                active,
                met: active
                    ? evaluatePredicate(goal.predicate, currentState)
                    : null
            };
        });
    }

    function getLastCommit() {
        if (!state.commits.length) return null;
        return state.commits[state.commits.length - 1];
    }

    function getLastReveal() {
        if (!state.firedBeats.length) return null;

        const entry = state.firedBeats[state.firedBeats.length - 1];
        const beat = getBeat(entry.beatId);
        const variant = getFiredBeatVariant(entry);

        if (!beat || !variant) return null;

        return {
            ...entry,
            beat,
            variant
        };
    }

    function isSourceLocked(entityId, currentState = state) {
        if (currentState.phase === 'planning') return false;

        const source = currentState.placements[entityId];

        if (
            source === 'cut' &&
            definition.commitment?.lockCutAfterCommit
        ) {
            return true;
        }

        const sourceContainer = getContainer(source);

        return Boolean(
            sourceContainer?.lockAfterCommit
        );
    }

    function isDestinationAvailable(destinationId, currentState = state) {
        if (destinationId === 'cut') return true;

        if (destinationId === 'pool') {
            return currentState.phase === 'planning';
        }

        const container = getContainer(destinationId);
        if (!container) return false;

        const world = deriveWorld(currentState);

        if (world.availability[destinationId] === false) {
            return false;
        }

        if (
            currentState.phase !== 'planning' &&
            container.lockAfterCommit
        ) {
            return false;
        }

        return true;
    }

    function canManipulate(currentState = state) {
        return ['planning', 'revising'].includes(currentState.phase);
    }

    function getPlacementError(entityId, destinationId) {
        if (!canManipulate()) {
            return 'The board is locked in this phase.';
        }

        if (!getEntity(entityId)) {
            return 'That item is not available.';
        }

        if (isSourceLocked(entityId)) {
            return 'That item was left behind when the plan was committed.';
        }

        if (!isDestinationAvailable(destinationId)) {
            return 'That destination is not available now.';
        }

        if (state.placements[entityId] === destinationId) {
            return null;
        }

        const container = getContainer(destinationId);

        if (
            container &&
            Number.isFinite(Number(container.resourceLimit))
        ) {
            const entity = getEntity(entityId);
            const existingWeight = getContainerWeight(destinationId);
            const alreadyThere =
                state.placements[entityId] === destinationId;

            const nextWeight = alreadyThere
                ? existingWeight
                : existingWeight + Number(entity.resourceCost || 0);

            if (nextWeight > Number(container.resourceLimit) + 0.0001) {
                return container.name + ' cannot carry that much weight.';
            }
        }

        return null;
    }

    function chooseBeatVariant(beat, currentState, placements) {
        return (beat.variants || []).find(variant => {
            return (variant.when || []).every(predicate =>
                evaluatePredicate(
                    predicate,
                    currentState,
                    placements
                )
            );
        }) || null;
    }

    function reduce(currentState, action) {
        if (action.type === 'RESTART') {
            return createDefaultState();
        }

        const next = clone(currentState);

        if (action.type === 'PLACE_ENTITY') {
            next.history.push({
                placements: clone(currentState.placements)
            });

            next.history = next.history.slice(-HISTORY_LIMIT);
            next.placements[action.entityId] = action.destinationId;
            return next;
        }

        if (action.type === 'UNDO') {
            const previous = next.history.pop();

            if (previous?.placements) {
                next.placements = previous.placements;
            }

            return next;
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
            return next;
        }

        if (action.type === 'REVEAL_BEAT') {
            const firedIds = new Set(
                next.firedBeats.map(entry => entry.beatId)
            );

            const beat = definition.beats.find(
                candidate => !firedIds.has(candidate.id)
            );

            const lastCommit = next.commits[next.commits.length - 1];

            if (!beat || !lastCommit) return next;

            const variant = chooseBeatVariant(
                beat,
                currentState,
                lastCommit.placements
            );

            if (!variant) return next;

            next.firedBeats.push({
                beatId: beat.id,
                variantId: variant.id,
                revealedAt: Date.now()
            });

            next.history = [];
            next.phase = 'reacting';
            return next;
        }

        if (action.type === 'OPEN_REVISION') {
            next.history = [];
            next.phase = 'revising';
            return next;
        }

        if (action.type === 'RESOLVE_NOW') {
            next.history = [];
            next.phase = 'resolved';
            next.completion = {
                resolvedAt: Date.now()
            };
            return next;
        }

        return next;
    }

    function getActionError(action) {
        if (action.type === 'PLACE_ENTITY') {
            return getPlacementError(
                action.entityId,
                action.destinationId
            );
        }

        if (action.type === 'UNDO') {
            if (!canManipulate()) {
                return 'Undo is not available in this phase.';
            }

            if (!state.history.length) {
                return 'There is nothing to undo.';
            }
        }

        if (action.type === 'COMMIT_PLAN') {
            if (state.phase !== 'planning') {
                return 'This plan is already committed.';
            }

            const simulated = reduce(
                state,
                { type: 'COMMIT_PLAN' }
            );

            const violations = deriveRuleViolations(simulated);

            if (violations.length) {
                return violations[0].label;
            }
        }

        if (action.type === 'REVEAL_BEAT') {
            if (state.phase !== 'committed') {
                return 'Commit the plan before revealing a change.';
            }

            const remaining = definition.beats.some(beat =>
                !state.firedBeats.some(entry => entry.beatId === beat.id)
            );

            if (!remaining) {
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
        const error = getActionError(action);

        if (error) {
            showToast(error);
            return false;
        }

        const previousPhase = state.phase;
        const previousPlacements = JSON.stringify(state.placements);

        state = reduce(state, action);

        if (
            action.type === 'PLACE_ENTITY' ||
            action.type === 'UNDO'
        ) {
            selectedEntityId = null;
        }

        const changed =
            previousPhase !== state.phase ||
            previousPlacements !== JSON.stringify(state.placements) ||
            ['REVEAL_BEAT', 'RESTART'].includes(action.type);

        if (changed) {
            gameStarted = true;
            persistState();
            touchActivity();
        }

        render();
        return changed;
    }

    function readBridgeWrapper() {
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

    function getProgressState() {
        const complete = state.phase === 'resolved';

        return {
            covered: complete ? 1 : 0,
            total: 1
        };
    }

    function persistState() {
        if (!Bridge || !session || !state || !definition) return;

        const timestamp = Date.now();
        const complete = state.phase === 'resolved';
        const wrapper = {
            status: complete ? 'complete' : 'in-progress',
            completedAt: complete
                ? (lastPersistedWrapper?.completedAt || timestamp)
                : null,
            currentLabel: PHASE_LABELS[state.phase],
            progress: getProgressState(),
            engineId: ENGINE_ID,
            engineVersion: ENGINE_VERSION,
            definitionId: definition.definitionId,
            definitionHash: definition.definitionHash,
            engineState: clone(state),
            lastOpenedAt: timestamp,
            lastTouchedAt: timestamp
        };

        lastPersistedWrapper = Bridge.upsertSessionState(
            session.id,
            definition.registry.registryId,
            wrapper
        );
    }

    function touchActivity() {
        if (!Bridge || !session || !definition) return;

        Bridge.touchRecentActivity({
            sessionId: session.id,
            registryId: definition.registry.registryId,
            title: definition.registry.title,
            launchUrl: window.location.href
        });
    }

    function registerDefinition() {
        if (!Bridge || !definition) return;

        Bridge.upsertItem({
            ...definition.registry,
            launchUrl: window.location.href.split('?')[0] +
                '?game=' +
                encodeURIComponent(definition.definitionId)
        });
    }

    function getEntityPreviousDestination(entityId) {
        const commit = getLastCommit();

        if (!commit) return null;

        return commit.placements[entityId] || null;
    }

    function getDestinationName(destinationId) {
        if (destinationId === 'pool') return 'Available';
        if (destinationId === 'cut') return 'Cut';

        return getContainer(destinationId)?.shortName ||
            getContainer(destinationId)?.name ||
            destinationId;
    }

    function getEntitiesAt(destinationId) {
        return definition.entities.filter(
            entity => state.placements[entity.id] === destinationId
        );
    }

    function formatResource(value) {
        const decimals = Number(definition.resource?.decimals) || 0;

        return Number(value || 0).toFixed(decimals) +
            (definition.resource?.unit || '');
    }

    function renderEntity(entity) {
        const selected = selectedEntityId === entity.id;
        const sourceLocked = isSourceLocked(entity.id);
        const previous = getEntityPreviousDestination(entity.id);
        const current = state.placements[entity.id];
        const movedSinceCommit =
            state.phase === 'revising' &&
            previous &&
            previous !== current;

        const classes = [
            'spp-entity',
            selected ? 'is-selected' : '',
            sourceLocked ? 'is-locked' : '',
            movedSinceCommit ? 'is-changed' : ''
        ].filter(Boolean).join(' ');

        const previousHtml = movedSinceCommit
            ? '<span class="spp-entity-previous">was ' +
                escapeHtml(getDestinationName(previous)) +
                '</span>'
            : '';

        return '<button class="' + classes + '"' +
            ' type="button"' +
            ' data-entity-id="' + escapeAttr(entity.id) + '"' +
            ' aria-pressed="' + String(selected) + '"' +
            (sourceLocked ? ' aria-disabled="true"' : '') +
            '>' +
            '<span class="spp-entity-copy">' +
            '<span class="spp-entity-name">' +
            escapeHtml(entity.name) +
            '</span>' +
            '<span class="spp-entity-description">' +
            escapeHtml(entity.description || '') +
            '</span>' +
            previousHtml +
            '</span>' +
            '<span class="spp-entity-cost">' +
            escapeHtml(formatResource(entity.resourceCost)) +
            '</span>' +
            '</button>';
    }

    function renderDestination(container) {
        const world = deriveWorld(state);
        const entities = getEntitiesAt(container.id);
        const unavailable = world.availability[container.id] === false;
        const locked =
            state.phase !== 'planning' &&
            Boolean(container.lockAfterCommit);
        const canTarget =
            canManipulate() &&
            Boolean(selectedEntityId) &&
            isDestinationAvailable(container.id);
        const weight = getContainerWeight(container.id);
        const limit = Number(container.resourceLimit);
        const limitHtml = Number.isFinite(limit)
            ? '<span class="spp-zone-resource">' +
                escapeHtml(formatResource(weight)) +
                ' / ' +
                escapeHtml(formatResource(limit)) +
                '</span>'
            : '<span class="spp-zone-resource">' +
                entities.length +
                (entities.length === 1 ? ' item' : ' items') +
                '</span>';

        const statusHtml = unavailable
            ? '<span class="spp-zone-status spp-zone-status--danger">Route closed</span>'
            : locked
                ? '<span class="spp-zone-status">Left behind</span>'
                : '';

        return '<section class="spp-zone' +
            (unavailable ? ' is-unavailable' : '') +
            (locked ? ' is-locked' : '') +
            '" data-zone-id="' + escapeAttr(container.id) + '">' +
            '<div class="spp-zone-header">' +
            '<div>' +
            '<h3>' + escapeHtml(container.name) + '</h3>' +
            '<p>' + escapeHtml(container.description || '') + '</p>' +
            '</div>' +
            '<div class="spp-zone-meta">' +
            limitHtml +
            statusHtml +
            '</div>' +
            '</div>' +
            '<div class="spp-zone-items">' +
            (entities.length
                ? entities.map(renderEntity).join('')
                : '<div class="spp-zone-empty">Nothing here yet</div>') +
            '</div>' +
            '<button class="spp-target" type="button"' +
            ' data-destination-id="' + escapeAttr(container.id) + '"' +
            (canTarget ? '' : ' disabled') +
            '>' +
            (selectedEntityId
                ? 'Move selected here'
                : 'Select an item first') +
            '</button>' +
            '</section>';
    }

    function renderSystemRail(destinationId, title, description) {
        const entities = getEntitiesAt(destinationId);
        const cutLocked =
            destinationId === 'cut' &&
            state.phase !== 'planning' &&
            definition.commitment?.lockCutAfterCommit;

        const canTarget =
            canManipulate() &&
            Boolean(selectedEntityId) &&
            isDestinationAvailable(destinationId);

        return '<section class="spp-rail' +
            (cutLocked ? ' is-locked' : '') +
            '">' +
            '<div class="spp-rail-heading">' +
            '<div>' +
            '<h3>' + escapeHtml(title) + '</h3>' +
            '<p>' + escapeHtml(description) + '</p>' +
            '</div>' +
            '<button class="spp-target spp-target--compact" type="button"' +
            ' data-destination-id="' + escapeAttr(destinationId) + '"' +
            (canTarget ? '' : ' disabled') +
            '>' +
            (destinationId === 'cut' ? 'Cut selected' : 'Return selected') +
            '</button>' +
            '</div>' +
            '<div class="spp-rail-items">' +
            (entities.length
                ? entities.map(renderEntity).join('')
                : '<span class="spp-rail-empty">None</span>') +
            '</div>' +
            '</section>';
    }

    function renderBrief() {
        const violations = deriveRuleViolations();
        const goals = deriveGoals();

        const rulesHtml = definition.rules.map(rule => {
            const violated = violations.some(
                item => item.ruleId === rule.id
            );

            return '<li class="spp-brief-item' +
                (violated ? ' is-violated' : '') +
                '">' +
                '<span class="spp-brief-status">' +
                (violated ? '!' : '•') +
                '</span>' +
                '<span>' + escapeHtml(rule.label) + '</span>' +
                '</li>';
        }).join('');

        const goalsHtml = goals.map(goal => {
            const cls = !goal.active
                ? ' is-inactive'
                : goal.met
                    ? ' is-met'
                    : ' is-unmet';

            const marker = !goal.active
                ? '○'
                : goal.met
                    ? '✓'
                    : '–';

            return '<li class="spp-brief-item' + cls + '">' +
                '<span class="spp-brief-status">' + marker + '</span>' +
                '<span>' + escapeHtml(goal.label) + '</span>' +
                '</li>';
        }).join('');

        const stakesHtml = definition.stakes.map(stake =>
            '<article class="spp-stake">' +
            '<span class="spp-stake-holder">' +
            escapeHtml(stake.holder) +
            '</span>' +
            '<p>“' + escapeHtml(stake.claim) + '”</p>' +
            '</article>'
        ).join('');

        return '<aside class="spp-brief">' +
            '<div class="spp-brief-section">' +
            '<span class="spp-brief-label">Rules</span>' +
            '<ul>' + rulesHtml + '</ul>' +
            '</div>' +
            '<div class="spp-brief-section">' +
            '<span class="spp-brief-label">Goals</span>' +
            '<ul>' + goalsHtml + '</ul>' +
            '</div>' +
            '<div class="spp-brief-section">' +
            '<span class="spp-brief-label">Stake</span>' +
            stakesHtml +
            '</div>' +
            '</aside>';
    }

    function renderReveal() {
        const reveal = getLastReveal();

        if (!reveal) return '';

        return '<div class="spp-reveal" role="status">' +
            '<span class="spp-reveal-kicker">' +
            escapeHtml(reveal.beat.label || 'The world changed') +
            '</span>' +
            '<p>' + escapeHtml(reveal.variant.reveal) + '</p>' +
            '</div>';
    }

    function renderOutcome() {
        if (state.phase !== 'resolved') return '';

        const goals = deriveGoals().filter(goal => goal.active);
        const outcomeLines = (definition.resolution?.outcomeLines || [])
            .filter(line =>
                (line.when || []).every(predicate =>
                    evaluatePredicate(predicate)
                )
            );

        return '<div class="spp-outcome">' +
            '<span class="spp-outcome-kicker">Final position</span>' +
            '<h2>What did the plan become?</h2>' +
            '<p>' +
            escapeHtml(definition.resolution?.prompt || '') +
            '</p>' +
            '<div class="spp-outcome-goals">' +
            goals.map(goal =>
                '<span class="spp-outcome-goal' +
                (goal.met ? ' is-met' : ' is-unmet') +
                '">' +
                (goal.met ? '✓ ' : '○ ') +
                escapeHtml(goal.label) +
                '</span>'
            ).join('') +
            '</div>' +
            outcomeLines.map(line =>
                '<p class="spp-outcome-line">' +
                escapeHtml(line.text) +
                '</p>'
            ).join('') +
            '</div>';
    }

    function renderControls() {
        const controls = [];

        if (state.phase === 'planning') {
            controls.push({
                label: 'Undo',
                action: 'undo',
                secondary: true,
                disabled: !state.history.length
            });
            controls.push({
                label: 'Commit plan',
                action: 'commit'
            });
        }

        if (state.phase === 'committed') {
            controls.push({
                label: 'Reveal change',
                action: 'reveal'
            });
            controls.push({
                label: 'Resolve now',
                action: 'resolve',
                secondary: true
            });
        }

        if (state.phase === 'reacting') {
            controls.push({
                label: 'Open revision',
                action: 'open-revision'
            });
            controls.push({
                label: 'Resolve now',
                action: 'resolve',
                secondary: true
            });
        }

        if (state.phase === 'revising') {
            controls.push({
                label: 'Undo',
                action: 'undo',
                secondary: true,
                disabled: !state.history.length
            });
            controls.push({
                label: 'Resolve plan',
                action: 'resolve'
            });
        }

        if (state.phase === 'resolved') {
            controls.push({
                label: 'Start again',
                action: 'restart'
            });
        }

        const selectionText = selectedEntityId
            ? 'Selected: ' + getEntity(selectedEntityId).name
            : state.phase === 'reacting'
                ? 'The board is locked. Discuss what the change means.'
                : canManipulate()
                    ? 'Select an item, then choose its destination.'
                    : 'The plan is locked in this phase.';

        return '<aside class="spp-controls">' +
            '<div class="spp-phase-card">' +
            '<span class="spp-phase-label">Phase</span>' +
            '<strong>' + escapeHtml(PHASE_LABELS[state.phase]) + '</strong>' +
            '<p>' + escapeHtml(selectionText) + '</p>' +
            '</div>' +
            '<div class="spp-control-actions">' +
            controls.map(control =>
                '<button class="spp-control-btn' +
                (control.secondary ? ' spp-control-btn--secondary' : '') +
                '" type="button" data-engine-action="' +
                escapeAttr(control.action) + '"' +
                (control.disabled ? ' disabled' : '') +
                '>' +
                escapeHtml(control.label) +
                '</button>'
            ).join('') +
            '</div>' +
            '<button class="spp-reset-link" type="button"' +
            ' data-engine-action="restart">Restart run</button>' +
            '</aside>';
    }

    function renderBoard() {
        return '<div class="spp-board">' +
            '<div class="spp-board-zones">' +
            definition.containers.map(renderDestination).join('') +
            '</div>' +
            '<div class="spp-board-rails">' +
            renderSystemRail(
                'pool',
                'Available',
                'Equipment not placed yet. Anything still here is Cut when you commit.'
            ) +
            renderSystemRail(
                'cut',
                state.phase === 'planning' ? 'Cut' : 'Left Behind',
                state.phase === 'planning'
                    ? 'Equipment you are choosing not to take.'
                    : 'These choices are now part of the expedition history.'
            ) +
            '</div>' +
            '</div>';
    }

    function render() {
        const stage = document.getElementById('shared-plan-stage');
        const phaseLabel = document.getElementById('shared-plan-phase');

        if (!stage || !definition || !state) return;

        if (phaseLabel) {
            phaseLabel.textContent = PHASE_LABELS[state.phase];
        }

        stage.innerHTML =
            '<div class="spp-stage-shell">' +
            '<div class="spp-stage-topline">' +
            '<div>' +
            '<span class="spp-stage-eyebrow">' +
            escapeHtml(definition.identity.eyebrow || '') +
            '</span>' +
            '<h1>' + escapeHtml(definition.identity.title) + '</h1>' +
            '</div>' +
            '<p>' + escapeHtml(definition.identity.premise) + '</p>' +
            '</div>' +
            renderReveal() +
            '<div class="spp-stage-grid">' +
            renderBrief() +
            renderBoard() +
            renderControls() +
            '</div>' +
            renderOutcome() +
            '</div>';
    }

    function renderLaunch() {
        const title = document.getElementById('launch-title');
        const premise = document.getElementById('launch-premise');
        const startButton = document.getElementById('launch-button');
        const warning = document.getElementById('launch-warning');

        if (title) title.textContent = definition.identity.title;
        if (premise) premise.textContent = definition.identity.premise;

        if (warning) {
            warning.hidden = !restoreBlocked;
            warning.textContent = restoreBlocked
                ? 'This saved run belongs to an older Definition. Start a fresh run to continue safely.'
                : '';
        }

        if (startButton) {
            if (restoreBlocked) {
                startButton.textContent = 'Start fresh';
            } else if (lastPersistedWrapper?.status === 'complete') {
                startButton.textContent = 'Review outcome';
            } else if (lastPersistedWrapper) {
                startButton.textContent = 'Continue expedition';
            } else {
                startButton.textContent = 'Begin expedition';
            }
        }
    }

    function showGame() {
        const launch = document.getElementById('launch-screen');
        const game = document.getElementById('game-screen');

        if (launch) launch.hidden = true;
        if (game) game.hidden = false;

        render();
    }

    function showLaunch() {
        const launch = document.getElementById('launch-screen');
        const game = document.getElementById('game-screen');

        if (launch) launch.hidden = false;
        if (game) game.hidden = true;

        renderLaunch();
    }

    function startGame() {
        if (restoreBlocked) {
            state = createDefaultState();
            lastPersistedWrapper = null;
            restoreBlocked = false;
        }

        gameStarted = true;
        persistState();
        touchActivity();

        window.AtlasAnalytics?.arcadeGameStart(
            definition.definitionId
        );

        showGame();
    }

    function loadActiveSessionState() {
        lastPersistedWrapper = readBridgeWrapper();
        restoreBlocked = false;
        selectedEntityId = null;

        state = normalizeState(
            lastPersistedWrapper?.engineState || null
        );
    }

    function mountSharedChrome() {
        if (window.AtlasSessionPanel) {
            AtlasSessionPanel.mount({
                root: '#atlas-session-panel-root',
                initialView: 'manage'
            });
        }

        if (window.ArcadeGameChrome) {
            ArcadeGameChrome.mountLanding({
                root: '#launch-screen',
                onBeforeReturn: function () {
                    if (gameStarted) persistState();
                }
            });

            ArcadeGameChrome.mountGame({
                root: '#shared-plan-header',
                returnRoot: '#arcade-game-return-root',
                actionsRoot: '#arcade-game-actions-root',
                onBeforeReturn: function () {
                    if (gameStarted) persistState();
                }
            });
        }
    }

    function showFatal(errors) {
        const launch = document.getElementById('launch-screen');

        if (!launch) return;

        launch.innerHTML =
            '<div class="spp-fatal">' +
            '<span class="spp-launch-kicker">Engine One</span>' +
            '<h1>Can’t start this game</h1>' +
            '<p>The hand-authored Definition did not pass V1 mechanical checks.</p>' +
            '<ul>' +
            errors.map(error =>
                '<li>' + escapeHtml(error) + '</li>'
            ).join('') +
            '</ul>' +
            '<a href="../index.html">Back to Arcade</a>' +
            '</div>';
    }

    function showToast(message) {
        const toast = document.getElementById('shared-plan-toast');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('is-visible');

        if (toastTimer) clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 2600);
    }

    function handleEntityClick(button) {
        const entityId = button.dataset.entityId;

        if (!entityId || isSourceLocked(entityId)) return;

        if (!canManipulate()) {
            showToast('The board is locked in this phase.');
            return;
        }

        selectedEntityId = selectedEntityId === entityId
            ? null
            : entityId;

        render();
    }

    function handleDestinationClick(button) {
        if (!selectedEntityId) return;

        dispatch({
            type: 'PLACE_ENTITY',
            entityId: selectedEntityId,
            destinationId: button.dataset.destinationId
        });
    }

    function handleEngineAction(action) {
        if (action === 'undo') {
            dispatch({ type: 'UNDO' });
        }

        if (action === 'commit') {
            dispatch({ type: 'COMMIT_PLAN' });
        }

        if (action === 'reveal') {
            dispatch({ type: 'REVEAL_BEAT' });
        }

        if (action === 'open-revision') {
            dispatch({ type: 'OPEN_REVISION' });
        }

        if (action === 'resolve') {
            dispatch({ type: 'RESOLVE_NOW' });
        }

        if (action === 'restart') {
            const confirmed = window.confirm(
                'Restart Twenty Kilos? This clears the current run for this learner.'
            );

            if (!confirmed) return;

            selectedEntityId = null;
            dispatch({ type: 'RESTART' });
        }
    }

    function handleClick(event) {
        const startButton = event.target.closest('#launch-button');
        if (startButton) {
            startGame();
            return;
        }

        const entityButton = event.target.closest('[data-entity-id]');
        if (entityButton) {
            handleEntityClick(entityButton);
            return;
        }

        const destinationButton = event.target.closest(
            '[data-destination-id]'
        );
        if (destinationButton) {
            handleDestinationClick(destinationButton);
            return;
        }

        const actionButton = event.target.closest('[data-engine-action]');
        if (actionButton) {
            handleEngineAction(actionButton.dataset.engineAction);
        }
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function init() {
        if (!Bridge) {
            showFatal(['AtlasBridge did not load.']);
            return;
        }

        definition = Definitions[getDefinitionId()] || null;

        if (!definition) {
            showFatal([
                'Definition "' + getDefinitionId() + '" is not registered.'
            ]);
            return;
        }

        const errors = validateDefinition(definition);

        if (errors.length) {
            showFatal(errors);
            return;
        }

        const mode = Bridge.readAppearanceMode();
        document.documentElement.dataset.theme = mode;

        session = Bridge.readActiveSession();
        registerDefinition();
        loadActiveSessionState();
        mountSharedChrome();
        showLaunch();

        document.addEventListener('click', handleClick);

        window.addEventListener('atlas:appearance-change', event => {
            const nextMode =
                event.detail?.mode ||
                Bridge.readAppearanceMode();

            document.documentElement.dataset.theme = nextMode;
        });

        window.addEventListener('atlas:session-change', event => {
            if (gameStarted) persistState();

            session =
                event.detail?.session ||
                Bridge.readActiveSession();

            loadActiveSessionState();

            const game = document.getElementById('game-screen');
            const wasPlaying = game && !game.hidden;

            gameStarted = Boolean(lastPersistedWrapper) || wasPlaying;

            if (wasPlaying) {
                showGame();
            } else {
                showLaunch();
            }
        });

        window.addEventListener('pagehide', function () {
            if (gameStarted) persistState();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

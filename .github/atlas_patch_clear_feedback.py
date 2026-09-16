from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


panel = 'shared/atlas-session-panel.js'

replace_once(
    panel,
    '''        focusRowActionControl(
            session.id,
            type === 'rename'
                ? '.atlas-session-row-editor-input'
                : '[data-action="confirm-delete"]'
        );''',
    '''        focusRowActionControl(
            session.id,
            type === 'rename'
                ? '.atlas-session-row-editor-input'
                : type === 'reset'
                    ? '[data-action="confirm-reset"]'
                    : '[data-action="confirm-delete"]'
        );''',
    'panel reset focus'
)

replace_once(
    panel,
    '''    async function commitSessionDelete(sessionId) {''',
    '''    async function commitSessionReset(sessionId) {
        const Bridge = getBridge();
        const session = Bridge.readSessions().find(
            item => item.id === sessionId
        );

        if (
            !session ||
            typeof options.onResetSession !== 'function'
        ) {
            return;
        }

        try {
            await options.onResetSession(session);
        } catch {
            rowActionState = {
                type: 'reset',
                sessionId,
                value: '',
                error: 'Couldn’t clear this subject activity.'
            };

            renderManageView();
            focusRowActionControl(
                sessionId,
                '[data-action="confirm-reset"]'
            );
            return;
        }

        rowActionState = null;
        renderManageView();
        focusSessionActionsToggle(sessionId);
    }

    async function commitSessionDelete(sessionId) {''',
    'panel commit reset'
)

replace_once(
    panel,
    '''        if (state.type === 'delete') {''',
    '''        if (state.type === 'reset') {
            const confirmation =
                document.createElement('div');
            const title =
                document.createElement('p');
            const copy =
                document.createElement('p');
            const actions =
                document.createElement('div');
            const displaySession =
                getDisplaySession(session);
            const resetTitle =
                resolveOption(
                    options.resetTitle,
                    displaySession
                ) || 'Clear this subject?';
            const resetMessage =
                resolveOption(
                    options.resetMessage,
                    displaySession
                ) ||
                `This removes saved subject activity for ${displayName}.`;
            const resetConfirmLabel =
                resolveOption(
                    options.resetConfirmLabel,
                    displaySession
                ) || 'Clear activity';
            const confirm =
                createActionButton({
                    label: resetConfirmLabel,
                    ariaLabel:
                        `${resetConfirmLabel} for ${displayName}`,
                    className: 'is-danger',
                    action: 'confirm-reset',
                    sessionId: session.id
                });
            const cancel =
                createActionButton({
                    label: 'Cancel',
                    action: 'cancel-row-action',
                    sessionId: session.id
                });
            const error =
                document.createElement('p');

            confirmation.className =
                'atlas-session-row-confirm';

            title.className =
                'atlas-session-row-confirm-title';
            title.textContent = resetTitle;

            copy.className =
                'atlas-session-row-confirm-copy';
            copy.textContent = resetMessage;

            actions.className =
                'atlas-session-row-editor-actions';

            error.className =
                'atlas-session-row-editor-error';
            error.textContent =
                state.error || '';

            actions.appendChild(confirm);
            actions.appendChild(cancel);

            confirmation.appendChild(title);
            confirmation.appendChild(copy);
            confirmation.appendChild(actions);
            confirmation.appendChild(error);

            container.appendChild(confirmation);
            return true;
        }

        if (state.type === 'delete') {''',
    'panel reset render'
)

replace_once(
    panel,
    '''        } else if (action === 'reset') {
            await options.onResetSession?.(session);
        } else if (action === 'delete') {''',
    '''        } else if (action === 'reset') {
            startRowAction('reset', session);
            return;
        } else if (action === 'confirm-reset') {
            await commitSessionReset(session.id);
            return;
        } else if (action === 'delete') {''',
    'panel reset action'
)

panel_css = 'shared/atlas-session-panel.css'
replace_once(
    panel_css,
    '''/* ============================================================
   EMPTY AND CREATE STATES
   ============================================================ */''',
    '''.atlas-session-row-editor,
.atlas-session-row-confirm {
    display: grid;
    width: 100%;
    gap: 0.48rem;
}

.atlas-session-row-editor-input {
    width: 100%;
    min-width: 0;
    padding: 0.52rem 0.62rem;
    border: 1px solid var(--atlas-modal-border-strong);
    border-radius: 8px;
    outline: none;
    background: var(--atlas-modal-control-surface);
    color: var(--atlas-modal-heading);
    font: inherit;
    font-size: 0.78rem;
}

.atlas-session-row-editor-input:focus {
    border-color: var(--atlas-modal-accent);
    box-shadow: 0 0 0 2px rgba(var(--atlas-modal-accent-rgb), 0.10);
}

.atlas-session-row-editor-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.atlas-session-row-confirm-title {
    margin: 0;
    color: var(--atlas-modal-heading);
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.35;
}

.atlas-session-row-confirm-copy {
    margin: 0;
    color: var(--atlas-modal-muted);
    font-size: 0.74rem;
    line-height: 1.45;
}

.atlas-session-row-editor-error {
    margin: 0;
    color: var(--atlas-modal-danger-text);
    font-size: 0.72rem;
    line-height: 1.4;
}

.atlas-session-row-editor-error:empty {
    display: none;
}

/* ============================================================
   EMPTY AND CREATE STATES
   ============================================================ */''',
    'panel row action styles'
)

subject_css = 'compass/shared/compass-subject.css'
replace_once(
    subject_css,
    '''/* ============================================================
VIEW LIFECYCLE AND AMBIENT CANVAS
============================================================ */''',
    '''/* ============================================================
COMPASS TOAST
Matches the Compass Hub feedback treatment.
============================================================ */
.compass-toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    z-index: 1300;
    max-width: calc(100vw - 2rem);
    padding: 0.65rem 1.15rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-panel);
    color: var(--text-muted);
    box-shadow: var(--shadow-md);
    font-size: 0.84rem;
    opacity: 0;
    pointer-events: none;
    transform: translateX(-50%) translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.compass-toast.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

/* ============================================================
VIEW LIFECYCLE AND AMBIENT CANVAS
============================================================ */''',
    'subject toast styles'
)

engine = 'compass/shared/compass-engine.js'
replace_once(
    engine,
    '''async function resetSession(name) {''',
    '''let compassToastTimer = null;

function showCompassToast(text) {
    let toast = document.getElementById('compass-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'compass-toast';
        toast.className = 'compass-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    if (compassToastTimer !== null) {
        window.clearTimeout(compassToastTimer);
        compassToastTimer = null;
    }

    toast.textContent = String(text || '');
    toast.classList.remove('visible');

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            toast.classList.add('visible');
        });
    });

    compassToastTimer = window.setTimeout(() => {
        toast.classList.remove('visible');
        compassToastTimer = null;
    }, 2800);
}

async function resetSession(name) {''',
    'engine toast helper'
)

replace_once(
    engine,
    '''    if (session.id === currentSessionId) {
        loadProgress();
    }

    window.AtlasSessionPanel?.refresh();
    refreshSessionUI();
}''',
    '''    if (session.id === currentSessionId) {
        loadProgress();
    }

    window.AtlasSessionPanel?.refresh();
    refreshSessionUI();

    const displayName = window.AtlasSessionPanel
        ? AtlasSessionPanel.getSessionDisplayName(session)
        : (session.name || 'Shared');

    showCompassToast(
        `${getEffectiveSubjectTitle()} activity cleared for ${displayName}.`
    );
}''',
    'engine clear success toast'
)

print('Clear confirmation + toast patch applied successfully.')

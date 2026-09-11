from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


hub_path = Path('compass/index.html')
hub = hub_path.read_text()

# Atlas Original My Version state belongs in the management menu, not on-card.
hub = replace_once(
    hub,
    "            ownershipLabel: hasMyVersion\n              ? 'My Version'\n              : '',\n            hasMyVersion,",
    "            hasMyVersion,",
    'remove Atlas Original ownershipLabel projection'
)

hub = replace_once(
    hub,
    "        '<div class=\"subject-card-title-block\">' +\n        (subject.ownershipLabel\n          ? '<span class=\"subject-card-version-badge\">' +\n            escHtml(subject.ownershipLabel) +\n            '</span>'\n          : '') +\n        '<h3 class=\"subject-card-title\">' +",
    "        '<div class=\"subject-card-title-block\">' +\n        '<h3 class=\"subject-card-title\">' +",
    'remove My Version card chip rendering'
)

hub = replace_once(
    hub,
    "    .subject-card-version-badge {\n      width: max-content;\n      padding: 0.24rem 0.42rem;\n      border: 1px solid rgba(var(--accent-rgb), 0.24);\n      border-radius: 999px;\n      background: rgba(var(--accent-rgb), 0.08);\n      color: var(--accent);\n      font-size: 0.6rem;\n      font-weight: 600;\n      letter-spacing: 0.08em;\n      line-height: 1;\n      text-transform: uppercase;\n    }\n\n",
    "",
    'remove obsolete My Version badge CSS'
)

# Quiet provenance for owned subjects created from a canonical Atlas source.
hub = replace_once(
    hub,
    "          '<div class=\"subject-card-menu\" role=\"menu\" hidden>' +\n\n          '<button type=\"button\" role=\"menuitem\" ' +\n          'onclick=\"editOwnedSubject(' +",
    "          '<div class=\"subject-card-menu\" role=\"menu\" hidden>' +\n\n          (subject.provenance &&\n            subject.provenance.sourceWorld === COMPASS_ID &&\n            subject.provenance.sourceSubjectId\n              ? '<div class=\"subject-card-menu-meta\">Originally from Atlas</div>'\n              : '') +\n\n          '<button type=\"button\" role=\"menuitem\" ' +\n          'onclick=\"editOwnedSubject(' +",
    'owned Atlas provenance menu label'
)

# Quiet state for an adapted canonical Atlas Original.
hub = replace_once(
    hub,
    "          '<div class=\"subject-card-menu\" role=\"menu\" hidden>' +\n\n          '<button type=\"button\" role=\"menuitem\" onclick=\"editAtlasOriginal(' +",
    "          '<div class=\"subject-card-menu\" role=\"menu\" hidden>' +\n\n          (subject.hasMyVersion\n            ? '<div class=\"subject-card-menu-meta\">My Version</div>'\n            : '') +\n\n          '<button type=\"button\" role=\"menuitem\" onclick=\"editAtlasOriginal(' +",
    'Atlas Original My Version menu label'
)

hub_path.write_text(hub)


engine_path = Path('compass/shared/compass-engine.js')
engine = engine_path.read_text()

# Explicit Edit from the Atlas Original hub opens the existing authoring flow expanded.
engine = replace_once(
    engine,
    "        requestMyVersionEditing({\n            expandAuthorBar: false\n        });",
    "        requestMyVersionEditing({\n            expandAuthorBar: true\n        });",
    'expand Atlas Original edit intent'
)

# If an owned subject already has a resumable working draft, explicit Edit still
# expands the existing authoring bar instead of leaving it presentation-like.
engine = replace_once(
    engine,
    "    if (\n        ownedSubjectAuthoringIntent &&\n        !myVersionEditing\n    ) {\n        beginMyVersionEditing(\n            ownedSubjectAuthoringIntent !==\n                'generate'\n        );\n    }\n\n    const resumableFullSubjectBuild =",
    "    if (\n        ownedSubjectAuthoringIntent &&\n        !myVersionEditing\n    ) {\n        beginMyVersionEditing(\n            ownedSubjectAuthoringIntent !==\n                'generate'\n        );\n    }\n\n    if (\n        ownedSubjectAuthoringIntent === 'edit' &&\n        myVersionEditing\n    ) {\n        setMyVersionAuthorBarMinimized(false);\n    }\n\n    const resumableFullSubjectBuild =",
    'expand resumed owned edit intent'
)

engine_path.write_text(engine)

# Lightweight invariants for Batch 2.
assert 'ownershipLabel: hasMyVersion' not in hub
assert "(subject.ownershipLabel" not in hub
assert 'Originally from Atlas</div>' in hub
assert 'subject.hasMyVersion' in hub and 'My Version</div>' in hub
assert 'expandAuthorBar: false' not in engine
assert "ownedSubjectAuthoringIntent === 'edit'" in engine

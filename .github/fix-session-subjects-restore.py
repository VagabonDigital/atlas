from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)

# Compass Hub: Session Subjects is a permanent working surface, even when the
# supplied Atlas library and My Subjects are both empty. It also supports direct
# creation into the current session using the existing session-only create path.
path = Path('compass/index.html')
text = path.read_text()

text = replace_once(
    text,
    '''      if (\n        !atlasSubjects.length &&\n        !ownedSubjects.length\n      ) {\n        main.innerHTML =\n          renderIntro(session) +\n          ownedLibraryHtml +\n          renderEmptyLibrary();\n\n        return;\n      }\n\n      main.innerHTML =\n''',
    '''      main.innerHTML =\n''',
    'remove empty-library early return'
)

text = replace_once(
    text,
    '''          {\n            canAdd: true\n          }\n''',
    '''          {\n            canAdd: true,\n            canCreate: true\n          }\n''',
    'session collection supports create'
)

old = '''      const headerAction = canAdd\n        ? (\n          '<button class="subject-library-create-btn" ' +\n          'type="button" ' +\n          'onclick="openAddSessionSubjectDialog(event)">' +\n          '<span class="subject-library-create-plus" aria-hidden="true">+</span>' +\n          'Add' +\n          '</button>'\n        )\n        : canCreate\n          ? (\n            '<button class="subject-library-create-btn" ' +\n            'type="button" ' +\n            'onclick="openCreateSubjectDialog(event, \\\'\\\', null, ' +\n            jsArg(categoryId) +\n            ')">' +\n            '<span class="subject-library-create-plus" aria-hidden="true">+</span>' +\n            'Create' +\n            '</button>'\n          )\n          : '';\n'''

new = '''      const headerAction =\n        (canAdd\n          ? (\n            '<button class="subject-library-create-btn" ' +\n            'type="button" ' +\n            'onclick="openAddSessionSubjectDialog(event)">' +\n            '<span class="subject-library-create-plus" aria-hidden="true">+</span>' +\n            'Add' +\n            '</button>'\n          )\n          : '') +\n        (canCreate\n          ? (\n            '<button class="subject-library-create-btn" ' +\n            'type="button" ' +\n            (canAdd\n              ? 'onclick="openCreateSubjectDialog(event, getActiveSession().id)">'\n              : 'onclick="openCreateSubjectDialog(event, \\\'\\\', null, ' +\n                jsArg(categoryId) +\n                ')">') +\n            '<span class="subject-library-create-plus" aria-hidden="true">+</span>' +\n            'Create' +\n            '</button>'\n          )\n          : '');\n'''

text = replace_once(text, old, new, 'session Add + Create actions')
path.write_text(text)

# Atlas Hub Settings: `hidden` can be defeated by the author-level flex rule for
# settings rows on some browsers. Keep the semantic hidden flag, but also set an
# inline display state so the global recovery row disappears immediately after
# the last restoration (including mobile Safari/Chrome variants).
path = Path('index.html')
text = path.read_text()
text = replace_once(
    text,
    '''      row.hidden = !applicable;\n      button.disabled = !applicable;\n      button.textContent = 'Restore';\n''',
    '''      row.hidden = !applicable;\n      row.style.display = applicable ? '' : 'none';\n      button.disabled = !applicable;\n      button.textContent = 'Restore';\n''',
    'restore-all row hard visibility'
)
path.write_text(text)

from pathlib import Path

path = Path('compass/index.html')
text = path.read_text()

old_call = """          {
            canAdd: true,
            canCreate: true
          }
"""
new_call = """          {
            canAdd: true
          }
"""
if old_call not in text:
    raise SystemExit('Session Subjects dual-action call not found')
text = text.replace(old_call, new_call, 1)

old_action = """      const headerAction =
        (canAdd
          ? (
            '<button class=\"subject-library-create-btn\" ' +
            'type=\"button\" ' +
            'onclick=\"openAddSessionSubjectDialog(event)\">' +
            '<span class=\"subject-library-create-plus\" aria-hidden=\"true\">+</span>' +
            'Add' +
            '</button>'
          )
          : '') +
        (canCreate
          ? (
            '<button class=\"subject-library-create-btn\" ' +
            'type=\"button\" ' +
            (canAdd
              ? 'onclick=\"openCreateSubjectDialog(event, getActiveSession().id)\">'
              : 'onclick=\"openCreateSubjectDialog(event, \\\'\\\', null, ' +
                jsArg(categoryId) +
                ')\">') +
            '<span class=\"subject-library-create-plus\" aria-hidden=\"true\">+</span>' +
            'Create' +
            '</button>'
          )
          : '');
"""
new_action = """      const headerAction = canAdd
        ? (
          '<button class=\"subject-library-create-btn\" ' +
          'type=\"button\" ' +
          'onclick=\"openAddSessionSubjectDialog(event)\">' +
          '<span class=\"subject-library-create-plus\" aria-hidden=\"true\">+</span>' +
          'Add' +
          '</button>'
        )
        : canCreate
          ? (
            '<button class=\"subject-library-create-btn\" ' +
            'type=\"button\" ' +
            'onclick=\"openCreateSubjectDialog(event, \\\'\\\', null, ' +
            jsArg(categoryId) +
            ')\">' +
            '<span class=\"subject-library-create-plus\" aria-hidden=\"true\">+</span>' +
            'Create' +
            '</button>'
          )
          : '';
"""
if old_action not in text:
    raise SystemExit('Dual header action implementation not found')
text = text.replace(old_action, new_action, 1)

path.write_text(text)

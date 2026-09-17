from pathlib import Path

path = Path('compass/index.html')
text = path.read_text(encoding='utf-8')

old_helper = '''    function isCompassCloudAuthorityPending() {
      return document.documentElement.dataset
        .atlasCompassCloudAuthority === 'pending';
    }
'''

new_helper = '''    function isCompassCloudAuthorityPending() {
      return document.documentElement.dataset
        .atlasCompassCloudAuthority === 'pending';
    }

    let compassCloudAuthorityReadyPromise = null;

    function ensureCompassCloudAuthorityReady() {
      if (!isCompassCloudAuthorityPending()) {
        return Promise.resolve(true);
      }

      if (window.AtlasTutorSubjectsCloudAuthority) {
        syncCompassCloudAuthorityState();
        return Promise.resolve(true);
      }

      if (compassCloudAuthorityReadyPromise) {
        return compassCloudAuthorityReadyPromise;
      }

      compassCloudAuthorityReadyPromise =
        new Promise(resolve => {
          let settled = false;
          let timeout = null;

          const finish = ready => {
            if (settled) return;
            settled = true;

            window.removeEventListener(
              'atlas:compass-cloud-authority-ready',
              onReady
            );

            if (timeout) {
              window.clearTimeout(timeout);
            }

            if (ready) {
              syncCompassCloudAuthorityState();
            }

            resolve(ready);
          };

          const onReady = () => finish(true);

          window.addEventListener(
            'atlas:compass-cloud-authority-ready',
            onReady,
            { once: true }
          );

          timeout = window.setTimeout(
            () => finish(
              Boolean(
                window.AtlasTutorSubjectsCloudAuthority
              )
            ),
            8000
          );
        })
          .finally(() => {
            compassCloudAuthorityReadyPromise = null;
          });

      return compassCloudAuthorityReadyPromise;
    }

    document.addEventListener(
      'click',
      event => {
        if (!isCompassCloudAuthorityPending()) {
          return;
        }

        const target = event.target;

        if (
          !target ||
          typeof target.closest !== 'function'
        ) {
          return;
        }

        const button = target.closest(
          '.subject-library button'
        );

        if (
          !button ||
          button.classList.contains(
            'subject-card-manage-btn'
          )
        ) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        void ensureCompassCloudAuthorityReady()
          .then(ready => {
            if (!ready) {
              showToast(
                'Your Atlas account is still getting ready. Try again.'
              );
              return;
            }

            if (document.contains(button)) {
              button.click();
            }
          });
      },
      true
    );
'''

replacements = [
    (old_helper, new_helper, 1, 'authority interaction gate'),
    (
        '''                canCreate:\n                  !cloudAuthorityPending,''',
        '''                canCreate: true,''',
        1,
        'Create first-paint control'
    ),
    (
        '''                canManageCategory:\n                  !cloudAuthorityPending,''',
        '''                canManageCategory: true,''',
        1,
        'category first-paint control'
    ),
    (
        '''                canMoveCategoryEarlier:\n                  !cloudAuthorityPending &&\n                  index > 0,''',
        '''                canMoveCategoryEarlier:\n                  index > 0,''',
        1,
        'category earlier control'
    ),
    (
        '''                canMoveCategoryLater:\n                  !cloudAuthorityPending &&\n                  index < libraryCategories.length - 1''',
        '''                canMoveCategoryLater:\n                  index < libraryCategories.length - 1''',
        1,
        'category later control'
    ),
    (
        '''            canAdd:\n              !cloudAuthorityPending''',
        '''            canAdd: true''',
        1,
        'Add first-paint control'
    ),
    (
        '''        const managementHtml =\n          isCompassCloudAuthorityPending()\n            ? ''\n            : ''',
        '''        const managementHtml =\n          ''',
        2,
        'card ellipsis first-paint controls'
    ),
]

for old, new, expected, label in replacements:
    count = text.count(old)
    if count != expected:
        raise SystemExit(
            f'Expected {expected} {label} anchor(s), found {count}'
        )
    text = text.replace(old, new)

required = [
    'function ensureCompassCloudAuthorityReady()',
    "'atlas:compass-cloud-authority-ready'",
    "target.closest(\n          '.subject-library button'",
    "button.classList.contains(\n            'subject-card-manage-btn'",
    'canCreate: true,',
    'canManageCategory: true,',
    'canAdd: true',
]

for needle in required:
    if needle not in text:
        raise SystemExit(f'Missing stable-control contract: {needle}')

for forbidden in [
    'canCreate:\n                  !cloudAuthorityPending',
    'canManageCategory:\n                  !cloudAuthorityPending',
    'canAdd:\n              !cloudAuthorityPending',
    "isCompassCloudAuthorityPending()\n            ? ''\n            :",
]:
    if forbidden in text:
        raise SystemExit(f'Old pending visual gate remains: {forbidden}')

path.write_text(text, encoding='utf-8')

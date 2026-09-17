from pathlib import Path

# Triggered after the temporary workflow was installed.
path = Path('compass/index.html')
text = path.read_text(encoding='utf-8')

old_hint = "  <script>(function(){var h=false;try{h=Boolean(localStorage.getItem('sb-jnhjfpagectprceswvqn-auth-token'));}catch(e){}document.documentElement.dataset.atlasAccountHint=h?'account':'anonymous';})();</script>"
new_hint = """  <script>
    (function () {
      var h = false;
      try {
        h = Boolean(
          localStorage.getItem(
            'sb-jnhjfpagectprceswvqn-auth-token'
          )
        );
      } catch (e) { }

      document.documentElement.dataset.atlasAccountHint =
        h ? 'account' : 'anonymous';

      if (h) {
        document.documentElement.dataset.atlasCompassCloudAuthority =
          'pending';
      }
    })();
  </script>"""

owned_anchor = """    async function getOwnedSubjects() {
      const Subjects = window.AtlasTutorSubjects;

      if (
        !Subjects ||
        typeof Subjects.listSubjects !== 'function'
      ) {
        return [];
      }
"""
owned_replacement = """    function syncCompassCloudAuthorityState() {
      const root = document.documentElement;

      if (root.dataset.atlasAccountHint !== 'account') {
        delete root.dataset.atlasCompassCloudAuthority;
        return false;
      }

      const ready = Boolean(
        window.AtlasTutorSubjectsCloudAuthority
      );

      root.dataset.atlasCompassCloudAuthority =
        ready ? 'ready' : 'pending';

      return !ready;
    }

    function isCompassCloudAuthorityPending() {
      return document.documentElement.dataset
        .atlasCompassCloudAuthority === 'pending';
    }

    async function getOwnedSubjects() {
      if (isCompassCloudAuthorityPending()) {
        return [];
      }

      const Subjects = window.AtlasTutorSubjects;

      if (
        !Subjects ||
        typeof Subjects.listSubjects !== 'function'
      ) {
        return [];
      }
"""

render_subjects_anchor = """      const Subjects = window.AtlasTutorSubjects;

      let sessionSubjectRefs = [];
      let libraryState = null;

      try {
        if (Subjects) {
"""
render_subjects_replacement = """      const Subjects = window.AtlasTutorSubjects;
      const cloudAuthorityPending =
        isCompassCloudAuthorityPending();

      let sessionSubjectRefs = [];
      let libraryState = null;

      try {
        if (Subjects && !cloudAuthorityPending) {
"""

library_anchor = """      const ownedLibraryHtml =
        libraryCategories
"""
library_replacement = """      const ownedLibraryHtml =
        cloudAuthorityPending
          ? ''
          : libraryCategories
"""

refresh_anchor = """    window.addEventListener(
      'atlas:compass-hub-refresh-request',
      requestHubRender
    );

    function refresh() {
"""
refresh_replacement = """    window.addEventListener(
      'atlas:compass-hub-refresh-request',
      requestHubRender
    );

    window.addEventListener(
      'atlas:compass-cloud-authority-ready',
      () => {
        syncCompassCloudAuthorityState();
        requestHubRender();
      }
    );

    function refresh() {
"""

init_anchor = """    function init() {
      if (!Bridge) return;

      // Registration belongs to startup, not rendering. The registry layer is
"""
init_replacement = """    function init() {
      if (!Bridge) return;

      syncCompassCloudAuthorityState();

      // Registration belongs to startup, not rendering. The registry layer is
"""

replacements = [
    (old_hint, new_hint, 'account hint'),
    (owned_anchor, owned_replacement, 'owned subject guard'),
    (render_subjects_anchor, render_subjects_replacement, 'render authority guard'),
    (library_anchor, library_replacement, 'library suppression'),
    (refresh_anchor, refresh_replacement, 'authority ready listener'),
    (init_anchor, init_replacement, 'init authority sync'),
]

for old, new, label in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Expected exactly one {label} anchor, found {count}')
    text = text.replace(old, new, 1)

required = [
    "atlasCompassCloudAuthority =\n          'pending'",
    "function syncCompassCloudAuthorityState()",
    "function isCompassCloudAuthorityPending()",
    "if (isCompassCloudAuthorityPending()) {\n        return [];",
    "if (Subjects && !cloudAuthorityPending)",
    "cloudAuthorityPending\n          ? ''",
    "'atlas:compass-cloud-authority-ready'",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f'Missing Pass A contract: {needle}')

path.write_text(text, encoding='utf-8')

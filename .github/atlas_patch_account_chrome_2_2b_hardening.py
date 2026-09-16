from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# Hub pages must fetch the new registry version so existing browsers cannot
# reuse the pre-account-chrome registry from Batch 2.1B.
for path, prefix in [
    ('index.html', './shared/'),
    ('compass/index.html', '../shared/'),
    ('arcade/index.html', '../shared/'),
]:
    replace_once(
        path,
        f'{prefix}atlas-content-registry.js?v=20260916-access1',
        f'{prefix}atlas-content-registry.js?v=20260916-accountchrome1',
        f'{path} account chrome registry cache key'
    )


# Atlas pilot feedback remains available in the mobile drawer as a secondary
# contact path, but leaves the prime desktop utility row permanently rather
# than being removed after first paint by JavaScript.
atlas_path = Path('index.html')
atlas = atlas_path.read_text(encoding='utf-8')
feedback_block = """      <button class="spine-btn" data-atlas-feedback title="Message the Atlas team" aria-label="Message the Atlas team">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 3.25h10v7H8.4L5 13v-2.75H3v-7Z"
            stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

"""
if atlas.count(feedback_block) != 1:
    raise SystemExit(
        f'Atlas desktop pilot feedback block: expected one match, found {atlas.count(feedback_block)}'
    )
atlas_path.write_text(atlas.replace(feedback_block, '', 1), encoding='utf-8')


# With the markup removed statically, account chrome no longer owns an Atlas-
# specific cleanup side effect.
chrome_path = Path('shared/atlas-account-chrome.js')
chrome = chrome_path.read_text(encoding='utf-8')
chrome_cleanup = """            mounted.push(control);

            if (body.dataset.atlasWorld === 'atlas') {
                const pilotFeedback = desktopActions.querySelector(
                    '[data-atlas-feedback]'
                );
                pilotFeedback?.remove?.();
            }
"""
chrome_replacement = """            mounted.push(control);
"""
if chrome.count(chrome_cleanup) != 1:
    raise SystemExit(
        f'account chrome pilot-feedback cleanup: expected one match, found {chrome.count(chrome_cleanup)}'
    )
chrome_path.write_text(
    chrome.replace(chrome_cleanup, chrome_replacement, 1),
    encoding='utf-8'
)


# Make the cache boundary and static Atlas feedback demotion permanent proof.
test_path = Path('tests/atlas-account-chrome-contract.test.js')
test = test_path.read_text(encoding='utf-8')
old_chrome_feedback_assert = """    assert.match(
        chrome,
        /pilotFeedback\\?\\.remove/,
        'The Atlas pilot feedback control should leave the prime desktop header slot.'
    );
"""
if test.count(old_chrome_feedback_assert) != 1:
    raise SystemExit(
        f'account chrome old feedback assertion: expected one match, found {test.count(old_chrome_feedback_assert)}'
    )
test = test.replace(old_chrome_feedback_assert, '', 1)

loop_anchor = """        assert.match(
            source,
            /class=\"mobile-header-actions\"/,
            `Product hub ${index + 1} must expose the shared mobile utility zone.`
        );
"""
loop_replacement = """        assert.match(
            source,
            /class=\"mobile-header-actions\"/,
            `Product hub ${index + 1} must expose the shared mobile utility zone.`
        );
        assert.match(
            source,
            /atlas-content-registry\\.js\\?v=20260916-accountchrome1/,
            `Product hub ${index + 1} must cache-bust the account-chrome registry version.`
        );
"""
if test.count(loop_anchor) != 1:
    raise SystemExit(
        f'account chrome hub proof loop anchor: expected one match, found {test.count(loop_anchor)}'
    )
test = test.replace(loop_anchor, loop_replacement, 1)

inside_anchor = """    assert.match(
        inside,
        /data-atlas-surface=\"inside-atlas\"/,
        'Inside Atlas must identify itself to shared account chrome.'
    );
"""
inside_replacement = """    assert.doesNotMatch(
        atlas,
        /class=\"spine-btn\" data-atlas-feedback/,
        'Atlas desktop header must not retain the pilot feedback control.'
    );
    assert.match(
        atlas,
        /class=\"drawer-nav-item\" data-atlas-feedback/,
        'Atlas should retain the secondary mobile-drawer contact path for now.'
    );

    assert.match(
        inside,
        /data-atlas-surface=\"inside-atlas\"/,
        'Inside Atlas must identify itself to shared account chrome.'
    );
"""
if test.count(inside_anchor) != 1:
    raise SystemExit(
        f'account chrome Inside Atlas proof anchor: expected one match, found {test.count(inside_anchor)}'
    )
test_path.write_text(
    test.replace(inside_anchor, inside_replacement, 1),
    encoding='utf-8'
)

print('Batch 2.2B closure hardening applied.')

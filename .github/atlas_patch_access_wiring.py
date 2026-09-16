from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'shared/atlas-access.js',
    """    function syncFromAccount(accountState) {\n        publish(stateFromAccount(accountState));\n    }\n\n    async function initialize() {\n""",
    """    function syncFromAccount(accountState) {\n        publish(stateFromAccount(accountState));\n    }\n\n    function bootstrapAnonymous() {\n        if (window.AtlasAccount) {\n            return snapshot();\n        }\n\n        publish(stateFromAccount({\n            ready: true,\n            authenticated: false\n        }));\n\n        return snapshot();\n    }\n\n    async function initialize() {\n""",
    'AtlasAccess anonymous bootstrap'
)

replace_once(
    'shared/atlas-access.js',
    """    window.AtlasAccess = Object.freeze({\n        CAPABILITY_NAMES,\n        initialize,\n""",
    """    window.AtlasAccess = Object.freeze({\n        CAPABILITY_NAMES,\n        bootstrapAnonymous,\n        initialize,\n""",
    'AtlasAccess anonymous bootstrap export'
)

replace_once(
    'shared/atlas-content-registry.js',
    """    function writeCloudAuthorityScripts() {\n""",
    """    function writeAtlasAccessBootstrapScript() {\n        if (\n            window.AtlasAccessBootstrap ||\n            document.querySelector(\n                'script[data-atlas-access-bootstrap]'\n            )\n        ) {\n            return;\n        }\n\n        const src =\n            '/shared/atlas-access-bootstrap.js?v=20260916-access1';\n\n        if (document.readyState === 'loading') {\n            document.write(\n                `<script data-atlas-access-bootstrap=\"true\" src=\"${src}\"><\\/script>`\n            );\n            return;\n        }\n\n        const script = document.createElement('script');\n        script.src = src;\n        script.async = false;\n        script.setAttribute(\n            'data-atlas-access-bootstrap',\n            'true'\n        );\n        document.head.appendChild(script);\n    }\n\n    function writeCloudAuthorityScripts() {\n""",
    'Atlas access bootstrap loader'
)

replace_once(
    'shared/atlas-content-registry.js',
    """    writeAtlasRootRuntimeScript();\n    writeCloudAuthorityScripts();\n    installTutorCreateHandoff();\n""",
    """    writeAtlasRootRuntimeScript();\n    writeCloudAuthorityScripts();\n    writeAtlasAccessBootstrapScript();\n    installTutorCreateHandoff();\n""",
    'Atlas access bootstrap invocation'
)

old_keys = (
    'atlas-content-registry.js?v=20260916-runtime3',
    'atlas-content-registry.js?v=20260916-stage1close1'
)
new_key = 'atlas-content-registry.js?v=20260916-access1'

changed = []
replacement_count = 0

for root in (Path('.'),):
    for path in sorted(root.rglob('*')):
        if not path.is_file():
            continue
        if '.git' in path.parts or '.github' in path.parts:
            continue
        if path.suffix.lower() not in {'.html', '.js'}:
            continue

        text = path.read_text(encoding='utf-8')
        next_text = text
        local_count = 0

        for old_key in old_keys:
            count = next_text.count(old_key)
            if count:
                next_text = next_text.replace(old_key, new_key)
                local_count += count

        if local_count:
            path.write_text(next_text, encoding='utf-8')
            changed.append((str(path), local_count))
            replacement_count += local_count

if replacement_count < 7:
    raise SystemExit(
        f'content-registry cache bust: expected at least 7 runtime references, found {replacement_count}'
    )

stale = []
for path in sorted(Path('.').rglob('*')):
    if not path.is_file():
        continue
    if '.git' in path.parts or '.github' in path.parts:
        continue
    if path.suffix.lower() not in {'.html', '.js'}:
        continue
    text = path.read_text(encoding='utf-8')
    if any(old_key in text for old_key in old_keys):
        stale.append(str(path))

if stale:
    raise SystemExit(
        'stale content-registry cache keys remain: ' + ', '.join(stale)
    )

print(f'Atlas access wiring updated; cache-busted {replacement_count} registry reference(s).')
for path, count in changed:
    print(f'  {path}: {count}')

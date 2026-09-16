from pathlib import Path

path = Path('shared/atlas-cloud-cache.js')
text = path.read_text()

old = """            .then(([summaries, library]) => {
                if (activeUserId !== userId) return false;

                storeSummaryList(summaries, { persist: false });
                storeLibrary(library, { persist: false });
                persistHubCache();

                try {
                    window.dispatchEvent(
                        new CustomEvent('atlas:compass-hub-cache-refreshed', {
                            detail: { userId }
                        })
                    );
                } catch { }

                return true;
            })
"""

new = """            .then(([summaries, library]) => {
                if (activeUserId !== userId) return false;

                const previousSummaries = JSON.stringify(
                    cachedSummaryList()
                );
                const previousLibrary = JSON.stringify(
                    libraryLoaded ? libraryValue : null
                );
                const nextSummaries = JSON.stringify(
                    Array.isArray(summaries) ? summaries : []
                );
                const nextLibrary = JSON.stringify(
                    library ?? null
                );
                const changed =
                    previousSummaries !== nextSummaries ||
                    previousLibrary !== nextLibrary;

                storeSummaryList(summaries, { persist: false });
                storeLibrary(library, { persist: false });
                persistHubCache();

                if (changed) {
                    try {
                        window.dispatchEvent(
                            new CustomEvent('atlas:compass-hub-cache-refreshed', {
                                detail: { userId }
                            })
                        );
                    } catch { }
                }

                return changed;
            })
"""

count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected one revalidation block, found {count}')

path.write_text(text.replace(old, new, 1))

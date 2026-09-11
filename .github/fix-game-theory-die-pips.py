from pathlib import Path

path = Path('shared/compass-catalog-data.js')
text = path.read_text()

old = '''                    <circle cx="59" cy="65" r="3" fill="currentColor"/>
                    <circle cx="74" cy="79" r="3" fill="currentColor"/>
                    <circle cx="59" cy="90" r="3" fill="currentColor"/>
                    <circle cx="74" cy="104" r="3" fill="currentColor"/>'''

new = '''                    <circle cx="58" cy="64" r="3" fill="currentColor"/>
                    <circle cx="75" cy="74" r="3" fill="currentColor"/>
                    <circle cx="58" cy="80" r="3" fill="currentColor"/>
                    <circle cx="75" cy="90" r="3" fill="currentColor"/>
                    <circle cx="58" cy="96" r="3" fill="currentColor"/>
                    <circle cx="75" cy="106" r="3" fill="currentColor"/>'''

if old not in text:
    raise SystemExit('Expected four-pip left face not found')

text = text.replace(old, new, 1)
path.write_text(text)

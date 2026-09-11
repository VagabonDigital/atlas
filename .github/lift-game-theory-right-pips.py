from pathlib import Path

path = Path('shared/compass-catalog-data.js')
text = path.read_text()

old = '''                    <circle cx="121" cy="65" r="3" fill="currentColor"/>
                    <circle cx="105" cy="78" r="3" fill="currentColor"/>
                    <circle cx="121" cy="82" r="3" fill="currentColor"/>
                    <circle cx="105" cy="94" r="3" fill="currentColor"/>
                    <circle cx="121" cy="99" r="3" fill="currentColor"/>
                    <circle cx="105" cy="110" r="3" fill="currentColor"/>'''

new = '''                    <circle cx="121" cy="65" r="3" fill="currentColor"/>
                    <circle cx="105" cy="78" r="3" fill="currentColor"/>
                    <circle cx="121" cy="82" r="3" fill="currentColor"/>
                    <circle cx="105" cy="94" r="3" fill="currentColor"/>
                    <circle cx="121" cy="95" r="3" fill="currentColor"/>
                    <circle cx="105" cy="105" r="3" fill="currentColor"/>'''

if old not in text:
    raise SystemExit('Expected current right-face six-pip block not found')

text = text.replace(old, new, 1)
path.write_text(text)

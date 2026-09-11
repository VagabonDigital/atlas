from pathlib import Path

path = Path('shared/compass-catalog-data.js')
text = path.read_text()

left_six = '''                    <circle cx="58" cy="64" r="3" fill="currentColor"/>
                    <circle cx="75" cy="74" r="3" fill="currentColor"/>
                    <circle cx="58" cy="80" r="3" fill="currentColor"/>
                    <circle cx="75" cy="90" r="3" fill="currentColor"/>
                    <circle cx="58" cy="96" r="3" fill="currentColor"/>
                    <circle cx="75" cy="106" r="3" fill="currentColor"/>'''

left_original = '''                    <circle cx="59" cy="65" r="3" fill="currentColor"/>
                    <circle cx="74" cy="79" r="3" fill="currentColor"/>
                    <circle cx="59" cy="90" r="3" fill="currentColor"/>
                    <circle cx="74" cy="104" r="3" fill="currentColor"/>'''

right_five = '''                    <circle cx="121" cy="64" r="3" fill="currentColor"/>
                    <circle cx="105" cy="77" r="3" fill="currentColor"/>
                    <circle cx="121" cy="83" r="3" fill="currentColor"/>
                    <circle cx="105" cy="96" r="3" fill="currentColor"/>
                    <circle cx="121" cy="102" r="3" fill="currentColor"/>'''

right_six = '''                    <circle cx="121" cy="65" r="3" fill="currentColor"/>
                    <circle cx="105" cy="78" r="3" fill="currentColor"/>
                    <circle cx="121" cy="82" r="3" fill="currentColor"/>
                    <circle cx="105" cy="94" r="3" fill="currentColor"/>
                    <circle cx="121" cy="99" r="3" fill="currentColor"/>
                    <circle cx="105" cy="110" r="3" fill="currentColor"/>'''

if left_six not in text:
    raise SystemExit('Expected six-pip left face not found')
if right_five not in text:
    raise SystemExit('Expected five-pip right face not found')

text = text.replace(left_six, left_original, 1)
text = text.replace(right_five, right_six, 1)
path.write_text(text)

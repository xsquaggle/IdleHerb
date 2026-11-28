#!/usr/bin/env python3
"""Builds one master file for the Batch 2 prompts that are still owed, so Lawson can run them in one ChatGPT chat.

Lawson, 2026-11-26: a long ChatGPT chat hit its maximum length, and pasting 20+ prompts again by hand is too much.
This file gives ChatGPT every remaining image at once: the shared style rules once, then each image's own text,
taken word for word from build_asset_batch_02.py so the two can never drift. Lawson types "next" between images.

Usage: python3 build_batch02_master.py OUT.md PROMPT_NUMBER [PROMPT_NUMBER ...]
"""
import os
import runpy
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
WANT = [int(a) for a in sys.argv[2:]]

argv = sys.argv
sys.argv = ['build_asset_batch_02.py', os.path.join(tempfile.mkdtemp(), 'batch02.md')]
B = runpy.run_path(os.path.join(HERE, 'build_asset_batch_02.py'), run_name='batch02')
sys.argv = argv
P, SETS, ROUNDS = B['P'], B['SETS'], B['ROUNDS']
REF, STYLE, BG_T, FILES = B['REF'], B['STYLE'], B['BG_T'], B['FILES']

set_of = {n: s for _, _, s, ns, _ in ROUNDS for n in ns}


def body(p):
    """The image's own text: the prompt without the shared opening line and the shared closing blocks.
    A prompt that opens with its own reference line (people sheets name which person to redraw) keeps it."""
    t = p['prompt']
    if t.startswith(REF + '\n\n'):
        t = t[len(REF) + 2:]
    t = t.split('\n\n' + STYLE, 1)[0]
    assert BG_T in p['prompt'] and FILES in p['prompt'], p['n']
    return t


def refs(p):
    return SETS[set_of[p['n']]][1] + p['att']


items = [P[n - 1] for n in WANT]
all_refs = []
for p in items:
    for f in refs(p):
        if f not in all_refs:
            all_refs.append(f)

L = []
w = L.append
w('# Sprout Tower: art images to make (master file)')
w('')
w('This file is for ChatGPT. It holds %d pixel-art images for a cozy idle game called Sprout Tower. '
  'Please make them **one at a time, in the order below**.' % len(items))
w('')
w('## How to work')
w('')
w('1. Read this whole file first. Then look at every reference picture attached to this chat. If the pictures came '
  'inside a zip, unzip it and show me each picture once, so that you can see them.')
w('2. Make **Image 1** now. After it, give me its FILES zip (see the shared rules), then stop.')
w('3. When I type **next**, make the next image the same way. When I type **redo** and a sentence, redo the last '
  'image with that change.')
w('4. Every image must follow its own description **and** all of the shared rules below, word for word. Do not '
  'shorten the style rules when you write the prompt for the image tool.')
w('5. Use the reference pictures only for style (pixel size, outline, shading, colours) and for the layouts the '
  'description asks you to copy. Do not copy their content, except where an image\'s description names a person '
  'in a reference picture to redraw: then keep that person\'s face, hair, outfit and colours.')
w('6. If this chat runs out of room, I will start a new chat with the same files and type **start at image N**. '
  'Then begin at that image.')
w('')
w('## The images')
w('')
w('| Image | File name | Shape | Reference pictures to look at |')
w('|---|---|---|---|')
for i, p in enumerate(items, 1):
    w('| %d | `%s` | %s | %s |' % (i, p['fname'], p['shape'], ', '.join('`%s`' % f for f in refs(p))))
w('')
w('## Shared rules for every image')
w('')
w('```text')
w(STYLE)
w('')
w(BG_T)
w('')
w(FILES)
w('```')
w('')
w('Save each image as a PNG at full size, with the file name from the table.')
for i, p in enumerate(items, 1):
    w('')
    w('---')
    w('')
    w('## Image %d: %s' % (i, p['title']))
    w('')
    w('- **File name:** `%s`' % p['fname'])
    w('- **Image shape:** %s' % p['shape'])
    w('- **Reference pictures:** %s' % ', '.join('`%s`' % f for f in refs(p)))
    w('- **What it is for:** %s' % p['purpose'])
    w('')
    w('```text')
    w(body(p))
    w('')
    w('Image shape: %s.' % p['shape'])
    w('```')
w('')
w('---')
w('')
w('## If an image is off')
w('')
w('I may send one of these with **redo**:')
w('')
for a, b in B['FIX']:
    w('- %s: "%s"' % (a, b))
w('')
open(OUT, 'w', encoding='utf-8').write('\n'.join(L))
print('images', len(items), 'refs', all_refs)

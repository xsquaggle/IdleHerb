#!/usr/bin/env python3
"""Builds one master file from any batch builder, so Lawson can run a whole batch in one ChatGPT chat.

Lawson, 2026-11-26: a long ChatGPT chat hit its maximum length, and pasting 20+ prompts again by hand is too much.
This file gives ChatGPT every image at once: the shared style rules once, then each image's own text, taken word
for word from the batch builder so the two can never drift. Lawson types "next" between images. It is the general
form of build_batch02_master.py and also handles images whose background line differs from the shared one
(back walls, which are painted edge to edge).

Lawson, 2026-11-27: "Send me a zip file as well as all of the extra required reference images and label them for which
prompt so that I don't have to add them manually every time I send it to ChatGPT, and I can send it all in one go."
So with --refs and --zip every reference picture goes into one zip, its name starting with the numbers of the images
it is for (img05_..., img01-13_...), and the master file uses those names. Lawson attaches two files and nothing else.

Usage: python3 build_master.py BUILDER.py OUT.md [PROMPT_NUMBER ...] [--refs DIR --zip OUT.zip]
       (no numbers: every prompt in the batch; DIR holds every reference picture under its plain name)
"""
import os
import runpy
import sys
import tempfile
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
REFS_DIR = ZIP = None
if '--refs' in args:
    i = args.index('--refs')
    REFS_DIR = args.pop(i + 1)
    args.pop(i)
if '--zip' in args:
    i = args.index('--zip')
    ZIP = args.pop(i + 1)
    args.pop(i)
assert (REFS_DIR is None) == (ZIP is None), '--refs and --zip go together'
BUILDER, OUT = args[0], args[1]
WANT = [int(a) for a in args[2:]]

argv = sys.argv
sys.argv = [BUILDER, os.path.join(tempfile.mkdtemp(), 'batch.md')]
B = runpy.run_path(os.path.join(HERE, BUILDER), run_name='batch')
sys.argv = argv
P, SETS, ROUNDS = B['P'], B['SETS'], B['ROUNDS']
REF, STYLE, BG_T, FILES = B['REF'], B['STYLE'], B['BG_T'], B['FILES']
WANT = WANT or [p['n'] for p in P]

set_of = {n: s for _, _, s, ns, _ in ROUNDS for n in ns}


def bg_of(p):
    return p.get('bg') or (BG_T if BG_T in p['prompt'] else B['BG_P'])


def body(p):
    """The image's own text: the prompt without the shared opening line and the shared closing blocks.
    A prompt that opens with its own reference line keeps it. A background line other than the shared one stays."""
    t = p['prompt']
    if t.startswith(REF + '\n\n'):
        t = t[len(REF) + 2:]
    t = t.split('\n\n' + STYLE, 1)[0]
    assert FILES in p['prompt'] and bg_of(p) in p['prompt'], p['n']
    if bg_of(p) != BG_T:
        t += '\n\n' + bg_of(p) + ' (This image uses this background line instead of the shared one.)'
    return t


def refs(p):
    return SETS[set_of[p['n']]][1] + p['att']


items = [P[n - 1] for n in WANT]
all_refs = []
for p in items:
    for f in refs(p):
        if f not in all_refs:
            all_refs.append(f)


def runs(ns):
    """[1, 2, 3, 5] -> '01-03+05'"""
    out, start = [], ns[0]
    for a, b in zip(ns, ns[1:] + [None]):
        if b != a + 1:
            out.append('%02d' % start if start == a else '%02d-%02d' % (start, a))
            start = b
    return '+'.join(out)


uses = {f: [p['n'] for p in items if f in refs(p)] for f in all_refs}
label = {f: ('img%s_%s' % (runs(uses[f]), f)) if ZIP else f for f in all_refs}


def names(p):
    return ', '.join('`%s`' % label[f] for f in refs(p))

L = []
w = L.append
w('# Sprout Tower: art images to make (master file)')
w('')
w('This file is for ChatGPT. It holds %d pixel-art images for a cozy idle game called Sprout Tower. '
  'Please make them **one at a time, in the order below**.' % len(items)
  + (' They keep their numbers from the full batch, so this file starts at Image %d.' % items[0]['n']
     if items[0]['n'] != 1 else ''))
w('')
w('## How to work')
w('')
w('1. Read this whole file first. Then look at every reference picture attached to this chat. If the pictures came '
  'inside a zip, unzip it and show me each picture once, so that you can see them.')
if ZIP:
    w('   Every picture is named for the images it belongs to: `img05_...` is for Image 5, `img01-13_...` is for Images '
      '1 to 13, and `img09+13_...` is for Images 9 and 13. When you make an image, look again at every picture whose '
      'name includes its number. The table below lists them too.')
w('2. Make **Image %d** now. After it, give me its FILES zip (see the shared rules), then stop.' % items[0]['n'])
w('3. When I type **next**, make the next image the same way. When I type **redo** and a sentence, redo the last '
  'image with that change.')
w('4. Every image must follow its own description **and** all of the shared rules below, word for word. Do not '
  'shorten the style rules when you write the prompt for the image tool.')
w('5. Use the reference pictures only for style (pixel size, outline, shading, colours) and for the layouts the '
  'description asks you to copy. Do not copy their content, except where an image\'s description names a person '
  'or a place in a reference picture to follow: then keep what it names.')
w('6. If this chat runs out of room, I will start a new chat with the same files and type **start at image N**. '
  'Then begin at that image.')
w('')
w('## The images')
w('')
w('| Image | File name | Shape | Reference pictures to look at |')
w('|---|---|---|---|')
for p in items:
    i = p['n']
    w('| %d | `%s` | %s | %s |' % (i, p['fname'], p['shape'], names(p)))
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
for p in items:
    i = p['n']
    w('')
    w('---')
    w('')
    w('## Image %d: %s' % (i, p['title']))
    w('')
    w('- **File name:** `%s`' % p['fname'])
    w('- **Image shape:** %s' % p['shape'])
    w('- **Reference pictures:** %s' % names(p))
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

if ZIP:
    readme = ['Reference pictures for the master file %s' % os.path.basename(OUT), '',
              'Each picture is named for the images it belongs to (img05 = Image 5, img01-13 = Images 1 to 13).', '']
    for p in items:
        i = p['n']
        readme.append('Image %d (%s): %s' % (i, p['title'], ', '.join(label[f] for f in refs(p))))
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('00_README_which_picture_for_which_image.txt', '\n'.join(readme) + '\n')
        for f in all_refs:
            z.write(os.path.join(REFS_DIR, f), label[f])
    print('zip', ZIP, len(all_refs) + 1, 'files')

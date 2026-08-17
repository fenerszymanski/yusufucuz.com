# Newsreader statics for Wix

The homepage widget loads Newsreader from Google Fonts, but the Wix blog cannot: Newsreader
is not in Wix's font library (nor are Lora or Spectral). So the blog uses these uploaded
static cuts instead, which keeps both halves of the site on the same typeface.

Five weights, matching what the homepage actually uses:

| File | Family | Style | Weight |
|------|--------|-------|--------|
| `Newsreader-Regular.ttf` | Newsreader | Regular | 400 |
| `Newsreader-Medium.ttf` | Newsreader | Medium | 500 |
| `Newsreader-SemiBold.ttf` | Newsreader | SemiBold | 600 |
| `Newsreader-Italic.ttf` | Newsreader | Italic | 400 |
| `Newsreader-MediumItalic.ttf` | Newsreader | Medium Italic | 500 |

## How they were made

Source: the official variable fonts in `google/fonts/ofl/newsreader`, instanced at
`opsz=16` with `fontTools.varLib.instancer`, then renamed by
`scripts/name-newsreader-statics.py`.

The rename step is not optional. The instancer keeps the variable font's name records, so
all three upright cuts came out of instancing calling themselves "Newsreader 16 Pt Regular".
Wix groups uploaded fonts by family name and reads the style from the subfamily, so without
the rewrite the dropdown shows five entries with three identical labels and you cannot tell
400 from 600. The script sets the typographic family/subfamily (name IDs 16/17),
`usWeightClass`, and the italic bits.

## Licence

Newsreader is under the SIL Open Font License 1.1 — see `OFL.txt`. Embedding and hosting are
permitted; the font is not sold on its own and keeps its name and licence.

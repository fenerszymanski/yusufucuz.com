"""Give each instanced Newsreader file a correct name table.

fontTools' instancer keeps the variable font's name records, so every static
cut came out calling itself "Newsreader 16 Pt Regular". Wix groups uploaded
fonts by family name and picks the style from the subfamily, so without this
all five files collide into one indistinguishable entry.
"""
from fontTools.ttLib import TTFont

# file -> (legacy family, legacy subfamily, typographic family,
#          typographic subfamily, weight class, italic)
PLAN = {
    "Newsreader-400.ttf":        ("Newsreader",          "Regular", "Newsreader", "Regular",       400, False),
    "Newsreader-500.ttf":        ("Newsreader Medium",   "Regular", "Newsreader", "Medium",        500, False),
    "Newsreader-600.ttf":        ("Newsreader SemiBold", "Regular", "Newsreader", "SemiBold",      600, False),
    "Newsreader-Italic-400.ttf": ("Newsreader",          "Italic",  "Newsreader", "Italic",        400, True),
    "Newsreader-Italic-500.ttf": ("Newsreader Medium",   "Italic",  "Newsreader", "Medium Italic", 500, True),
}

for filename, (fam, sub, tfam, tsub, weight, italic) in PLAN.items():
    font = TTFont(filename)
    full = fam if sub == "Regular" else f"{fam} {sub}"
    ps = full.replace(" ", "")
    records = {1: fam, 2: sub, 3: f"{ps};yusufucuz", 4: full, 6: ps, 16: tfam, 17: tsub}
    for name_id, value in records.items():
        font["name"].setName(value, name_id, 3, 1, 0x409)   # Windows
        font["name"].setName(value, name_id, 1, 0, 0)       # Macintosh
    font["OS/2"].usWeightClass = weight
    # fsSelection: bit 0 italic, bit 5 bold, bit 6 regular. Keep these honest so
    # Wix does not synthesise a slant or a weight on top of the real one.
    sel = font["OS/2"].fsSelection & ~(1 | (1 << 5) | (1 << 6))
    sel |= 1 if italic else (1 << 6)
    font["OS/2"].fsSelection = sel
    font["head"].macStyle = 2 if italic else 0
    out = f"named-{filename}"
    font.save(out)
    print(f"{out}: family={tfam!r} style={tsub!r} weight={weight}")

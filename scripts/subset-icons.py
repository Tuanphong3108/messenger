"""Subset Material Symbols (Rounded) down to the icons this extension uses.
Usage: python3 scripts/subset-icons.py   (needs: pip install fonttools brotli)"""
import subprocess, sys

ICONS = [
    "search", "arrow_back", "edit_square", "inbox", "archive", "settings",
    "open_in_new", "account_circle", "refresh", "close", "picture_in_picture",
    "chat_bubble", "tune", "person", "chat",
]
SRC = "node_modules/material-symbols/material-symbols-rounded.woff2"
OUT = "fonts/material-symbols-rounded.subset.woff2"

# letters + underscore are needed as ligature inputs; icon glyphs are kept by name
letters = [f"U+{ord(c):04X}" for c in "abcdefghijklmnopqrstuvwxyz_"]
cmd = [
    sys.executable, "-m", "fontTools.subset", SRC,
    f"--output-file={OUT}", "--flavor=woff2",
    "--unicodes=" + ",".join(letters),
    "--glyphs=" + ",".join(ICONS),
    "--layout-features=*", "--no-layout-closure",
    "--no-hinting", "--drop-tables+=DSIG",
]
subprocess.run(cmd, check=True)
print("wrote", OUT)

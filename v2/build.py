#!/usr/bin/env python3
"""Bundle src/ into a single self-contained index.html (CSS, JS and images inlined)."""
import base64, io, pathlib, re
from PIL import Image

HERE = pathlib.Path(__file__).parent
SRC = HERE / "src"
REPO = HERE.parent

def jpg_uri(path, width, q):
    im = Image.open(path).convert("RGB")
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

def png_uri(path, width=None):
    im = Image.open(path).convert("RGBA")
    if width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

html = (SRC / "index.template.html").read_text()
css = (SRC / "style.css").read_text()
imgs = {
    "aerial": jpg_uri(REPO / "ElPorvenir-Homepage.png", 1800, 74),
    "orchard": jpg_uri(REPO / "ElPorvenir-AboutUs.png", 1600, 74),
}
tree_png = png_uri(REPO / "assets/tree.png") if (REPO / "assets/tree.png").exists() else ""
logo_png = png_uri(REPO / "el-porvenir-logo-light.png", 400)

blank = "data:image/gif;base64,R0lGODlhAQABAAAAACw="
html = html.replace('src="{{IMG_AERIAL}}"', f'src="{blank}" data-img="aerial"')
html = html.replace('src="{{IMG_AERIAL_S}}"', f'src="{blank}" data-img="aerial"')
html = html.replace('src="{{IMG_ORCHARD_S}}"', f'src="{blank}" data-img="orchard"')
html = html.replace("{{IMG_TREE}}", tree_png).replace("{{IMG_LOGO}}", logo_png)

js_img = "window.EP_IMG=" + "{" + ",".join(f'"{k}":"{v}"' for k, v in imgs.items()) + "};\n"
js = js_img + "\n".join((SRC / f).read_text() for f in ["i18n.js", "tree.js", "map.js", "audio.js", "main.js"])

html = html.replace("/*CSS*/", css).replace("/*JS*/", js)
assert "{{" not in html, re.findall(r"\{\{[A-Z_]+\}\}", html)
out = HERE / "index.html"
out.write_text(html)
print(out, f"{len(html)/1024:.0f} KB")

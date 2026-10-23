"""Generates docs/assets/banner.svg (+ .png) and social-preview.svg (+ .png). Run: python3 docs/assets/make_banner.py"""
import cairosvg, os

OUT = os.path.dirname(__file__)
BRAND, DARK, INK, MUTED, PAPER = "#0f6b4c", "#0a4a35", "#10211b", "#55665f", "#f6f4ee"
RISK = {"high": "#e5484d", "med": "#f2a33a", "low": "#3fa96b"}
SERIF = "Fraunces, Georgia, 'DejaVu Serif', serif"
SANS = "'Plus Jakarta Sans', 'Segoe UI', Arial, 'DejaVu Sans', sans-serif"

def scene(cx, cy, W, H):
    P = lambda gx, gy, z=0: (cx + (gx - gy) * W, cy + (gx + gy) * H - z)
    pts = lambda *ps: " ".join(f"{x:.1f},{y:.1f}" for x, y in ps)
    o = []
    # ground, river, roads
    o.append(f'<polygon points="{pts(P(-0.4,-0.4),P(6.6,-0.4),P(6.6,7.2),P(-0.4,7.2))}" fill="#e8e3d3" stroke="#cbc4ae"/>')
    o.append(f'<polygon points="{pts(P(-0.4,5.4),P(6.6,5.4),P(6.6,7.2),P(-0.4,7.2))}" fill="#4f96d3"/>')
    for gx in (1.45, 2.95, 4.45):
        o.append(f'<polygon points="{pts(P(gx-0.05,-0.4),P(gx+0.05,-0.4),P(gx+0.05,5.4),P(gx-0.05,5.4))}" fill="#8a8e91"/>')
    for gy in (1.45, 2.95, 4.45):
        o.append(f'<polygon points="{pts(P(-0.4,gy-0.05),P(6.6,gy-0.05),P(6.6,gy+0.05),P(-0.4,gy+0.05))}" fill="#8a8e91"/>')
    # houses (gx, gy, height px, floors-risk)
    houses = []
    for j, gy in enumerate((0.15, 1.6, 3.1, 4.6)):
        for i, gx in enumerate((0.15, 1.6, 3.1, 4.6)):
            if (i, j) in ((1, 2), (2, 2)): continue  # park
            risk = "low" if j == 0 else "med" if j == 1 else "high"
            h = 34 + ((i * 7 + j * 11) % 4) * 9
            houses.append((gx, gy, h, risk))
    for gx, gy, h, risk in sorted(houses, key=lambda t: t[0] + t[1]):
        s = 1.05
        a, b, c, d = (gx, gy), (gx + s, gy), (gx + s, gy + s), (gx, gy + s)
        # raised plot
        o.append(f'<polygon points="{pts(P(gx-0.1,gy-0.1),P(gx+s+0.1,gy-0.1),P(gx+s+0.1,gy+s+0.1),P(gx-0.1,gy+s+0.1))}" fill="#d9d2bd" stroke="#b9b093" stroke-width="0.6"/>')
        o.append(f'<polygon points="{pts(P(*b,h),P(*c,h),P(*c,0),P(*b,0))}" fill="#c7bea6" stroke="#a79f88" stroke-width="0.6"/>')
        o.append(f'<polygon points="{pts(P(*c,h),P(*d,h),P(*d,0),P(*c,0))}" fill="#d8d0bc" stroke="#a79f88" stroke-width="0.6"/>')
        o.append(f'<polygon points="{pts(P(*a,h),P(*b,h),P(*c,h),P(*d,h))}" fill="#e9e4d4" stroke="{RISK[risk]}" stroke-width="3"/>')
        for k in range(2):  # a few windows on each visible face
            for u in (0.2, 0.55):
                z0 = 8 + k * (h - 14) / 2
                o.append(f'<polygon points="{pts(P(gx+s,gy+s*u,z0+10),P(gx+s,gy+s*(u+0.2),z0+10),P(gx+s,gy+s*(u+0.2),z0),P(gx+s,gy+s*u,z0))}" fill="#8db5cc"/>')
                o.append(f'<polygon points="{pts(P(gx+s*u,gy+s,z0+10),P(gx+s*(u+0.2),gy+s,z0+10),P(gx+s*(u+0.2),gy+s,z0),P(gx+s*u,gy+s,z0))}" fill="#8db5cc"/>')
        tx, ty = P(gx + s * 0.28, gy + s * 0.3, h)
        o.append(f'<ellipse cx="{tx:.1f}" cy="{ty-3:.1f}" rx="3.2" ry="4.2" fill="#3b3f44"/>')  # rooftop water tank
    for gx, gy in ((2.3, 3.7), (2.7, 4.1), (2.0, 4.2), (3.4, 3.8), (-0.2, 2.2), (6.2, 1.0), (6.3, 3.0)):  # trees and park
        x, y = P(gx, gy)
        o.append(f'<ellipse cx="{x:.1f}" cy="{y-14:.1f}" rx="9" ry="11" fill="#3f8f4f"/><rect x="{x-1.5:.1f}" y="{y-5:.1f}" width="3" height="6" fill="#6b4a2f"/>')
    # illustrative flood water over the low rows
    o.append(f'<polygon points="{pts(P(-0.4,4.55,6),P(6.6,4.55,6),P(6.6,7.2,6),P(-0.4,7.2,6))}" fill="#3b82c4" opacity="0.5"/>')
    for k in range(5):
        x1, y1 = P(0.2 + k * 1.3, 5.4 + (k % 2) * 0.5, 6)
        o.append(f'<path d="M{x1:.1f},{y1:.1f} q10,-5 20,0 t20,0" stroke="#eaf5ff" stroke-width="2" fill="none" opacity="0.85"/>')
    return "\n".join(o)

def chip(x, y, text, w, fill="#ffffff", stroke="#d9d4c5", colour=INK, size=15):
    return (f'<g><rect x="{x}" y="{y}" width="{w}" height="34" rx="17" fill="{fill}" stroke="{stroke}"/>'
            f'<text x="{x + w/2}" y="{y + 22}" text-anchor="middle" font-family="{SANS}" font-size="{size}" font-weight="600" fill="{colour}">{text}</text></g>')

def shield(x, y, s=1.0):
    return (f'<g transform="translate({x},{y}) scale({s})"><path d="M24 2 L44 10 V24 C44 36 35 44 24 48 C13 44 4 36 4 24 V10 Z" fill="{BRAND}"/>'
            '<path d="M14 25 l7 7 l13 -15" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>')

def banner(w, h, title_size, sub_size, scene_scale, social=False):
    cx, cy = w * (0.745 if not social else 0.775), h * (0.20 if not social else 0.27)
    W, H = 50 * scene_scale, 25 * scene_scale
    top = 78 if not social else 70
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="EcoShield AI banner: Know the risk. Protect what matters. Prove the impact.">
  <defs>
    <radialGradient id="g1" cx="85%" cy="-10%" r="70%"><stop offset="0" stop-color="{BRAND}" stop-opacity="0.16"/><stop offset="1" stop-color="{BRAND}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="-5%" cy="40%" r="60%"><stop offset="0" stop-color="#2f7fc1" stop-opacity="0.12"/><stop offset="1" stop-color="#2f7fc1" stop-opacity="0"/></radialGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#10211b" flood-opacity="0.15"/></filter>
  </defs>
  <rect width="{w}" height="{h}" fill="{PAPER}"/><rect width="{w}" height="{h}" fill="url(#g1)"/><rect width="{w}" height="{h}" fill="url(#g2)"/>
  {shield(60, top - 8, 1.0)}
  <text x="120" y="{top + 28}" font-family="{SANS}" font-size="30" font-weight="800" fill="{INK}">EcoShield AI</text>
  <text x="60" y="{top + 110}" font-family="{SERIF}" font-size="{title_size}" font-weight="700" fill="{INK}">Know the Risk.</text>
  <text x="60" y="{top + 110 + title_size * 1.12}" font-family="{SERIF}" font-size="{title_size}" font-weight="700" fill="{BRAND}">Protect What Matters.</text>
  <text x="60" y="{top + 110 + title_size * 2.24}" font-family="{SERIF}" font-size="{title_size}" font-weight="700" fill="{BRAND}">Prove the Impact.</text>
  <text x="60" y="{top + 130 + title_size * 2.24 + sub_size}" font-family="{SANS}" font-size="{sub_size}" fill="{MUTED}">AI-guided flood preparedness and blockchain-verified</text>
  <text x="60" y="{top + 134 + title_size * 2.24 + sub_size * 2.3}" font-family="{SANS}" font-size="{sub_size}" fill="{MUTED}">community climate action.</text>
  {chip(60, h - 74, "Real rainfall data", 168)}{chip(240, h - 74, "AI assistant", 130)}{chip(382, h - 74, "3D climate twin", 158)}{chip(552, h - 74, "Sepolia proof", 138)}
  <g filter="url(#sh)">{scene(cx, cy, W, H)}</g>
  <g filter="url(#sh)"><rect x="{w - 372}" y="{h - 118}" width="300" height="64" rx="14" fill="#ffffff" stroke="#d9d4c5"/>
    <circle cx="{w - 336}" cy="{h - 86}" r="14" fill="{BRAND}"/><path d="M{w-343} {h-86} l5 5 l9 -10" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="{w - 312}" y="{h - 92}" font-family="{SANS}" font-size="16" font-weight="700" fill="{INK}">Verified on the blockchain</text>
    <text x="{w - 312}" y="{h - 70}" font-family="{SANS}" font-size="13" fill="{MUTED}">Unchanged since approval.</text></g>
  <text x="{w - 60}" y="34" text-anchor="end" font-family="{SANS}" font-size="13" fill="{MUTED}">Illustrative demo colony. Flood water is a simulated scenario.</text>
</svg>'''

for name, (w, h, ts, ss, sc, social) in {"banner": (1600, 520, 54, 21, 1.0, False), "social-preview": (1280, 640, 46, 20, 0.78, True)}.items():
    svg = banner(w, h, ts, ss, sc, social)
    open(os.path.join(OUT, f"{name}.svg"), "w").write(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(OUT, f"{name}.png"))
print("ok")

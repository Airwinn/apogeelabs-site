# Apogee Labs — the mark

An apogee is the far point of an orbit, so the mark *is* one: a tilted ellipse
cut open, with a solid dot parked exactly where the path reaches its furthest
point. The dot sits on the ellipse's own major axis — it is not decoration, it
is the apogee, and the gap is the only thing the eye has to complete.

Two elements, one accent. The orbit carries `currentColor` so it inverts for
free in dark mode; the dot is the single brand colour, **apogee violet
`#6D5BF7`**, chosen because none of the four apps owns a violet (Marge green,
Notch coral, Ribh green, Kept amber) — the studio reads as the frame around
them, never as a fifth app.

Wordmark is **Space Grotesk SemiBold**, converted to outlines so every SVG is
self-contained. It is a geometric sans with enough quirk (that single-storey
`g`, the flat-sided `e`) to stop the lockup feeling like a default, and its
squared terminals echo the mark's cut ends.

At small sizes the mark is optically retuned, not merely scaled: heavier stroke,
larger dot and a wider opening (58° instead of 48°), so at 16px the dot still
reads as separate from the arc instead of welding onto it. The icon sits on the
brand neutral `#0B0D14`, a navy dark enough to hold the violet without glare.

## Files

| File | What it is |
|---|---|
| `assets/logo.svg` | Mark + wordmark lockup. Ink is `currentColor`. |
| `assets/mark.svg` | Mark only, 100×100. |
| `assets/favicon.svg` | Rounded-square icon, small-size tuning. |
| `favicon.ico` | 16/32/48 from the same icon. |
| `assets/apple-touch-icon.png` | 180×180, full-bleed (iOS masks its own corners). |
| `assets/og-image.png` | 1200×630 social card, rendered from `assets/og-image.svg`. |

## Re-rendering

```sh
rsvg-convert -w 1200 -h 630 assets/og-image.svg -o assets/og-image.png
rsvg-convert -w 180  -h 180 assets/favicon.svg  -o assets/apple-touch-icon.png   # then flatten corners
```

Colours live in one place on the site: `--brand` / `--brand-ink` in
`assets/css/style.css`. Change them there and the whole site follows.

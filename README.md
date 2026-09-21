# Apogee Labs site

Static, zero-dependency. Push this repo to GitHub, enable Pages (Settings ->
Pages -> Deploy from branch -> `main` / root), done.

## Custom domain (once bought — see domain report from the build agent)

1. Rename `CNAME.example` to `CNAME` (already contains the recommended domain).
2. At your registrar, point the apex domain at GitHub Pages:
   - **A**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **AAAA**: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - **CNAME** (if using `www`): `<your-github-username>.github.io`
3. In repo Settings -> Pages, set the custom domain and check "Enforce HTTPS"
   once the certificate is issued (can take a few hours).

## Regenerating QR codes

Edit `BASE_URL` in `build-qr.py`, then: `pip install segno && python3 build-qr.py`.
Regenerates `qr/*.svg` (site) and `qr/print/*.png` (1024px, print-ready).

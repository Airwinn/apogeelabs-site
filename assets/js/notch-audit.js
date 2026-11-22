/* Notch Roommate Chore Audit. Vanilla JS, no dependencies, nothing leaves the
   browser. Pure scoring lives in audit(); the DOM part only runs in a page. */

// Owner: swap PT_PLACEHOLDER for the real App Store provider token here.
var IOS_URL  = "https://apps.apple.com/app/id6773518599?pt=PT_PLACEHOLDER&ct=site-audit&mt=8";
var PLAY_URL = "https://play.google.com/store/apps/details?id=com.notch.app&referrer=utm_source%3Dsite%26utm_medium%3Daudit%26utm_campaign%3Dnotch-1-2-4";

var CHORES = ["dishes", "trash", "bathroom", "floors", "surfaces", "shopping"];
var WEIGHT = { dishes: 1, trash: 1, bathroom: 3, floors: 2, surfaces: 1.5, shopping: 2 };

/* people: [{name, counts:{dishes:n,...}}]. Returns shares, fairness 0-100, and
   who is on top / lightest. kind: empty | solo | tie | even | fair | uneven | lopsided */
function audit(people) {
  var n = people.length;
  var pts = people.map(function (p) {
    return CHORES.reduce(function (s, c) { return s + (WEIGHT[c] * Math.max(0, +(p.counts || {})[c] || 0)); }, 0);
  });
  var total = pts.reduce(function (a, b) { return a + b; }, 0);
  var rows = people.map(function (p, i) {
    return { name: p.name, points: pts[i], share: total ? pts[i] / total : 0 };
  });
  var max = Math.max.apply(null, pts), min = Math.min.apply(null, pts);
  var top = rows.filter(function (r) { return r.points === max; }).map(function (r) { return r.name; });
  var least = rows.filter(function (r) { return r.points === min; }).map(function (r) { return r.name; });
  rows.sort(function (a, b) { return b.points - a.points; });
  var out = { n: n, total: total, rows: rows, top: top, least: least, fairness: null, kind: "empty" };
  if (n < 1 || !total) return out;
  if (n === 1) { out.fairness = 100; out.kind = "solo"; return out; }
  var tvd = rows.reduce(function (s, r) { return s + Math.abs(r.share - 1 / n); }, 0) / 2;
  out.fairness = Math.round(100 * (1 - tvd / (1 - 1 / n)));
  out.kind = max === min ? "tie" : out.fairness >= 90 ? "even" : out.fairness >= 70 ? "fair" : out.fairness >= 40 ? "uneven" : "lopsided";
  return out;
}

if (typeof module !== "undefined") module.exports = { audit: audit, CHORES: CHORES };

if (typeof document !== "undefined") (function () {
  var T = {
    en: {
      chores: { dishes: "Dishes", trash: "{trash}", bathroom: "Bathroom", floors: "Floors", surfaces: "Kitchen surfaces", shopping: "Shopping" },
      days: ["M", "T", "W", "T", "F", "S", "S"],
      names: "Who lives here?", nameN: "{R} {n}", add: "Add {r}", remove: "Remove {name}",
      counts: "Times done in the last 7 days", plus: "One more for {name}, {chore}", minus: "One less for {name}, {chore}",
      run: "Run the audit", verdict: "Official verdict", fairness: "Fairness", top: "Top contributor", least: "Lightest load",
      need: "Add at least one name.", save: "Save image", share: "Share", print: "Print the chart", again: "Edit",
      printTitle: "Weekly chore chart", cta: "Try it now on the App Store and Google Play",
      ios: "App Store", play: "Google Play", cardCta: "Keep score for real. Try Notch on the App Store and Google Play",
      alt: "Your shareable verdict card", scan: "Scan to join", and: " & ",
      v: {
        empty: ["No chores logged.", "Suspiciously clean, or nobody counted? Pip raises one eyebrow."],
        solo: ["A one-{r} {home}.", "Everything is {top}'s doing. Pip salutes you."],
        tie: ["A perfect tie.", "Everyone did the same. Pip is framing this {home}."],
        even: ["Beautifully fair.", "Case closed. {top} edges ahead, kindly."],
        fair: ["Mostly fair, tiny wobble.", "{top} did a bit more. A thank-you goes a long way."],
        uneven: ["Uneven. Time for a chat.", "{top} carries more. {least}, Pip believes in a comeback."],
        lopsided: ["Most of the work sits with {top}.", "Thank them loudly. {least}, a sponge awaits you."]
      }
    },
    fr: {
      chores: { dishes: "Vaisselle", trash: "Poubelles", bathroom: "Salle de bain", floors: "Sols", surfaces: "Plans de cuisine", shopping: "Courses" },
      days: ["L", "M", "M", "J", "V", "S", "D"],
      names: "Qui habite ici ?", nameN: "Colocataire {n}", add: "Ajouter un colocataire", remove: "Retirer {name}",
      counts: "Fois faites ces 7 derniers jours", plus: "Un de plus pour {name}, {chore}", minus: "Un de moins pour {name}, {chore}",
      run: "Lancer l'audit", verdict: "Verdict officiel", fairness: "Équité", top: "Le plus actif", least: "Le plus léger",
      need: "Ajoute au moins un prénom.", save: "Enregistrer l'image", share: "Partager", print: "Imprimer le tableau", again: "Modifier",
      printTitle: "Tableau des tâches de la semaine", cta: "Essaie-le maintenant sur l'App Store et Google Play",
      ios: "App Store", play: "Google Play", cardCta: "Fais les comptes pour de vrai. Essaie Notch sur l'App Store et Google Play",
      alt: "Ta carte verdict à partager", scan: "Scanne pour rejoindre", and: " et ",
      v: {
        empty: ["Aucune tâche notée.", "Trop propre pour être vrai, ou personne n'a compté ? Pip lève un sourcil."],
        solo: ["Une coloc à une personne.", "Tout est l'œuvre de {top}. Pip te salue."],
        tie: ["Égalité parfaite.", "Tout le monde a fait pareil. Pip encadre cette coloc."],
        even: ["Joliment équitable.", "Affaire classée. {top} garde une courte longueur d'avance."],
        fair: ["Plutôt équitable, un léger écart.", "{top} en a fait un peu plus. Un merci fait du bien."],
        uneven: ["Inégal. Il est temps d'en parler.", "{top} porte plus que sa part. {least}, Pip croit à ton retour."],
        lopsided: ["L'essentiel du travail repose sur {top}.", "Remerciez-le bien fort. {least}, une éponge t'attend."]
      }
    }
  };

  var lang = document.documentElement.lang === "fr" ? "fr" : "en";
  var S = T[lang];
  var nl = (navigator.language || "en-US").toLowerCase();
  var W = { r: "roommate", home: "apartment", trash: "Trash" };
  if (lang === "en") {
    if (/^en-(au)/.test(nl)) W = { r: "housemate", home: "share house", trash: "Bins" };
    else if (/^en-(gb|ie|nz|za|in)/.test(nl)) W = { r: "flatmate", home: "flat", trash: "Bins" };
  }
  function fill(s, o) {
    o = o || {};
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      if (k in o) return o[k];
      if (k === "R") return W.r.charAt(0).toUpperCase() + W.r.slice(1);
      return k in W ? W[k] : m;
    });
  }
  function chore(c) { return fill(S.chores[c]); }

  var $ = function (id) { return document.getElementById(id); };
  var base = document.currentScript ? document.currentScript.getAttribute("data-base") || "../../" : "../../";
  var people = [{ name: "", counts: {} }, { name: "", counts: {} }];
  var last = null, blob = null;

  function nm(p, i) { return p.name.trim() || fill(S.nameN, { n: i + 1, R: fill("{R}") }); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function renderNames() {
    var box = $("names"); box.textContent = "";
    people.forEach(function (p, i) {
      var row = el("div", "au-row");
      var lab = el("label", "au-sr", nm({ name: "" }, i)); lab.htmlFor = "n" + i;
      var inp = el("input"); inp.id = "n" + i; inp.type = "text"; inp.maxLength = 16; inp.value = p.name;
      inp.autocomplete = "off"; inp.placeholder = nm({ name: "" }, i);
      inp.oninput = function () { p.name = inp.value; renderCounts(); };
      row.append(lab, inp);
      if (people.length > 1) {
        var rm = el("button", "au-icon", "×"); rm.type = "button";
        rm.setAttribute("aria-label", fill(S.remove, { name: nm(p, i) }));
        rm.onclick = function () { people.splice(i, 1); renderNames(); renderCounts(); };
        row.append(rm);
      }
      box.append(row);
    });
    $("add").hidden = people.length >= 5;
  }

  function renderCounts() {
    var box = $("counts"); box.textContent = "";
    CHORES.forEach(function (c) {
      var g = el("fieldset", "au-chore"), lg = el("legend", null, chore(c));
      g.append(lg);
      people.forEach(function (p, i) {
        var row = el("div", "au-step"), who = el("span", "au-who", nm(p, i)), v = (p.counts[c] || 0);
        var minus = el("button", "au-icon", "−"), val = el("output", "au-val", String(v)), plus = el("button", "au-icon", "+");
        minus.type = plus.type = "button";
        minus.setAttribute("aria-label", fill(S.minus, { name: nm(p, i), chore: chore(c) }));
        plus.setAttribute("aria-label", fill(S.plus, { name: nm(p, i), chore: chore(c) }));
        function set(x) { p.counts[c] = Math.max(0, Math.min(14, x)); val.textContent = p.counts[c]; }
        minus.onclick = function () { set((p.counts[c] || 0) - 1); };
        plus.onclick = function () { set((p.counts[c] || 0) + 1); };
        row.append(who, minus, val, plus); g.append(row);
      });
      box.append(g);
    });
  }

  function list(a) { return a.join(S.and); }
  function verdictText(r) {
    var v = S.v[r.kind], o = { top: list(r.top), least: list(r.least) };
    return [fill(v[0], o), fill(v[1], o)];
  }

  // ---- card (1080x1920 canvas) ----
  function wrap(ctx, text, maxW) {
    var words = text.split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function drawCard(r, done) {
    var cv = $("card"), ctx = cv.getContext("2d"), W_ = 1080, H = 1920, f = "'Space Grotesk', -apple-system, 'SF Pro Display', system-ui, sans-serif";
    var icon = new Image();
    function paint() {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#14141a"); g.addColorStop(1, "#0B0D14");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W_, H);
      var rg = ctx.createRadialGradient(540, 120, 0, 540, 120, 800);
      rg.addColorStop(0, "rgba(255,77,77,.30)"); rg.addColorStop(1, "rgba(255,77,77,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W_, H);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      if (icon.complete && icon.naturalWidth) {
        ctx.save(); ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(90, 100, 120, 120, 28); else ctx.rect(90, 100, 120, 120);
        ctx.clip(); ctx.drawImage(icon, 90, 100, 120, 120); ctx.restore();
      }
      ctx.fillStyle = "#f5f5f7"; ctx.font = "600 56px " + f; ctx.fillText("Notch", 236, 178);
      ctx.fillStyle = "#FF4D4D"; ctx.font = "600 34px " + f; ctx.fillText(S.verdict.toUpperCase(), 90, 340);
      var vt = verdictText(r);
      ctx.fillStyle = "#f5f5f7"; ctx.font = "600 92px " + f;
      var y = 450;
      wrap(ctx, vt[0], 900).slice(0, 4).forEach(function (l) { ctx.fillText(l, 90, y); y += 104; });
      ctx.fillStyle = "rgba(245,245,247,.72)"; ctx.font = "500 40px " + f; y += 14;
      wrap(ctx, vt[1], 900).slice(0, 4).forEach(function (l) { ctx.fillText(l, 90, y); y += 56; });
      y = Math.max(y + 50, 880);
      if (r.fairness != null) {
        ctx.fillStyle = "#9C8FFF"; ctx.font = "600 150px " + f; ctx.fillText(r.fairness, 90, y + 110);
        var w = ctx.measureText(String(r.fairness)).width;
        ctx.fillStyle = "rgba(245,245,247,.6)"; ctx.font = "600 44px " + f; ctx.fillText("/100  " + S.fairness, 90 + w + 16, y + 110);
        y += 190;
      }
      var rows = r.rows.slice(0, 5);
      rows.forEach(function (row, i) {
        ctx.fillStyle = "#f5f5f7"; ctx.font = "600 44px " + f; ctx.fillText(row.name, 90, y + 40);
        ctx.textAlign = "right"; ctx.fillText(Math.round(row.share * 100) + "%", 990, y + 40); ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(90, y + 62, 900, 22);
        ctx.fillStyle = i === 0 && r.kind !== "empty" ? "#FF4D4D" : "#6D5BF7";
        ctx.fillRect(90, y + 62, Math.max(8, 900 * row.share), 22);
        y += 140;
      });
      ctx.fillStyle = "#f5f5f7"; ctx.font = "600 42px " + f;
      var cl = wrap(ctx, S.cardCta, 900), cy = 1780 - (cl.length - 1) * 54;
      cl.forEach(function (l) { ctx.fillText(l, 90, cy); cy += 54; });
      ctx.fillStyle = "rgba(245,245,247,.5)"; ctx.font = "500 32px " + f; ctx.fillText("apogeelabs.org/notch", 90, 1860);
      cv.toBlob(function (b) { blob = b; done && done(); }, "image/png");
    }
    icon.onload = icon.onerror = function () { (document.fonts && document.fonts.load ? document.fonts.load("600 40px 'Space Grotesk'") : Promise.resolve()).then(paint, paint); };
    icon.src = base + "assets/img/apps/notch-icon-192.png";
  }

  function run() {
    var ps = people.map(function (p, i) { return { name: nm(p, i), counts: p.counts }; });
    last = audit(ps);
    var r = last, vt = verdictText(r);
    $("v-head").textContent = vt[0]; $("v-sub").textContent = vt[1];
    $("v-score").textContent = r.fairness == null ? "" : S.fairness + " " + r.fairness + "/100";
    $("v-top").textContent = r.total && r.n > 1 && r.kind !== "tie" ? S.top + ": " + list(r.top) + " · " + S.least + ": " + list(r.least) : "";
    var ul = $("v-rank"); ul.textContent = "";
    r.rows.forEach(function (row) {
      var li = el("li"), b = el("span", "au-bar"); b.style.setProperty("--w", Math.round(row.share * 100) + "%");
      li.append(el("span", null, row.name), el("b", null, Math.round(row.share * 100) + "%"), b); ul.append(li);
    });
    $("result").hidden = false;
    drawCard(r, function () {
      $("result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }

  function buildSheet() {
    var t = $("sheet-table"); t.textContent = "";
    var head = el("tr"); head.append(el("th"));
    people.forEach(function (p, i) { head.append(el("th", null, nm(p, i))); });
    t.append(head);
    CHORES.forEach(function (c) {
      var tr = el("tr"); tr.append(el("th", null, chore(c)));
      people.forEach(function () {
        var td = el("td");
        S.days.forEach(function (d) { var s = el("span", "au-day", d); td.append(s); });
        tr.append(td);
      });
      t.append(tr);
    });
  }

  function init() {
    $("t-names").textContent = S.names; $("t-counts").textContent = S.counts;
    $("add").textContent = "+ " + fill(S.add); $("run").textContent = S.run;
    $("save").textContent = S.save; $("share").textContent = S.share; $("print").textContent = S.print;
    $("card").setAttribute("aria-label", S.alt);
    $("cta").textContent = S.cta;
    $("ios").href = IOS_URL; $("play").href = PLAY_URL;
    $("ios").textContent = S.ios; $("play").textContent = S.play;
    $("sheet-title").textContent = S.printTitle; $("sheet-cta").textContent = S.cta; $("sheet-scan").textContent = S.scan;
    $("add").onclick = function () { if (people.length < 5) { people.push({ name: "", counts: {} }); renderNames(); renderCounts(); } };
    $("run").onclick = run;
    $("save").onclick = function () {
      if (!blob) return;
      var a = el("a"); a.href = URL.createObjectURL(blob); a.download = "notch-chore-audit.png";
      document.body.append(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    };
    $("share").onclick = function () {
      if (!blob) return;
      var file = new File([blob], "notch-chore-audit.png", { type: "image/png" });
      navigator.share({ files: [file], title: "Notch" }).catch(function () {});
    };
    try {
      var probe = new File([new Blob(["x"])], "a.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [probe] }) && navigator.share) $("share").hidden = false;
    } catch (e) {}
    $("print").onclick = function () { buildSheet(); window.print(); };
    renderNames(); renderCounts();
  }
  init();
})();

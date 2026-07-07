import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/**
 * Enrolli — Waitlist landing page
 * Ported faithfully from the Claude Design file (Waitlist.dc.html).
 *
 * Self-contained: drops the brand tokens, fonts, and component styles into a
 * scoped <style> block so this file works on its own inside the Vite app.
 *
 * Fonts: loaded from Google Fonts via the @import at the top of the <style>
 * block. If you'd rather avoid the render-time @import, add this to index.html
 * <head> instead and delete the @import line:
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;700&family=Nunito:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600&display=swap" rel="stylesheet">
 *
 * The signup form currently confirms client-side (matches the design). Where to
 * add the Supabase insert is marked clearly in handleSubmit() below — that's a
 * backend change I'd want you to review before we wire it up.
 */

// Launch target: August 1, 2026, 10:00 AM Central (-05:00 CDT)
const LAUNCH = Date.parse("2026-08-01T10:00:00-05:00");

// ── Enrolli wordmark ──────────────────────────────────────────────
// Fredoka 700, rotating warm letter colors, green dot after the final "i".
const LOGO_LETTERS = [
  ["e", "#F4944B"],
  ["n", "#E07230"],
  ["r", "#F4944B"],
  ["o", "#E47563"],
  ["l", "#F4944B"],
  ["l", "#E07230"],
  ["i", "#E47563"],
  [".", "#87AC48"],
];

function Logo({ size = "1.8rem" }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.5px",
        userSelect: "none",
      }}
      aria-label="Enrolli"
    >
      {LOGO_LETTERS.map(([ch, color], i) => (
        <span key={i} style={{ color }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, LAUNCH - now);
  return {
    d: String(Math.floor(diff / 86400000)),
    h: pad(Math.floor(diff / 3600000) % 24),
    m: pad(Math.floor(diff / 60000) % 60),
    s: pad(Math.floor(diff / 1000) % 60),
  };
}

export default function Waitlist() {
  const cd = useCountdown();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.target);
    const first = (fd.get("first") || "").toString().trim();

    const { error: insertError } = await supabase.from("waitlist").insert({
      first_name: first,
      last_name: (fd.get("last") || "").toString().trim() || null,
      email: (fd.get("email") || "").toString().trim(),
      role: fd.get("role") || null,
      grad_year: fd.get("grad") || null,
    });

    setSubmitting(false);

    // 23505 = unique violation → they're already on the list, treat as success.
    if (insertError && insertError.code !== "23505") {
      console.error(insertError);
      setError("Something went wrong. Please try again.");
      return;
    }

    setName(first);
    setSubmitted(true);
  };

  return (
    <div className="enr-waitlist">
      <style>{styles}</style>

      {/* ── header ── */}
      <header className="enr-header">
        <Logo size="1.8rem" />
        <a href="#waitlist-form" className="enr-pill enr-pill--green">
          <span className="dot dot--green" />
          Join the waitlist
        </a>
      </header>

      {/* ── hero spotlight ── */}
      <section className="enr-hero">
        <span className="blob blob--yellow" />
        <span className="blob blob--coral" />
        <span className="blob blob--orange" />
        <div className="enr-hero__inner">
          <span className="eyebrow eyebrow--orange">
            <span className="dot dot--orange" />
            The wait is almost over
          </span>

          <div className="countdown">
            <div className="cd-unit">
              <div className="cd-num">{cd.d}</div>
              <div className="cd-label">Days</div>
            </div>
            <div className="cd-colon">:</div>
            <div className="cd-unit">
              <div className="cd-num">{cd.h}</div>
              <div className="cd-label">Hours</div>
            </div>
            <div className="cd-colon">:</div>
            <div className="cd-unit">
              <div className="cd-num">{cd.m}</div>
              <div className="cd-label">Mins</div>
            </div>
            <div className="cd-colon">:</div>
            <div className="cd-unit">
              <div className="cd-num cd-num--orange">{cd.s}</div>
              <div className="cd-label">Secs</div>
            </div>
          </div>

          <p className="enr-hero__when">Doors open August 1 · 10:00 AM Central</p>

          <h1 className="enr-hero__title">
            Colleges that <span className="accent-orange">actually fit.</span>
            &nbsp;Everything you need to decide.
          </h1>
          <p className="enr-hero__sub">
            Be first in line when Enrolli opens, and lock in a founding-member
            discount on Match &amp; Match+.
          </p>
        </div>
      </section>

      {/* ── form / success band ── */}
      <section id="waitlist-form" className="enr-form-band">
        <div className="enr-form-wrap">
          {!submitted ? (
            <div className="enr-card enr-card--green">
              <h2 className="enr-form__title">Claim your spot</h2>
              <p className="enr-form__note">
                Founding-member pricing closes at launch.
              </p>
              <form onSubmit={handleSubmit} className="enr-form">
                <div className="row">
                  <input
                    name="first"
                    required
                    placeholder="First name"
                    className="field"
                  />
                  <input name="last" placeholder="Last name" className="field" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="field"
                />
                <div className="row">
                  <select name="role" required className="field field--select">
                    <option value="">I'm a…</option>
                    <option>Student</option>
                    <option>Parent</option>
                    <option>Counselor</option>
                  </select>
                  <select name="grad" className="field field--select">
                    <option value="">Class of…</option>
                    <option>2026</option>
                    <option>2027</option>
                    <option>2028</option>
                    <option>2029+</option>
                    <option>N/A</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn--primary btn--block"
                  disabled={submitting}
                >
                  <span className="dot dot--white" />
                  {submitting ? "Reserving…" : "Reserve My Spot"}
                </button>
                {error && <p className="enr-form__error">{error}</p>}
              </form>
            </div>
          ) : (
            <div className="enr-card enr-card--green enr-success">
              <div className="enr-success__check">✓</div>
              <h2 className="enr-success__title">
                You're in, {name || "friend"}! 🎉
              </h2>
              <p className="enr-success__body">
                Your founding-member discount is reserved. We'll email you the
                second Enrolli goes live on August 1.
              </p>
              <p className="enr-success__count">Just {cd.d} days to go.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── match features ── */}
      <section className="sec sec--yellowpale">
        <div className="wrap-narrow">
          <h2 className="sec__title">
            It starts with a match that{" "}
            <span className="accent-orange">makes sense.</span>
          </h2>
          <p className="sec__sub">
            One quiz scores every school against what you told us matters.
          </p>
          <div className="dotlist">
            <div className="dotlist__row">
              <span className="dot dot--orange dot--lg" />
              <p>
                <strong>A match % for every school</strong> — weighted by your
                priorities.
              </p>
            </div>
            <div className="dotlist__row">
              <span className="dot dot--coral dot--lg" />
              <p>
                <strong>Reach, Match, or Likely</strong> — an honest read on your
                odds.
              </p>
            </div>
            <div className="dotlist__row">
              <span className="dot dot--green dot--lg" />
              <p>
                <strong>Reasons for every match</strong> — no black boxes, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── how it works ── */}
      <section className="sec sec--likelybg sec--bordered">
        <div className="wrap-mid">
          <div className="sec__eyebrow-center">
            <span className="eyebrow eyebrow--green">
              <span className="dot dot--green" />
              How it works
            </span>
          </div>
          <div className="steps">
            {[
              {
                n: "1",
                t: "Take the quiz",
                b: "Eight quick sections on academics, campus culture, budget, and more. Used to match you with schools that fit.",
              },
              {
                n: "2",
                t: "Get matched",
                b: "A ranked, best-fit list, tailored to you. Reasons backed by data for every match. We've done the research so you don't have to.",
              },
              {
                n: "3",
                t: "Explore & decide",
                b: "Explore step by step, compare and rank your top schools, and stay on top of every application: all in one place.",
              },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step__num">{s.n}</div>
                <h3 className="step__title">{s.t}</h3>
                <p className="step__body">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── dashboard grid ── */}
      <section className="sec sec--herobg">
        <div className="wrap-wide">
          <div className="dash-head">
            <span className="eyebrow eyebrow--green">
              <span className="dot dot--green" />
              Your dashboard
            </span>
            <h2 className="dash-head__title">
              Your whole search,{" "}
              <span className="accent-green">in one place.</span>
            </h2>
            <p className="dash-head__sub">
              Every school you save gets its own place on your dashboard for you
              to explore, weigh it against the rest, and track application tasks.
            </p>
          </div>

          <div className="dash-grid">
            {[
              {
                chip: "chip--yellow",
                dot: "dot--orange",
                t: "Explore every match",
                b: "Click matched schools for the stats that matter: admit rate, cost, GPA, majors, size, setting, and more, all in one view.",
              },
              {
                chip: "chip--blue",
                dot: "dot--bluedark",
                t: "Enrolli Quality Index",
                b: "See which schools have standout student outcomes compared to similar schools, at a glance.",
              },
              {
                chip: "chip--reach",
                dot: "dot--coral",
                t: "Compare side by side",
                b: "Line up your top schools by the things you actually care about, without fighting through the noise.",
              },
              {
                chip: "chip--greenlt",
                dot: "dot--green",
                t: "Plan for cost & aid",
                b: "See net price, not sticker price, and plan for aid to make sure your perfect fit is a fit financially, too.",
              },
              {
                chip: "chip--match",
                dot: "dot--orange",
                t: "Track every application",
                b: "Move each school from exploring to applied to committed, and never miss a deadline again.",
              },
              {
                chip: "chip--likely",
                dot: "dot--green",
                t: "Decide with confidence",
                b: "Weigh the trade-offs, revisit the reasons behind each match, and commit with confidence.",
              },
            ].map((c, i) => (
              <div key={i} className="dash-card">
                <div className={`chip ${c.chip}`}>
                  <span className={`dot ${c.dot} dot--md`} />
                </div>
                <h3 className="dash-card__title">{c.t}</h3>
                <p className="dash-card__body">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── final CTA ── */}
      <section className="sec sec--likelybg final-cta">
        <span className="blob blob--yellow blob--cta" />
        <div className="final-cta__inner">
          <h2 className="final-cta__title">
            Only <span className="accent-orange">{cd.d} days</span> until launch.
          </h2>
          <p className="final-cta__sub">
            Join the waitlist now to be first in line and keep your
            founding-member discount.
          </p>
          <a href="#waitlist-form" className="btn btn--primary">
            <span className="dot dot--white" />
            Reserve My Spot
          </a>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="enr-footer">
        <Logo size="1.45rem" />
        <span className="enr-footer__copy">
          © Subtle Impact Enterprises LLC · Enrolli — find your best-fit college.
        </span>
      </footer>
    </div>
  );
}

// ── Scoped styles: brand tokens, fonts, component classes ──────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;700&family=Nunito:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600&display=swap');

.enr-waitlist {
  /* Warm primaries */
  --orange:#F4944B; --orange-deep:#E07230; --orange-deep-2:#E07E33;
  --coral:#E47563; --yellow:#FFE566; --yellow-hi:#FFD700;
  --yellow-pale:#FFFBE8; --yellow-card:#FFF3CC;
  /* Cool accents */
  --green:#87AC48; --green-dark:#5A7A2E; --green-pale:#F1F8E6;
  --green-chip:#DCEBC4; --green-eyebrow:#DDE8B0;
  --blue:#C1DEEA; --blue-dark:#5BA3C2; --blue-pale:#E8F4FA;
  /* Warm neutrals */
  --ink:#2A2118; --brown:#4A3828; --muted:#9A8878; --muted-2:#6E6152;
  /* Backgrounds */
  --cream:#FFFDF5; --hero:#FFF8E6; --surface:#FFFFFF;
  /* Lines */
  --card-line:#F0E8D8;
  /* Fit tags */
  --fit-reach-bg:#FFF0E8; --fit-match-bg:#FFF8E6; --fit-likely-bg:#EEF7DC;
  /* Fonts */
  --font-display:'Fredoka', system-ui, sans-serif;
  --font-body:'Nunito', system-ui, sans-serif;

  font-family: var(--font-body);
  color: var(--brown);
  background: var(--cream);
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
}
.enr-waitlist * { box-sizing: border-box; }

/* dots */
.enr-waitlist .dot { display:inline-block; width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.enr-waitlist .dot--md { width:14px; height:14px; }
.enr-waitlist .dot--lg { width:10px; height:10px; }
.enr-waitlist .dot--orange { background:var(--orange); }
.enr-waitlist .dot--coral { background:var(--coral); }
.enr-waitlist .dot--green { background:var(--green); }
.enr-waitlist .dot--bluedark { background:var(--blue-dark); }
.enr-waitlist .dot--white { background:#fff; }

.enr-waitlist .accent-orange { color:var(--orange); }
.enr-waitlist .accent-green { color:var(--green); }

/* header */
.enr-header {
  position:sticky; top:0; z-index:50; display:flex; align-items:center;
  justify-content:space-between; gap:12px; padding:15px 40px;
  background:#fff; border-bottom:3px solid var(--orange);
}
.enr-pill {
  display:inline-flex; align-items:center; gap:8px; border-radius:100px;
  padding:7px 18px; font-weight:800; font-size:.78rem; color:var(--ink);
  text-decoration:none;
}
.enr-pill--green { background:var(--green-eyebrow); border:2px solid var(--green); }

/* eyebrow labels */
.enr-waitlist .eyebrow {
  display:inline-flex; align-items:center; gap:8px; font-size:.72rem;
  font-weight:900; letter-spacing:2.5px; text-transform:uppercase;
}
.enr-waitlist .eyebrow--orange { color:var(--orange); }
.enr-waitlist .eyebrow--green { color:var(--green-dark); }

/* hero */
.enr-hero { position:relative; overflow:hidden; background:var(--hero); padding:60px 24px 56px; text-align:center; }
.enr-hero__inner { position:relative; z-index:1; max-width:660px; margin:0 auto; }
.enr-hero .eyebrow--orange { margin-bottom:26px; }
.blob { position:absolute; border-radius:50%; pointer-events:none; }
.blob--yellow { width:460px; height:460px; background:var(--yellow); opacity:.26; top:-190px; left:50%; transform:translateX(-50%); }
.blob--coral { width:220px; height:220px; background:var(--coral); opacity:.10; bottom:-80px; right:-50px; }
.blob--orange { width:180px; height:180px; background:var(--orange); opacity:.10; bottom:-60px; left:-40px; }

.countdown { display:flex; justify-content:center; align-items:flex-start; gap:8px; margin-bottom:10px; }
.cd-unit { width:108px; }
.cd-num { font-family:var(--font-display); font-weight:700; font-size:4.4rem; line-height:1; color:var(--ink); }
.cd-num--orange { color:var(--orange); }
.cd-colon { font-family:var(--font-display); font-weight:700; font-size:3.4rem; line-height:1.15; color:var(--yellow-hi); }
.cd-label { font-size:.68rem; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-top:10px; }

.enr-hero__when { font-size:.88rem; font-weight:800; color:var(--coral); margin:0 0 30px; letter-spacing:.5px; }
.enr-hero__title { font-family:var(--font-display); font-weight:500; font-size:clamp(2.1rem,4.5vw,3rem); line-height:1.15; margin:0 0 14px; color:var(--ink); }
.enr-hero__sub { font-size:1.08rem; color:var(--brown); font-weight:600; max-width:500px; margin:0 auto; line-height:1.55; }

/* form band */
.enr-form-band { padding:48px 24px; background:var(--green-pale); border-top:3px solid var(--green); border-bottom:3px solid var(--green); }
.enr-form-wrap { max-width:520px; margin:0 auto; }
.enr-card { background:#fff; border-radius:20px; box-shadow:0 14px 34px rgba(135,172,72,.14); }
.enr-card--green { border:2.5px solid var(--green); padding:32px; }
.enr-form__title { font-family:var(--font-display); font-weight:500; font-size:1.5rem; margin:0 0 4px; color:var(--ink); text-align:center; }
.enr-form__note { font-size:.9rem; font-weight:600; color:var(--muted-2); margin:0 0 22px; text-align:center; }
.enr-form { display:flex; flex-direction:column; gap:12px; }
.enr-form .row { display:flex; gap:10px; }
.field {
  flex:1; width:100%; padding:12px 14px; border-radius:10px; border:1.5px solid var(--green);
  background:var(--surface); font-size:14px; font-family:var(--font-body); font-weight:600;
  color:var(--ink); outline:none; transition:all .15s;
}
.field:focus { box-shadow:0 0 0 3px rgba(135,172,72,.18); }
.field--select { padding-right:34px; cursor:pointer; }
.enr-form__spam { text-align:center; font-size:.76rem; font-weight:700; color:var(--muted); margin:2px 0 0; }

/* buttons */
.btn {
  display:inline-flex; align-items:center; justify-content:center; gap:9px;
  padding:14px 28px; border-radius:100px; font-family:var(--font-body);
  font-weight:800; font-size:1rem; cursor:pointer; text-decoration:none; transition:all .15s;
}
.btn--block { width:100%; margin-top:4px; }
.btn--primary { border:1.5px solid var(--orange); background:var(--orange); color:#fff; box-shadow:0 4px 16px rgba(244,148,75,.3); }
.btn--primary:hover { background:var(--orange-deep-2); border-color:var(--orange-deep-2); }
.btn:disabled { opacity:.65; cursor:default; }
.enr-form__error { text-align:center; font-size:.8rem; font-weight:800; color:var(--coral); margin:2px 0 0; }

/* success */
.enr-success { padding:40px 30px; text-align:center; }
.enr-success__check { width:58px; height:58px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:1.7rem; color:#fff; font-weight:900; }
.enr-success__title { font-family:var(--font-display); font-weight:500; font-size:1.6rem; margin:0 0 10px; color:var(--ink); }
.enr-success__body { font-size:.98rem; font-weight:600; color:var(--brown); max-width:420px; margin:0 auto 10px; line-height:1.55; }
.enr-success__count { font-size:.84rem; font-weight:800; color:var(--coral); margin:0; }

/* generic sections */
.sec { padding:56px 24px; }
.sec--yellowpale { background-color:var(--yellow-pale); padding:56px 24px 44px; }
.sec--likelybg { background-color:var(--fit-likely-bg); }
.sec--herobg { background-color:var(--hero); padding:60px 24px; }
.sec--bordered { border-top:3px solid var(--green); border-bottom:3px solid var(--green); }
.wrap-narrow { max-width:500px; margin:0 auto; }
.wrap-mid { max-width:760px; margin:0 auto; }
.wrap-wide { max-width:940px; margin:0 auto; }
.sec__title { font-family:var(--font-display); font-weight:500; font-size:clamp(1.5rem,3vw,2rem); margin:0 0 8px; color:var(--ink); text-align:center; }
.sec__sub { font-size:.95rem; font-weight:600; color:var(--muted-2); margin:0 0 26px; text-align:center; }
.sec__eyebrow-center { text-align:center; margin-bottom:32px; }

/* dot list */
.dotlist { display:flex; flex-direction:column; gap:14px; }
.dotlist__row { display:flex; gap:12px; align-items:flex-start; }
.dotlist__row .dot { margin-top:6px; }
.dotlist__row p { margin:0; font-size:.98rem; font-weight:600; color:var(--brown); line-height:1.5; }
.dotlist__row strong { color:var(--ink); font-weight:800; }

/* steps */
.steps { display:flex; gap:16px; flex-wrap:wrap; }
.step { flex:1; min-width:200px; text-align:center; background:#fff; border:1.5px solid var(--card-line); border-radius:16px; padding:26px 18px; }
.step__num { width:42px; height:42px; border-radius:50%; background:var(--yellow); font-family:var(--font-display); font-weight:700; font-size:1.25rem; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
.step__title { font-family:var(--font-display); font-weight:500; font-size:1.05rem; margin:0 0 5px; color:var(--ink); }
.step__body { margin:0; font-size:.86rem; font-weight:500; color:var(--brown); line-height:1.5; }

/* dashboard */
.dash-head { text-align:center; max-width:620px; margin:0 auto 40px; }
.dash-head .eyebrow { margin-bottom:14px; }
.dash-head__title { font-family:var(--font-display); font-weight:500; font-size:clamp(1.6rem,3.2vw,2.2rem); line-height:1.2; margin:0 0 12px; color:var(--ink); }
.dash-head__sub { font-size:1.02rem; font-weight:600; color:var(--brown); margin:0; line-height:1.55; }
.dash-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px; }
.dash-card { background:#fff; border:1.5px solid var(--card-line); border-radius:18px; padding:24px; }
.chip { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
.chip--yellow { background:var(--yellow-card); }
.chip--blue { background:var(--blue-pale); }
.chip--reach { background:var(--fit-reach-bg); }
.chip--greenlt { background:var(--green-chip); }
.chip--match { background:var(--fit-match-bg); }
.chip--likely { background:var(--fit-likely-bg); }
.dash-card__title { font-family:var(--font-display); font-weight:500; font-size:1.12rem; margin:0 0 6px; color:var(--ink); }
.dash-card__body { margin:0; font-size:.92rem; font-weight:500; color:var(--brown); line-height:1.55; }

/* final cta */
.final-cta { position:relative; overflow:hidden; border-top:3px solid var(--green); text-align:center; }
.blob--cta { width:260px; height:260px; opacity:.22; top:-110px; right:-60px; left:auto; transform:none; }
.final-cta__inner { position:relative; z-index:1; max-width:560px; margin:0 auto; }
.final-cta__title { font-family:var(--font-display); font-weight:500; font-size:clamp(1.5rem,3vw,2rem); margin:0 0 10px; color:var(--ink); }
.final-cta__sub { font-size:1rem; font-weight:600; color:var(--brown); margin:0 0 24px; line-height:1.55; }

/* footer */
.enr-footer { border-top:3px solid var(--green); padding:30px 40px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; background-color:var(--cream); }
.enr-footer__copy { font-size:.76rem; font-weight:700; color:var(--muted); }

/* small screens */
@media (max-width:560px) {
  .enr-header, .enr-footer { padding-left:20px; padding-right:20px; }
  .cd-unit { width:auto; min-width:64px; }
  .cd-num { font-size:3rem; }
  .cd-colon { font-size:2.2rem; }
}
`;

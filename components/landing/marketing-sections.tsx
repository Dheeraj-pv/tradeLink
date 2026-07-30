import Link from "next/link";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  DropletIcon,
  HomeIcon,
  KeyIcon,
  PaintIcon,
  StarIcon,
  TruckIcon,
  WrenchIcon,
  ZapIcon,
} from "@/components/ui/icons";

const stats = [
  { value: "12,400+", label: "Jobs Posted" },
  { value: "3,800+", label: "Verified Providers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "< 2 hrs", label: "Avg. First Response" },
];

const steps = [
  {
    num: "01",
    icon: BriefcaseIcon,
    title: "Post Your Job",
    desc: "Describe what you need, upload photos, and set your location. Your job goes live instantly.",
  },
  {
    num: "02",
    icon: StarIcon,
    title: "Compare Bids",
    desc: "Review bids from vetted providers with real ratings and verified credentials.",
  },
  {
    num: "03",
    icon: CheckCircleIcon,
    title: "Hire Confidently",
    desc: "Accept the best offer, track work in real time, and pay only when satisfied.",
  },
];

const trades = [
  { label: "Plumbing", Icon: DropletIcon },
  { label: "Electrical", Icon: ZapIcon },
  { label: "Carpentry", Icon: WrenchIcon },
  { label: "Painting", Icon: PaintIcon },
  { label: "General", Icon: HomeIcon },
  { label: "Moving", Icon: TruckIcon },
];

export function LandingNav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <KeyIcon style={{ width: 20, height: 20 }} />
        TradeLink
      </Link>
      <div className="nav-right">
        <Link href="/auth/login" className="btn-ghost">
          Log in
        </Link>
        <Link href="/auth/register" className="btn-orange">
          Get started
        </Link>
      </div>
    </nav>
  );
}

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="hero-badge-dot" />
        Trusted by 12,000+ homeowners across New York
      </div>
      <h1>
        Quality tradespeople,
        <br />
        one platform.
      </h1>
      <p>
        Post your job and receive competitive bids from verified local providers.
        Compare ratings, review credentials, and hire with confidence.
      </p>
      <div className="hero-btns">
        <Link href="/auth/register" className="btn-hero-primary">
          Post a Job — It&apos;s Free
        </Link>
        <Link href="/auth/login" className="btn-hero-outline">
          Find Work as a Provider
        </Link>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="stats-bar">
      {stats.map((stat) => (
        <div key={stat.label} className="stat">
          <div className="stat-val">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="how">
      <p className="section-eyebrow">How it works</p>
      <h2 className="section-title">Hire with confidence from first quote to final handshake.</h2>
      <div className="steps-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.num} className="step-card">
              <div className="step-icon-wrap">
                <Icon />
              </div>
              <p className="step-num">{step.num}</p>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function BrowseTradesSection() {
  return (
    <section className="browse">
      <h2 className="browse-title">Browse popular services</h2>
      <div className="trades-list">
        {trades.map(({ label, Icon }) => (
          <button key={label} type="button" className="trade-chip">
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="cta-band">
      <div className="cta-inner">
        <div className="cta-text">
          <h2>Ready to get started?</h2>
          <p>Join homeowners and providers who trust TradeLink for every project.</p>
        </div>
        <div className="cta-btns">
          <Link href="/auth/register" className="btn-cta-primary">
            Create account
          </Link>
          <Link href="/auth/login" className="btn-cta-outline">
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="footer">
      <Link href="/" className="footer-logo">
        <KeyIcon style={{ width: 18, height: 18 }} />
        TradeLink
      </Link>
      <p className="footer-copy">© 2024 TradeLink. Built for trusted local work.</p>
    </footer>
  );
}

export function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:   #1a2540;
          --navy-2: #1e2d4d;
          --orange: #d4621a;
          --orange-h: #bf5616;
          --cream:  #f0ece4;
          --cream-2:#f7f4ef;
          --white:  #ffffff;
          --muted:  #8fa0b8;
          --text:   #1a2540;
        }

        body { font-family: 'Inter', sans-serif; color: var(--text); background: var(--white); }

        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw; height: 68px; background: var(--navy);
        }
        .nav-logo { display: flex; align-items: center; gap: 8px; color: var(--white); font-weight: 600; font-size: 1.05rem; text-decoration: none; }
        .nav-logo svg { color: var(--orange); }
        .nav-right { display: flex; align-items: center; gap: 20px; }
        .btn-ghost { background: none; border: none; color: var(--white); font-size: .9rem; cursor: pointer; font-family: inherit; font-weight: 500; text-decoration: none; }
        .btn-ghost:hover { text-decoration: underline; }
        .btn-orange { background: var(--orange); color: var(--white); border: none; border-radius: 8px; padding: 10px 22px; font-size: .9rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
        .btn-orange:hover { background: var(--orange-h); }

        .hero {
          background: var(--navy); padding: 80px 5vw 96px;
          min-height: calc(100vh - 68px - 100px);
          display: flex; flex-direction: column; justify-content: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
          border-radius: 999px; padding: 6px 16px; color: var(--white);
          font-size: .78rem; font-weight: 500; margin-bottom: 32px; width: fit-content;
        }
        .hero-badge-dot { width: 7px; height: 7px; background: #4ade80; border-radius: 50%; flex-shrink: 0; }
        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800; color: var(--white); line-height: 1.13;
          max-width: 560px; margin-bottom: 24px;
        }
        .hero p { color: var(--muted); font-size: 1rem; line-height: 1.7; max-width: 460px; margin-bottom: 40px; }
        .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }
        .btn-hero-primary { background: var(--orange); color: var(--white); border: none; border-radius: 10px; padding: 14px 28px; font-size: .95rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
        .btn-hero-primary:hover { background: var(--orange-h); }
        .btn-hero-outline { background: transparent; color: var(--white); border: 1.5px solid rgba(255,255,255,.35); border-radius: 10px; padding: 14px 28px; font-size: .95rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: border-color .15s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
        .btn-hero-outline:hover { border-color: rgba(255,255,255,.7); }

        .stats-bar {
          background: var(--orange); padding: 28px 5vw;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .stat { text-align: center; }
        .stat-val { font-size: clamp(1.3rem, 2.5vw, 1.7rem); font-weight: 700; color: var(--white); }
        .stat-label { font-size: .78rem; color: rgba(255,255,255,.75); margin-top: 4px; font-weight: 500; }

        .how { background: var(--cream-2); padding: 80px 5vw; }
        .section-eyebrow { font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--orange); margin-bottom: 14px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; color: var(--navy); max-width: 540px; margin-bottom: 48px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .step-card { background: var(--white); border-radius: 14px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .step-icon-wrap { width: 44px; height: 44px; background: #fef0e7; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .step-icon-wrap svg { width: 22px; height: 22px; color: var(--orange); }
        .step-num { font-size: .72rem; font-weight: 600; color: var(--muted); letter-spacing: .06em; margin-bottom: 8px; }
        .step-title { font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
        .step-desc { font-size: .875rem; color: #5a6a80; line-height: 1.65; }

        .browse { background: var(--white); padding: 72px 5vw; }
        .browse-title { font-family: 'Playfair Display', serif; font-size: clamp(1.4rem, 2.5vw, 1.9rem); font-weight: 700; color: var(--navy); margin-bottom: 28px; }
        .trades-list { display: flex; flex-wrap: wrap; gap: 12px; }
        .trade-chip {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1.5px solid #dde2eb; border-radius: 8px;
          padding: 10px 18px; font-size: .875rem; font-weight: 500;
          color: var(--navy); background: var(--white); cursor: pointer;
          transition: border-color .15s, background .15s; font-family: inherit;
        }
        .trade-chip svg { width: 16px; height: 16px; color: var(--orange); }
        .trade-chip:hover { border-color: var(--orange); background: #fef8f4; }

        .cta-band { background: var(--cream-2); padding: 56px 5vw; }
        .cta-inner {
          background: var(--navy); border-radius: 18px;
          padding: 48px 56px; display: flex;
          align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
        }
        .cta-text h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.3rem, 2.5vw, 1.8rem); font-weight: 700; color: var(--white); margin-bottom: 8px; }
        .cta-text p { font-size: .9rem; color: var(--muted); }
        .cta-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-cta-primary { background: var(--orange); color: var(--white); border: none; border-radius: 10px; padding: 13px 26px; font-size: .9rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
        .btn-cta-primary:hover { background: var(--orange-h); }
        .btn-cta-outline { background: transparent; color: var(--white); border: 1.5px solid rgba(255,255,255,.35); border-radius: 10px; padding: 13px 26px; font-size: .9rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: border-color .15s; white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
        .btn-cta-outline:hover { border-color: rgba(255,255,255,.7); }

        .footer {
          background: var(--navy); padding: 24px 5vw;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .footer-logo { display: flex; align-items: center; gap: 8px; color: var(--white); font-weight: 600; font-size: .95rem; text-decoration: none; }
        .footer-logo svg { color: var(--orange); }
        .footer-copy { font-size: .8rem; color: var(--muted); }

        @media (max-width: 768px) {
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: 1fr; }
          .cta-inner { padding: 36px 28px; flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .stats-bar { grid-template-columns: 1fr 1fr; }
          .hero-btns { flex-direction: column; }
          .cta-btns { flex-direction: column; width: 100%; }
          .btn-cta-primary, .btn-cta-outline { width: 100%; text-align: center; }
        }
      `}</style>
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <BrowseTradesSection />
      <CTASection />
      <LandingFooter />
    </>
  );
}

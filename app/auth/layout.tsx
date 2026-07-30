"use client";
import Link from "next/link";
import { CheckIcon, KeyIcon } from "@/components/ui/icons";

const features = [
  "Verified professionals",
  "Competitive bidding",
  "Real-time job tracking",
  "Genuine customer reviews",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        NOTE: This style block contains ONLY the rules needed for layout.
        No z-index hacks, no pointer-events overrides — those caused the
        previous version's buttons to stop receiving clicks. Keep it that way.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #1a2540; --orange: #d4621a; --orange-h: #bf5616;
          --cream: #f0ece4; --white: #ffffff; --muted: #8fa0b8;
          --border: #e2ddd8; --sub: #7a7060;
        }
        body { font-family: 'Inter', sans-serif; }

        .auth-page {
          display: grid;
          grid-template-columns: 42% 1fr;
          min-height: 100vh;
        }

        .auth-left {
          background: var(--navy);
          display: flex;
          flex-direction: column;
          padding: 36px 48px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .auth-logo {
          display: flex; align-items: center; gap: 8px;
          color: #fff; font-weight: 600; font-size: 1rem; text-decoration: none;
        }
        .auth-logo svg { color: var(--orange); }
        .auth-left-body {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding: 40px 0 60px;
        }
        .auth-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 800; color: #fff; line-height: 1.2;
          margin-bottom: 20px; max-width: 380px;
        }
        .auth-left p {
          color: var(--muted); font-size: .9rem;
          line-height: 1.7; max-width: 360px; margin-bottom: 40px;
        }
        .auth-features { list-style: none; display: flex; flex-direction: column; gap: 14px; }
        .auth-features li {
          display: flex; align-items: center; gap: 12px;
          color: #fff; font-size: .9rem; font-weight: 500;
        }
        .auth-features li svg { color: var(--orange); flex-shrink: 0; }
        .auth-left-foot { color: rgba(255,255,255,.3); font-size: .78rem; margin-top: auto; }

        .auth-right {
          background: var(--cream);
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px;
        }
        .auth-form-box { width: 100%; max-width: 440px; }

        .auth-form-box h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; font-weight: 700;
          color: var(--navy); margin-bottom: 6px;
        }
        .auth-subtitle { font-size: .875rem; color: var(--sub); margin-bottom: 28px; }
        .auth-tabs {
          display: grid; grid-template-columns: 1fr 1fr;
          border: 1.5px solid var(--border); border-radius: 10px;
          overflow: hidden; margin-bottom: 28px; background: #e8e3dc;
        }
        .auth-tab {
          padding: 11px; font-size: .875rem; font-weight: 600;
          border: none; background: transparent; cursor: pointer;
          font-family: inherit; color: var(--sub); transition: background .15s, color .15s;
          text-decoration: none; display: block; text-align: center;
        }
        .auth-tab.active { background: var(--white); color: var(--navy); }
        .role-label { font-size: .8rem; font-weight: 600; color: var(--navy); margin-bottom: 12px; }
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .role-card {
          border: 1.5px solid var(--border); border-radius: 10px;
          padding: 14px 16px; cursor: pointer; background: var(--white);
          transition: border-color .15s, background .15s;
          text-align: left; font-family: inherit; width: 100%;
        }
        .role-card.selected { border-color: var(--orange); background: #fef8f4; }
        .role-name { font-size: .9rem; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
        .role-card.selected .role-name { color: var(--orange); }
        .role-sub-text { font-size: .78rem; color: var(--sub); }
        .auth-field { margin-bottom: 18px; }
        .auth-field label { display: block; font-size: .8rem; font-weight: 600; color: var(--navy); margin-bottom: 7px; }
        .auth-field label span { color: var(--orange); }
        .auth-field input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid var(--border); border-radius: 9px;
          font-size: .9rem; font-family: inherit;
          background: var(--white); color: var(--navy);
          outline: none; transition: border-color .15s;
        }
        .auth-field input:focus { border-color: var(--orange); }
        .auth-field input::placeholder { color: #b0a898; }
        .auth-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .btn-auth-primary {
          width: 100%; padding: 14px; background: var(--navy); color: #fff;
          border: none; border-radius: 10px; font-size: .95rem; font-weight: 600;
          cursor: pointer; font-family: inherit; margin-top: 4px; transition: background .15s, opacity .15s;
        }
        .btn-auth-primary:hover:not(:disabled) { background: #253460; }
        .btn-auth-primary:disabled { opacity: .6; cursor: not-allowed; }
        .auth-switch { text-align: center; font-size: .85rem; color: var(--sub); margin-top: 16px; }
        .auth-switch a { color: var(--orange); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .demo-box {
          margin-top: 20px; background: #fffbf5;
          border: 1.5px solid #f0d9c0; border-radius: 10px;
          padding: 14px 16px; font-size: .8rem; line-height: 1.6; color: #7a5c3a;
        }
        .demo-box strong { color: var(--orange); }
        .form-error {
          background: #fdecec;
          border: 1px solid #f3c7c7;
          color: #c92e2e;
          font-size: .82rem;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
        }

        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { position: static; height: auto; min-height: 260px; padding: 28px; }
          .auth-left-body { padding: 24px 0 0; }
          .auth-right { padding: 36px 24px; }
          .auth-field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="auth-page">
        <aside className="auth-left">
          <Link href="/" className="auth-logo">
            <KeyIcon />
            TradeLink
          </Link>

          <div className="auth-left-body">
            <h1>Connect with skilled tradespeople in your area.</h1>
            <p>
              Whether you need a job done or want to offer your services,
              TradeLink makes it simple, transparent, and fair.
            </p>
            <ul className="auth-features">
              {features.map((f) => (
                <li key={f}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <span className="auth-left-foot">© 2024 TradeLink</span>
        </aside>

        <main className="auth-right">
          <div className="auth-form-box">{children}</div>
        </main>
      </div>
    </>
  );
}

"use client";

import { Icon } from "@/components/icons";
import { PhonePreview } from "@/components/sections";

const features = [
  { icon: "sun", t: "Dawn, not \u201cmorning routine\u201d", b: "A five\u2011minute practice for before you reach the phone. Quiet, optional, never gamified." },
  { icon: "wave", t: "Weather, not goals", b: "Tell us what\u2019s loud \u2014 anxiety, ache, wire. We\u2019ll pick the practice. Your streak is none of our business." },
  { icon: "leaf", t: "Teachers with names", b: "Ketut, Ayu, Wayan, Made. Filmed in Ubud. They\u2019ll remember you by week two, even if you don\u2019t show up in week one." },
  { icon: "anchor", t: "Offline, always", b: "Download a week\u2019s practices. Do them on a plane, in a closet, in a hotel bathroom. No Wi\u2011Fi needed." },
  { icon: "moon", t: "Wind\u2011down, with the lights off", b: "An audio\u2011only yin series designed for eyes closed. No screen glow, no \u201cgreat job!\u201d notification." },
  { icon: "heart", t: "A practice journal you\u2019ll actually use", b: "One line after. That\u2019s the whole ask. We\u2019ll show you the patterns later, quietly." },
];

export default function DownloadPage() {
  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 24 }}>
        <div className="eyebrow">The app</div>
        <h1>
          A small <em>green room</em>
          <br />
          in your pocket.
        </h1>
        <p>
          Built by one team in Ubud and one in Brooklyn. No venture&#x2011;capital wellness language. No
          notifications that say &ldquo;you&apos;ve been doing great.&rdquo; You&apos;ve been doing fine.
          Here&apos;s today&apos;s practice.
        </p>
        <div className="hero-cta" style={{ marginTop: 24 }}>
          <button className="btn btn-primary btn-lg">
            <Icon name="apple" size={16} /> Download for iPhone
          </button>
          <button className="btn btn-ghost btn-lg">
            <Icon name="play-store" size={16} /> Download for Android
          </button>
        </div>
      </section>

      <section className="app-show">
        <div className="app-show-inner">
          <div className="app-show-phones">
            <PhonePreview />
            <PhonePreview />
          </div>
          <div>
            <div className="section-eyebrow">What&apos;s inside</div>
            <h2 className="section-h2">
              Not a library. <em>A shelf.</em>
            </h2>
            <p className="section-lede" style={{ marginTop: 16 }}>
              We don&apos;t think you need 4,000 classes. We&apos;ve picked a few hundred and we keep
              sharpening the list. Every practice earns its place.
            </p>
          </div>
        </div>
      </section>

      <section className="app-features">
        {features.map((f, i) => (
          <div key={i} className="app-feature">
            <Icon name={f.icon} className="ai" size={32} />
            <h4>{f.t}</h4>
            <p>{f.b}</p>
          </div>
        ))}
      </section>

      <section className="quote">
        <blockquote>
          It&apos;s the first &ldquo;wellness&rdquo; app I don&apos;t resent. It asks less of me than
          my toothbrush.
        </blockquote>
        <cite>
          <strong>Jules M.</strong> &middot; engineer &middot; practicing 9 months
        </cite>
      </section>

      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <h2>
              <em>Free</em> for seven days. Then &pound;8/month.
            </h2>
            <p>Cancel with two taps. No &ldquo;we&apos;ll miss you&rdquo; email chain. We mean it.</p>
            <div className="store-row">
              <button className="btn btn-sun btn-lg">
                <Icon name="apple" size={16} /> App Store
              </button>
              <button className="btn btn-sun btn-lg" style={{ background: "#fff" }}>
                <Icon name="play-store" size={16} /> Google Play
              </button>
            </div>
          </div>
          <div className="app-cta-right">
            <PhonePreview />
          </div>
        </div>
      </section>
    </>
  );
}

/* global React, Icon, PhonePreview */

function AppPage() {
  const features = [
    { icon: "sun", t: "Dawn, not \"morning routine\"", b: "A five‑minute practice for before you reach the phone. Quiet, optional, never gamified." },
    { icon: "wave", t: "Weather, not goals", b: "Tell us what's loud — anxiety, ache, wire. We'll pick the practice. Your streak is none of our business." },
    { icon: "leaf", t: "Teachers with names", b: "Ketut, Ayu, Wayan, Made. Filmed in Ubud. They'll remember you by week two, even if you don't show up in week one." },
    { icon: "anchor", t: "Offline, always", b: "Download a week's practices. Do them on a plane, in a closet, in a hotel bathroom. No Wi‑Fi needed." },
    { icon: "moon", t: "Wind‑down, with the lights off", b: "An audio‑only yin series designed for eyes closed. No screen glow, no \"great job!\" notification." },
    { icon: "heart", t: "A practice journal you'll actually use", b: "One line after. That's the whole ask. We'll show you the patterns later, quietly." },
  ];
  return (
    <>
      <section className="page-hero" style={{paddingBottom: 24}}>
        <div className="eyebrow">The app</div>
        <h1>A small <em>green room</em><br/>in your pocket.</h1>
        <p>Built by one team in Ubud and one in Brooklyn. No venture‑capital wellness language. No notifications that say "you've been doing great." You've been doing fine. Here's today's practice.</p>
        <div className="hero-cta" style={{marginTop: 24}}>
          <button className="btn btn-primary btn-lg">
            <Icon name="apple" size={16}/> Download for iPhone
          </button>
          <button className="btn btn-ghost btn-lg">
            <Icon name="play-store" size={16}/> Download for Android
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
            <div className="section-eyebrow">What's inside</div>
            <h2 className="section-h2">Not a library. <em>A shelf.</em></h2>
            <p className="section-lede" style={{marginTop: 16}}>
              We don't think you need 4,000 classes. We've picked a few hundred and we keep sharpening the list. Every practice earns its place.
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
          It's the first "wellness" app I don't resent. It asks less of me than my toothbrush.
        </blockquote>
        <cite><strong>Jules M.</strong> · engineer · practicing 9 months</cite>
      </section>

      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <h2><em>Free</em> for seven days. Then £8/month.</h2>
            <p>Cancel with two taps. No "we'll miss you" email chain. We mean it.</p>
            <div className="store-row">
              <button className="btn btn-sun btn-lg"><Icon name="apple" size={16}/> App Store</button>
              <button className="btn btn-sun btn-lg" style={{background:'#fff'}}><Icon name="play-store" size={16}/> Google Play</button>
            </div>
          </div>
          <div className="app-cta-right"><PhonePreview /></div>
        </div>
      </section>
    </>
  );
}
window.AppPage = AppPage;

/* global React, HeroSun, HeroSplit, HeroEditorial, SplitSection, Struggles, HowItWorks, Practices, QuoteSection, AppCTA */

function HomePage({ tweaks, setPage }) {
  const heroProps = {
    headline: tweaks.heroHeadline,
    sub: tweaks.heroSub,
    cta: tweaks.ctaLabel,
    onCTA: () => setPage("app"),
    onPricing: () => setPage("pricing"),
  };
  let Hero;
  if (tweaks.heroVariant === "sun") Hero = HeroSun;
  else if (tweaks.heroVariant === "split") Hero = HeroSplit;
  else Hero = HeroEditorial;
  return (
    <>
      <Hero {...heroProps} />
      <SplitSection setPage={setPage} />
      <Struggles setPage={setPage} />
      <HowItWorks />
      <AppCTA onCTA={() => setPage("app")} />
    </>
  );
}
window.HomePage = HomePage;

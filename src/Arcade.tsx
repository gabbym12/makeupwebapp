import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Brush, CircleHelp, Eye, Sparkles, Layers3, ShieldCheck } from "lucide-react";
import MakeupGame from "./MakeupGame";
import { BeautyTrivia, MakeupMemoryMatch, BuildMakeupLook, NoMistakesMemory } from "./MiniGames";
import AuthControl from "./AuthControl";

type Activity = "shade" | "memory" | "trivia" | "look" | "one-take";

const activities = [
  { id: "shade" as const, number: "01", title: "Shade Match", kicker: "Train your color eye", text: "Find the twin, from easy shades to the barely-there undertones.", icon: Eye, swatches: ["#d98283", "#c87d83", "#b9787d"] },
  { id: "memory" as const, number: "02", title: "Makeup Memory Match", kicker: "Turn over a little color", text: "Six pairs are waiting. Remember where each shade is hiding.", icon: Layers3, swatches: ["#b9787d", "#e3a083", "#765765"] },
  { id: "trivia" as const, number: "03", title: "Beauty Trivia", kicker: "A few lovely facts", text: "Five quick questions about the colors and rituals we love.", icon: CircleHelp, swatches: ["#d7a94f", "#a77984", "#c66c59"] },
  { id: "look" as const, number: "04", title: "Build a Makeup Look", kicker: "Make the mood yours", text: "Choose eye, cheek, and lip shades to bring a beauty brief to life.", icon: Brush, swatches: ["#8b675b", "#cf8c86", "#944e60"] },
  { id: "one-take" as const, number: "05", title: "Memory Challenge", kicker: "Three rounds. Keep going.", text: "Find 6, then 8, then 10 pairs. Wrong matches turn back; the layout changes each round.", icon: ShieldCheck, swatches: ["#c87d83", "#d7a94f", "#765765"] },
];

export default function Arcade() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const select = (next: Activity) => {
    setActivity(next);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    document.title = activity ? `${activities.find((item) => item.id === activity)?.title} — The Makeup Counter` : "The Makeup Counter — Color Play";
  }, [activity]);

  if (activity === "shade") return <MakeupGame onHub={() => setActivity(null)} />;
  if (activity === "memory") return <MakeupMemoryMatch onHub={() => setActivity(null)} />;
  if (activity === "trivia") return <BeautyTrivia onHub={() => setActivity(null)} />;
  if (activity === "look") return <BuildMakeupLook onHub={() => setActivity(null)} />;
  if (activity === "one-take") return <NoMistakesMemory onHub={() => setActivity(null)} />;

  return (
    <div className="arcade">
      <div className="arcade__ribbon">THE MAKEUP COUNTER · A LITTLE COLOR, A LITTLE PLAY</div>
      <header className="arcade__header">
        <a className="arcade__brand" href="/" aria-label="The Makeup Counter, shop home">
          <span>the makeup counter</span><small>Curiosity looks good on you</small>
        </a>
        <div className="arcade__header-actions">
          <AuthControl className="arcade-account-control" />
          <a className="arcade__shop" href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to the shop</a>
        </div>
      </header>
      <main className="arcade__hub">
        <section className="arcade__hero">
          <div>
            <p className="arcade__eyebrow">The color-play corner</p>
            <h1>Make a little<br /><em>room for play.</em></h1>
            <p className="arcade__lead">A friendly pause at the counter. Follow your eye, test your memory, or make a look that feels like you.</p>
          </div>
          <div className="arcade__hero-art" aria-hidden="true">
            <div className="arcade__orbit arcade__orbit--one" /><div className="arcade__orbit arcade__orbit--two" />
            <span className="arcade__art-note">YOUR<br />COLOR<br />STORY</span>
            <span className="arcade__art-shape arcade__art-shape--one" /><span className="arcade__art-shape arcade__art-shape--two" /><span className="arcade__art-shape arcade__art-shape--three" />
            <span className="arcade__art-caption">Pick a mood.<br />See what happens.</span>
          </div>
        </section>
        <div className="arcade__section-head">
          <div><p className="arcade__eyebrow">Choose your little adventure</p><h2>Five ways to play</h2></div>
          <p>Nothing to win but a sharper eye<br />and a few new favorites.</p>
        </div>
        <section className="arcade__activity-grid" aria-label="Choose a game">
          {activities.map(({ id, number, title, kicker, text, icon: Icon, swatches }) => (
            <button className={`arcade-card arcade-card--${id}`} type="button" key={id} onClick={() => select(id)}>
              <span className="arcade-card__top"><span>{number} / PLAY</span><Icon size={19} strokeWidth={1.5} aria-hidden="true" /></span>
              <span className="arcade-card__swatches" aria-hidden="true">{swatches.map((shade) => <i key={shade} style={{ background: shade }} />)}</span>
              <span className="arcade-card__copy"><small>{kicker}</small><strong>{title}</strong><span>{text}</span></span>
              <span className="arcade-card__go">Play this one <ArrowRight size={15} aria-hidden="true" /></span>
            </button>
          ))}
        </section>
        <aside className="arcade__note"><Sparkles size={17} strokeWidth={1.5} aria-hidden="true" /><p><strong>Come as you are.</strong> These are just-for-fun color games—no timer, no wrong kind of curious.</p><span>01 — 05</span></aside>
      </main>
      <footer className="arcade__footer"><a href="/">The Makeup Counter</a><span>A place to play with color</span><a href="/">Shop the collection <ArrowRight size={13} aria-hidden="true" /></a></footer>
    </div>
  );
}

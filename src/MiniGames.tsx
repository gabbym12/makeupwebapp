import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Heart, Check } from "lucide-react";

type GameShellProps = { onHub: () => void; children: ReactNode; eyebrow: string };

function GameShell({ onHub, children, eyebrow }: GameShellProps) {
  return (
    <div className="arcade mini-game">
      <div className="arcade__ribbon">THE MAKEUP COUNTER · A LITTLE COLOR, A LITTLE PLAY</div>
      <header className="arcade__header">
        <a className="arcade__brand" href="/" aria-label="The Makeup Counter, shop home"><span>the makeup counter</span><small>Curiosity looks good on you</small></a>
        <div className="arcade__header-actions"><button className="arcade__shop" type="button" onClick={onHub}><ArrowLeft size={15} aria-hidden="true" /> All games</button><a className="arcade__shop arcade__shop--link" href="/">Visit the shop</a></div>
      </header>
      <main className="mini-game__main">
        <p className="arcade__eyebrow">{eyebrow}</p>
        {children}
      </main>
    </div>
  );
}

type Pair = { id: string; name: string; color: string; family: string };
const MEMORY_PAIRS: Pair[] = [
  { id: "rose", name: "Rosewater", color: "#c87d83", family: "Rosy" },
  { id: "fig", name: "Fig velvet", color: "#765765", family: "Plum" },
  { id: "apricot", name: "Apricot veil", color: "#e8a27e", family: "Warm" },
  { id: "honey", name: "Honey glow", color: "#d7a94f", family: "Golden" },
  { id: "mauve", name: "Quiet mauve", color: "#a77984", family: "Soft" },
  { id: "clay", name: "Soft clay", color: "#b86f5f", family: "Earthy" },
];
type MemoryCard = Pair & { key: string };
function newDeck(): MemoryCard[] {
  return [
    ...MEMORY_PAIRS.map((pair) => ({ ...pair, key: `${pair.id}-a` })),
    ...[...MEMORY_PAIRS].reverse().map((pair) => ({ ...pair, key: `${pair.id}-b` })),
  ];
}

export function MakeupMemoryMatch({ onHub }: { onHub: () => void }) {
  const [deck, setDeck] = useState<MemoryCard[]>(newDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [turns, setTurns] = useState(0);
  const [locked, setLocked] = useState(false);
  const done = matched.length === MEMORY_PAIRS.length;
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped.map((key) => deck.find((card) => card.key === key));
    if (first && second && first.id === second.id) {
      setMatched((value) => [...value, first.id]);
      setFlipped([]);
      return;
    }
    setLocked(true);
    const timer = window.setTimeout(() => { setFlipped([]); setLocked(false); }, 850);
    return () => window.clearTimeout(timer);
  }, [flipped, deck]);
  function flip(card: MemoryCard) {
    if (locked || done || flipped.includes(card.key) || matched.includes(card.id)) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length === 2) setTurns((value) => value + 1);
  }
  function replay() { setDeck(newDeck()); setFlipped([]); setMatched([]); setTurns(0); setLocked(false); }
  return <GameShell onHub={onHub} eyebrow="A memory game · 6 shade pairs">
    <div className="mini-game__heading"><div><h1>Makeup memory <em>match.</em></h1><p>Turn two cards at a time. Find every shade pair to finish the tray.</p></div><div className="mini-game__stat"><strong>{String(turns).padStart(2, "0")}</strong><span>turns</span></div></div>
    <div className="mini-game__progressline"><span>{matched.length} of 6 pairs found</span><div role="progressbar" aria-label="Pairs found" aria-valuemin={0} aria-valuemax={6} aria-valuenow={matched.length}><i style={{ transform: `scaleX(${matched.length / 6})` }} /></div><span>12 cards</span></div>
    <div className="memory-grid" role="group" aria-label="Memory match cards">
      {deck.map((card, index) => {
        const revealed = flipped.includes(card.key) || matched.includes(card.id);
        return <button key={card.key} type="button" className={`memory-card${revealed ? " is-revealed" : ""}${matched.includes(card.id) ? " is-matched" : ""}`} onClick={() => flip(card)} disabled={revealed || locked || done} aria-label={revealed ? `${card.name}, ${matched.includes(card.id) ? "matched" : "face up"}` : `Card ${index + 1}, face down`} aria-pressed={revealed}>
          {revealed ? <><i style={{ background: card.color }} /><span>{card.name}</span></> : <span className="memory-card__back" aria-hidden="true">the<br />counter</span>}
        </button>;
      })}
    </div>
    {done ? <div className="mini-game__result-inline" role="status"><div><h2>Every shade, found.</h2><p>You matched all six pairs in {turns} {turns === 1 ? "turn" : "turns"}. Lovely memory.</p></div><button className="arcade-button" type="button" onClick={replay}><RotateCcw size={15} /> Play again</button></div> : <p className="mini-game__hint">The card positions stay the same each time. Take your time and find all six pairs.</p>}
  </GameShell>;
}

export function NoMistakesMemory({ onHub }: { onHub: () => void }) {
  const [deck, setDeck] = useState<MemoryCard[]>(newDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [turns, setTurns] = useState(0);
  const [locked, setLocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const won = matched.length === MEMORY_PAIRS.length;

  useEffect(() => {
    if (flipped.length !== 2 || failed || won) return;
    const [first, second] = flipped.map((key) => deck.find((card) => card.key === key));
    if (first && second && first.id === second.id) {
      setMatched((value) => [...value, first.id]);
      setFlipped([]);
      return;
    }
    setLocked(true);
    const timer = window.setTimeout(() => setFailed(true), 950);
    return () => window.clearTimeout(timer);
  }, [flipped, deck, failed, won]);

  function flip(card: MemoryCard) {
    if (locked || failed || won || flipped.includes(card.key) || matched.includes(card.id)) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length === 2) setTurns((value) => value + 1);
  }

  function replay() {
    setDeck(newDeck());
    setFlipped([]);
    setMatched([]);
    setTurns(0);
    setLocked(false);
    setFailed(false);
  }

  return <GameShell onHub={onHub} eyebrow="One-take memory · 6 shade pairs">
    <div className="mini-game__heading">
      <div><h1>One-take <em>memory.</em></h1><p>Turn over two cards at a time. Match all six pairs without a mistake—or restart with the same card positions.</p></div>
      <div className="mini-game__stat"><strong>{String(turns).padStart(2, "0")}</strong><span>turns</span></div>
    </div>
    <div className="mini-game__progressline">
      <span>{matched.length} of 6 pairs found</span>
      <div role="progressbar" aria-label="Pairs found" aria-valuemin={0} aria-valuemax={6} aria-valuenow={matched.length}><i style={{ transform: `scaleX(${matched.length / 6})` }} /></div>
      <span>{failed ? "Run ended" : "One life"}</span>
    </div>
    <div className={`memory-grid no-mistakes-grid${failed ? " is-failed" : ""}`} role="group" aria-label="One-take memory cards">
      {deck.map((card, index) => {
        const revealed = flipped.includes(card.key) || matched.includes(card.id);
        return <button key={card.key} type="button" className={`memory-card${revealed ? " is-revealed" : ""}${matched.includes(card.id) ? " is-matched" : ""}${failed && flipped.includes(card.key) ? " is-mistake" : ""}`} onClick={() => flip(card)} disabled={revealed || locked || failed || won} aria-label={revealed ? `${card.name}, ${matched.includes(card.id) ? "matched" : "face up"}` : `Card ${index + 1}, face down`} aria-pressed={revealed}>
          {revealed ? <><i style={{ background: card.color }} /><span>{card.name}</span></> : <span className="memory-card__back" aria-hidden="true">the<br />counter</span>}
        </button>;
      })}
    </div>
    {failed ? <div className="mini-game__result-inline no-mistakes-result is-failed" role="status" aria-live="assertive"><div><h2>That’s the one.</h2><p>The shades didn’t match. This run is over—restart with the same card positions.</p></div><button className="arcade-button" type="button" onClick={replay}><RotateCcw size={15} aria-hidden="true" /> Restart this layout</button></div>
      : won ? <div className="mini-game__result-inline no-mistakes-result" role="status" aria-live="polite"><div><h2>Six pairs. Not one mistake.</h2><p>You cleared the tray in {turns} {turns === 1 ? "turn" : "turns"}. A flawless eye.</p></div><button className="arcade-button" type="button" onClick={replay}><RotateCcw size={15} aria-hidden="true" /> Play again</button></div>
        : <p className="mini-game__hint">One wrong pair ends the attempt. Take a careful look before you turn the next card.</p>}
  </GameShell>;
}

type Question = { question: string; choices: string[]; answer: number; explanation: string };
const QUESTIONS: Question[] = [
  { question: "Which undertone is most often described as having a hint of blue or pink?", choices: ["Cool", "Warm", "Olive", "Neutral"], answer: 0, explanation: "Cool undertones tend to lean rosy, red, or blue beneath the surface." },
  { question: "What does a primer usually help makeup do?", choices: ["Change skin tone", "Sit more smoothly", "Add SPF by itself", "Set lipstick"], answer: 1, explanation: "Primer creates a smoother base and can help makeup wear more evenly." },
  { question: "Which finish reflects the most light?", choices: ["Matte", "Velvet", "Satin", "Shimmer"], answer: 3, explanation: "Shimmer has reflective particles that catch and bounce light." },
  { question: "In a classic complementary color pairing, which hue sits opposite red on the color wheel?", choices: ["Orange", "Green", "Violet", "Yellow"], answer: 1, explanation: "Green is opposite red on the traditional artist’s color wheel." },
  { question: "What is a useful first step when choosing a foundation shade?", choices: ["Match your neck", "Pick the lightest shade", "Test on your hand", "Choose by bottle"], answer: 0, explanation: "The neck is a helpful reference for a shade that blends naturally with the face." },
];

export function BeautyTrivia({ onHub }: { onHub: () => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const complete = index === QUESTIONS.length;
  const current = QUESTIONS[index];
  function answer(option: number) { if (choice !== null) return; setChoice(option); if (option === current.answer) setScore((value) => value + 1); }
  function next() { setIndex((value) => value + 1); setChoice(null); }
  function replay() { setIndex(0); setChoice(null); setScore(0); }
  return <GameShell onHub={onHub} eyebrow="Beauty trivia · 5 questions">
    {!complete ? <section className="trivia-panel" aria-labelledby="trivia-title">
      <div className="mini-game__heading"><div><h1>Beauty <em>trivia.</em></h1><p>Trust what you know—and pick up a little something along the way.</p></div><div className="mini-game__stat"><strong>{String(index + 1).padStart(2, "0")}</strong><span>of 05</span></div></div>
      <div className="mini-game__progressline"><span>Question {index + 1} / 5</span><div role="progressbar" aria-label="Trivia question progress" aria-valuemin={0} aria-valuemax={5} aria-valuenow={index + 1}><i style={{ transform: `scaleX(${(index + 1) / 5})` }} /></div><span>{score} correct</span></div>
      <h2 id="trivia-title" className="trivia-panel__question">{current.question}</h2>
      <div className="trivia-options" role="group" aria-label="Answer choices">
        {current.choices.map((option, choiceIndex) => <button type="button" key={option} className={`trivia-option${choice === choiceIndex ? " is-picked" : ""}${choice !== null && choiceIndex === current.answer ? " is-right" : ""}${choice === choiceIndex && choiceIndex !== current.answer ? " is-wrong" : ""}`} onClick={() => answer(choiceIndex)} disabled={choice !== null} aria-pressed={choice === choiceIndex}><span>{String.fromCharCode(65 + choiceIndex)}</span>{option}{choice !== null && choiceIndex === current.answer ? <Check size={17} aria-label="Correct answer" /> : null}</button>)}
      </div>
      {choice !== null && <div className={`trivia-feedback${choice === current.answer ? " is-right" : ""}`} role="status" aria-live="polite"><div><strong>{choice === current.answer ? "Lovely, that’s right." : "Not quite—and now you know."}</strong><p>{current.explanation}</p></div><button className="arcade-button" type="button" onClick={next}>{index === QUESTIONS.length - 1 ? "See my score" : "Next question"}<ArrowRight size={15} /></button></div>}
    </section> : <section className="mini-game__result" aria-labelledby="trivia-result-title"><div className="mini-game__result-mark"><Sparkles size={29} /></div><p className="arcade__eyebrow">That’s a wrap</p><h1 id="trivia-result-title">A curious mind, <em>indeed.</em></h1><strong className="mini-game__big-score">{score}<small> / 5</small></strong><p>You got {score} {score === 1 ? "answer" : "answers"} right. Every little beauty fact is another color in the picture.</p><button className="arcade-button" type="button" onClick={replay}><RotateCcw size={15} /> Try the questions again</button></section>}
  </GameShell>;
}

type ShadeOption = { name: string; color: string; mood: string };
type LookBrief = { title: string; copy: string; family: string; accents: string[] };
const LOOK_BRIEFS: LookBrief[] = [
  { title: "Soft focus, slow morning", copy: "A little warmth, nothing too precious. Let the colors feel lived-in and easy.", family: "soft", accents: ["#8f7468", "#c78683", "#a96368"] },
  { title: "After-hours rose", copy: "A confident flush with a deeper note. Your look can be romantic without being shy.", family: "rose", accents: ["#765765", "#c66f7c", "#944e60"] },
  { title: "Sunlit, not serious", copy: "Bring a golden hint to the eyes and let the rest feel bright, fresh, and undone.", family: "sun", accents: ["#b37c43", "#dc9278", "#c56b56"] },
];
const OPTIONS: Record<string, ShadeOption[]> = {
  eye: [
    { name: "Cocoa haze", color: "#8f7468", mood: "soft" }, { name: "Fig velvet", color: "#765765", mood: "rose" }, { name: "Honeyed bronze", color: "#b37c43", mood: "sun" }, { name: "Mauve smoke", color: "#947882", mood: "soft" },
  ],
  cheek: [
    { name: "Petal flush", color: "#c78683", mood: "soft" }, { name: "Rose bloom", color: "#c66f7c", mood: "rose" }, { name: "Apricot veil", color: "#dc9278", mood: "sun" }, { name: "Berry tint", color: "#a45d72", mood: "rose" },
  ],
  lip: [
    { name: "Rosewood", color: "#a96368", mood: "soft" }, { name: "Mulberry stain", color: "#944e60", mood: "rose" }, { name: "Terracotta", color: "#c56b56", mood: "sun" }, { name: "Warm fig", color: "#965e5d", mood: "soft" },
  ],
};
type ProductType = keyof typeof OPTIONS;
const PRODUCT_LABELS: Record<ProductType, string> = { eye: "Eye", cheek: "Cheek", lip: "Lip" };

export function BuildMakeupLook({ onHub }: { onHub: () => void }) {
  const [briefIndex, setBriefIndex] = useState(0);
  const [selection, setSelection] = useState<Record<ProductType, number | null>>({ eye: null, cheek: null, lip: null });
  const [submitted, setSubmitted] = useState(false);
  const brief = LOOK_BRIEFS[briefIndex];
  const selectedCount = Object.values(selection).filter((value) => value !== null).length;
  const score = useMemo(() => (Object.keys(OPTIONS) as ProductType[]).reduce((total, type) => {
    const index = selection[type];
    return total + (index !== null && OPTIONS[type][index].mood === brief.family ? 1 : 0);
  }, 0), [selection, brief.family]);
  function anotherBrief() { setBriefIndex((value) => (value + 1) % LOOK_BRIEFS.length); setSelection({ eye: null, cheek: null, lip: null }); setSubmitted(false); }
  function submit() { if (selectedCount === 3) setSubmitted(true); }
  return <GameShell onHub={onHub} eyebrow="Look builder · one eye, one cheek, one lip">
    <div className="mini-game__heading"><div><h1>Build a makeup <em>look.</em></h1><p>Three choices, one mood. There’s no wrong way to make it yours.</p></div><div className="mini-game__stat"><Heart size={21} /><span>your edit</span></div></div>
    <section className="look-brief" aria-label="Your makeup brief"><div><p className="arcade__eyebrow">Your brief · {String(briefIndex + 1).padStart(2, "0")} / 03</p><h2>{brief.title}</h2><p>{brief.copy}</p></div><div className="look-brief__palette" aria-label="Brief palette">{brief.accents.map((color) => <i key={color} style={{ background: color }} />)}</div></section>
    {!submitted ? <>
      <div className="look-options">
        {(Object.keys(OPTIONS) as ProductType[]).map((type) => <fieldset className="look-category" key={type}><legend>{PRODUCT_LABELS[type]} shade <small>Choose one</small></legend><div className="look-swatch-list">
          {OPTIONS[type].map((option, index) => <button type="button" key={option.name} className={`look-swatch${selection[type] === index ? " is-selected" : ""}`} aria-pressed={selection[type] === index} onClick={() => setSelection((current) => ({ ...current, [type]: index }))}><i style={{ background: option.color }} /><span>{option.name}</span></button>)}
        </div></fieldset>)}
      </div>
      <div className="look-submit-row"><p>{selectedCount === 3 ? "Your trio is ready to meet." : `${3 - selectedCount} ${3 - selectedCount === 1 ? "choice" : "choices"} left`}</p><button className="arcade-button" type="button" onClick={submit} disabled={selectedCount !== 3}>See the look <ArrowRight size={15} /></button></div>
    </> : <section className="look-result" aria-live="polite" aria-labelledby="look-result-title">
      <div className="look-result__face" aria-hidden="true"><span style={{ background: OPTIONS.eye[selection.eye!].color }} /><span style={{ background: OPTIONS.cheek[selection.cheek!].color }} /><span style={{ background: OPTIONS.lip[selection.lip!].color }} /></div>
      <div className="look-result__copy"><p className="arcade__eyebrow">Your look is in</p><h2 id="look-result-title">{score === 3 ? "A beautiful fit." : score === 2 ? "A lovely little harmony." : "Unexpected, in the best way."}</h2><p>{score} out of 3 shades echo your “{brief.title}” brief. The rest is your own signature.</p><ul>{(Object.keys(OPTIONS) as ProductType[]).map((type) => <li key={type}><span>{PRODUCT_LABELS[type]}</span><strong>{OPTIONS[type][selection[type]!].name}</strong></li>)}</ul><button className="arcade-button" type="button" onClick={anotherBrief}><RotateCcw size={15} /> Try another brief</button></div>
    </section>}
  </GameShell>;
}

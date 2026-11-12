import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Palette, RotateCcw } from "lucide-react";
import AuthControl from "./AuthControl";

type Shade = {
  id: string;
  name: string;
  color: string;
};

type Round = {
  target: Shade;
  choices: Shade[];
};

type Level = {
  name: string;
  title: string;
  description: string;
  rounds: Round[];
};

const levelBlueprints: Level[] = [
  {
    name: "Starter",
    title: "A little warm-up",
    description: "Start with the broad strokes. Find each shade’s unmistakable twin.",
    rounds: [
      {
        target: { id: "petal", name: "Petal blush", color: "#d98283" },
        choices: [
          { id: "peach", name: "Apricot veil", color: "#e8a27e" },
          { id: "petal", name: "Petal blush", color: "#d98283" },
          { id: "clay", name: "Soft clay", color: "#b86f5f" },
          { id: "rosewood", name: "Rosewood", color: "#a85460" },
        ],
      },
      {
        target: { id: "fig", name: "Fig jam", color: "#744759" },
        choices: [
          { id: "berry", name: "Wild berry", color: "#96445c" },
          { id: "fig", name: "Fig jam", color: "#744759" },
          { id: "cocoa", name: "Cocoa dusk", color: "#705347" },
          { id: "plum", name: "Plum silk", color: "#8e6a83" },
        ],
      },
      {
        target: { id: "honey", name: "Honey glow", color: "#d7a94f" },
        choices: [
          { id: "sand", name: "Warm sand", color: "#c5a782" },
          { id: "honey", name: "Honey glow", color: "#d7a94f" },
          { id: "butter", name: "Buttercream", color: "#ead99c" },
          { id: "copper", name: "Soft copper", color: "#bd7859" },
        ],
      },
      {
        target: { id: "mauve", name: "Quiet mauve", color: "#a77984" },
        choices: [
          { id: "petal", name: "Petal blush", color: "#d98283" },
          { id: "taupe", name: "Misty taupe", color: "#9c8a7b" },
          { id: "mauve", name: "Quiet mauve", color: "#a77984" },
          { id: "berry", name: "Wild berry", color: "#96445c" },
        ],
      },
      {
        target: { id: "terracotta", name: "Rose terracotta", color: "#c66c59" },
        choices: [
          { id: "terracotta", name: "Rose terracotta", color: "#c66c59" },
          { id: "coral", name: "Fresh coral", color: "#e88d79" },
          { id: "brick", name: "Soft brick", color: "#9e5148" },
          { id: "peach", name: "Apricot veil", color: "#e8a27e" },
        ],
      },
    ],
  },
  {
    name: "In the mix",
    title: "Read the undertone",
    description: "The shades are closer now. Look past the color family to the small shifts in tone.",
    rounds: [
      {
        target: { id: "rosewater", name: "Rosewater", color: "#c87d83" },
        choices: [
          { id: "rosewater", name: "Rosewater", color: "#c87d83" },
          { id: "dusty-rose", name: "Dusty rose", color: "#c78386" },
          { id: "soft-berry", name: "Soft berry", color: "#c47780" },
          { id: "warm-petal", name: "Warm petal", color: "#cb7d78" },
        ],
      },
      {
        target: { id: "fig-leaf", name: "Fig leaf", color: "#805968" },
        choices: [
          { id: "plum-veil", name: "Plum veil", color: "#815b69" },
          { id: "fig-leaf", name: "Fig leaf", color: "#805968" },
          { id: "berry-ink", name: "Berry ink", color: "#7d5667" },
          { id: "mauve-smoke", name: "Mauve smoke", color: "#835a68" },
        ],
      },
      {
        target: { id: "sunlit-terracotta", name: "Sunlit terracotta", color: "#c9795e" },
        choices: [
          { id: "apricot-clay", name: "Apricot clay", color: "#c87b60" },
          { id: "cinnamon-rose", name: "Cinnamon rose", color: "#c67861" },
          { id: "sunlit-terracotta", name: "Sunlit terracotta", color: "#c9795e" },
          { id: "rose-copper", name: "Rose copper", color: "#c77a5c" },
        ],
      },
      {
        target: { id: "oat-glaze", name: "Oat glaze", color: "#cdbb9c" },
        choices: [
          { id: "oat-glaze", name: "Oat glaze", color: "#cdbb9c" },
          { id: "almond-milk", name: "Almond milk", color: "#cbbb9f" },
          { id: "sandstone", name: "Sandstone", color: "#cbb99c" },
          { id: "linen-warm", name: "Warm linen", color: "#cebb9c" },
        ],
      },
      {
        target: { id: "mulberry", name: "Mulberry stain", color: "#9a5366" },
        choices: [
          { id: "mulberry", name: "Mulberry stain", color: "#9a5366" },
          { id: "plum-stain", name: "Plum stain", color: "#995468" },
          { id: "berry-blush", name: "Berry blush", color: "#9c5367" },
          { id: "rose-fig", name: "Rose fig", color: "#9a5565" },
        ],
      },
    ],
  },
  {
    name: "Expert",
    title: "The close call",
    description: "A counter artist’s eye is made here. Trust the quietest difference.",
    rounds: [
      {
        target: { id: "petal-dusk", name: "Petal at dusk", color: "#b9787d" },
        choices: [
          { id: "petal-dusk", name: "Petal at dusk", color: "#b9787d" },
          { id: "rose-dusk", name: "Rose at dusk", color: "#b9797d" },
          { id: "mauve-petal", name: "Mauve petal", color: "#b9787e" },
          { id: "soft-petal", name: "Soft petal", color: "#b9777d" },
        ],
      },
      {
        target: { id: "plum-cashmere", name: "Plum cashmere", color: "#765765" },
        choices: [
          { id: "plum-cashmere", name: "Plum cashmere", color: "#765765" },
          { id: "fig-cashmere", name: "Fig cashmere", color: "#765766" },
          { id: "mauve-cashmere", name: "Mauve cashmere", color: "#775765" },
          { id: "berry-cashmere", name: "Berry cashmere", color: "#765764" },
        ],
      },
      {
        target: { id: "copper-rose", name: "Copper rose", color: "#bd745f" },
        choices: [
          { id: "rose-copper", name: "Rose copper", color: "#be745f" },
          { id: "copper-rose", name: "Copper rose", color: "#bd745f" },
          { id: "warm-rose", name: "Warm rose", color: "#bd755f" },
          { id: "clay-rose", name: "Clay rose", color: "#bd745e" },
        ],
      },
      {
        target: { id: "milled-honey", name: "Milled honey", color: "#c5a36b" },
        choices: [
          { id: "golden-oat", name: "Golden oat", color: "#c5a36c" },
          { id: "milled-honey", name: "Milled honey", color: "#c5a36b" },
          { id: "soft-amber", name: "Soft amber", color: "#c6a36b" },
          { id: "honeyed-sand", name: "Honeyed sand", color: "#c5a36a" },
        ],
      },
      {
        target: { id: "raisin-velvet", name: "Raisin velvet", color: "#714d5b" },
        choices: [
          { id: "raisin-velvet", name: "Raisin velvet", color: "#714d5b" },
          { id: "velvet-fig", name: "Velvet fig", color: "#724d5b" },
          { id: "raisin-plum", name: "Raisin plum", color: "#714d5c" },
          { id: "deep-rosewood", name: "Deep rosewood", color: "#714c5b" },
        ],
      },
    ],
  },
];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
  }
  return copy;
}

function makeFreshLevels(): Level[] {
  return levelBlueprints.map((level) => ({
    ...level,
    rounds: shuffled(level.rounds).map((round) => ({
      ...round,
      choices: shuffled(round.choices),
    })),
  }));
}

type Screen = "playing" | "level-complete" | "complete";

type MakeupGameProps = { onHub: () => void };

export default function MakeupGame({ onHub }: MakeupGameProps) {
  const [levels, setLevels] = useState<Level[]>(makeFreshLevels);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[][]>(() => levelBlueprints.map(() => []));
  const [screen, setScreen] = useState<Screen>("playing");

  const currentLevel = levels[levelIndex];
  const currentRound = currentLevel?.rounds[roundIndex];
  const currentAnswers = answers[levelIndex] ?? [];
  const levelScore = currentAnswers.filter(Boolean).length * 20;
  const totalScore = answers.flat().filter(Boolean).length * 20;
  const correct = selectedId === currentRound?.target.id;
  const roundNumber = roundIndex + 1;
  const correctChoice = currentRound?.choices.find((shade) => shade.id === currentRound.target.id);

  function chooseShade(shade: Shade) {
    if (selectedId || !currentRound || screen !== "playing") return;
    setSelectedId(shade.id);
    setAnswers((previous) => previous.map((levelAnswers, index) => (
      index === levelIndex
        ? [...levelAnswers.slice(0, roundIndex), shade.id === currentRound.target.id]
        : levelAnswers
    )));
  }

  function continueGame() {
    if (!selectedId || !currentRound) return;
    if (roundIndex === currentLevel.rounds.length - 1) {
      setScreen("level-complete");
      return;
    }
    setRoundIndex((index) => index + 1);
    setSelectedId(null);
  }

  function continueLevel() {
    if (levelIndex === levels.length - 1) {
      setScreen("complete");
      return;
    }
    setLevelIndex((index) => index + 1);
    setRoundIndex(0);
    setSelectedId(null);
    setScreen("playing");
  }

  function replay() {
    setLevels(makeFreshLevels());
    setLevelIndex(0);
    setRoundIndex(0);
    setSelectedId(null);
    setAnswers(levelBlueprints.map(() => []));
    setScreen("playing");
  }

  useEffect(() => {
    function handleNumberShortcut(event: KeyboardEvent) {
      if (screen !== "playing" || selectedId || !currentRound) return;
      if (event.altKey || event.ctrlKey || event.metaKey || !["1", "2", "3", "4"].includes(event.key)) return;
      const shade = currentRound.choices[Number(event.key) - 1];
      if (shade) {
        event.preventDefault();
        chooseShade(shade);
      }
    }

    window.addEventListener("keydown", handleNumberShortcut);
    return () => window.removeEventListener("keydown", handleNumberShortcut);
  }, [currentRound, screen, selectedId]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Shade Match — The Makeup Counter";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const progressLabel = screen === "playing"
    ? `Level ${levelIndex + 1}, round ${roundNumber} of 5`
    : screen === "level-complete"
      ? `Level ${levelIndex + 1} complete`
      : "All three levels complete";

  return (
    <div className="shade-game">
      <div className="shade-game__topline">A little color, a little play</div>
      <header className="shade-game__header">
        <a className="shade-game__brand" href="/" aria-label="The Makeup Counter, back to shop">
          <span className="shade-game__brand-name">the makeup counter</span>
          <span className="shade-game__brand-note">A place to play with color</span>
        </a>
        <div className="shade-game__header-actions">
          <AuthControl className="shade-account-control" />
          <button className="shade-game__back" type="button" onClick={onHub}>
            <ArrowLeft size={15} aria-hidden="true" />
            <span>All games</span>
          </button>
          <a className="shade-game__shop-link" href="/">Visit the shop</a>
        </div>
      </header>

      <main className="shade-game__main">
        {screen === "playing" && currentLevel && currentRound ? (
          <>
            <div className="shade-game__intro">
              <div>
                <p className="shade-game__eyebrow">The shade match challenge · Level {levelIndex + 1}</p>
                <h1 className="shade-game__title">Trust your <em>color eye.</em></h1>
                <p className="shade-game__dek">{currentLevel.description}</p>
              </div>
              <div className="shade-game__round-chip" aria-label={`Round ${roundNumber} of 5`}>
                <span>{String(roundNumber).padStart(2, "0")}</span>
                <span>of 05</span>
              </div>
            </div>

            <nav className="shade-game__level-track" aria-label="Level progress">
              {levels.map((level, index) => (
                <div
                  className={`shade-game__level-step${index === levelIndex ? " is-current" : ""}${index < levelIndex ? " is-done" : ""}`}
                  key={level.name}
                  aria-current={index === levelIndex ? "step" : undefined}
                >
                  <span className="shade-game__level-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="shade-game__level-name">{level.name}</span>
                </div>
              ))}
            </nav>

            <section className="shade-game__board" aria-labelledby="shade-question">
              <div className="shade-game__target-panel">
                <p className="shade-game__target-label">Your shade to match</p>
                <div
                  className="shade-game__target"
                  style={{ backgroundColor: currentRound.target.color }}
                  role="img"
                  aria-label={`Target shade: ${currentRound.target.name}`}
                />
                <p className="shade-game__target-name">Find its twin</p>
              </div>

              <div className="shade-game__choices-panel">
                <h2 className="shade-game__question" id="shade-question">
                  Which swatch is the match?
                </h2>
                <p className="shade-game__hint">
                  Choose a shade below, or press 1, 2, 3, or 4.
                </p>
                <div className="shade-game__options" role="group" aria-label="Choose the matching shade">
                  {currentRound.choices.map((shade, index) => {
                    const isSelected = selectedId === shade.id;
                    const isRight = selectedId !== null && shade.id === currentRound.target.id;
                    const isWrong = isSelected && !correct;
                    return (
                      <button
                        className={`shade-game__option${isSelected ? " is-selected" : ""}${isRight ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
                        type="button"
                        key={shade.id}
                        disabled={selectedId !== null}
                        aria-pressed={isSelected}
                        aria-label={`Choice ${index + 1}: ${shade.name}`}
                        onClick={() => chooseShade(shade)}
                      >
                        <span
                          className="shade-game__option-swatch"
                          style={{ backgroundColor: shade.color }}
                          aria-hidden="true"
                        >
                          <span className="shade-game__option-number">{index + 1}</span>
                        </span>
                        <span className="shade-game__option-name">{shade.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="shade-game__progress-row">
              <span>Round {roundNumber} / 5</span>
              <div
                className="shade-game__progress"
                role="progressbar"
                aria-label={`Level ${levelIndex + 1} round progress`}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={roundNumber}
              >
                <div className="shade-game__progress-fill" style={{ transform: `scaleX(${roundNumber / 5})` }} />
              </div>
              <span>{levelScore} pts</span>
            </div>

            {selectedId ? (
              <div
                className={`shade-game__feedback ${correct ? "is-right" : "is-wrong"}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="shade-game__feedback-copy">
                  <h3 className="shade-game__feedback-title">
                    {correct ? "A perfect match." : "Not quite this time."}
                  </h3>
                  <p className="shade-game__feedback-text">
                    {correct
                      ? "Lovely eye. That’s 20 points in the bag."
                      : `The matching shade was ${correctChoice?.name}. Take that color in before the next round.`}
                  </p>
                </div>
                <button className="shade-game__continue" type="button" onClick={continueGame}>
                  {roundIndex === currentLevel.rounds.length - 1 ? "See level score" : "Next shade"}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <p className="shade-game__footnote">A correct match earns 20 points. No timer, just good color instincts.</p>
            )}
          </>
        ) : screen === "level-complete" ? (
          <section className="shade-game__result shade-game__level-result" aria-labelledby="level-result-title">
            <div className="shade-game__result-mark" aria-hidden="true">
              <Palette size={36} strokeWidth={1.25} />
            </div>
            <p className="shade-game__eyebrow">Level {levelIndex + 1} · {currentLevel?.name}</p>
            <h1 className="shade-game__title" id="level-result-title">
              {levelIndex === levels.length - 1 ? <>Expertly <em>seen.</em></> : <>Level complete, <em>lovely eye.</em></>}
            </h1>
            <p className="shade-game__result-score" aria-label={`${levelScore} out of 100 points`}>
              {levelScore}<small> / 100</small>
            </p>
            <p className="shade-game__result-copy">
              {levelIndex === 0
                ? "Starter shades are behind you. Next, the undertones start to blur."
                : levelIndex === 1
                  ? "A keen eye. The expert round is all about the tiniest shifts."
                  : "You made it through all fifteen shades. Your final tally is ready."}
            </p>
            <div className="shade-game__round-review" aria-label={`${currentAnswers.filter(Boolean).length} correct rounds out of 5`}>
              {currentAnswers.map((wasCorrect, index) => (
                <span
                  className={`shade-game__review-dot ${wasCorrect ? "is-right" : "is-wrong"}`}
                  key={`round-${index + 1}`}
                  aria-label={`Round ${index + 1}: ${wasCorrect ? "correct" : "incorrect"}`}
                  title={`Round ${index + 1}: ${wasCorrect ? "correct" : "incorrect"}`}
                />
              ))}
            </div>
            <button className="shade-game__replay shade-game__level-continue" type="button" onClick={continueLevel}>
              {levelIndex === levels.length - 1 ? "See final score" : `Continue to ${levels[levelIndex + 1].name}`}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </section>
        ) : (
          <section className="shade-game__result" aria-labelledby="result-title">
            <div className="shade-game__result-mark" aria-hidden="true">
              <Palette size={36} strokeWidth={1.25} />
            </div>
            <p className="shade-game__eyebrow">That’s a wrap · Three levels complete</p>
            <h1 className="shade-game__title" id="result-title">Your color eye is <em>something.</em></h1>
            <p className="shade-game__result-score" aria-label={`${totalScore} out of 300 points`}>
              {totalScore}<small> / 300</small>
            </p>
            <p className="shade-game__result-copy">
              {totalScore === 300
                ? "Fifteen for fifteen. You have a beautifully sharp eye for shade."
                : totalScore >= 180
                  ? "A lovely eye for color, from broad strokes to the subtlest undertones."
                  : "Color is a feeling, not a test. Every round is another shade to discover."}
            </p>
            <div className="shade-game__level-scores" aria-label="Scores by level">
              {levels.map((level, index) => (
                <div className="shade-game__level-score" key={level.name}>
                  <span>{level.name}</span>
                  <strong>{(answers[index] ?? []).filter(Boolean).length * 20}<small> / 100</small></strong>
                </div>
              ))}
            </div>
            <button className="shade-game__replay" type="button" onClick={replay}>
              <RotateCcw size={15} aria-hidden="true" />
              Replay all levels
            </button>
            <div className="shade-game__round-review shade-game__all-review" aria-label={`${answers.flat().filter(Boolean).length} correct rounds out of 15`}>
              {answers.flat().map((wasCorrect, index) => (
                <span
                  className={`shade-game__review-dot ${wasCorrect ? "is-right" : "is-wrong"}`}
                  key={`round-${index + 1}`}
                  aria-label={`Round ${index + 1}: ${wasCorrect ? "correct" : "incorrect"}`}
                  title={`Round ${index + 1}: ${wasCorrect ? "correct" : "incorrect"}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <div className="shade-game__sr-only" aria-live="polite" aria-atomic="true">
        {screen !== "playing" ? `${progressLabel}. ${screen === "complete" ? `Your total score is ${totalScore} out of 300.` : `Level score: ${levelScore} out of 100.`}` : ""}
      </div>
    </div>
  );
}

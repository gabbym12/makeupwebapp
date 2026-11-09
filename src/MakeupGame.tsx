import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Palette, RotateCcw } from "lucide-react";

type Shade = {
  id: string;
  name: string;
  color: string;
};

type Round = {
  target: Shade;
  choices: Shade[];
};

const startingRounds: Round[] = [
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
];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
  }
  return copy;
}

function makeFreshGame(): Round[] {
  return shuffled(startingRounds).map((round) => ({
    ...round,
    choices: shuffled(round.choices),
  }));
}

export default function MakeupGame() {
  const [rounds, setRounds] = useState<Round[]>(makeFreshGame);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const currentRound = rounds[roundIndex];
  const score = answers.filter(Boolean).length * 20;
  const correct = selectedId === currentRound?.target.id;

  function chooseShade(shade: Shade) {
    if (selectedId || !currentRound) return;
    setSelectedId(shade.id);
    setAnswers((previous) => {
      const next = [...previous];
      next[roundIndex] = shade.id === currentRound.target.id;
      return next;
    });
  }

  function continueGame() {
    if (!selectedId) return;
    if (roundIndex === rounds.length - 1) {
      setFinished(true);
      return;
    }
    setRoundIndex((index) => index + 1);
    setSelectedId(null);
  }

  function replay() {
    setRounds(makeFreshGame());
    setRoundIndex(0);
    setSelectedId(null);
    setAnswers([]);
    setFinished(false);
  }

  useEffect(() => {
    function handleNumberShortcut(event: KeyboardEvent) {
      if (finished || selectedId || !currentRound) return;
      if (!["1", "2", "3", "4"].includes(event.key)) return;
      const shade = currentRound.choices[Number(event.key) - 1];
      if (shade) {
        event.preventDefault();
        chooseShade(shade);
      }
    }

    window.addEventListener("keydown", handleNumberShortcut);
    return () => window.removeEventListener("keydown", handleNumberShortcut);
  }, [currentRound, finished, selectedId]);

  const roundNumber = roundIndex + 1;
  const correctChoice = currentRound?.choices.find((shade) => shade.id === currentRound.target.id);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Shade Match — The Makeup Counter";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="shade-game">
      <div className="shade-game__topline">A little color, a little play</div>
      <header className="shade-game__header">
        <a className="shade-game__brand" href="/" aria-label="The Makeup Counter, back to shop">
          <span className="shade-game__brand-name">the makeup counter</span>
          <span className="shade-game__brand-note">A place to play with color</span>
        </a>
        <a className="shade-game__back" href="/">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Back to the shop</span>
        </a>
      </header>

      <main className="shade-game__main">
        {!finished ? (
          <>
            <div className="shade-game__intro">
              <div>
                <p className="shade-game__eyebrow">The shade match challenge</p>
                <h1 className="shade-game__title">Trust your <em>color eye.</em></h1>
                <p className="shade-game__dek">
                  Five rounds, four swatches each. Find the one that feels like a perfect match.
                </p>
              </div>
              <div className="shade-game__round-chip" aria-label={`Round ${roundNumber} of 5`}>
                <span>{String(roundNumber).padStart(2, "0")}</span>
                <span>of 05</span>
              </div>
            </div>

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
                  Go with your eye. Choose a shade below, or press 1, 2, 3, or 4.
                </p>
                <div className="shade-game__options" role="group" aria-label="Choose the matching shade">
                  {currentRound.choices.map((shade, index) => {
                    const isSelected = selectedId === shade.id;
                    const isRight = selectedId !== null && shade.id === currentRound.target.id;
                    const isWrong = isSelected && !correct;
                    const stateClass = isSelected ? " is-selected" : "";
                    return (
                      <button
                        className={`shade-game__option${stateClass}${isRight ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
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

            <div className="shade-game__progress-row" aria-label={`Round ${roundNumber} of 5`}>
              <span>Round {roundNumber}</span>
              <div
                className="shade-game__progress"
                role="progressbar"
                aria-label="Game progress"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={roundNumber}
              >
                <div
                  className="shade-game__progress-fill"
                  style={{ transform: `scaleX(${roundNumber / rounds.length})` }}
                />
              </div>
              <span>{score} points</span>
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
                  {roundIndex === rounds.length - 1 ? "See my score" : "Next shade"}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <p className="shade-game__footnote">A correct match earns 20 points. No timer, just good color instincts.</p>
            )}
          </>
        ) : (
          <section className="shade-game__result" aria-labelledby="result-title">
            <div className="shade-game__result-mark" aria-hidden="true">
              <Palette size={36} strokeWidth={1.25} />
            </div>
            <p className="shade-game__eyebrow">That’s a wrap</p>
            <h1 className="shade-game__title" id="result-title">Your color eye is <em>something.</em></h1>
            <p className="shade-game__result-score" aria-label={`${score} out of 100 points`}>
              {score}<small> / 100</small>
            </p>
            <p className="shade-game__result-copy">
              {score === 100
                ? "Five for five. You have a beautifully sharp eye for shade."
                : score >= 60
                  ? "A lovely eye for color. There’s always another shade to discover."
                  : "Color is a feeling, not a test. Want to take another little look?"}
            </p>
            <button className="shade-game__replay" type="button" onClick={replay}>
              <RotateCcw size={15} aria-hidden="true" />
              Play again
            </button>
            <div className="shade-game__round-review" aria-label={`${answers.filter(Boolean).length} correct rounds out of 5`}>
              {answers.map((wasCorrect, index) => (
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
        {finished ? `Challenge complete. Your score is ${score} out of 100.` : ""}
      </div>
    </div>
  );
}

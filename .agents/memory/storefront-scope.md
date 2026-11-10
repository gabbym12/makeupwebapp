---
name: Storefront scope
description: The user's confirmed direction for this project's website.
---

This project is an online makeup shop with a separate five-game arcade: Shade
Match, Makeup Memory Match, Memory Challenge, Beauty Trivia, and Build a Makeup
Look. The challenge grows from 6 to 10 pairs over three rounds. Wrong pairs turn
back over so players can keep trying; each round has a fixed layout, and later
rounds move the cards while preserving matching pairs. Standard Memory Match
remains forgiving.

**Why:** The user asked for more than color matching, selected three additional games, then requested a three-round matching challenge with different card layouts between rounds. The user clarified that wrong pairs should turn back over rather than restart the run.

**How to apply:** Preserve the shop at `/`; keep the five activities together on the separate game page and retain three escalating rounds, with retry-on-mismatch and stable, pair-correct layouts that differ by round unless the user changes direction.

# G.R.I.N.D - Game Rules

## Overview

A trick-taking game where players take turns as leaders and followers, performing tricks to avoid collecting letters from the word "G.R.I.N.D". The last player remaining wins!

## Setup

- **Players**: 2+ players
- **Cards**: 98 unique trick cards
- **Game Word**: G.R.I.N.D (5 letters = 5 strikes to elimination)
- **Initial Leader/player**: Player 0

## Card Deck

- 98 unique trick cards of varying difficulties
- Shuffled using Fisher-Yates algorithm
- Reshuffled when there are no more cards in the draw pile to draw from.

## Gameplay

### Turn Structure

1. **Leader's Turn**:

   - Leader draws a random card
   - Attempts to set the trick for others to perform
   - If successful:
     - All other players must attempt the same trick
     - Leader earns +1 successful consecutive streak
     - If leader reaches 3 successful consecutive trick land streak, leadership passes to the next players index
   - If failed:
     - Leader receives a letter from "G.R.I.N.D"
     - Leadership passes to the next players index

2. **Followers' Turns**:
   - Must attempt the leader's trick in turn order
   - Success: No penalty
   - Failure: Receive a letter from "G.R.I.N.D"

### Special Rules

- **Three Streak Rule**: Leader can only have 3 successful consecutive streaks before passing leadership after the current round ends.
- **Elimination**: Players are eliminated from the game when they accumulate all 5 letters 'G.R.I.N.D'.

## Winning

- Last remaining player wins!
- cannot be a tie game!

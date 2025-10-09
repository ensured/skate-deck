# G.R.I.N.D - Game Rules

## Overview

A trick-taking game where players take turns as leaders and followers, performing tricks to avoid collecting letters from the word "G.R.I.N.D". The last player remaining wins!

## Setup

- **Players**: 2+ players
- **Cards**: 98 unique trick cards
- **Game Word**: G.R.I.N.D (5 letters = 5 strikes to elimination)
- **Initial Leader**: Player 0

## Card Deck

- 98 unique trick cards of varying difficulties
- Deck is shuffled initially using Fisher-Yates algorithm
- Cards are drawn sequentially until deck is empty

## Gameplay

### Turn Structure

Each round consists of:
1. Leader draws and attempts a trick
2. All other players attempt the same trick in turn order
3. Round ends when all players have attempted the trick

**Round increments when:**
- Any player misses a trick (new card drawn, new round starts)
- All players complete the leader's trick (round ends, leadership may rotate)

### Leader's Role

- **Leader draws a card** and sets the trick for all players to attempt
- **Successful attempt**: Leader gets +1 to consecutive streak
- **Failed attempt**: Leader gets a letter from "G.R.I.N.D" and leadership passes immediately

**Leadership Rotation:**
- **Leader fails**: Leadership passes immediately to next player
- **Leader succeeds 3 times**: Leadership passes after current round ends (all players attempt the trick)
- **Rotation is automatic** - happens without player input

### Followers' Turns

- **Must attempt the leader's trick** in turn order
- **Success**: No penalty, earn points for the trick
- **Failure**: Receive a letter from "G.R.I.N.D"

### Elimination & Letters

**Letter System:**
- Each miss gives 1 letter: G → R → I → N → D
- Progress shown as "Player got letter 'R' (2/5)"
- Visual indicators show current letter progress

**Elimination:**
- Players are eliminated when they collect all 5 letters (G.R.I.N.D)
- Game ends immediately when only 1 player remains
- Eliminated players are removed from gameplay

### Winning

- **Last remaining player wins**
- Game ends automatically when only 1 active player remains
- Cannot be a tie game

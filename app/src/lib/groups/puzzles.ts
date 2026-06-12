/* GROUPS puzzle bank — daily Connections-style grids over the 48 qualified
   nations. Each puzzle: 4 groups × 4 nations, tier 0 (easiest) → 3 (sneakiest),
   stored in tier order. Nation names MUST match lib/anthem/puzzles.ts exactly
   (a unit test enforces it) so tiles can reuse the anthem flag/cc data.

   Editorial rules (mirror NYT Connections):
   - every nation appears in exactly ONE group of its grid;
   - deliberate traps (a nation that *also* fits another group's category) are
     good — noted in comments — but the full 4+4+4+4 partition must be unique;
   - facts only (geography, flags, confederations, tournament history), no
     opinions, no FIFA marks. Titles are EN editorial content (like anthem
     hints) — they do not get translated. */

export interface GroupDef {
  title: string
  tier: 0 | 1 | 2 | 3
  nations: [string, string, string, string]
}

export interface GroupsPuzzle {
  groups: [GroupDef, GroupDef, GroupDef, GroupDef]
}

export const GROUPS_BANK: GroupsPuzzle[] = [
  /* #1 — traps: Germany & Spain are also World Cup winners but belong to
     "border France"; unique because England/Uruguay border nothing French. */
  {
    groups: [
      { title: 'Have won the World Cup', tier: 0, nations: ['Brazil', 'Argentina', 'Uruguay', 'England'] },
      { title: 'Island nations', tier: 1, nations: ['Japan', 'New Zealand', 'Cape Verde', 'Curaçao'] },
      { title: 'Crescent moon on the flag', tier: 2, nations: ['Türkiye', 'Tunisia', 'Algeria', 'Uzbekistan'] },
      { title: 'Share a land border with France', tier: 3, nations: ['Spain', 'Switzerland', 'Belgium', 'Germany'] },
    ],
  },
  /* #2 — trap: Mexico's capital is also "named after the country" but sits in
     the hosts group. */
  {
    groups: [
      { title: 'World Cup hosts, 2022 & 2026', tier: 0, nations: ['United States', 'Canada', 'Mexico', 'Qatar'] },
      { title: 'Capital city named after the country', tier: 1, nations: ['Panama', 'Tunisia', 'Algeria', 'Brazil'] },
      { title: 'Lions in the team nickname', tier: 2, nations: ['Morocco', 'Senegal', 'Iraq', 'England'] },
      { title: 'Reached a final, never won it', tier: 3, nations: ['Netherlands', 'Croatia', 'Sweden', 'Czechia'] },
    ],
  },
  /* #3 — traps: Austria is landlocked (sits in A…A); Switzerland & Austria
     also hosted Winter Olympics (sit in landlocked / A…A). Bosnia has a
     coastline (Neum), so the landlocked alternative fails → unique. */
  {
    groups: [
      { title: 'Start and end with the letter A', tier: 0, nations: ['Argentina', 'Australia', 'Austria', 'Algeria'] },
      { title: 'Landlocked countries', tier: 1, nations: ['Switzerland', 'Czechia', 'Paraguay', 'Uzbekistan'] },
      { title: 'The equator passes through', tier: 2, nations: ['Ecuador', 'Colombia', 'Brazil', 'DR Congo'] },
      { title: 'Hosted a Winter Olympics', tier: 3, nations: ['Norway', 'Japan', 'France', 'Bosnia and Herzegovina'] },
    ],
  },
  /* #4 — traps: England's flag is red & white (sits with King Charles);
     Canada has exactly one land neighbour (sits with King Charles);
     Qatar is Arabic-speaking (sits in one-neighbour). */
  {
    groups: [
      { title: 'Flag is only red and white', tier: 0, nations: ['Japan', 'Switzerland', 'Türkiye', 'Austria'] },
      { title: 'King Charles is head of state', tier: 1, nations: ['Canada', 'Australia', 'New Zealand', 'England'] },
      { title: 'Arabic is an official language', tier: 2, nations: ['Saudi Arabia', 'Jordan', 'Egypt', 'Iraq'] },
      { title: 'Exactly one land neighbour', tier: 3, nations: ['Portugal', 'Haiti', 'South Korea', 'Qatar'] },
    ],
  },
  /* #5 — trap: Mexico also played at the 1930 World Cup (sits in Spanish).
     Brazil keeps the 1930 group non-Spanish → unique. */
  {
    groups: [
      { title: 'Spanish-speaking', tier: 0, nations: ['Mexico', 'Colombia', 'Ecuador', 'Panama'] },
      { title: 'Drive on the left', tier: 1, nations: ['England', 'Scotland', 'South Africa', 'Japan'] },
      { title: 'Played at the first World Cup (1930)', tier: 2, nations: ['France', 'Belgium', 'United States', 'Brazil'] },
      { title: 'Arabic script on the flag', tier: 3, nations: ['Saudi Arabia', 'Iraq', 'Iran', 'Egypt'] },
    ],
  },
  /* #6 — traps: Spain, France & Netherlands also pay in euros (they sit in
     colour nicknames; Belgium's "Red Devils" is devils, not a colour). */
  {
    groups: [
      { title: 'Nickname is literally a colour', tier: 0, nations: ['Spain', 'France', 'Netherlands', 'New Zealand'] },
      { title: 'Share a border with Brazil', tier: 1, nations: ['Colombia', 'Paraguay', 'Uruguay', 'Argentina'] },
      { title: 'Pay in euros', tier: 2, nations: ['Germany', 'Portugal', 'Belgium', 'Croatia'] },
      { title: '2026 World Cup debutants', tier: 3, nations: ['Cape Verde', 'Curaçao', 'Jordan', 'Uzbekistan'] },
    ],
  },
  /* #7 — trap: South Korea co-hosted 2002 and never won (sits in AFC). */
  {
    groups: [
      { title: 'European champions (won the Euros)', tier: 0, nations: ['Spain', 'France', 'Portugal', 'Netherlands'] },
      { title: 'Play in the Asian confederation', tier: 1, nations: ['Australia', 'Iran', 'South Korea', 'Jordan'] },
      { title: 'Animal in the team nickname', tier: 2, nations: ['Algeria', 'Ivory Coast', 'Saudi Arabia', 'Uzbekistan'] },
      { title: 'Hosted a World Cup, never won one', tier: 3, nations: ['Mexico', 'South Africa', 'Qatar', 'Sweden'] },
    ],
  },
  /* #8 — traps: Mexico has a Caribbean coastline AND an Olympic football
     gold (2012), but only Mexico fits the Tropic of Cancer group → unique. */
  {
    groups: [
      { title: 'Name contains LAND', tier: 0, nations: ['England', 'Scotland', 'Netherlands', 'New Zealand'] },
      { title: 'Caribbean coastline', tier: 1, nations: ['Haiti', 'Curaçao', 'Panama', 'Colombia'] },
      { title: "Olympic gold in men's football", tier: 2, nations: ['Argentina', 'Brazil', 'Spain', 'Uruguay'] },
      { title: 'The Tropic of Cancer crosses', tier: 3, nations: ['Mexico', 'Saudi Arabia', 'Egypt', 'Algeria'] },
    ],
  },
  /* #9 — traps: USA & France are G7 (sit in red-white-blue); Saudi Arabia's
     flag has no red (sits in OPEC). */
  {
    groups: [
      { title: 'Red, white and blue flag', tier: 0, nations: ['United States', 'France', 'Netherlands', 'Norway'] },
      { title: 'G7 members', tier: 1, nations: ['Canada', 'Japan', 'Germany', 'England'] },
      { title: 'No red anywhere on the flag', tier: 2, nations: ['Argentina', 'Uruguay', 'Brazil', 'Sweden'] },
      { title: 'OPEC members', tier: 3, nations: ['Saudi Arabia', 'Iran', 'Iraq', 'Algeria'] },
    ],
  },
  /* #10 — monarchy double-bill; trap: Spain is also a European monarchy but
     hides in the flag-animals group (eagle: Mexico/Egypt, condor: Ecuador,
     lion in the coat of arms: Spain). */
  {
    groups: [
      { title: 'Copa América winners', tier: 0, nations: ['Brazil', 'Uruguay', 'Colombia', 'Paraguay'] },
      { title: 'European monarchies', tier: 1, nations: ['Netherlands', 'Belgium', 'Norway', 'Sweden'] },
      { title: 'Arab monarchies', tier: 2, nations: ['Jordan', 'Morocco', 'Saudi Arabia', 'Qatar'] },
      { title: 'An animal on the flag or arms', tier: 3, nations: ['Mexico', 'Egypt', 'Ecuador', 'Spain'] },
    ],
  },
]

/* all 16 nations of a puzzle, in tier order (UI shuffles for display) */
export function puzzleNations(p: GroupsPuzzle): string[] {
  return p.groups.flatMap((g) => g.nations)
}

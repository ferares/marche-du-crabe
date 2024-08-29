import { enemyIcons, objectRevealedIcon, playersIcon, shrimpIcon } from "@/helpers/game"

import NewGameBtn from "@/components/NewGameBtn"

export default function Home() {
  return (
    <main className="main-content">
      <section className="intro">
        <h1 className="title">
          Game based on &quot;La Marche du Crabe&quot;
        </h1>
        <ul>
          <li>2 player game.</li>
          <br />
          <li>
            <b>Set up</b>: There&apos;s a board with 12 objects in it:
            <ul>
              <li>Behind 8 of those objects there are crabs that we need to free ({objectRevealedIcon}) to win the game.</li>
              <li>Behind the remaining 4 objects there are enemies ({enemyIcons.octopus}). Each player knows only 2 of these objects.</li>
            </ul>
          </li>
          <br />
          <li>
            <b>Objective</b>: Players cooperate to move around the board to free their fellow crabs and avoid their enemies. Each player moves in only 1 direction, up-down or right-left.
          </li>
          <br />
          <li>
            <b>Communication</b>: Players can only communicate through their actions.
          </li>
          <br />
          <li>
            <b>On your turn</b>:
            <ol>
              <li>Draw an enemy card and place it on the board on the specified row.</li>
              <li>Move the crabs <span className="players">{playersIcon}</span> (or choose to leave them where they are).</li>
            </ol>
          </li>
          <br />
          <li>
            We start the game with 5 shrimps ({shrimpIcon}) that we can feed our enemies so we can escape them:
            <ul>
              <li>Moving to a space with an enemy or moving over one or more enemies costs 1 {shrimpIcon}.</li>
              <li>Placing an enemy on the space that&apos;s occupied by the players costs 1 {shrimpIcon}.</li>
              <li>Moving to a space with an object that turned out to have a hidden enemy costs 2 {shrimpIcon}.</li>
            </ul>
          </li>
          <br />
          <li>We win if all 8 crabs ({objectRevealedIcon}) are freed from their objects.</li>
          <li>We lose if we run out of {shrimpIcon} or if a player runs out of enemy cards to place on the board.</li>
        </ul>
        <NewGameBtn />
      </section>
    </main>
  );
}

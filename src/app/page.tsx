import NewGameBtn from "@/components/NewGameBtn"

export default function Home() {
  return (
    <main className="main-content">
      <section className="intro">
        <h1 className="title">
          La Marche du Crabe
        </h1>
        <p>
          We are the last members of a peculiar decapod crustacean species: the square crabs from the Gironde estuary.
          From an evolutionary standpoint, we&apos;re not that useful, notably because... Well, we physically can&apos;t turn.
          We&apos;re bound to walk in a straight line all our life. And not even straight, but… Crab steering! Not exactly an interesting life...
          Especially for those born between two rocks.
        </p>

        <p>
          We&apos;re not that moronic though, because, after only a few hundred thousand years,
          we realized that with two crabs who take turns climbing on top of each other,
          we could move in a grid pattern in all our environment! New horizons beckoned us!
        </p>

        <p>
          Let&apos;s use this discovery to free our buddies, who are trapped under items left on the beach by careless humans,
          whilst avoiding our sworn enemies: the formidable yet stupid brown crabs and the terrifying and sly lobsters...
        </p>

        <p>
          La Marche du Crabe is a super immersive cooperative deduction game, in which the two playful crabs will be completely dependent on each other...
          not to mention! You have often seen crabs discuss, will you?
        </p>

        <p>
          An evolving game!<br />
          To ensure an unlimited lifespan and a growing challenge, the game is scalable, with eleven Scenario cards and as many new challenges!<br />
          The promise of unlimited play and always new games!<br />
        </p>

        <h2>How To Play</h2>

        <p>
          On their turn, the player must play a Baddie card on the beach and then move the crabs token. If they stop on an Item Card,
          their friend tells whether if it&apos;s a forbidden item or not.
        </p>

        <h2>How To Win</h2>

        <p>
          To win, the two players must free together their 8 crab buddies before they cannot place Baddie cards on the beach. Moreover, shrimps being life points,
          players lose if they must use shrimps and they don&apos;t have anymore!
        </p>
        <br />
        <br />
        <NewGameBtn />
      </section>
    </main>
  );
}

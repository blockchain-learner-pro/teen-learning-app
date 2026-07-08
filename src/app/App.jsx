import { useState } from "react";
import { getSnapshot } from "../engine/gameStateEngine";

import Splash from "../components/splash/Splash";
import Menu from "../components/menu/Menu";
import Game from "../components/game/Game";
import HUD from "../components/hud/GameHUD";
import Results from "../components/results/Results";

export default function App() {
  const [screen, setScreen] = useState("splash");

  const [gameState, setGameState] = useState(() => getSnapshot());

  const goGame = () => setScreen("game");
  const goMenu = () => setScreen("menu");
  const goResults = () => setScreen("results");

  return (
    <>
      {screen === "splash" && <Splash onFinish={goMenu} />}

      {screen !== "splash" && (
        <div className="app-background screen-fade-in">
          {screen === "menu" && <Menu startGame={goGame} />}

          {screen === "game" && (
            <div className="game-layout">
              <Game
                setGameState={setGameState}
                endGame={goResults}
              />

              <div className="hud-column">
                <HUD {...gameState} />
              </div>
            </div>
          )}

          {screen === "results" && (
            <Results
              score={gameState.score}
              restart={goMenu}
            />
          )}
        </div>
      )}
    </>
  );
}


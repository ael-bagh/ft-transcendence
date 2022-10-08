import MainLayout from "../components/layout/MainLayout";
import { ReactP5Wrapper, P5Instance } from "react-p5-wrapper";
import { Engine, Bodies, Composite } from "matter-js";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/api/useSocket";

export default function Game() {
  const { Move, Correction, CorrectionOff } = useSocket();
  const engine = useRef(Engine.create());
  const bar1 = useRef(Bodies.rectangle(50, 300, 10, 100, { isStatic: true }));
  const bar2 = useRef(Bodies.rectangle(1230, 300, 10, 100, { isStatic: true }));
  const ball = useRef(Bodies.circle(640, 360, 10, { isStatic: true }));
  const key = useRef({ up: false, down: false });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const { socket } = useSocket();
  useEffect(() => {
    socket.on("game_ended", (data: GameData) => {
      setGameEnded(true);
    });
    Composite.add(engine.current.world, [
      ball.current,
      bar1.current,
      bar2.current,
    ]);
    document.addEventListener(
      "keydown",
      (event) => {
        let mov = 0;
        if (event.key === "ArrowUp") {
          mov = -1;
          key.current.up = true;
        } else if (event.key === "ArrowDown") {
          mov = 1;
          key.current.down = true;
        } else return;
        Move(mov);
      },
      false
    );
    document.addEventListener(
      "keyup",
      (event) => {
        let mov = 0;
        if (event.key === "ArrowUp") {
          key.current.up = false;
          if (key.current.down === true) mov = 1;
          else mov = 0;
        } else if (event.key === "ArrowDown") {
          key.current.down = false;
          if (key.current.up === true) mov = -1;
          else mov = 0;
        } else return;
        Move(mov);
      },
      false
    );
    Correction(bar1.current, bar2.current, ball.current, setScore1, setScore2);
    return () => {
      socket.off("game_ended");
      CorrectionOff();
    };
  }, []);
  const sketch = (p5: P5Instance) => {
    const ballRadiusRatio = 10 / 1280;
    const barWidthRatio = 10 / 1280;
    const barHeightRatio = 100 / 720;
    let cwidth = window.innerWidth;
    let cheight = window.innerWidth / 1.77777777778;
    if (cheight > window.innerHeight - 80) {
      cheight = window.innerHeight - 80;
      cwidth = (window.innerHeight - 80) * 1.77777777778;
    }
    p5.setup = () => p5.createCanvas(cwidth, cheight, p5.P2D);

    p5.windowResized = () => {
      cwidth = window.innerWidth;
      cheight = window.innerWidth / 1.77777777778;
      if (cheight > window.innerHeight - 80) {
        cheight = window.innerHeight - 80;
        cwidth = (window.innerHeight - 80) * 1.77777777778;
      }
      p5.resizeCanvas(cwidth, cheight);
    };

    p5.draw = () => {
      p5.background(51);
      let pos = ball.current.position;
      let angle = ball.current.angle;
      p5.push();
      p5.translate(pos.x * cwidth, pos.y * cheight);
      p5.rotate(angle);
      p5.rectMode(p5.CENTER);
      p5.ellipse(0, 0, ballRadiusRatio * cwidth, ballRadiusRatio * cwidth);
      p5.pop();
      pos = bar1.current.position;
      angle = bar1.current.angle;
      p5.push();
      p5.translate(pos.x * cwidth, pos.y * cheight);
      p5.rotate(angle);
      p5.rectMode(p5.CENTER);
      p5.rect(0, 0, barWidthRatio * cwidth, barHeightRatio * cheight);
      p5.pop();
      pos = bar2.current.position;
      angle = bar2.current.angle;
      p5.push();
      p5.translate(pos.x * cwidth, pos.y * cheight);
      p5.rotate(angle);
      p5.rectMode(p5.CENTER);
      p5.rect(0, 0, barWidthRatio * cwidth, barHeightRatio * cheight);
      p5.pop();
      p5.textSize(32);
      p5.text(score1, (cwidth / 2) - 50 , 10, 70, 80);
      p5.text(score2, (cwidth / 2) + 50, 10, 70, 80);

    };
  };
  // const { data: Game } = useLoaderData() as { data: Game | null };
  return (
    <MainLayout>
      <div className="flex  justify-center items-center w-screen h-full">
      <ReactP5Wrapper sketch={sketch} />
      </div>
    </MainLayout>
  );
}

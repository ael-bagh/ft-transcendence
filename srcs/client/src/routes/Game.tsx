import MainLayout from "../components/layout/MainLayout";
import { ReactP5Wrapper, P5Instance } from "react-p5-wrapper";
import { Engine, Bodies, Composite } from "matter-js";
import { useEffect, useRef, useState, Fragment, useContext } from "react";
import { useSocket } from "../hooks/api/useSocket";
import { Dialog, Transition } from "@headlessui/react";
import { GiPodiumWinner, GiDeadHead } from "react-icons/gi";
import { AuthUserContext } from "../contexts/authUser.context";
import { Link } from "react-router-dom";
import sock from "../lib/socket";
import { useParams } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";

function Example(props: { open: boolean; gameData: GameData | undefined }) {
  const cancelButtonRef = useRef(null);
  const { authUser } = useContext(AuthUserContext);
  let spectating = false;
  if (
    [props.gameData?.winner, props.gameData?.loser].includes(authUser?.login) ==
    false
  ) {
    spectating = true;
  }
  return (
    <>
      {
        <Transition.Root show={props.open} as={Fragment}>
          <Dialog
            as="div"
            className="fixed z-10 inset-0 overflow-y-auto"
            initialFocus={cancelButtonRef}
            onClose={() => open}
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    {!spectating && (
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        {props.gameData?.winner === authUser?.login ? (
                          <GiPodiumWinner
                            className="h-6 w-6 text-green-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <GiDeadHead
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )}
                    {spectating && (
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <FaRegEye
                          className="h-6 w-6 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div className="mt-3 text-center sm:mt-5">
                      {!spectating && (
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 font-medium text-gray-900"
                        >
                          {props.gameData?.winner === authUser?.login
                            ? "You won!"
                            : "You lost!"}
                        </Dialog.Title>
                      )}
                      {spectating && (
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 font-medium text-gray-900"
                        >
                          GAME DONE !
                        </Dialog.Title>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Link
                      to={"/dashboard"}
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      ref={cancelButtonRef}
                    >
                      Back to dashboard
                    </Link>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      }
    </>
  );
}

export default function Game() {
  const { id } = useParams();
  const { Move, Correction, CorrectionOff } = useSocket();
  const engine = useRef(Engine.create());
  const bar1 = useRef(
    Bodies.rectangle(50 / 1280, 300 / 720, 10 / 1280, 100 / 720, {
      isStatic: true,
    })
  );
  const bar2 = useRef(
    Bodies.rectangle(1230 / 1280, 300 / 720, 10 / 1280, 100 / 720, {
      isStatic: true,
    })
  );
  const ball = useRef(
    Bodies.circle(640 / 1280, 360 / 720, 10 / 1280, { isStatic: true })
  );
  const key = useRef({ up: false, down: false });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameData, setGameData] = useState<GameData | undefined>(undefined);
  const [gameEnded, setGameEnded] = useState(false);
  const { socket } = useSocket();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    socket.on("game_ended", (data: GameData) => {
      setGameEnded(true);
      setGameData(data);
      setVisible(true);
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
  }, [id]);

  useEffect(() => {
    sock.emit("spectate", { target_lobby: id });
    return () => {
      sock.emit("quitGame", { target_lobby: id });
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
      p5.background(50);

      let pos = ball.current.position;
      let angle = ball.current.angle;

      p5.push();
      p5.translate(cwidth / 2, 0);
      p5.rotate(angle);
      p5.fill(255);
      p5.rectMode(p5.CENTER);
      p5.rect(0, cheight / 2, 0.002 * cwidth, cheight);
      p5.noFill();
      p5.stroke(255);
      p5.ellipse(
        0,
        cheight / 2,
        ballRadiusRatio * cwidth * 40,
        ballRadiusRatio * cwidth * 40
      );
      p5.pop();

      p5.push();
      p5.translate(pos.x * cwidth, pos.y * cheight);
      p5.rotate(angle);
      p5.fill(255);
      p5.rectMode(p5.CENTER);
      p5.noStroke();
      p5.ellipse(0, 0, ballRadiusRatio * cwidth, ballRadiusRatio * cwidth);
      p5.pop();
      pos = bar1.current.position;
      angle = bar1.current.angle;
      p5.push();
      p5.translate(pos.x * cwidth, pos.y * cheight);
      p5.fill(0);
      p5.rotate(angle);
      p5.rectMode(p5.CENTER);
      p5.noStroke();
      p5.rect(0, 0, barWidthRatio * cwidth, barHeightRatio * cheight);
      p5.pop();
      pos = bar2.current.position;
      angle = bar2.current.angle;
      p5.push();
      p5.translate(pos.x * cwidth, pos.y * cheight);
      p5.rotate(angle);
      p5.rectMode(p5.CENTER);
      p5.noStroke();
      p5.rect(0, 0, barWidthRatio * cwidth, barHeightRatio * cheight);
      p5.pop();
      p5.textSize(32);
      p5.text(score1, cwidth / 2 - 50, 10, 70, 80);
      p5.text(score2, cwidth / 2 + 50, 10, 70, 80);
    };
  };

  return (
    <MainLayout>
      <div className="flex  justify-center items-center w-screen h-full">
        <Example open={visible} gameData={gameData} />
        <ReactP5Wrapper sketch={sketch} />
      </div>
    </MainLayout>
  );
}

import { CustomSocket } from '@/auth/auth.adapter';
import { Game_mode } from '@prisma/client';
import {
  Body,
  Engine,
  Runner,
  Bodies,
  Composite,
  Events,
  IEventCollision,
} from 'matter-js';
import { Subject } from 'rxjs';
import { Server } from 'socket.io';
// import { GameService } from './game.service';

export interface GameEnded{
  game_id: string;
  game_type: Game_mode;
  games: {winner: string, loser: string, winner_score: number, loser_score: number}[];
  winner?: string;
  loser?: string;
  winner_score?: number;
  loser_score?: number;
}

export class GameObject {
  public gameEvents = new Subject<{ event: string; payload: any }>();
  public engine: Engine;
  public ball: Body;
  public bars: Body[] = [];
  public mov: number[] = [];
  public score: [number, number][] = [];
  public game_score: number[] = [];
  public walls: { [x: string]: Body } = {};
  public runner: Runner;
  public gameStarted: boolean;
  public games_played :number;
  public data : GameEnded;
  public number_of_games : number;
  public speed : number;
  constructor(
    private readonly server: Server,
    private readonly room: string,
    private readonly mode: Game_mode,
    private readonly player1: string,
    private readonly player2: string,
  ) {
	if (mode == Game_mode.ONE)
		this.number_of_games = 1;
	else
	{
		this.number_of_games = 3;
	}
    this.engine = Engine.create({ gravity: { x: 0, y: 0 } });
    this.walls['top'] = Bodies.rectangle(640, -250, 1800, 500, {
      isStatic: true,
    });
    this.walls['bottom'] = Bodies.rectangle(640, 970, 1800, 500, {
      isStatic: true,
    });
    this.walls['left'] = Bodies.rectangle(-250, 360, 500, 1500, {
      isStatic: true,
    });
    this.walls['right'] = Bodies.rectangle(1530, 360, 500, 1500, {
      isStatic: true,
    });
    this.ball = Bodies.circle(640, 360, 10, {
      inertia: Infinity,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 1,
    });

    
    this.bars.push(
      Bodies.rectangle(50, 300, 10, 100, {
        inertia: Infinity,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 1,
      }),
    );
    this.bars.push(
      Bodies.rectangle(1230, 300, 10, 100, {
        inertia: Infinity,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 1,
      }),
    );
    Composite.add(this.engine.world, [
      this.bars[0],
      this.bars[1],
      this.ball,
      this.walls['top'],
      this.walls['bottom'],
      this.walls['left'],
      this.walls['right'],
    ]);
    
    this.mov.push(0);
    this.mov.push(0);
    this.score.push([0, 0]);
    this.runner = Runner.create({ isFixed: true, delta: 16.6666666667 });
    Events.on(this.engine, 'afterUpdate', this.after_update.bind(this));
    Events.on(this.engine, 'beforeUpdate', this.before_update.bind(this));
    Events.on(this.engine, 'collisionStart', this.col_start.bind(this));
    Events.on(this.engine, 'collisionEnd', this.col_end.bind(this));
    this.gameStarted = false;
    this.games_played = 0;
    this.game_score = [0, 0];
    this.data = {
      game_id: this.room,
      game_type: mode,
      games: [],
    }
    // this.runner.
    this.speed = 10;
  }
  run() :Promise<GameEnded>
  {
    return new Promise((resolve) => {
      this.reset();
      Runner.run(this.runner, this.engine);
      this.gameStarted = true;
      this.gameEvents.subscribe({
        next: (v) => v.event === 'GAME_FINISHED' && resolve(v.payload),
      });
    });
  }
  reset() {
    Body.setVelocity(this.ball, { x: 4, y: 6 });
    Body.setPosition(this.ball, { x: 640, y: 360 });
  }
  private col_start(event: IEventCollision<Engine>) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; ++i) {
      const pair = pairs[i];
      if (pair.bodyA === this.ball || pair.bodyB === this.ball) {
        if (
          pair.bodyA === this.walls['top'] ||
          pair.bodyB === this.walls['top']
        ) {
          Body.setVelocity(this.ball, {
            x: this.ball.velocity.x,
            y: -this.ball.velocity.y,
          });
        } else if (
          pair.bodyA === this.walls['bottom'] ||
          pair.bodyB === this.walls['bottom']
        ) {
          Body.setVelocity(this.ball, {
            x: this.ball.velocity.x,
            y: -this.ball.velocity.y,
          });
        } else if (
          pair.bodyA === this.walls['left'] ||
          pair.bodyB === this.walls['left']
        ) {
          // Body.setVelocity(this.ball, { x: -this.ball.velocity.x, y: this.ball.velocity.y });
          this.reset();
          ++this.score[this.games_played][1];
          this.speed = 10;
        } else if (
          pair.bodyA === this.walls['right'] ||
          pair.bodyB === this.walls['right']
        ) {
          this.reset();
          ++this.score[this.games_played][0];
          this.speed = 10;
          // Body.setVelocity(this.ball, { x: -this.ball.velocity.x, y: this.ball.velocity.y });
        } else {
          if (pair.bodyA == this.ball) {
            Body.setStatic(pair.bodyB, true);
          } else {
            Body.setStatic(pair.bodyA, true);
          }
          Body.setVelocity(this.ball, {
            x: -this.ball.velocity.x,
            y: this.ball.velocity.y,
          });
        }
      }
    }
    if (this.score[this.games_played][0] == 5 || this.score[this.games_played][1] == 5) {
      
      if (this.score[this.games_played][0] == 5)
      {
        ++this.game_score[0];
        this.data.games.push({
          winner: this.player1,
          loser: this.player2,
          winner_score: this.score[this.games_played][0],
          loser_score: this.score[this.games_played][1],
        });
      }
      else
      {
        ++this.game_score[1];
        this.data.games.push({
          winner: this.player2,
          loser: this.player1,
          winner_score: this.score[this.games_played][1],
          loser_score: this.score[this.games_played][0],
        });
      }
      ++this.games_played;
      if (this.number_of_games == this.games_played || this.game_score[0] == Math.ceil(this.number_of_games / 2) || this.game_score[1] == Math.ceil(this.number_of_games / 2)) {
        Runner.stop(this.runner);
        this.gameStarted = false;
        this.data.winner = this.game_score[0] > this.game_score[1] ? this.player1 : this.player2;
        this.data.loser = this.game_score[0] > this.game_score[1] ? this.player2 : this.player1;
        this.data.winner_score = this.game_score[0] > this.game_score[1] ? this.game_score[0] : this.game_score[1];
        this.data.loser_score = this.game_score[0] > this.game_score[1] ? this.game_score[1] : this.game_score[0];

        this.gameEvents.next({
          event: 'GAME_FINISHED',
          payload: this.data,
        });
      }
      else{
        this.score.push([0, 0]);
      }
    }
  }
  private twin_projector(height: number) {
    const a =
      (height * Math.sin((25 * Math.PI) / 180)) /
      (2 * Math.sin((40 * Math.PI) / 180));
    const x = a * Math.sin((65 * Math.PI) / 180);
    const y = a * Math.sin((25 * Math.PI) / 180);
    return [x, y];
  }
  private calculate_new_pos(ball: Body, bar: Body) {
    let a = this.twin_projector(100);

    const pos_ball = ball.position;
    const pos_bar = bar.position;
    const y = pos_ball.y - pos_bar.y;
    const x = pos_ball.x - pos_bar.x;
    if ((x < 0 && pos_bar.x == 50) || (x > 0 && pos_bar.x == 1230))
      return [ball.velocity.x, ball.velocity.y];
    if (y > 0) a[1] *= -1;
    if (pos_bar.x == 50) a[0] *= -1;
    const vtx = pos_ball.x - a[0] - pos_bar.x;
    const vty = pos_ball.y - a[1] - pos_bar.y;

    const teta = Math.atan2(vty, vtx);
    const vx = this.speed * Math.cos(teta);
    const vy = this.speed * Math.sin(teta);
    return [vx, vy];
  }
  private col_end(event: IEventCollision<Engine>) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; ++i) {
      const pair = pairs[i];
      if (pair.bodyA === this.ball || pair.bodyB === this.ball) {
        if (
          pair.bodyA === this.walls['top'] ||
          pair.bodyB === this.walls['top']
        ) {
        } else if (
          pair.bodyA === this.walls['bottom'] ||
          pair.bodyB === this.walls['bottom']
        ) {
        } else if (
          pair.bodyA === this.walls['left'] ||
          pair.bodyB === this.walls['left']
        ) {
        } else if (
          pair.bodyA === this.walls['right'] ||
          pair.bodyB === this.walls['right']
        ) {
        } else {
          if (pair.bodyA == this.ball) {
            Body.setStatic(pair.bodyB, false);
            const v = this.calculate_new_pos(this.ball, pair.bodyB);
            Body.setVelocity(this.ball, { x: v[0], y: v[1] });
          } else {
            Body.setStatic(pair.bodyA, false);
            const v = this.calculate_new_pos(this.ball, pair.bodyA);
            Body.setVelocity(this.ball, { x: v[0], y: v[1] });
          }
          this.speed *= 1.05;
        }
      }
    }
  }

  private before_update() {
    for (let i = 0; i < this.bars.length; ++i) {
      Body.setVelocity(this.bars[i], { x: 0, y: 20 * this.mov[i] });
      const pos = this.bars[i].position;
      const vel = this.bars[i].velocity;
      if (pos.y + vel.y < 50) {
        Body.setVelocity(this.bars[i], { x: vel.x, y: 0 });
        Body.setPosition(this.bars[i], { x: pos.x, y: 50 });
      } else if (pos.y + vel.y > 670) {
        Body.setVelocity(this.bars[i], { x: vel.x, y: 0 });
        Body.setPosition(this.bars[i], { x: pos.x, y: 670 });
      } else if (this.bars[i].isStatic) {
        Body.setPosition(this.bars[i], { x: pos.x, y: pos.y + vel.y });
      }
    }
  }

  private after_update() {
    if (this.gameStarted) {
      const corr: [number, number][] = [];
      for (let i = 0; i < this.bars.length; ++i) {
        corr.push([this.bars[i].position.x / 1280, this.bars[i].position.y / 720]);
      }
      corr.push([this.ball.position.x /1280, this.ball.position.y / 720]);
      corr.push([this.score[this.games_played][0], this.score[this.games_played][1]]);
      this.server.to(this.room).volatile.emit('correction', corr[0], corr[1], corr[2], corr[3]);
    }
  }
  public forceEnd(login : string){
      if (this.gameStarted)
      {
        Runner.stop(this.runner);
        this.gameStarted = false;
      }
      if (login == this.player1){
        const games: {winner: string, loser: string, winner_score: number, loser_score: number}[] = [];
        for (let i = 0; i < Math.ceil(this.number_of_games / 2); ++i)
        {
          games.push({winner: this.player2, loser: this.player1, winner_score: 5, loser_score: 0});
        }
        const new_data : GameEnded = {
          game_id: this.room,
          game_type: this.mode,
          games: games,
          winner: this.player2,
          loser: this.player1,
          winner_score: Math.ceil(this.number_of_games / 2),
          loser_score: 0,
        }
        this.gameEvents.next({
          event: 'GAME_FINISHED',
          payload: new_data,
        });
      }
      else if (login == this.player2){
        const games: {winner: string, loser: string, winner_score: number, loser_score: number}[] = [];
        for (let i = 0; i < Math.ceil(this.number_of_games / 2); ++i)
        {
          games.push({winner: this.player1, loser: this.player2, winner_score: 5, loser_score: 0});
        }
        const new_data : GameEnded = {
          game_id: this.room,
          game_type: this.mode,
          games: games,
          winner: this.player1,
          loser: this.player2,
          winner_score: Math.ceil(this.number_of_games / 2),
          loser_score: 0,
        }
        this.gameEvents.next({
          event: 'GAME_FINISHED',
          payload: new_data,
        });
      }
  }
}



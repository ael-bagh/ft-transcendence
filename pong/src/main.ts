import {Socket, io} from 'socket.io-client'
import {Game} from './canvas'
import Matter from 'matter-js'
import P5 from 'p5'
class Client{
	public socket : Socket;
	public game : Game;
	constructor() {
		// this.socket = io('http://10.12.12.2:4000');
		this.socket = io('http://localhost:4000');
		this.game = new Game();
		this.socket.on('connect', function () {
			console.log('connect')
		})
		document.addEventListener('keydown', (event) => {
			if (game.game_start == true)
			{
				if (event.key === 'ArrowUp'){
					this.game.mov = -1;
					this.game.key['ArrowUp'] = 1;
				}
				else if (event.key === 'ArrowDown'){
					this.game.mov = 1;
					this.game.key['ArrowDown'] = 1;
				}
				else
					return;
				this.socket.emit('mov', this.game.mov);
			}
		})
		document.addEventListener('keyup', (event) => {
			if (game.game_start == true)
			{
				if (event.key === 'ArrowUp'){
					this.game.key['ArrowUp'] = 0;
					if (this.game.key['ArrowDown'] === 1)
						this.game.mov = 1;
					else
						this.game.mov = 0;
				}
				else if (event.key === 'ArrowDown'){
					this.game.key['ArrowDown'] = 0;
					if (this.game.key['ArrowUp'] === 1)
						this.game.mov = -1;
					else
						this.game.mov = 0;
				}
				else
					return;
				this.socket.emit('mov', this.game.mov);
			}
		})
		this.socket.on('correction', (bar_1: [number, number], bar_2: [number, number], ball: [number, number]) => {
			if (game.game_start == true)
			{
				Matter.Body.setPosition(this.game.bar[0], {x: bar_1[0], y: bar_1[1]});
				Matter.Body.setPosition(this.game.bar[1], {x: bar_2[0], y: bar_2[1]});
				Matter.Body.setPosition(this.game.ball, {x: ball[0], y: ball[1]});
			}
		})

		this.socket.on('start', (bar_1: [number, number], bar_2: [number, number], ball: [number, number], t:number) => {
			console.log('start ')
			Matter.Body.setPosition(this.game.bar[0], {x: bar_1[0], y: bar_1[1]});
			Matter.Body.setPosition(this.game.bar[1], {x: bar_2[0], y: bar_2[1]});
			Matter.Body.setPosition(this.game.ball, {x: ball[0], y: ball[1]});
			const run = function (){
				game.game_start = true;
			}
			setTimeout(run, t - new Date().getTime());
		})
		this.socket.on('projector', (a : [number, number]) => {
			proj[0] = a[0];
			proj[1] = a[1];
			console.log(proj)
		})
	}
}
const client = new Client();
const game = client.game;
let proj : [number, number] = [68.30127018922194, 18.30127018922193];
const render_bodies = (p5: P5) => {
	let pos = game.ball.position;
	let angle = game.ball.angle;
	p5.push();
	p5.translate(pos.x, pos.y);
	p5.rotate(angle);
	p5.rectMode(p5.CENTER);
	p5.ellipse(0, 0, 10, 10);
	p5.pop();
	for (let i = 0; i < 2; i++)
	{
		pos = game.bar[i].position;
		angle = game.bar[i].angle;
		p5.push();
		p5.translate(pos.x, pos.y);
		p5.rotate(angle);
		p5.rectMode(p5.CENTER);
		p5.rect(0, 0, 10, 100);
		p5.pop();
	}
	p5.push();
	p5.translate(proj[0] + 60 , proj[1] + game.bar[1].position.y);
	p5.rectMode(p5.CENTER);
	p5.rect(0, 0, 5, 5);
	p5.pop();
};
const sketch = (p5: P5) => {
	p5.setup = () => {
		const canvas = p5.createCanvas(1280, 720);
		p5.frameRate(60);
		canvas.parent("app");
		p5.background("Black");
	};
	p5.draw = () => {
		p5.background(51);
		render_bodies(p5);
	};
};

new P5(sketch);
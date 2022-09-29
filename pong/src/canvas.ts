import Matter from 'matter-js'

export class Game{
	public engine : Matter.Engine;
	public bar : Matter.Body[] = [];
	public ball : Matter.Body;
	public key: { [x: string]: number } = {};
	public mov: number;
	public game_start : boolean;
	constructor(){
		this.engine = Matter.Engine.create({gravity: {x: 0, y: 0}});
		this.mov = 0;
		this.game_start = false;
		this.key["ArrowDown"] = 0;
		this.key["ArrowUp"] = 0;
		this.bar.push(Matter.Bodies.rectangle(50, 300, 10, 100));
		this.bar.push(Matter.Bodies.rectangle(1230, 300, 10, 100));
		this.ball = Matter.Bodies.circle(640, 360, 10);
		Matter.Composite.add(this.engine.world, [this.ball, this.bar[0], this.bar[1],
		Matter.Bodies.rectangle(640, -250, 1800, 500, { isStatic: true }),
		Matter.Bodies.rectangle(640, 970, 1800, 500, { isStatic: true }),
		Matter.Bodies.rectangle(-250, 360, 500, 1500, { isStatic: true }),
		Matter.Bodies.rectangle(1530, 360, 500, 1500, { isStatic: true })]);
	}
}

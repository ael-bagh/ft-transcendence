import Matter from 'matter-js'

export class Game{
	public engine : Matter.Engine;
	public ball : Matter.Body;
	public bars = new Map<string, [Matter.Body, number]>()
	public walls: { [x: string]: Matter.Body } = {};
	public runner : Matter.Runner;
	
	constructor(){
		console.log("Game created");
		this.engine = Matter.Engine.create( {gravity: {x: 0, y: 0}} );
		this.walls["top"] = Matter.Bodies.rectangle(640, -250, 1800, 500, { isStatic: true });
		this.walls["bottom"] = Matter.Bodies.rectangle(640, 970, 1800, 500, { isStatic: true });
		this.walls["left"] = Matter.Bodies.rectangle(-250, 360, 500, 1500, { isStatic: true });
		this.walls["right"] = Matter.Bodies.rectangle(1530, 360, 500, 1500, { isStatic: true });
		this.ball = Matter.Bodies.circle(640, 360, 10,{inertia: Infinity,
						friction: 0,
						frictionStatic: 0,
						frictionAir: 0,
						restitution: 1});
		Matter.Composite.add(this.engine.world, [this.ball, this.walls["top"], this.walls["bottom"], this.walls["left"], this.walls["right"]]);
		this.runner = Matter.Runner.create({isFixed : true, delta: 16.6666666667});
	}

	public addBar(id: string, x: number, y: number, width: number, height: number){
		this.bars.set(id, [Matter.Bodies.rectangle(x, y, width, height, {inertia: Infinity, friction: 0, frictionStatic: 0, frictionAir: 0,restitution: 1}), 0]);
		Matter.Composite.add(this.engine.world, this.bars.get(id)![0]);
	}

	public removeBar(id: string){
		console.log("Bar removed");
		Matter.Composite.remove(this.engine.world, this.bars.get(id)![0]);
		this.bars.delete(id);
	}

}

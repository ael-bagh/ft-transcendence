import path from 'path'
import express from 'express'
import Matter from 'matter-js'
import * as http from 'http'
import * as SocketIO from 'socket.io'
import crypto from 'crypto'
import {Game} from './simulation'

const port: number = 4000;
const app = express();
app.use(express.static(path.join(__dirname, '../../../pong')))
const server = new http.Server(app)
const io = new SocketIO.Server(server, {
	cors: {
		// origin: 'http://10.12.12.2:3000',
		origin: 'http://localhost:3000',
		credentials: true
	}
})
const twin_projector = function(height:number)
{
	const a = (height * Math.sin(25 * Math.PI/ 180)) / (2 * Math.sin(40 * Math.PI / 180));
	const x = a * Math.sin(65 * Math.PI / 180);
	const y = a * Math.sin(25 * Math.PI / 180);
	return [x, y]
}


const games = new Map<string, Game>();
const links  = new Map<string, string>();
const pending_rooms : string[] = [];
io.on('connection', (socket: SocketIO.Socket) => {
	const calculate_new_pos = function(ball : Matter.Body, bar: Matter.Body)
	{
		let a = twin_projector(100);

		io.to(links.get(socket.id)!).volatile.emit("projector", a);
		const pos_ball = ball.position;
		const pos_bar = bar.position;
		console.log(pos_ball);
		console.log(pos_bar);
		const y = pos_ball.y - pos_bar.y;
		const x = pos_ball.x - pos_bar.x;
		console.log('x',x);
		if (x < 0 && pos_bar.x == 50 || x > 0 && pos_bar.x == 1230)
			return [ball.velocity.x, ball.velocity.y];
		if (y > 0)
			a[1] *= -1;
		if (pos_bar.x == 50)
			a[0] *= -1;
		console.log('a',a, 'y', y);
		const vtx = pos_ball.x - a[0] - pos_bar.x;
		const vty = pos_ball.y - a[1] - pos_bar.y;

		const teta = Math.atan2(vty, vtx);
		console.log(teta * 180 / Math.PI);
		const vx = 10 * Math.cos(teta);
		const vy = 10 * Math.sin(teta);
		return [vx, vy];
	}
	const col_start = function(event : Matter.IEventCollision<Matter.Engine>) {
		console.log("collision", my_game?.ball.velocity.x, my_game?.ball.velocity.y);
		if (my_game !== undefined)
		{
			const pairs = event.pairs;
			for (let i = 0; i < pairs.length; ++i) {
				const pair = pairs[i];
				if (pair.bodyA === my_game.ball || pair.bodyB === my_game.ball) {
					if (pair.bodyA === my_game.walls["top"] || pair.bodyB === my_game.walls["top"]) {
						console.log("top");
						Matter.Body.setVelocity(my_game.ball, {x: my_game.ball.velocity.x, y: -my_game.ball.velocity.y});
					}
					else if (pair.bodyA === my_game.walls["bottom"] || pair.bodyB === my_game.walls["bottom"]) {
						console.log("bottom");
						Matter.Body.setVelocity(my_game.ball, {x: my_game.ball.velocity.x, y: -my_game.ball.velocity.y});
					}
					else if (pair.bodyA === my_game.walls["left"] || pair.bodyB === my_game.walls["left"]) {
						console.log("left");
						Matter.Body.setVelocity(my_game.ball, {x: -my_game.ball.velocity.x, y: my_game.ball.velocity.y});
					}
					else if (pair.bodyA === my_game.walls["right"] || pair.bodyB === my_game.walls["right"]) {
						console.log("right");
						Matter.Body.setVelocity(my_game.ball, {x: -my_game.ball.velocity.x, y: my_game.ball.velocity.y});
					}
					else
					{
						console.log("bar");
						if (pair.bodyA == my_game.ball)
						{
							Matter.Body.setStatic(pair.bodyB, true);
						}
						else
						{
							Matter.Body.setStatic(pair.bodyA, true);
						}
						Matter.Body.setVelocity(my_game.ball, {x: -my_game.ball.velocity.x, y: my_game.ball.velocity.y});
					}
				}

			}
		}
	}
	const col_end = function(event : Matter.IEventCollision<Matter.Engine>) {
		console.log("collision");
		if (my_game !== undefined)
		{
			const pairs = event.pairs;
			for (let i = 0; i < pairs.length; ++i) {
				const pair = pairs[i];
				if (pair.bodyA === my_game.ball || pair.bodyB === my_game.ball) {
					if (pair.bodyA === my_game.walls["top"] || pair.bodyB === my_game.walls["top"]) {
						console.log("top");
						
					}
					else if (pair.bodyA === my_game.walls["bottom"] || pair.bodyB === my_game.walls["bottom"]) {
						console.log("bottom");
					}
					else if (pair.bodyA === my_game.walls["left"] || pair.bodyB === my_game.walls["left"]) {
						console.log("left");
					}
					else if (pair.bodyA === my_game.walls["right"] || pair.bodyB === my_game.walls["right"]) {
						console.log("right");
					}
					else
					{
						console.log("bar");
						if (pair.bodyA == my_game.ball)
						{
							Matter.Body.setStatic(pair.bodyB, false);
							const v = calculate_new_pos(my_game.ball, pair.bodyB);
							Matter.Body.setVelocity(my_game.ball, {x: v[0], y: v[1]});
							console.log(v);
						}
						else
						{
							Matter.Body.setStatic(pair.bodyA, false);
							const v = calculate_new_pos(my_game.ball, pair.bodyA);
							Matter.Body.setVelocity(my_game.ball, {x: v[0], y: v[1]});
							console.log(v);
						}
					}
				}

			}
		}
	}
	const before_update = function() {
		
		if (my_game !== undefined)
		{
			for (let bar of my_game.bars.values())
			{
				Matter.Body.setVelocity(bar[0], {x: 0, y: 20 * bar[1]});
				const pos = bar[0].position;
				const vel = bar[0].velocity;
				if (pos.y + vel.y < 50)
				{
					Matter.Body.setVelocity(bar[0], {x: vel.x, y: 0});
					Matter.Body.setPosition(bar[0], {x: pos.x, y: 50});
				}
				else if (pos.y + vel.y > 670)
				{
					Matter.Body.setVelocity(bar[0], {x: vel.x, y: 0});
					Matter.Body.setPosition(bar[0], {x: pos.x, y: 670});
				}
				else if (bar[0].isStatic)
				{
					Matter.Body.setPosition(bar[0], {x: pos.x, y: pos.y + vel.y});
				}
			}
		}
	}
	const after_update = function() {
		const corr : [number, number][] = [];
		if (my_game !== undefined)
		{
			for (let bar of my_game.bars.values())
			{
				corr.push([bar[0].position.x, bar[0].position.y]);
			}
			corr.push([my_game.ball.position.x, my_game.ball.position.y]);
			io.to(links.get(socket.id)!).volatile.emit("correction", corr[0], corr[1], corr[2]);
		}
	}
	console.log('------------------------------------------------------------------------> a user connected : ' + socket.id)
	if (!links.has(socket.id))
	{
		let room = pending_rooms.pop();
		if (room !== undefined)
		{
			console.log("room found " + room);
			socket.join(room);
			if (games.has(room))
			{
				const game = games.get(room);
				if (game !== undefined)
				{
					for (const bar of game.bars.values())
					{
						if (bar[0].position.x === 50)
						{
							game.addBar(socket.id, 1230, 300, 10, 100);
						}
						else
						{
							game.addBar(socket.id, 50, 300, 10, 100);
						}
						break;
					}
				}
			}
			else
			{
				games.set(room, new Game());
				games.get(room)!.addBar(socket.id, 50, 300, 10, 100);
				pending_rooms.push(room);
			}
		}
		else
		{
			room = crypto.randomBytes(8).toString('hex');
			socket.join(room);
			console.log("creat new room : " + room);
			pending_rooms.push(room);
			games.set(room, new Game());
			games.get(room)!.addBar(socket.id, 50, 300, 10, 100);
		}
		links.set(socket.id, room);
	}
	const my_game = games.get(links.get(socket.id)!);
	const my_bar = my_game!.bars.get(socket.id);
	if (my_game !== undefined && my_bar !== undefined)
	{
		if (my_game.bars.size === 2)
		{
			Matter.Events.on(my_game.engine, 'afterUpdate', after_update);
			Matter.Events.on(my_game.engine, 'beforeUpdate', before_update);
			Matter.Events.on(my_game.engine, 'collisionStart', col_start);
			Matter.Events.on(my_game.engine, 'collisionEnd', col_end)
			Matter.Body.setVelocity(my_game.ball, {x: 4, y: 6});
			const current_date = new Date().getTime() + 1000;
			io.to(links.get(socket.id)!).emit('start',[50, 300],[1230, 300],[640, 360],current_date);
			const run = function () {
				const game_start = new Date().getTime();
				Matter.Runner.run(my_game.runner, my_game.engine)
				console.log('game_start', game_start);
			}
			setTimeout(run, current_date - new Date().getTime());
		}
		socket.on('mov', (mov: number) => {
			console.log('mov', mov);
			if (mov > 0)
				my_bar[1] = 1;
			else if (mov < 0)
				my_bar[1] = -1;
			else
				my_bar[1] = 0;
		})
		socket.on('disconnect', () => {
			console.log('<------------------------------------------------------------------------ socket disconnected : ' + socket.id)
			my_game.removeBar(socket.id);
			Matter.Events.off(my_game.engine, 'afterUpdate', after_update);
			Matter.Events.off(my_game.engine, 'beforeUpdate', before_update);
			Matter.Events.off(my_game.engine, 'collisionStart', col_start);
			Matter.Events.off(my_game.engine, 'collisionEnd', col_end)
			if (my_game.bars.size === 0)
			{	
				console.log('game deleted');
				games.delete(links.get(socket.id)!);
				links.delete(socket.id);
			}
			else
			{
				const channelId = links.get(socket.id)!;
				pending_rooms.push(links.get(socket.id)!);
				links.delete(socket.id);
				socket.to(channelId).disconnectSockets();
			}
		})
	}
})

server.listen(port)

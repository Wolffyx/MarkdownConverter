import express from "express";
import http from "http";
import bodyParser from "body-parser";
import Routes from "./routes/routes";
import { Bind } from 'lodash-decorators'
import debug from 'debug'
import { engine } from 'express-handlebars';
import path from "path";
export default class ExpressServer {
	private app: express.Application;
	readonly port: number;
	server: http.Server;

	constructor(port: number = 80) {
		this.port = port;
	}

	public init(): void {
		this.createApp();

		this.server = http.createServer(this.app);

		this.server.on('error', this.onError);
		this.server.on('listening', this.onListening);
	}

	private createApp(): void {
		this.app = express();
		this.view();
		this.middleware();
		this.routes();
	}
	private view(){
		this.app.engine('handlebars', engine());
		this.app.set('view engine', 'handlebars');
		this.app.set('views', path.join(__dirname, "./views"));
	}
	private middleware() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({extended: false}))
	}

	private routes() {
		this.app.use('/', Routes);
	}

	public getApp(): express.Application {
		return this.app;
	}
	onError(error: NodeJS.ErrnoException) {
		if (error.syscall !== 'listen') throw error;
		let bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;
		switch (error.code) {
			case 'EACCES':
				console.error(`${bind} requires elevated privileges`);
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(`${bind} is already in use`);
				process.exit(1);
				break;
			default:
				throw error
		}
	}

	@Bind()
	onListening() {
		console.log(`Listening on port ${this.port}!`);
		debug(`Listening on ${this.port}`)
	}

}

import {NextFunction, Request, Response, Router} from 'express'
import * as fs from "fs";
import * as path from "path";
import {Converter} from "showdown";
import * as util from "util";
import {Pages} from "../cache";
import {watch} from "chokidar";


/*
 * private router -> only for logged user
 */
export class Routes {
	router: Router;

	/**
	 * Initialize the UserRouter
	 */
	constructor() {
		this.router = Router();
	}

	init() {
		watch(path.join(__dirname, "../books")).on("all", (event, filePath) => {
			console.log(event, filePath);
			if (event === "change") console.log("reload");
			if (event === "add") {
				const name = path.basename(filePath)
				// console.log(name.replace(/.md$/gm,""))

				const page = {
					name: name.replace(/.md$/gm, "").match(/[\w\s\d.-]+/)?.[0].replaceAll(' ', '-').toLowerCase() ?? "",
					originalName: name,
				}
				Pages[page.name] = page
			}
			if (event === "unlink") {
				const name = path.basename(filePath)
				const page = Object.values(Pages).find(page => page.originalName === name)
				delete Pages[page.name]
			}
		});


		this.router.get('/', this.browse);
		this.router.get('/book/:name', this.read);
	}

	/**
	 * GET list of books.
	 */
	private browse(req: Request, res: Response, next: NextFunction) {
		res.render('home', {
			title: 'Books',
			books: Object.values(Pages),
			layout: false
		});
	}

	private async read(req: Request, res: Response, next: NextFunction) {
		const page = Pages[req.params.name]
		if (!page) {
			res.status(404).send({error: "Page not found"})
			return
		}
		let file = await util.promisify(fs.readFile)(path.join(__dirname, "../books", page.originalName))
		let converter = new Converter({
			metadata: true
		})
		res.send(converter.makeHtml(file.toString()))
	}
}

const routes = new Routes();
routes.init();

export default (routes.router)

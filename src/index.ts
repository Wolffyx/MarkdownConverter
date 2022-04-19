import debug from 'debug'
import ExpressServer from "./expressServer";

debug('ts-express:server');

const expressServer = new ExpressServer(8080);
expressServer.init();

expressServer.server.listen(expressServer.port);

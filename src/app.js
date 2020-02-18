import 'dotenv/config';

import express from 'express'; // express é o frame principal
import path from 'path'; // path pra poder acessar arquivos
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors'; // lib pro sentry poder funcionar
import io from 'socket.io';
import http from 'http';
import routes from './routes'; // importa as rotas
import sentryConfig from './config/sentry'; // config do sentry

import './database';

class App {
  constructor() {
    this.app = express(); // instancia o app
    this.server = http.Server(this.app);

    Sentry.init(sentryConfig);

    this.socket();

    this.middlewares(); // inicia os middlewares
    this.routes(); // inicia as rotas
    this.exceptionHandler();

    this.connectedUsers = {};

    /*
    this.connectedUsers = {
      user: 'Higo',
    };

    console.log(this.connectedUsers.user);
    console.log(this.connectedUsers['user']);

    */
  }

  socket() {
    this.io = io(this.server);

    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;
      this.connectedUsers[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUsers[user_id];
      });
    });
  }

  middlewares() {
    this.app.use(Sentry.Handlers.requestHandler()); // sentry.io pra gerenciar exceptions e erros
    this.app.use(cors()); // gerencia quem pode acessar a aplicação pela url
    this.app.use(express.json()); // permite o express entender requests em json
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    ); // config do multer

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;

      next();
    });
  }

  routes() {
    this.app.use(routes); // podemos usar as rotas
    this.app.use(Sentry.Handlers.errorHandler()); // sentry manipula as rotas
  }

  exceptionHandler() {
    this.app.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error.' });
    });
  }
}

export default new App().app;

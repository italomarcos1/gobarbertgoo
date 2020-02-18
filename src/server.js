import app from './app'; // puxa o modulo app

app.listen(3333); // instancia o server

/* importa apenas o server (mesmo estando definido em outro canto), pq isso
é vital na parte de testes unitarios, onde testaremos apenas a classe. por
isso usamos o server aqui, mas implementamos em outro arquivo. */

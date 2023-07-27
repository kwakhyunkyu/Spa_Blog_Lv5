import db from './db/db';
import usersRouter from './routes/users.route';
import postsRouter from './routes/posts.route';
import commentsRouter from './routes/comments.route';
import likesRouter from './routes/likes.route';

export default function init(app) {
  db.connect(); // Assuming db.js exports a connect function to establish a database connection

  app.use('/', [usersRouter, postsRouter, commentsRouter, likesRouter]);
}

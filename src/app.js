import express from 'express';
import cookieParser from 'cookie-parser';
import init from './init';
import usersRouter from './routes/users.route';
import postsRouter from './routes/posts.route';
import commentsRouter from './routes/comments.route';
import likesRouter from './routes/likes.route';

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());

init(app);

app.use('/', [usersRouter, postsRouter, commentsRouter, likesRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});

import express from 'express';
import { Op } from 'sequelize';
import { Posts, Likes } from '../models';
import authMiddleware from '../middlewares/auth-middleware';

const router = express.Router();

class PostsController {
  static async createPost(req, res) {
    if (!res.locals.user) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    const { userId, nickname } = res.locals.user;
    const { title, content } = req.body;

    const post = await Posts.create({
      UserId: userId,
      Nickname: nickname,
      title,
      content,
    });

    return res.status(201).json({ data: post });
  }

  static async getAllPosts(req, res) {
    const posts = await Posts.findAll({
      attributes: [
        'postId',
        'UserId',
        'Nickname',
        'title',
        'createdAt',
        'updatedAt',
        [Posts.sequelize.literal('(SELECT COUNT(*) FROM Likes WHERE Likes.PostId = Posts.postId)'), 'likeCount'],
      ],
      order: [
        [Posts.sequelize.literal('likeCount'), 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return res.status(200).json({ data: posts });
  }

  static async getPostById(req, res) {
    const { postId } = req.params;
    const post = await Posts.findOne({
      attributes: [
        'postId',
        'UserId',
        'Nickname',
        'title',
        'content',
        'createdAt',
        'updatedAt',
        [Posts.sequelize.literal('(SELECT COUNT(*) FROM Likes WHERE Likes.PostId = Posts.postId)'), 'likeCount'],
      ],
      where: { postId },
    });

    return res.status(200).json({ data: post });
  }

  static async editPost(req, res) {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    } else if (post.UserId !== userId) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    // 게시글의 권한을 확인하고, 게시글을 수정합니다.
    await Posts.update(
      { title, content }, // title과 content 컬럼을 수정합니다.
      {
        where: {
          [Op.and]: [{ postId: postId }, { UserId: userId }],
        },
      }
    );

    return res.status(200).json({ data: '게시글이 수정되었습니다.' });
  }

  static async deletePost(req, res) {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    } else if (post.UserId !== userId) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    // 게시글의 권한을 확인하고, 게시글을 삭제합니다.
    await Posts.destroy({
      where: {
        [Op.and]: [{ postId: postId }, { UserId: userId }],
      },
    });

    return res.status(200).json({ data: '게시글이 삭제되었습니다.' });
  }
}

router.post('/posts', authMiddleware, PostsController.createPost);
router.get('/posts', PostsController.getAllPosts);
router.get('/posts/:postId', PostsController.getPostById);
router.put('/posts/:postId', authMiddleware, PostsController.editPost);
router.delete('/posts/:postId', authMiddleware, PostsController.deletePost);

export default router;

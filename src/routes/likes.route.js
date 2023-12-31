import express from 'express';
import { Likes } from '../models';
import authMiddleware from '../middlewares/auth-middleware';

const router = express.Router();

class LikesController {
  static async toggleLike(req, res) {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    try {
      const existingLike = await Likes.findOne({
        where: {
          PostId: postId,
          UserId: userId,
        },
      });

      if (existingLike) {
        // 이미 좋아요를 누른 경우 좋아요 취소
        await Likes.destroy({
          where: {
            PostId: postId,
            UserId: userId,
          },
        });

        return res.status(200).json({ message: '게시글의 좋아요를 취소했습니다.' });
      }

      // 좋아요 생성
      await Likes.create({
        PostId: postId,
        UserId: userId,
      });

      return res.status(201).json({ message: '게시글에 좋아요를 눌렀습니다.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 오류입니다.' });
    }
  }
}

router.post('/:postId/likes', authMiddleware, LikesController.toggleLike);

export default router;

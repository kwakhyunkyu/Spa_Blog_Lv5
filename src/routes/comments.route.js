import express from 'express';
import { Posts, Comments } from '../models';
import authMiddleware from '../middlewares/auth-middleware';

const router = express.Router();

class CommentsController {
  static async createComment(req, res) {
    if (!res.locals.user) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    const { userId, nickname } = res.locals.user;
    const { postId } = req.params;
    const { comment } = req.body;

    try {
      // 게시글이 존재하는지 확인
      const post = await Posts.findOne({ where: { postId } });
      if (!post) {
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
      }

      // 댓글 생성
      const createdComment = await Comments.create({
        UserId: userId,
        PostId: postId,
        Nickname: nickname,
        comment,
      });

      return res.status(201).json({ data: createdComment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 오류입니다.' });
    }
  }

  static async getCommentsByPostId(req, res) {
    const { postId } = req.params;

    try {
      // 게시글이 존재하는지 확인
      const post = await Posts.findOne({ where: { postId } });
      if (!post) {
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
      }

      // 댓글 목록 조회
      const comments = await Comments.findAll({
        where: { PostId: postId },
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({ data: comments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 오류입니다.' });
    }
  }

  static async editComment(req, res) {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
      const editComment = await Comments.findOne({
        where: {
          commentId,
          PostId: postId,
          UserId: userId,
        },
      });

      if (!editComment) {
        return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
      }

      editComment.comment = comment;
      await editComment.save();

      return res.status(200).json({ data: editComment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 오류입니다.' });
    }
  }

  static async deleteComment(req, res) {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;

    try {
      const deleteComment = await Comments.findOne({
        where: {
          commentId,
          PostId: postId,
          UserId: userId,
        },
      });

      if (!deleteComment) {
        return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
      }

      await deleteComment.destroy();

      return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '서버 오류입니다.' });
    }
  }
}

router.post('/comments/:postId', authMiddleware, CommentsController.createComment);
router.get('/comments/:postId', CommentsController.getCommentsByPostId);
router.put('/comments/:postId/:commentId', authMiddleware, CommentsController.editComment);
router.delete('/comments/:postId/:commentId', authMiddleware, CommentsController.deleteComment);

export default router;

const express = require('express');
const { Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 댓글 생성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
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
});

// 댓글 목록 조회
router.get('/posts/:postId/comments', async (req, res) => {
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
});

// 댓글 수정 API
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
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
});

// 댓글 삭제 API
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
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
});

module.exports = router;

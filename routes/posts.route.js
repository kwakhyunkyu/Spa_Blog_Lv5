const express = require('express');
const { Op } = require('sequelize');
const { Posts, Comments, Likes } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 게시글 생성 API
router.post('/posts', authMiddleware, async (req, res) => {
  // 게시글을 생성하는 사용자의 정보를 가지고 올 것.
  const { userId, nickname } = res.locals.user;
  const { title, content } = req.body;

  const post = await Posts.create({
    UserId: userId,
    Nickname: nickname,
    title,
    content,
  });

  return res.status(201).json({ data: post });
});

// 게시글 목록 조회
router.get('/posts', async (req, res) => {
  const posts = await Posts.findAll({
    attributes: ['postId', 'UserId', 'Nickname', 'title', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({ data: posts });
});

// 게시글 상세 조회
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const post = await Posts.findOne({
    attributes: ['postId', 'UserId', 'Nickname', 'title', 'content', 'createdAt', 'updatedAt'],
    where: { postId },
  });

  return res.status(200).json({ data: post });
});

// 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 게시글을 조회합니다.
  const post = await Posts.findOne({ where: { postId } });

  if (!post) {
    return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
  } else if (post.UserId !== userId) {
    return res.status(401).json({ message: '권한이 없습니다.' });
  }

  // 게시글의 권한을 확인하고, 게시글을 수정합니다.
  await Posts.update(
    { title, content }, // title과 content 컬럼을 수정합니다.
    {
      where: {
        [Op.and]: [{ postId }, { UserId: userId }],
      },
    }
  );

  return res.status(200).json({ data: '게시글이 수정되었습니다.' });
});

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  // 게시글을 조회합니다.
  const post = await Posts.findOne({ where: { postId } });

  if (!post) {
    return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
  } else if (post.UserId !== userId) {
    return res.status(401).json({ message: '권한이 없습니다.' });
  }

  // 게시글의 권한을 확인하고, 게시글을 삭제합니다.
  await Posts.destroy({
    where: {
      [Op.and]: [{ postId }, { UserId: userId }],
    },
  });

  return res.status(200).json({ data: '게시글이 삭제되었습니다.' });
});

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

// 좋아요 생성 또는 취소 API
router.post('/posts/:postId/likes', authMiddleware, async (req, res) => {
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
});

module.exports = router;

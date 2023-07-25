const jwt = require('jsonwebtoken');
const { Users } = require('../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;
  if (!authorization) {
    return res.status(403).json({
      message: '로그인이 필요합니다.',
    });
  }

  const [tokenType, token] = authorization.split(' ');
  if (tokenType !== 'Bearer' || !token) {
    return res.status(401).json({
      message: '토큰 타입이 존재하지 않거나 토큰이 일치하지 않습니다.',
    });
  }

  try {
    const decodedToken = jwt.verify(token, 'customize_secret_key');
    const userId = decodedToken.userId;

    const user = await Users.findOne({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({
        message: '토큰에 해당하는 사용자가 존재하지 않습니다.',
      });
    }

    res.locals.user = {
      userId: user.userId,
      nickname: user.nickname,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: '비정상적인 접근입니다.',
    });
  }
};

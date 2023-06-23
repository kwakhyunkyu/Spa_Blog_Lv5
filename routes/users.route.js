const express = require("express");
const jwt = require("jsonwebtoken");
const { Users, Tokens } = require("../models");
const router = express.Router();

// 회원가입 API
router.post("/users", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;
  const isExistUser = await Users.findOne({
    where: {
      nickname: nickname,
    },
  });

  if (!nickname || !password || !confirmPassword) {
    res.status(400).json({
      errorMessage: "공백이 없도록 입력하세요.",
    });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return;
  }

  // nickname 동일한 유저가 실제로 존재할 때, 에러발생
  if (isExistUser) {
    res.status(409).json({
      message: "중복된 닉네임입니다.",
    });
    return;
  }

  await Users.create({ nickname, password });

  return res.status(201).json({
    message: "회원가입이 완료되었습니다.",
  });
});

// 로그인 API
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  const user = await Users.findOne({
    where: { nickname },
  });

  // 1. 해당하는 사용자가 존재하는가?
  // 2. 해당하는 사용자의 비밀번호가 존재하는가?
  if (!user) {
    return res.status(401).json({
      message: "해당하는 사용자가 존재하지 않습니다",
    });
  } else if (user.password !== password) {
    return res.status(401).json({
      message: "비밀번호가 일치하지 않습니다.",
    });
  }

  // jwt를 생성하고
  const token = jwt.sign(
    {
      userId: user.userId,
    },
    "customize_secret_key"
  );

  // 쿠키를 발급
  res.cookie("authorization", `Bearer ${token}`);

  // response를 할당
  res.status(200).json({
    message: "로그인에 성공하였습니다.",
  });
});

module.exports = router;

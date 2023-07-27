const { Sequelize } = require('sequelize');
require('dotenv').config();

// 데이터베이스 연결 정보
const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: process.env.DATABASE_DIALECT, // 여기서 dialect를 환경 변수에서 가져와서 지정합니다.
});

function connect() {
  try {
    sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
  }
}

module.exports = {
  connect,
};

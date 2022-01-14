var express = require('express');
var router = express.Router();
const Location = require('../model/Location');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* GET upload page. */
router.get('/upload', (req, res, next) => {
  res.render('upload');
});

/* 위치 조회 API */
router.get('/locations', async (req, res, next) => {
  try {
    const locations = await Location.find({}, {});

    res.json({
      locations,
      message: 'success',
      isSuccess: true,
    });
  } catch (err) {
    console.log('err', err);
    res.json({
      message: '저장 실패',
      isSuccess: false,
    });
  }
});

/* 위치 등록 API */
router.post('/locations', async (req, res, next) => {
  try {
    const { title, address, lat, lng } = req.body;
    const location = await Location.create({ title, address, lat, lng });

    res.json({
      location,
      message: 'success',
      isSuccess: true,
    });
  } catch (err) {
    console.log('err', err);
    res.json({
      message: '저장 실패',
      isSuccess: false,
    });
  }
});

module.exports = router;

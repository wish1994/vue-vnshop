var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var user = require('../models/user');

var goods = require('../models/goods');

mongoose.connect('mongodb://localhost/shop');

mongoose.connection.on('connected',function(){
  console.log("mongodb connected sucssess");
})

mongoose.connection.on('error',function(){
  console.log("mongodb connected error");
})

mongoose.connection.on('disconnected',function(){
  console.log("mongodb connected disconnected");
})


router.get('/list',function(req,res,next){
  // 接收 page 第几页
  // 接收 pagesize 每页显示几条
  let priceLevel = req.param('priceLevel');
  let sort = req.param('sort') ? req.param('sort') : 'all';
  let currentPage = parseInt(req.param('page')) > 0 ? parseInt(req.param('page'))
  : 1;
  let pagesize = parseInt(req.param('pagesize')) > 0 ? parseInt(req.param('pagesize')) : 4;
 
  
  let skip = (currentPage - 1) * pagesize;

  let param = {};
  let priceGt = '',
      priceLte = '';
  if(priceLevel != 'all'){


      switch (priceLevel) {
        case '0':
          priceGt = 0;
          priceLte = 100;
          break;
      
        case '1':
          priceGt = 100;
          priceLte = 500;
          break;
        case '2':
          priceGt = 500;
          priceLte = 1000;
          break;
        case '3':
          priceGt = 1000;
          priceLte = 2000;
          break;
      }
      param = { salePrice: { $gt: priceGt, $lte: priceLte } }

      // 表驱动法
      // let priceItem = [
      //   [0,100],
      //   [100,500],
      //   [500,1000],
      //   [1000,2000]
      // ];

      // param = {
      //   salePrice:{
      //     $gt:priceItem[priceLevel][0],
      //     $lte:priceItem[priceLevel][1]
      //   }
      // }

    

  }

  let goodsModel = goods.find(param);
  // if (想要排序) {
    goodsModel.sort({ 'salePrice': sort });
  // }
  goodsModel.skip(skip).limit(pagesize);
  
  goodsModel.exec({}, function (err, result) {
    res.json({ status: "1", msg: '', data: result })
  })
})

router.post('/addCart',function(req,res,next){

  var productId = req.body.productId;
  var userId = 100000077;

  user.findOne({userId:userId},function(err,userDoc){

    let goodsItem = '';
    userDoc.cartList.forEach(function(item){
      if(item.productId == productId){
          goodsItem = item;
          item.productNum++;
      }
    })

    if (goodsItem){
      userDoc.save(function (err2, doc2) {
        res.json({
          status: '0',
          msg: '',
          result: '商品数量添加成功'
        })
      })
    }else{
      goods.findOne({ 'productId': productId }, function (err, goodsDoc) {
        goodsDoc.productNum = 1;
        userDoc.cartList.push(goodsDoc);
        userDoc.save(function (err2, doc2) {
          res.json({
            status: '0',
            msg: '',
            result: '加入购物车成功'
          })
        })
      })
    }
  })

})

module.exports = router;
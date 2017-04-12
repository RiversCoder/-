var express = require('express');
//创建路由
var router = express.Router();
var Category = require('../models/category');
var User = require('../models/users');
var Article = require('../models/article');

var Tools = require('../tools/tools');

var renderDataPage = {};
var tools = new Tools();
tools.getAllDatabases(router,'/',Category,Article,User,function(renderData,req,res,next){

    var pid = req.query.pid;

    if(pid === undefined)
    {

        res.render('main/index',{
            navId : '58e4a5fd8d4f2b0347ecb210',
            navInfo : renderData.category,
            userInfo : req.userInfo,
            data : renderData.article
        });

        return;
    }
    else
    {
        Article.findOne({_id : pid}).populate(['category','user']).then(function(info){
            info.views++;
            info.save().then(function(info2){
                res.render('main/article',{
                    navId : info.category._id.toString(),
                    navInfo : renderData.category,
                    userInfo : req.userInfo,
                    cdata : info,
                    comments : info.comment
                });

                res = null;
            });
        });

        return;
    }

});



var arr = [];
tools.getAllDatabases(router,'/category',Category,Article,User,function(renderData,req,res,next){
    var cid = req.query.cid;
    arr = [];

    for(var item of renderData.article)
    {
        if(item.category._id.toString() == cid)
        {
            arr.push(item);
        }
    }
    if(cid == '58e4a5fd8d4f2b0347ecb210')
    {
        arr = renderData.article;
    }

    res.render('main/index',{
        navId : cid,
        navInfo : renderData.category,
        userInfo : req.userInfo,
        data : arr
    });
});


router.get('/category/comment',function(req,res,next){
    //console.log(req.query);
    var comData = {
        comment : req.query.content,
        date : new Date(),
        username : req.userInfo.username
    };
    console.log(comData);
    Article.findOne({
        _id : req.query.cid
    }).then(function(info){
        info.comment.unshift(comData);
        return info.save();
    }).then(function(info2){

        res.json(comData);
    });

});









module.exports = router;
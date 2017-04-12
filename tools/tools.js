/**
 * Created by MAC on 17/4/7.
 */

/*var express = require('express');
//创建路由


//获取数据库模型model
var User = require('../models/users');
var Category = require('../models/category');
var Article = require('../models/article');*/

var Tools = function()
{

}

Tools.prototype = {
    constructor : Tools,
    pageTurn : function(router,routerUrl,Database,callback)  //分页封装
    {
        //实现分页功能
        var catebase = null;
        var catepage = 0;
        var cateskip = 0;
        var catelimit = 10;
        var cateAllItems = 0;
        var cateAllpage = 0;

        router.get(routerUrl,function(req,res,next){

            Database.count().then(function(dataInfo){
                cateAllpage = Math.ceil(dataInfo/catelimit);
                cateAllItems = dataInfo;
                return true;
            }).then(function(info){
                //console.log('执行到此处'+cateAllpage,cateAllItems);
                //console.log(info);
                catepage = req.query.page-1 || 0;

                if(catepage < 0)
                {
                    catepage = 0;
                }
                else if(catepage > cateAllpage)
                {
                    catepage = cateAllpage;
                }
                cateskip = catepage * catelimit;

                var data = {
                    cpage : catepage+1,
                    skip : cateskip,
                    limit : catelimit,
                    pages : cateAllpage,
                    allItems : cateAllItems
                };
                //console.log(data);
                callback(data,req,res,next);

                return;
            });


        });

    },
    getAllDatabases : function(router,url,Category,Article,User,callback)
    {
        var renderData = {};
        router.get(url,function(req,res,next){

            //xu
            Category.find().sort({_id: 1}).then(function(infos){
                renderData.category = infos; //[ { _id: 58e4a5fd8d4f2b0347ecb210, name: '我的首页', __v: 0 },..]
                delete renderData._locals;
            }).then(function(c){
                return Article.find().sort({time : 1}).populate(['category','user']).then(function(infos){
                    renderData.article = infos;
                });
            }).then(function(c){
                return User.find().then(function(infos){
                    renderData.user = infos;
                });
            }).then(function(){
                //console.log(renderData,pid,id);
                callback(renderData,req,res,next);
            });
        });
    }

};

module.exports = Tools;
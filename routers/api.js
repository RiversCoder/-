var express = require('express');
//创建路由
var router = express.Router();
//通过模型类 来操作数据库
var User = require('../models/users');

//设置全局默认返回注册信息 中间键
var returnData = null;
router.use(function(req,res,next){
    returnData = {
        code : 0,
        message : ''
    };
    next();
});


//注册信息处理
router.post('/user/register',function(req,res,next){
    //console.log(req.body);
    var user = req.body.username;
    var pasw = req.body.password;
    var rpasw = req.body.repassword;

    //对接收过来的数据进行操作
    if(user == '')
    {
        returnData.code = 1;
        returnData.message = '用户名不能为空!';
        res.json(returnData);
        return;
    }

    if(rpasw == '' ||  pasw == '')
    {
        returnData.code = 2;
        returnData.message = '密码不能为空!';
        res.json(returnData);
        return;
    }

    if(rpasw != pasw)
    {
        returnData.code = 3;
        returnData.message = '两次填写密码不一致!';
        res.json(returnData);
        return;
    }


    //用户名注册 :
    //1.检测该用户名是否已经被注册 , 如果已经被注册,返回错误信息 ; 如果没被注册将数据添加到数据库中
   /* var p2 = User.findOne(function(){
        username : user
    });*/

    /*p2 = new Promise(function(resolve){
        resolve();
    });*/

    //注意findOne方法的参数是一个对象,不是一个回调
    User.findOne({
        username : user
    }).then(function(userInfo){
        //console.log(userInfo);
        //能查询到就返回查询信息:
        /*
             { _id: 58e1fe6f86c14c034818cf1e,
             username: '1234',
             password: '123',
             __v: 0 }
         */
        //如果能查询不到 就返回null
        if(userInfo)
        {
            returnData.code = 4;
            returnData.message = '该用户名已经被注册了!';
            res.json(returnData);
            return;
        }
        //保存用户注册的信息存到数据库
        var users = new User({
            username : user,
            password : pasw
        });

        return users.save();
    }).then(function(newUserInfo){
        //console.log(newUserInfo);
        //如果数据能够保存不成功 就返回 undefined
        //如果数据没有保存成功 就返回 向数据库保存的信息
        /*
             { __v: 0,
             username: '123455',
             password: '1234',
             _id: 58e1ff23a080da034c24a65b }
         */

        returnData.message = '恭喜你,注册成功!';
        res.json(returnData);
        return;
    });

});


//设置全局默认返回登陆信息 中间键
var returnLoginData = null;
router.use(function(req,res,next){
    returnLoginData = {
        code : 0,
        message : ''
    };
    next();
});


//登陆信息处理
router.post('/user/login',function(req,res,next){
    //console.log(req.body);
    var user = req.body.username;
    var pw = req.body.password;

    User.findOne({
        username : user,
        password : pw
    }).then(function(findInfo){
        //如果能够查询到用户名信息以及密码 就返回给客户端查询成功信息
        //1. null  2.{ username: '1234', password: '123' }
        if(findInfo)
       {

           returnLoginData.message = '登录成功!';
           returnLoginData.code = 0;
           returnLoginData.loginInfo = findInfo;

           req.cookies.set('userInfo',JSON.stringify({
               _id : findInfo._id,
               username :  encodeURI(findInfo.username)
           }));

           res.json(returnLoginData);
           //每次注册成功返回注册信息

           //res.json(req.cookies.get('userInfo'));
           return;
       }
       else
       {
           returnLoginData.message = '用户名或密码错误!';
           returnLoginData.code = 1;
           res.json(returnLoginData);
           return;
       }
    });
});

//退出用户处理
router.get('/user/logout',function(req,res,next){
    req.cookies.set('userInfo',null); //设置cookie值为空 渲染的时候走 登录和注册框
    res.json({
        message : '退出成功',
        code : 0
    });
});

module.exports = router;
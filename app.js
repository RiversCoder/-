//加载所有模块

//加载express模块
var express = require('express');
//加载body-parser模块 用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载模版 处理模块
var swig = require('swig');
//加载cookies模块
var Cookies = require('cookies');
//用来解析请求过来数据
var bodyParser = require('body-parser');
//加载数据库模块
var mongoose = require('mongoose');
//加载 数据库model模块
var User = require('./models/users');

var app = express();




//bodyparse设置
app.use(bodyParser.urlencoded({extended : true}));

//console.log(new Cookies()); Cookies { secure: undefined, request: undefined, response: undefined }
//cookie设置
app.use(function(req,res,next){
    //res.myId = 'liguangchuan';
    //req.mySex = 'boy';
    req.cookies = new Cookies(req,res);
    req.userInfo = {};

    if(req.cookies.get('userInfo'))
    {
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            req.userInfo.username = decodeURI(req.userInfo.username);

            //设置isAdmin 获取当前登陆用户的类型
            User.findById(req.userInfo._id).then(function(adminInfo){
                req.userInfo['isAdmin'] = Boolean(adminInfo.isAdmin);
                next(); //注意next()的位置,不然赋值失败
            });

        }catch(e){}
    }
    else {
        next();
    }

});


//路由分配 动态开发
//配置一个模版
//定义当前应用所使用的模版引擎
//参数1 : 模版引擎的名称也是模版文件的后缀名 参数2 : 表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模版文件存放目录 , 参数1:必须是 'views' 参数2:目录
app.set('views','./views');
//注册所使用的模版引擎, 参数1:必须是 'view engine' 参数2: 和app.engine这个方法中定义的模板引擎的名称（第一个参数）保持一致的
app.set('view engine','html');
//在开发过程中 去除默认的模版缓存
swig.setDefaults({cache:false});




//设置静态文件
app.use('/public',express.static(__dirname + '/public'));


//根据不同的功能 划分模块 (动态)
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));



//用来操作数据库时的错误信息:
//DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
//mongoose.Promise = global.Promise;
//连接数据库
mongoose.connect('mongodb://127.0.0.1:27018/blog',function(error){
    if(error){
        console.log('数据库连接失败');
    }
    else{
        console.log('数据库连接成功');
    }
});

//监听
app.listen(8082);
//MACBOOKdeMacBook-Pro:~ MAC$ cd /Users/MAC/mongodb-osx-x86_64-3.4.3/bin
//MACBOOKdeMacBook-Pro:bin MAC$ ./mongod --dbpath=/Users/MAC/Desktop/NodeJS/blog/db --port=27018


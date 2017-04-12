var express = require('express');
//创建路由
var router = express.Router();

//获取数据库模型model
var User = require('../models/users');
var Category = require('../models/category');
var Article = require('../models/article');

//导入工具库
var Tools = require('../tools/tools');

//判断是否为管理员进入当前后台管理页面 (通过url地址进入)
router.use(function(req,res,next){
    if(!req.userInfo.isAdmin)
    {
        res.send('只有管理员才能进入管理页面!');
        return;
    }
    next();
});


//后台首页
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo : req.userInfo
    });
});


//后台用户管理 : 需要获取数据库信息
//计算总页数 总数据量
var allpage = 0;
var limit = 8;
var allItems = 0;
User.find().then(function(dataInfo){
    allpage = Math.ceil(dataInfo.length/limit)-1;
    allItems = dataInfo.length;
});

//获取数据库信息:
//实现分页功能
var databases = null;
var cpage = 0;

router.get('/user',function(req,res,next){

    //console.log('进入user路由');

    cpage = req.query.page-1 || 0;

    if(cpage < 0)
    {
        cpage = 0;
    }
    else if(cpage > allpage)
    {
        cpage = allpage;
    }
    skip = cpage * limit;

    User.find().skip(skip).limit(limit).then(function(dataInfo){
        databases = dataInfo;
        res.render('admin/user_admin',{
            dataInfo : databases,
            userInfo : req.userInfo,
            pageInfo : {
                rname : 'user',
                cpage : cpage+1,
                limit : limit,
                pages : allpage,
                allItems : allItems
            }
        });
    });
});




//2.分类功能模块:

//获取数据库信息:
//实现分页功能
var catebase = null;
var catepage = 0;
var cateskip = 0;
var catelimit = 20;
var cateAllItems = 0;
var cateAllpage = 0;


//分类首页页面渲染
router.get('/categoryIndex',function(req,res,next){

    Category.find().then(function(dataInfo){
        cateAllpage = Math.ceil(dataInfo.length/catelimit);
        cateAllItems = dataInfo.length;
    });

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

    Category.find().skip(cateskip).limit(catelimit).then(function(dataInfo){
        catebase = dataInfo;
        //console.log(catebase);
        res.render('admin/categoryIndex',{
            dataInfo : catebase,
            userInfo : req.userInfo,
            pageInfo : {
                rname : 'categoryIndex',
                cpage : catepage+1,
                limit : catelimit,
                pages : cateAllpage,
                allItems : cateAllItems
            }
        });
    });

});




//分类添加页面结构渲染
router.get('/categoryIndexAdd',function(req,res,next){
    res.render('admin/categoryIndexAdd',{
        userInfo : req.userInfo
    });
});



//分类添加按钮点击提交数据
router.post('/categoryIndexAddData',function(req,res,next){
    //获取分类标题提交数据

    //判断内容是否为空
    if(req.body.categoryName == '')
    {
        //渲染错误页面
        res.render('admin/category_error',{
            userInfo : req.userInfo,
            name : req.body.categoryName,
            message : '分类标题不能为空!'
        });
        return;
    }

     /*
    //渲染成功页面
    res.render('admin/category_sucess',{
        userInfo : req.userInfo
    });
    */

    //查询数据库 是否存在已有字段
    Category.findOne({
        name : req.body.categoryName
    }).then(function(info){
        //console.log(info); //null
        if(info)
        {
            //渲染错误页面
            res.render('admin/category_error',{
                userInfo : req.userInfo,
                name : req.body.categoryName,
                message : '分类标题已经存在!'
            });
            return;
        }

        //console.log(info);
        //数据库不能查询到的时候 往数据库添加这条数据
        return new Category({
            name : req.body.categoryName
        }).save();

    }).then(function(info){
        //console.log(info);
        //如果成功保存在数据库
        if(info)
        {
            //渲染成功页面
            res.render('admin/category_sucess',{
                userInfo : req.userInfo,
                name : req.body.categoryName,
                message : '分类标题保存成功'
            });
        }
    });
});



//分类页面修改请求
var editId = 0;
router.get('/categoryIndex/edit',function(req,res,next){
    var id = req.query.id;
    editId = id;
    //查找当前ID对应的数据库信息
    Category.findOne({
        _id : id
    }).then(function(info){
        if(info)
        {
            //渲染编辑页面
            res.render('admin/category_edit',{
                name : info.name
            });
            return Promise.reject();
        }
    });

});


//接收修改分类名称的表单请求处理
router.post('/categoryIndex/editform',function(req,res,next){
    var id = editId;
    var name = req.body.changeName;
    var cnames = name;

    //1.判断是否为空: 如果为空则 直接进入成功页面 '修改成功'
    //2.查找数据库中是否有当前有同名的数据存在(id不同) 如果有则进入报错页面 : '数据库中已有当前分类名称数据存在'
    //3.否则: 找到当前id数据,update 分类名称 ,

    //1.空
    if(!name && name!=0)
    {
        res.render('admin/category_sucess',{
            userInfo : req.userInfo,
            message : ' 修改成功!'
        });
        return;
    }

    //console.log(id,name); //注意ID值的获取

    var oldName = null;
    //2.查找同名
   Category.findOne({
        _id : {$ne : id},
        name : name
    }).then(function(info){

        //找到同名
        if(info)
        {
            res.render('admin/category_error',{
                userInfo : req.userInfo,
                message : '对不起,数据库中有相同的名字的数据存在!'
            });
            return Promise.reject();
        }
        else
        {
            //没找到同名 : 修改数据库信息 * * *
            return Category.update({
                _id : id
            },{
                name : cnames
            });
        }
    }).then(function(info){
        //如果修改数据成功 : 渲染成功页面
        //console.log(info); //{ n: 1, nModified: 1, ok: 1 }
        res.render('admin/category_sucess',{
            userInfo : req.userInfo,
            message : ' 修改成功!'
        });

    });
});

//删除分类列表项
router.get('/categoryIndex/remove',function(req,res,next){
    var id = req.query.id;
    Category.remove({
        _id : id
    }).then(function(info){
        if(info)
        {
            res.render('admin/category_sucess',{
                userInfo : req.userInfo,
                message : ' 删除成功!'
            });
        }
    });
});


//文章管理 : 文章添加

//页面渲染
router.get('/articleIndexAdd',function(req,res,next){
    //获取分类数据
    Category.find().then(function(info){
        res.render('admin/articleIndexadd', {
            userInfo: req.userInfo,
            cates: info
        });
        return Promise.reject();
    });
});


//获取表单数据
router.post('/articleIndexAddData',function(req,res,next){
    var data = req.body;
    //console.log(data);
    //处理错误输入内容逻辑
    if(data.article_title == '')
    {
        res.render('admin/article_error',{
            userInfo : req.userInfo,
            message : '请输入文章标题!'
        });
        return;
    }

    if(data.article_des == '')
    {
        res.render('admin/article_error',{
            userInfo : req.userInfo,
            message : '请输入文章描述!'
        });
        return;
    }

    if(data.article_content == '')
    {
        res.render('admin/article_error',{
            userInfo : req.userInfo,
            message : '请输入文章内容!'
        });
        return;
    }

    //开始保存数据在数据库 保存成功渲染成功保存页面
    //获取category分类项的_id
    var id = req.query.id;
    //保存到数据表
    var articleM = new Article({
        category : data.cateId,
        title : data.article_title,
        des : data.article_des,
        user : req.userInfo._id.toString(),
        views : 0,
        content : data.article_content,
        time : (new Date())
    });

    articleM.save().then(function(info){
        //console.log(info);
        //如果保存成功
        if(info)
        {
            res.render('admin/article_success',{
                userInfo : req.userInfo,
                message : '文章保存成功!'
            });
            return;
        }
    });

});



//文章首页渲染
var tools = new Tools();
tools.pageTurn(router,'/articleIndex',Article,function(data,req,res,next){
    //console.log(data);
    Article.find().sort({_id : -1}).skip(data.skip).limit(data.limit).populate(['category','user']).then(function(info){
        //渲染页面

        /*
         console.log(info);  =>
             { _id: 58e762b3a0fac8054e963282,
             category: { _id: 58e4a6328d4f2b0347ecb213, name: '实战项目', __v: 0 },
             title: '我的实战',
             user:
             { _id: 58e34347d6d9ae6827af7b23,
             username: 'admin',
             password: 'admin',
             isAdmin: true },
             __v: 0,
             views: 0,
             time: 2017-04-07T09:58:11.168Z,
             content: '内容',
             des: '简介' } ]
         */

        res.render('admin/articleIndex',{
            userInfo : req.userInfo,
            dataInfo : info,
            pageInfo : {
                rname : 'articleIndex',
                cpage : data.cpage,
                limit : data.limit,
                pages : data.pages,
                allItems : data.allItems
            }
        });

        return;
    });
});



//文章编辑按钮点击 请求
router.get('/articleIndex/edit',function(req,res,next){
    var id = req.query.id;
    //console.log(id);

    //通过id查找数据项
    Article.findOne({
        _id : id
    }).populate(['category','user']).then(function(info){
        //console.log(info);
        //获取分类表所有数据
        Category.find().then(function(cinfo){
            //console.log(cinfo);

            //获取去当前数据条内容
            res.render('admin/article_edit',{
                userInfo : req.userInfo,
                cates : cinfo,
                cdata : info
            });
        });
    });
});


//点击修改按钮 请求路由
router.post('/articleIndex/edit/articleEdit',function(req,res,next){
    //获取数据
    var id = req.query.id;
    var data = req.body;
    //console.log(data);

    //查找 不同_id 相同标题 数据项
    Article.findOne({
        _id : {$ne : id},
        title : data.article_title
    }).then(function(info){
        // 如果有同名的存在 就跳转到错误信息页
        //console.log(info);
        if(info)
        {
            res.render('admin/article_error',{
                userInfo : req.userInfo,
                message : '文章标题重复!'
            });
            return;
        }

        return Article.update({
            _id : id
        },{
            category : data.cateId,
            title : data.article_title,
            des : data.article_des,
            content : data.article_content
        });
    }).then(function (info) {
        //console.log(info); //{ n: 1, nModified: 1, ok: 1 }
        res.render('admin/article_success', {
            userInfo: req.userInfo,
            message: '修改文章成功!'
        });
    });
});


//删除文章 请求
router.get('/articleIndex/edit/articleRemove',function(req,res,next){
    var id = req.query.id;
    console.log(id)
    //查找数据
    Article.remove({
        _id : id
    }).then(function(info){
        if(info){
            res.render('admin/article_success',{
                userInfo : req.userInfo,
                message : '删除成功!'
            });
        }
    });

});


module.exports =  router;
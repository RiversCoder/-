/**
 * Created by MAC on 17/4/6.
 */

var mongoose = require('mongoose');

//定义文章数据表结构
module.exports = new mongoose.Schema({

    //关联字段 - 分类的_id
    category : {
        //类型:
        type : mongoose.Schema.Types.ObjectId,
        //引用: (另一张表的模型model)
        ref : 'Category'
    },
    //内容标题
    title : String,
    //内容简介
    des : {
        type : String,
        default : ''
    },
    //内容
    content : {
        type : String,
        default : ''
    },
    //时间
   time: {
        type: Date,
        default: Date.now
    },
    //阅读量
    views : {
        type : Number,
        default : 0
    },
    //用户表
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    comment : {
        type : Array,
        default : ''
    }
});
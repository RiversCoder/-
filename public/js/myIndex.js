//注册登录切换
(function()
{	
	function Logreg()
	{

	}

	Logreg.prototype = 
	{
		constructor : Logreg,
		goLogin : function(elem)
		{
			elem.bind('click',function(ev) {
				$('#registerBoxs').css('display', 'none');
				$('#loginBoxs').css('display', 'block');
			});

		},
		goRegister : function(elem){
			elem.click(function(ev) {
				$('#loginBoxs').css('display', 'none');
				$('#registerBoxs').css('display', 'block');
			});
		},
		sendLoginData : function()
		{
			var login = $('#loginBtn');
			var t1 = $('#loginBoxs input[name=username]');
			var t2 = $('#loginBoxs input[name=password]');

			login.click(function(){
				$.ajax({
					url : '/api/user/login',
					type : 'post',
					dataType : 'json',
					data : {
						username : t1.val(),
						password : t2.val()
					},
					success : function(data){
						console.log(data);
						$('#loginBoxs').find('.lrtipsInfo').show().text(data.message);

						//登陆成功后进入个人信息页面
						if(data.code === 0)
						{
							setTimeout(function(){
								/*$('#loginBoxs').hide();
								$('#userInfosBoxs').show();
								$('#c_right').find('.lrtitle').text('个人信息');
								$('#c_right').find('.userinfo').show().find('.infoname').text(t1.val());
								$('#userInfosBoxs').find('.unbame').text(t1.val());
								$('#userInfosBoxs').find('.uibd').text(data.loginInfo._id);*/
								window.location.reload();
							},800);
						}
					}
				});
			});
		},
		sendRegisterData : function()
		{
			var register = $('#registerBtn');
			var t1 = $('#registerBoxs input[name=username]');
			var t2 = $('#registerBoxs input[name=password]');
			var t3 = $('#registerBoxs input[name=repassword]');

			register.click(function(){
				$.ajax({
					url : '/api/user/register',
					type : 'post',
					dataType : 'json',
					data : {
						username : t1.val(),
						password : t2.val(),
						repassword : t3.val()
					},
					success : function(data){
						$('#registerBoxs').find('.lrtipsInfo').show().text(data.message);

						//注册成功后进入登录页面
						if(data.code === 0)
						{
							setTimeout(function(){
								$('#registerBoxs').hide();
								$('#loginBoxs').show();
							},1000);
						}
					}
				});
			});
		},
		userInfoOut : function(elem)
		{
			elem.click(function(){
				console.log('点击');
				$.ajax({
					url : '/api/user/logout',
					type : 'get',
					dataType : 'json',
					success : function(data){
						console.log(data);
						window.location.reload();
					}
				});
			});
		}
	};

	var loginRegister = new Logreg();

	//注册登陆切换
	loginRegister.goRegister($('#goRegister'));
	loginRegister.goLogin($('#goLogin'));
	//发送登陆数据
	loginRegister.sendLoginData();
	//发送注册数据
	loginRegister.sendRegisterData();
	//退出用户
	loginRegister.userInfoOut($('#userInfoOutBtn'));
	loginRegister.userInfoOut($('#userInfoOutBtnAdmin'));
})();


// JavaScript Document


$(function(){
	//menu
	$(".menu ul li").click(function(){
		$(this).addClass("menuItem")
		.siblings().removeClass("menuItem");
		var index = $(".menu ul li").index(this);
		$(this).eq(index).show();
		//$(".menu ul li").eq(index).show();
	});


	//user
	$(".user li.name").bind("mouseover",function(){
		$(".exit").show();
		$(this).addClass("nameHover");
	});
	$(".user li.name").bind("mouseout",function(){
		$(".exit").hide();
		$(this).removeClass("nameHover");
	});


	//left
	$(".left li.li_2").click(function(){
		var obj = $(".left li.li_2");
		for(var i=0; i<obj.length; i++){
			if(obj.eq(i).hasClass("leftItem")){
				obj.eq(i).removeClass("leftItem");
			}
		}
		$(this).addClass("leftItem");
	});
	$(".left2 ul li").click(function(){
		$(this).addClass("leftItem")
		.siblings().removeClass("leftItem");
		var index = $(".left2 ul li").index(this);
		$(this).eq(index).show();
		//$(".menu ul li").eq(index).show();
	});

	//新建用户
	for(var i=0; i<3; i++){
		$("#step0").css("display","block");
		if(i==0){
			$("#next").click(function(){
				$("#step0").css("display","none");
				$("#step1").css("display","block");
			});
		}else if(i==1){
			$("#prev").click(function(){
				$("#step0").css("display","block");
				$("#step1").css("display","none");
			});
		}else {
			$("#creat").click(function(){
				$("#step1").css("display","none");
				$("#step2").css("display","block");
			});
		}
	}
});

/**
 * customGroup.js	自定义分组
 * author: helin
 * date: 2015.1.23
 */
var pageidx      = 1;
var pagenum      = 50;
var homeStatus   = ["未激活","开机", "欠费", "停机", "销户"];
var groupData    = [];
var homelistData = null;
var groupPageidx = 1;		//分组列表的页码
var groupPagenum = 100;		//分组列表的条数
var emptyFlag    = true;	//是否是滚动条刷新分组列表
var searchFlag	 = false;	//是否是搜索状态下的列表显示
var membertypeArr = ['', '家庭', '用户'];
var groupMethod = ['', '按家庭分组', '按用户分组'];
var GROUP_TYPE   = 20001;

var accesstoken = top.accesstoken;
var accessAddr = top.accessAddr;

//家庭列表的排序和筛选参数
var statusSelect = [0];		//1：未激活，2：开机，3：欠费，4：停机，5：销户
var sortby = 0;			//0：默认排序，1：家庭id，2：家庭名称，3：用户总数，4：用户名，5：用户id，6：用户昵称，7：用户年龄。
var asc    = 1;			//1：升序【默认】，2：降序。

$(function () {
	
    $('.masks', top.document).hide();
    $('.popMain', top.document).hide();

	top.currWin = window;
	GROUP_TYPE = top.getUrlArgs("grouptype", window.location.href );//绍兴需求 
	initRight();
	outHeight();
	bindEvent();
	getGroupList();

	//显示搜索按钮
	$(".search", top.document).show();
});

//动态改变页面的高
function outHeight () {
    var height = $(window).height();
    $(".left").css("height", height);
    $(".left .group-list").css("height", height-35);
    $(".right").css("height", height);
    $(".homelist").css("height", height-70);
}

//按钮事件绑定
function bindEvent () {
	//窗口改变事件
	$(window).resize(function(){
	    outHeight();
	});

	//滚动条刷新事件
	$(".group-list").scroll(function (event) {
		var totalHeight = this.scrollHeight;
		var currHeight = this.scrollTop+this.clientHeight;

		//产生滚动条，且滚动条到底了，刷新下一页的数据
		if (this.scrollTop && (currHeight == totalHeight)) {	
			groupPageidx++;
			emptyFlag = false;
			getGroupList();
		}
	});

	$(".homelist").scroll(function (event) {
		$(".homelist-title").css({
			width: this.style.width+"px",
			top: this.scrollTop
		});
	});

	//新建分组按钮
	$(".new-group").click(function () {
		if ($(this).hasClass("btn-disable")) return;

		if (!adjustGroupRight) {
			$.alert({msg: "没有权限！", img:"img/info.png"});
			return;
		}

		$.container({
			title: "新建分组",
			showTitle: true,
			targetId: "#new-group-pop",
			width: 400,
			height: 200
		});
	});

	//查看分组按钮
	$(".view-group").click(function () {
		if ($(this).hasClass("btn-disable")) return;

		if (!adjustGroupRight) {
			$.alert({msg: "没有权限！", img:"img/info.png"});
			return;
		}
		
		var currGroupData, currGroupId = $(".group-list .selected").data("group_id");

		if (currGroupId === null) return;

		for (var i in groupData) {
			if (groupData[i].group_id == currGroupId) currGroupData = groupData[i];
		}

		/*
		var url = accessAddr+"/portal/get_relevance_list?accesstoken="+accesstoken+"&pageidx=1&pagenum=1000&terminalgroupid="+currGroupId;

		$.ajax({
			url: url,
			success: function (res) {
				if (res.list && res.list.length > 0) {
					var list = res.list;
					for (var i = 0, len = list.length; i < len; i++) {
						var portalList = list[i].portal_list;
						$(".view-group-portal option[value='"+portalList[0].portal_id+"']", top.document).attr("selected", true);
						$(".view-group-portal", top.document).data("old_portalid", portalList[0].portal_id);
					}
				} else {
					$.alert({msg: "获取分组列表失败！"+res.ret_msg, img:"img/info.png"});
				}
			},
			error: function (res) {
				$.alert({msg: "获取分组列表失败！"+res.ret_msg, img:"img/info.png"});
			}
		});*/

		$.container({
			title: "属性",
			showTitle: true,
			targetId: "#view-group-pop",
			width: 400,
			height: 430
		});

		//初始化弹出框内的内容
		$(".view-group-name", top.document).attr("value", currGroupData.name);
		$(".view-group-name", top.document).data("old_name", currGroupData.name);
		$(".view-group-type", top.document).html( membertypeArr[ parseInt( currGroupData.member_type ) ] );
		$(".view-group-method", top.document).html(groupMethod[ parseInt( currGroupData.member_type ) ]);
		$(".view-group-desc", top.document).html(currGroupData.desc);
		$(".view-group-desc", top.document).data("old_desc", currGroupData.desc);
	});

	//删除分组按钮
	$(".delete-group").click(function () {
		if ($(this).hasClass("btn-disable")) return;

		if (!deleteGroupRight) {
			$.alert({msg: "没有权限！", img:"img/info.png"});
			return;
		}

		var currGroupData, currGroupId = $(".group-list .selected").data("group_id");

		if (currGroupId === null) return;

		for (var i in groupData) {
			if (groupData[i].group_id == currGroupId) {
				currGroupData = groupData[i];
			}
		}

		if (homelistData == null || homelistData.length == 0) {
			$.confirm({msg: "确定要删除 "+currGroupData.name+" 分组吗？", callback: function (result) {
				if (result) {
					var url = accessAddr+"/terminalgroup/delete?accesstoken="+accesstoken+"&groupid="+currGroupId;
					$.ajax({
						url: url,
						success: function (res) {
							$.alert({msg: "删除成功！", img:"img/info.png"});
							emptyFlag = true;
							getGroupList();
						},
						error: function (res) {
							if (res.ret == 10606) {
								$.container({
									targetId: "#delete-group-pop",
									width: 300,
									height: 150
								});
								$(".delete-group-name").html(currGroupData.name);
							} else {
								$.alert({msg: "删除分组失败！"+res.ret_msg, img:"img/info.png"});
							}
						}
					});
				}
			}});
		} else {
			$.container({
				targetId: "#delete-group-pop",
				width: 300,
				height: 150
			});
			$(".delete-group-name").html(currGroupData.name);
		}
	});

	//排序
	$(".homelist-title .sort").click(function () {
		//搜索列表暂时没有筛选和排序功能
		if (searchFlag) return;

		hideStatusSelect();
		$(".homelist-title .sort").removeClass("active");
		$(this).addClass("active");

		sortby = $(this).attr("value");

		if (!$(this).hasClass("desc")) {
			$(this).addClass("desc");
			asc = 2;
		} else {
			$(this).removeClass("desc");
			asc = 1;
		}

		var groupid = $(".group-list li.selected").data("group_id");
		var membertype = $(".group-list li.selected").data("member_type");
		showHomeList(groupid, membertype);
		return false;
	});

	//显示隐藏状态筛选框
	$(".homelist-title .filter").click(function (event) {
		//搜索列表暂时没有筛选和排序功能
		if (searchFlag) return;

		if (!$(this).hasClass("active")) {
			$(this).addClass("active");

			$(".status-select").show();
		} else {
			hideStatusSelect();
		}

		return false;
	});

	//隐藏下拉框
	$(document).click(function () {
		if ($(".homelist-title .filter").hasClass("active")) hideStatusSelect();
	});
	
	$(".status-select").mouseleave(function () {
		hideStatusSelect();
	});

	function hideStatusSelect () {
		$(".homelist-title .filter").removeClass("active");
		$(".status-select").hide();
	}

	//状态筛选下拉框点击事件
	$(".status-select li").click(function () {
		if (!$(this).hasClass("checked")) {
			$(this).addClass("checked");

			if (statusSelect.length == 1 && statusSelect[0] == 0) statusSelect = [];
			statusSelect.push($(this).attr("value"));
		} else {
			$(this).removeClass("checked");

			var value = $(this).attr("value");
			for (var i in statusSelect) {
				if (statusSelect[i] == value) statusSelect.splice(i, 1);
			}

			if (statusSelect.length == 0) statusSelect[0] = 0;
		}

		var groupid = $(".group-list li.selected").data("group_id");
		var membertype = $(".group-list li.selected").data("member_type");
		showHomeList(groupid, membertype);
		return false;
	});

	//上传按钮
    $(".upload").click(function() {

        var groupid = $(".group-list li.selected").data("group_id");

        top.$.content({
            width: "450px",
            height: "240px",
            header: {
                text: "批量添加"
            },
            content: {
                frameName:'upload',
                src: "upload.html?token="+top.accesstoken+'&groupid='+groupid
            },
            footer: {
                buttons: [{
                    buttonID: "sure",
                    buttonText: "开始上传",
                    callback: function () {
                        top.window['upload'].Upload.submit(function () {
                            getGroupList(groupid);
                        });
                    }
                }, {
                    buttonID: "cancel",
                    buttonText: "关闭",
                    callback: function (layerID) {
                        top.$.tLayer("close", layerID);
                    }
                }]
            }
        });

        top.$('.layer-box-header').height('24px');
    });	
}

//获取分组列表
function getGroupList ( _groupId ) {
	if (emptyFlag) {
		$(".group-list").empty();
		groupData = [];
		groupPageidx = 1;
		groupPagenum = 100;
	}
	var url = accessAddr+"/terminalgroup/get_list?accesstoken="+accesstoken+"&grouptype="+GROUP_TYPE+"&pageidx="+groupPageidx+"&pagenum="+groupPagenum;
	$.ajax({
		url: url,
		success: function (res) {
			var curLen = groupData.length;
			if(!res.list){
				res.list = [];
			}
			$.merge(groupData, res.list);
			if (!groupData || groupData.length == 0) {
				$.alert({msg: "分组列表为空！", img:"img/info.png"});
				$(".view-group").addClass("btn-disable");
				$(".delete-group").addClass("btn-disable");
				return;
			}

			var $ul = $(".group-list"),
				$li = null;
			for (var i = curLen, len = groupData.length; i < len; i++) {
				$li = $("<li><a groupid="+ groupData[i].group_id +" onclick='showHomeList("+groupData[i].group_id+", "+groupData[i].member_type+", this)' title='"+groupData[i].name+"'>"+groupData[i].name+"</li>").appendTo($ul);
				$li.data("group_id", groupData[i].group_id);
				$li.data("member_type", groupData[i].member_type);
			}
			if( _groupId ){
				$('.group-list a[groupid='+_groupId+']').click();
			}else{
				$(".group-list a:eq(0)").click();
			}
			
		},
		error: function (res) {
			$.alert({msg: "获取分组列表失败！"+res.ret_msg, img:"img/info.png"});
		}
	});
}

//搜索分组成员
function searchHandler (keyword) {
	//重置页码参数和排序参数
	pageidx = 1;
	sortby = 0;
	asc = 1;
	statusSelect = [];

	$(".homelist-title .sort").removeClass("desc active");
	$(".status-select li").removeClass("checked");

	searchFlag = true;

	var groupid = $(".group-list li.selected").data("group_id");
	var membertype = $(".group-list li.selected").data("member_type");
	var url = accessAddr+"/terminalgroup/search_member?keyword="+keyword.toLowerCase()+"&membertype="+membertype+"&groupid="+groupid;

	if( membertype == 1 ){
		$('#userlist').hide();
		$('#homelist').show();
		showPage(url, 2);
	}else if( membertype == 2){
		$('#homelist').hide();
		$('userlist').show();
		showUserPage( url, 2 );
	}
}

//显示右边的分组家庭列表信息
function showHomeList (groupid, membertype, _this) {
	if (arguments.length == 3) {	//点击左侧分组列表
		$(".group-list li").removeClass("selected");
		$(_this).parent().addClass("selected");

		
		//重置页码参数和排序参数
		pageidx = 1;
		sortby = 0;
		asc = 1;
		statusSelect = [];

		$(".homelist-title .sort").removeClass("desc active");
		$(".status-select li").removeClass("checked");

		searchFlag = false;
	}

	if (sortby == 0) {
		var url = accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype="+membertype+"&status="+statusSelect.join("|");
	} else {
		var url = accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype="+membertype+"&status="+statusSelect.join("|")+"&sortby="+sortby+"&asc="+asc;
	}
	
	if( membertype == 1 ){
		$('a#add-user').hide();
		$('a#add-home').show();
		$('#userlist').hide();
		$('#homelist').show();
		showPage(url, 1);
	}else if( membertype == 2){
		$('a#add-home').hide();
		$('a#add-user').show();
		$('#homelist').hide();
		$('#userlist').show();
		showUserPage( url, 1 );
	} else {
		var url = accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype=2"+"&status="+statusSelect.join("|")+"&sortby="+sortby+"&asc="+asc;
		$('a#add-home').hide();
		$('a#add-user').show();
		$('#homelist').hide();
		$('#userlist').show();
		showUserPage( url, 1 );		
	}
	
}

function showPage (_url, _type){
	$(".pagebox").tPager({
        request: {
            url: _url,
            data: {
                accesstoken : top.accesstoken,
	            pagenum     : 50,
	            pageidx 	: 1
            },
            // 请求失败后的回调
            error: function (res) {
				if (_type == 1) {
					$.alert({msg: "获取家庭列表失败！"+res.ret_msg, img:"img/info.png"});
				} else {
					$.alert({msg: "搜索失败！"+res.ret_msg, img:"img/info.png"});
				}
			}
        },
        // 分页控件中能有多少个按钮
        scope: 5,
        loadData: function(data, total) {
            },
        // 获取分页数据成功
        onSuccess: function(res){
			$("#homelist .homelist-content").empty();
			homelistData = res.list;

			if (!homelistData || homelistData.length == 0) {
				$(".delete-group").removeClass("btn-disable");
				return;
			}
			$(".delete-group").addClass("btn-disable");

			var	len = homelistData.length,
				$ul = $("#homelist .homelist-content"),
				html = "",
				address;

			for (var i = 0; i < len; i++) {
				address = homelistData[i].address;
				address = address.province+address.city+address.district+address.detail;

				html = 	"";
				html += "<li>";
    			html += 	"<span class='col col1'>"+homelistData[i].home_id+"</span>";
				html += 	"<span class='col col2' title='"+homelistData[i].home_name+"'>"+homelistData[i].home_name+"</span>";
    			html += 	"<span class='col col3'>"+homelistData[i].superuser_name+"</span>";
    			html += 	"<span class='col col4'>"+homeStatus[homelistData[i].status-1]+"</span>";
    			html += 	"<span class='col col5'>"+homelistData[i].user_total+"</span>";
    			html +=		"<span class='col col6' title='"+address+"'>"+address+"</span>";
    			html +=		"<span class='col col7'>\
                                <a href='endUserManage.php?id="+homelistData[i].home_id+"' target='_parent' class='enter-home' title='进入'></a>\
                                <a href='javascript:deleteMember("+ homelistData[i].home_id +", 1);' class='delete-home' title='删除'></a>\
                                </span>";
                html +=	"</li>";

				$ul.append(html);
			}
		}
    });
}

function showUserPage (_url, _type){
	$(".pagebox").tPager({
        request: {
            url: _url,
            data: {
                accesstoken : top.accesstoken,
	            pagenum     : 50,
	            pageidx 	: 1
            },
            // 请求失败后的回调
            error: function (res) {
				if (_type == 1) {
					$.alert({msg: "获取用户列表失败！"+res.ret_msg, img:"img/info.png"});
				} else {
					$.alert({msg: "搜索失败！"+res.ret_msg, img:"img/info.png"});
				}
			}
        },
        // 分页控件中能有多少个按钮
        scope: 5,
        loadData: function(data, total) {
            },
        // 获取分页数据成功
        onSuccess: function(res){
			$("#userlist .homelist-content").empty();
			homelistData = res.list;

			if (!homelistData || homelistData.length == 0) {
				$(".delete-group").removeClass("btn-disable");
				return;
			}
			$(".delete-group").addClass("btn-disable");

			var	len = homelistData.length,
				$ul = $("#userlist .homelist-content"),
				html = "";
			var genderArr = ['', '男', '女'];

			for (var i = 0; i < len; i++) {

				html = 	"";
				html += "<li>";
    			html += 	"<span class='col col1'>"+homelistData[i].user_id+"</span>";
				html += 	"<span class='col col2' title='"+homelistData[i].user_name+"'>"+homelistData[i].user_name+"</span>";
    			html += 	"<span class='col col3'>"+homelistData[i].nick_name+"</span>";
    			html += 	"<span class='col col4'>"+genderArr[ homelistData[i].gender ]+"</span>";
    			html += 	"<span class='col col5'>"+top.getAddress( homelistData[i].address )+"</span>";
    			html +=		"<span class='col col7'>\
                                <a href='javascript:deleteMember("+ homelistData[i].user_id +", 2);' class='delete-home' title='删除'></a>\
                                </span>";
                html +=	"</li>";

				$ul.append(html);
			}
		}
    });
}

//添加分组
function addGroup () {
	var name      = $(".new-group-name", top.document).val();
	var groupType = GROUP_TYPE;
	var portalid  = $(".new-group-portal", top.document).val();
	var level     = 2;
	var desc      = $(".new-group-desc", top.document).val();
	var groupMemberType = 0;

	groupMemberType = $('.new-group-pop input:radio[name=groupMemberType]:checked', top.document).val();
	console.log( groupMemberType );

	if (name == "") {
		alert("分组名称不能为空！");
		return;
	}

	if(name.length > 20){
		alert("分组名称不能超过20个字符！");
		return;
	}

	if (desc == "") {
		alert("分组描述不能为空！");
		return;
	}

	if(desc.length > 250){
		alert("分组描述不能超过250个字符！");
		return;
	}

	if( !groupMemberType ){
		alert("分组类型不能为空！");
		return;
	}

	CloseLayer();

	var url = accessAddr+"/terminalgroup/add";
	$.ajax({
		url: url,
		type: "post",
		data: JSON.stringify({
			accesstoken: accesstoken,
			name: name,
			grouptype: groupType,
			level: level,
			desc: desc,
			membertype:groupMemberType
		}),
		success: function (res) {
			emptyFlag = true;
			getGroupList(res.group_id);
		},
		error: function (res) {
			if (res.ret == 10600) {
				$.alert({msg: "分组名称重复！", img:"img/info.png"});
			}else if( res.ret == 61100 ){
				$.alert({msg: "包含敏感词！", img:"img/info.png"});
			} else {
				$.alert({msg: "添加分组失败！"+res.ret_msg, img:"img/info.png"});
			}
		}
	});
}

//修改分组信息
function adjustGroup () {
	var groupid 	= $(".group-list .selected").data("group_id");
	var name        = $(".view-group-name", top.document).val();
	var oldName     = $(".view-group-name", top.document).data("old_name");
	var portalid    = $(".view-group-portal option:selected", top.document).val();
	var oldPortalid = $(".view-group-portal", top.document).data("old_portalid");
	var desc        = $(".view-group-desc", top.document).val();
	var oldDesc     = $(".view-group-desc", top.document).data("old_desc");

	if (name == "") {
		alert("分组名称不能为空！");
		return;
	}

	if(name.length > 20){
		alert("分组名称不能超过20个字符！");
		return;
	}

	if (desc == "") {
		alert("分组描述不能为空！");
		return;
	}

	if(desc.length > 250){
		alert("分组描述不能超过250个字符！");
		return;
	}

	CloseLayer();
	
	//判断是否做出了修改
	if (name != oldName || desc != oldDesc) {
		var url = accessAddr+"/terminalgroup/adjust_info";
		var data = {
			accesstoken: accesstoken,
			groupid: groupid
		}

		if (name != oldName) data.name = name;
		if (desc != oldDesc)data.desc = desc;
		/*{
			desc=desc.replace(/\n/g,"");
			data.desc = desc;
		} */
		$.ajax({
			url: url,
			type: "post",
			data: JSON.stringify(data),
			success: function (res) {
				emptyFlag = true;
				getGroupList(groupid);
			},
			error: function (res) {
				if (res.ret == 10612) {
					$.alert({msg: "分组名称重复！", img:"img/info.png"});
				}else if( res.ret == 61100 ){
					$.alert({msg: "包含敏感词！", img:"img/info.png"});
				}  else {
					$.alert({msg: "修改分组失败！"+res.ret_msg, img:"img/info.png"});
				}
			}
		});
	}

}


var adjustGroupRight = true;
var deleteGroupRight = true;

/**
 * [initRight 根据用户的权限分配功能]
 */
function initRight () {
	var user_riglt_list = top.user_riglt_list;
	var pageRight = [7008, 7009];	//本页面需要判断的权限

	$.each(pageRight, function (i, v) {
		if ($.inArray(v, user_riglt_list) == -1) {
			if (v == 7008) {	//编辑分组
				adjustGroupRight = false;
				$(".new-group").addClass("btn-disable");
				$(".view-group").addClass("btn-disable");
			} else {	//删除分组
				deleteGroupRight = false;
				$(".delete-group").addClass("btn-disable");
			}
		}
	});
	
	$(".menu a:not(.unable)").eq(0).click();
}


//添加家庭弹窗
function addHomes(){
    var groupid     = $(".group-list .selected").data("group_id");
    var membertype  = $(".group-list .selected").data("member_type");
    $.container({
            title: "添加家庭",
            showTitle: true,
            targetId: "#add-home-pop",
            width: 700,
            height: 430
    });

    bindSerachMember( membertype );
    top.getHomeList();

    rightFrameCallback = function(){
        $('#homelist td input:checked', top.document).each(function(index, el) {
            console.log( $(this).attr('homeid') );
            top.ajaxReqAction(function(data){
                if(data.ret == 0){
                    $.alert({msg:'添加成功',img:'img/info.png'});
                }
            },function(data){
                if( data.ret == 10608 ){
                    $.alert({msg:'已添加该家庭',img:'img/info.png'});
                }else{
                    $.alert({msg:'添加失败',img:'img/info.png'});
                }
            },
            '/terminalgroup/add_member',
            {accesstoken:top.accesstoken,groupid:groupid,memberid:$(this).attr('homeid'),membertype:membertype},
            'post','json',accessAddr);
        });

        CloseLayer();

        setTimeout(function(){
            showHomeList(groupid, membertype );
        },1000);
    }
}


//添加用户弹窗
function addUsers(){
    var groupid     = $(".group-list .selected").data("group_id");
	var membertype  = $(".group-list li.selected").data("member_type");
	var addUserData = {
		accesstoken : top.accesstoken,
		groupid     : groupid,
		membertype  : membertype
	}

    $.container({
            title: "添加用户",
            showTitle: true,
            targetId: "#add-user-pop",
            width: 600,
            height: 430
    });

    bindSerachMember( membertype );
   // top.getUserList();

    rightFrameCallback = function( _keyword ){

    	if( _keyword ){
    		addAllUserBySearch( _keyword, addUserData )
    	}else{
    		$('#homelist td input:checked', top.document).each(function(index, el) {
    			addUserData.memberid = $(this).attr('userid');
	        	addUsersSubmit( addUserData );
	        });

	        CloseLayer();

		    setTimeout(function(){
		        showHomeList(groupid, membertype);
		    },1000);
    	}
    }
}

//添加用户
function addUsersSubmit( _dataObj ){

    top.ajaxReqAction(function(data){
        if(data.ret == 0){
            $.alert({msg:'添加成功',img:'img/info.png'});
        }
    },function(data){
        if( data.ret == 10608 || data.ret == 10604 ){
            $.alert({msg:'已添加该用户',img:'img/info.png'});
        }else{
            $.alert({msg:'添加失败',img:'img/info.png'});
        }
    },
    '/terminalgroup/add_member',
    _dataObj,'post','json',accessAddr);		   
}

//搜索出的用户全部添加
function addAllUserBySearch( _keyword, _dataObj ){
	var total   = 0, 
		pageidx = 1,
		pagenum = 50,
		maxPage = 0;

	searchUser({
		accesstoken : top.accesstoken,
		area        : _keyword,
		pagenum     : pagenum,
		pageidx     : pageidx
	});

	//搜索用户
	function searchUser( _obj ){
		top.ajaxReqAction(function(data){

			for( var i = 0, len = data.list.length; i < len; i ++ ){
				_dataObj.memberid = data.list[i].user_id;
				addUsersSubmit( _dataObj );
			}

			total     = parseInt( data.total );
			maxPage   = Math.ceil( total/pagenum );

			if( parseInt(_obj.pageidx) < maxPage ){
				_obj.pageidx ++ ;
				setTimeout( function(){
					searchUser( _obj );
				}, 1000);
			}else{
				setTimeout(function(){
					$.alert({msg:'添加完成',img:'img/info.png'});
				}, 3000);
			}
		},function(){

		},'/usermanager/terminaluser/search_user',
		_obj,'get','json',accessAddr)
	}
}



//删除家庭
function deleteMember( _id, _membertype ){
    var groupid     = $(".group-list .selected").data("group_id");
    top.ajaxReqAction(function(data){
        if(data.ret == 0){
            $.alert({msg:'删除成功',img:'img/info.png'});

            setTimeout(function(){
                showHomeList(groupid, _membertype);
            },1000);
        }
    },function(data){
        $.alert({msg:'删除失败',img:'img/info.png'});
    },
    '/terminalgroup/delete_member',
    {accesstoken:top.accesstoken,groupid:groupid,memberid:_id,membertype:_membertype},
    'get','json',accessAddr);
}

//弹出框绑定搜索事件
function bindSerachMember( _membertype ){
	var timer = null;
	$('.search-member .by-name', top.document).on("keyup focus",function(){
		clearTimeout(timer);
		
		timer = setTimeout(function(){
		  	var searchId = $(".search-member .by-name", top.document ).val();
		  	if(searchId == "") {
				return;
		  	}
		  	top.searchMember( searchId, _membertype );
		  	$('#homelist', top.document).html('<tr class="searching"><td>搜索中...</td></tr>');
		}, 500);
		
	});

	$('.search-member .by-address', top.document).on("keyup focus",function(){
		clearTimeout(timer);
		
		timer = setTimeout(function(){
		  	var address = $(".search-member .by-address", top.document ).val();
		  	if(address == "") {
				return;
		  	}
		  	top.searchUserByAdress( address, 2 );
		  	$('#homelist', top.document).html('<tr class="searching"><td>搜索中...</td></tr>');
		}, 500);
		
	});
}


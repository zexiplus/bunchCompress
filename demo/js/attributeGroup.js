/**
 * attributeGroup.js   自定义分组
 * author: xiaoxixi
 * date: 2017.12.08
 */
var pageidx      = 1;
var pagenum      = 50;
var homeStatus   = ["未激活","开机", "欠费", "停机", "销户"];
var groupData    = [];
var homelistData = null;
var groupPageidx = 1;       //分组列表的页码
var groupPagenum = 100;     //分组列表的条数
var emptyFlag    = true;    //是否是滚动条刷新分组列表
var searchFlag   = false;   //是否是搜索状态下的列表显示

var system_id = 10005;  //按用户属性分组
var accessAddr = top.accessAddr;
var accesstoken = top.accesstoken;

//家庭列表的排序和筛选参数
var statusSelect = [0];     //1：未激活，2：开机，3：欠费，4：停机，5：销户
var sortby = 0;         //0：默认排序，1：家庭id，2：家庭名称，3：用户总数，4：用户名，5：用户id，6：用户昵称，7：用户年龄。
var asc    = 1;         //1：升序【默认】，2：降序。

$(function () {
    
    $('.masks', top.document).hide();
    $('.popMain', top.document).hide();

    top.currWin = window;

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
        $(".view-group-type", top.document).html("自定义分组");
        $(".view-group-method", top.document).html("按家庭分组");
        $(".view-group-desc", top.document).html(currGroupData.desc);
        $(".view-group-desc", top.document).data("old_desc", currGroupData.desc);
    });

    //删除分组按钮
    $(".delete-group").click(function () {
        if ($(this).hasClass("btn-disable")) return;

        if (!deleteGroupRight) {
            $.alert({msg: "没有权限！"+res.ret_msg, img:"img/info.png"});
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
        showHomeList(groupid);
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
        showHomeList(groupid);
        return false;
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
    var url = accessAddr+"/terminalgroup/get_list?accesstoken="+accesstoken+"&grouptype="+system_id+"&pageidx="+groupPageidx+"&pagenum="+groupPagenum;
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
                $li = $("<li title="+ groupData[i].group_id+"--"+groupData[i].name+">"+"<a groupid="+ groupData[i].group_id +" onclick='showHomeList("+groupData[i].group_id+", this)'>"+groupData[i].name+"</li>").appendTo($ul);
                $li.data("group_id", groupData[i].group_id);
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
    var url = accessAddr+"/terminalgroup/search_member?keyword="+keyword.toLowerCase()+"&membertype=1&groupid="+groupid;

    showPage(url, 2);
}

//显示右边的分组家庭列表信息
function showHomeList (groupid, _this) {
    if (arguments.length == 2) {    //点击左侧分组列表
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
        var url = statusSelect.join("|") == "" ?
        accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype=1" :
        accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype=1&status="+statusSelect.join("|");
    } else {
        var url = statusSelect.join("|") == "" ?
        accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype=1&sortby="+sortby+"&asc="+asc :
        accessAddr+"/terminalgroup/get_member_list?groupid="+groupid+"&membertype=1&status="+statusSelect.join("|")+"&sortby="+sortby+"&asc="+asc;
    }
    
    showPage(url, 1);
}

/**
 * [showPage 根据不同的接口显示分组成员的分页列表]
 * @param  {[type]} _url  [description]
 * @param  {[type]} _type [description]
 * @return {[type]}       [description]
 */
// function showPage (_url, _type) {
//  var pageObj = new Page(".pageblock", {
//      currPage: pageidx,
//      pagenum: pagenum,
//      total: "total",  //总条目key，用于ajax返回总条目获取的总数
//      reqhttp: _url,
//      success: function(res){
//          $(".homelist-content").empty();
//          pageidx = pageObj.options.currPage;
//          homelistData = res.list;

//          if (!homelistData || homelistData.length == 0) {
//              $(".delete-group").removeClass("btn-disable");
//              return;
//          }
//          $(".delete-group").addClass("btn-disable");

//          var len = homelistData.length,
//              $ul = $(".homelist-content"),
//              html = "",
//              address;

//          for (var i = 0; i < len; i++) {
//              address = homelistData[i].address;
//              address = address.province+address.city+address.district+address.detail;

//              html =  "";
//              html += "<li>";
//              html +=     "<span class='col col1'>"+homelistData[i].home_id+"</span>";
//              html +=     "<span class='col col2' title='"+homelistData[i].home_name+"'>"+homelistData[i].home_name+"</span>";
//              html +=     "<span class='col col3'>"+homelistData[i].superuser_name+"</span>";
//              html +=     "<span class='col col4'>"+homeStatus[homelistData[i].status-1]+"</span>";
//              html +=     "<span class='col col5'>"+homelistData[i].user_total+"</span>";
//              html +=     "<span class='col col6' title='"+address+"'>"+address+"</span>";
//              html +=     "<span class='col col7'><a href='endUserManage.php?id="+homelistData[i].home_id+"' target='_parent' class='enter-home' title='进入'></a></span>";
//              html += "</li>";

//              $ul.append(html);
//          }
//      },
//      error: function (res) {
//          if (_type == 1) {
//              $.alert({msg: "获取家庭列表失败！"+res.ret_msg, img:"img/info.png"});
//          } else {
//              $.alert({msg: "搜索失败！"+res.ret_msg, img:"img/info.png"});
//          }
//      }
//  });
// }

function showPage (_url, _type){
    $(".pagebox").tPager({
        request: {
            url: _url,
            data: {
                accesstoken : top.accesstoken,
                pagenum     : 50,
                pageidx     : 1
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
        // 正在分页中
        onPaging: function() {},
        /**
         * 数据加载完成，执行 onSuccess 之前执行的回调。return false 不再执行 onSuccess 回调，且不会刷新分页导航
         * @param  {Object} data  响应数据
         * @param  {Int}    total 数据总数
         * @return                可返回 false，终止 onSuccess 回调的执行
         */
        loadData: function(data, total) {
            },
        // 获取分页数据成功
        onSuccess: function(res){
            $(".homelist-content").empty();
            homelistData = res.list;

            if (!homelistData || homelistData.length == 0) {
                $(".delete-group").removeClass("btn-disable");
                return;
            }
            $(".delete-group").addClass("btn-disable");

            var len = homelistData.length,
                $ul = $(".homelist-content"),
                html = "",
                address;

            for (var i = 0; i < len; i++) {
                address = homelistData[i].address;
                address = address.province+address.city+address.district+address.detail;

                html =  "";
                html += "<li>";
                html +=     "<span class='col col1'>"+homelistData[i].home_id+"</span>";
                html +=     "<span class='col col2' title='"+homelistData[i].home_name+"'>"+homelistData[i].home_name+"</span>";
                html +=     "<span class='col col3'>"+homelistData[i].superuser_name+"</span>";
                html +=     "<span class='col col4'>"+homeStatus[homelistData[i].status-1]+"</span>";
                html +=     "<span class='col col5'>"+homelistData[i].user_total+"</span>";
                html +=     "<span class='col col6' title='"+address+"'>"+address+"</span>";
                html +=     "<span class='col col7'><a href='endUserManage.php?id="+homelistData[i].home_id+"' target='_parent' class='enter-home' title='进入'></a><a href='javascript:deleteGroup("+homelistData[i].home_id+")' class='delete-home'></a></span>";
                html += "</li>";

                $ul.append(html);
            }
        }
    });
}

//添加分组
function addGroup () {
    var name      = $(".new-group-name", top.document).val();
    var groupType = system_id;
    var portalid  = $(".new-group-portal", top.document).val();
    var level     = 2;
    var desc      = $(".new-group-desc", top.document).val();

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

    if(desc.length > 200){
        alert("分组描述不能超过200个字符！");
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
            desc: desc
        }),
        success: function (res) {
            emptyFlag = true;
            getGroupList(res.group_id);
            //portal管理功能单独分出去
            //relatePortal(res.group_id, portalid);
        },
        error: function (res) {
            if (res.ret == 10600) {
                $.alert({msg: "分组名称重复！", img:"img/info.png"});
            }else if( res.ret == 61100 ){
                $.alert({msg: "包含敏感词！", img:"img/info.png"});
            }  else {
                $.alert({msg: "添加分组失败！"+res.ret_msg, img:"img/info.png"});
            }
        }
    });
}

//修改分组信息
function adjustGroup () {
    var groupid     = $(".group-list .selected").data("group_id");
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

    if(desc.length > 200){
        alert("分组描述不能超过200个字符！");
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
        if (desc != oldDesc){
            desc=desc.replace(/\n/g,"");
            data.desc = desc;
        }
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

    //判断是否做出了修改
    if (portalid != oldPortalid) {
        //portal管理功能单独分出去
        //relatePortal(groupid, portalid);
    }
}

//将分组和portal建立绑定关系
function relatePortal (groupid, portalid) {
    var time = Math.round(new Date().getTime()/1000);
    var url = accessAddr+"/portal/set_relevance?accesstoken="+accesstoken+"&terminalgroupid="+groupid+"&portalid="+portalid+"&effectivetime="+time;

    $.ajax({
        url: url,
        error: function (res) {
            $.alert({msg: "关联Portal失败！"+res.ret_msg, img:"img/info.png"});
        }
    });
}

var adjustGroupRight = true;
var deleteGroupRight = true;

/**
 * [initRight 根据用户的权限分配功能]
 */
function initRight () {
    var user_riglt_list = top.user_riglt_list;
    var pageRight = [7008, 7009];   //本页面需要判断的权限

    $.each(pageRight, function (i, v) {
        if ($.inArray(v, user_riglt_list) == -1) {
            if (v == 7008) {    //编辑分组
                adjustGroupRight = false;
                $(".new-group").addClass("btn-disable");
                $(".view-group").addClass("btn-disable");
            } else {    //删除分组
                deleteGroupRight = false;
                $(".delete-group").addClass("btn-disable");
            }
        }
    });
    
    $(".menu a:not(.unable)").eq(0).click();
}
function deleteGroup(homeid) {
    var groupid = $(".group-list .selected a").attr("groupid");
    console.log(groupid)
    console.log('homeid is %d',homeid)
    top.ajaxReqAction(function(data){
        if(data.ret == 0){
            $.alert({msg:'删除成功',img:'img/info.png'});

            setTimeout(function(){
                showHomeList(groupid);
            },1000);
        }
    },function(data){
        $.alert({msg:'删除失败',img:'img/info.png'});
    },
    '/terminalgroup/delete_member',
    {accesstoken:top.accesstoken,groupid:groupid,memberid:homeid,membertype:1});    
}
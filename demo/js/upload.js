var uploadUrl = "";

var Upload = {
    init: function() {
        $('#uploadFile').uploadfive({
            uploader: uploadUrl,
            queueID: "queue",
            multi: false, //设置值为false时，一次只能选中一个文件。
            method: "post",
            fileTypeExts: "*.csv,*.xls,*.xlsx",
            processData: "speed",
            fileObjName: "uploadfile",
            removeCompleted: false, //当上传完成（不管成功还是失败）时上传进度条消失。
            removeCancelled: true, //当取消上传时上传进度条消失。
            checkExisting: false,
            dataType: "json",
            removeCancelled: true,
            formData: {}, //定义在文件上传时需要一同提交的其他数据对象。
            height: 25,
            auto: false, //设置为true时会在文件上传时自动上传到服务器。
            onSelect: function(file) { //每添加一个文件至上传队列时触发该事件。
                console.log("onSelect-----------");
            },
            //当文件上传开始前调用
            onUploadStart: function(file) {
                console.log('上传开始');
                var accesstoken = Upload.getParam('token');
                var groupid = Upload.getParam('groupid');
                var uploadUrl = "http://192.168.36.103:11933/addUserToGroup?accesstoken=" + accesstoken + "&groupid=" + groupid;
                $('#uploadFile').uploadfive('settings', 'uploader', uploadUrl);
            },
            //uploadfive对象初始化成功后调用
            onInit: function(instance) {
                console.log("onInit-----------");
            },
            //5.文件上传过程中调用
            onUploadProgress: function(file, loaded, total, queueLoaded, queueSize) {
                console.log("onUploadProgress-----------");
            },
            onQueueComplete: function(queueData) {
                console.log("onQueueComplete-----------");
            },
            onUploadError: function(file) {
                $(this).find("input").val("");
            },
            onUploadSuccess: function(file, data) {

                $('#total').html(data.total)
                $('#success').html(data.succnumber);
                $('#fail').html(data.faildata.failnumber);
                
                var arr = [];
                $(data.faildata.failgather).each(function(index, value) {
                    var dom = '<li>' +
                        '<span>' + value.ca_id + '</span>' +
                        '<span>' + Upload.translate(value.home_id) + '</span>' +
                        '<span>' + Upload.translate(value.failreason) + '</span>' +
                        '</li>';
                    arr.push(dom);
                });

                
                if (arr.length !== 0) {
                    $('#result').show();
                    $('#resultList').show();
                    var height = arr.length * 25 + 120,
                        wHeight = $(top.window).height();

                    if (height + 120 > wHeight) {
                        top.$('.layer-box-content-inner').height(wHeight - 120  + 'px');
                    } else {
                        top.$('.layer-box-content-inner').height(height+ 'px');
                    }
                }else{
                    $('#result').show();
                }
                $('#errorList').append(arr.join(''));
                top.$('#sure').attr('title', '完成').html('完成').click(function() {
                    top.$('#cancel').trigger('click');
                });

            },
            onClearQueue: function(total) {
                console.log(total);
            },
            onCancel: function(file) {
                $(this).find("input").val("");
            }
        });
    },
    submit: function(callback) {
        $('#uploadFile').uploadfive('upload');
        
        setTimeout(function() {
            callback();
        }, 1500);
    },
    getParam: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
            r = window.location.search.substr(1).match(reg);

        return (r != null) ? unescape(r[2]) : null;
    },
    translate: function(reason) {

        if (reason == 'home_not_found') {
            return '家庭未找到';
        } else if (reason == 'add_home_repeat') {
            return '重复添加';
        } else if (reason == 'not_found_home_id') {
            return 'homeid未找到';
        }else if (reason == 0) {
            return '未知';
        }else{
            return reason;
        }
    }
}

window.Upload = Upload;

Upload.init();

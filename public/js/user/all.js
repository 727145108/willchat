var Base = function ($) {
    // ajax 提交表单
    var initAjaxForm = function () {
        // 表单默认以AJAX提交并提示处理结果，提升用户体验，如果不要AJAX提交则在form添加no-ajax类
        $("form").not('.validate').submit(function (event) {
            var url = $(this).attr('action');
            var submitData = $(this).serialize();
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: submitData,
            }).done(function (data, textStatus, jqXHR) {
                var formItem = $('form');
                // 清除旧的错误提示
                formItem.find('.alert').remove();
                this.success(data.info);
                if (data.url) {
                    setTimeout(function () {
                        top.location.href = data.url
                    }, 2000);
                } else {
                    setTimeout(function () {
                        top.location.reload()
                    }, 2000);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                var errors = jqXHR.responseJSON;
                var formItem = $('form');
                // 清除旧的错误提示
                formItem.find('.alert').remove();
                $.each(errors, function (index, val) {
                    var errorMsg = val[0];
                    var errorAlert = $("<div class=\"alert alert-danger alert-dismissable\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\"></button><strong>验证错误!</strong> " + errorMsg + " </div>");
                    formItem.prepend(errorAlert);
                });
            }).always(function () {
                console.log("complete");
            });
            return false;
        });
    };

    //图片弹出预览
    var initImgpreview = function () {
        $('img.preview-small,.thumbnail img').click(function (event) {
            event.preventDefault();

            var imgSrc = $(this).attr('src');
            var imgItem = "<img src='" + imgSrc + "' height='300'/>";
            top.layer.open({
                type: 1,
                title: false,
                fix: false,
                shadeClose: true,
                offset: ['150px', ''],
                area: ['auto', 'auto'],
                content: imgItem
            });
        });
    };

    // table 行全选
    var initCheckAll = function () {
        //全选的实现
        $(".group-checkable").click(function () {
            $(".ids").prop("checked", this.checked);
            $('.group-checkable,.ids').uniform()
        });
        $(".ids").click(function () {
            var option = $(".ids");
            option.each(function (i) {
                if (!this.checked) {
                    $(".group-checkable").prop("checked", false);
                    $('.group-checkable,.ids').uniform()
                    return false;
                } else {
                    $(".group-checkable").prop("checked", true);
                    $('.group-checkable,.ids').uniform()
                }
            });
        });
    };

    // ajax get请求
    $('.ajax-get').click(function () {
        var target;
        var that = this;
        if ($(this).hasClass('confirm')) {
            if (!confirm('确认要执行该操作吗?')) {
                return false;
            }
        }
        if ((target = $(this).attr('href')) || (target = $(this).attr('url'))) {
            $.get(target).success(function (data) {
                if (data.status == 1) {
                    if (data.url) {
                        this.success(data.info + ' 页面即将自动跳转~');
                    } else {
                        this.success(data.info);
                    }
                    setTimeout(function () {
                        if (data.url) {
                            location.href = data.url;
                        } else {
                            location.reload();
                        }
                    }, 1500);
                } else {
                    this.error(data.info);
                    setTimeout(function () {
                        if (data.url) {
                            location.href = data.url;
                        }
                    }, 1500);
                }
            });
        }
        return false;
    });

    // ajax post submit请求
    $('.ajax-post').click(function () {
        var target, query, form;
        var target_form = $(this).attr('target-form');
        var that = this;
        var nead_confirm = false;
        if (($(this).attr('type') == 'submit') || (target = $(this).attr('href')) || (target = $(this).attr('url'))) {
            form = $('.' + target_form);
            if ($(this).attr('hide-data') === 'true') { //无数据时也可以使用的功能
                form = $('.hide-data');
                query = form.serialize();
            } else if (form.get(0) == undefined) {
                return false;
            } else if (form.get(0).nodeName == 'FORM') {
                if ($(this).hasClass('confirm')) {
                    if (!confirm('确认要执行该操作吗?')) {
                        return false;
                    }
                }
                if ($(this).attr('url') !== undefined) {
                    target = $(this).attr('url');
                } else {
                    target = form.get(0).action;
                }
                query = form.serialize();
            } else if (form.get(0).nodeName == 'INPUT' || form.get(0).nodeName == 'SELECT' || form.get(0).nodeName == 'TEXTAREA') {
                form.each(function (k, v) {
                    if (v.type == 'checkbox' && v.checked == true) {
                        nead_confirm = true;
                    }
                });
                if (nead_confirm && $(this).hasClass('confirm')) {
                    if (!confirm('确认要执行该操作吗?')) {
                        return false;
                    }
                }
                query = form.serialize();
            } else {
                if ($(this).hasClass('confirm')) {
                    if (!confirm('确认要执行该操作吗?')) {
                        return false;
                    }
                }
                query = form.find('input,select,textarea').serialize();
            }
            $(that).addClass('disabled').attr('autocomplete', 'off').prop('disabled', true);
            $.post(target, query).success(function (data) {
                if (data.status == 1) {
                    if (data.url) {
                        this.success(data.info + ' 页面即将自动跳转~');
                    } else {
                        this.success(data.info);
                    }
                    setTimeout(function () {
                        $(that).removeClass('disabled').prop('disabled', false);
                        if (data.url) {
                            location.href = data.url;
                        } else {
                            location.reload();
                        }
                    }, 1500);
                } else {
                    this.error(data.info);
                    setTimeout(function () {
                        $(that).removeClass('disabled').prop('disabled', false);
                        if (data.url) {
                            location.href = data.url;
                        }
                    }, 1500);
                }
            });
        }
        return false;
    });

    // 侧栏高亮,rewrite URL模式匹配
    var highlightSidebar = function () {
        //侧栏菜单中的全部有链接菜单项
        var sidebarLinks = $(".sidebar-menu").find('.treeview a');

        if (sidebarLinks.length > 0) {
            //当前页面URL
            var url = document.URL;

            var activeMenuItem = $(".sidebar-menu .treeview").find("a[href='" + url + "']").first();

            if (activeMenuItem) {
                //保存当前高亮菜单项 index 到 cookie 中
                var menuIndex = sidebarLinks.index(activeMenuItem);

                activeMenuItem.parents(".treeview").addClass("active");
                activeMenuItem.parent('li').addClass("active");

                Cookies.set('menuindex', menuIndex);
            } else {
                //侧栏中没有与当前 URL 匹配的，则高亮上一次高亮的项
                var menuIndex = Cookies.get('menuindex');

                activeMenuItem = sidebarLinks.eq(menuIndex);

                activeMenuItem.parents(".treeview").addClass("active");
                activeMenuItem.parent('li').addClass("active");
            }
        }
    };

    // 上传文件对话框
    var initUploadfile = function () {
        $('.btn-uploadfile').on('click', function () {
            var triggerItem=$(this); //触发弹出层的元素
            var data=triggerItem.data();
            top.dialog({
                id: 'dialog-uplpadfile',
                title: '上传文件',
                fixed:true,
                quickClose: true,
                padding: 10,
                data: data,
                zIndex: 99999,
                url: "{:U('User/Dialog/uploadfile',array('token'=>$token))}",
                okValue: '确定',
                cancelValue: '取消',
                ok: function() {
                    if (this.data.filepath) {
                        var picControl=triggerItem.parents('.pic-control');
                        //更新输入框值
                        picControl.find("input.pic-path").val(this.data.filepath);
                        //更新预览图片
                        picControl.find("img").attr("src", "__ROOT__"+this.data.filepath);
                    };
                    this.close().remove();
                },
                cancel: function() {
                }
            })
                .show();
            return false;
        });
    };

    var initPopupDialog = function () {
        // 弹出编辑框
        $('.popup').on('click', function () {
            var triggerItem = $(this); //触发弹出层的元素
            var data = triggerItem.data();
            var url = $(this).attr('href');
            var area = ['500px', '350px'];
            //不同尺寸弹出窗
            if($(this).hasClass('popup-large')){
                area = ['750px', '500px'];
            }else if($(this).hasClass('popup-mediun')){
                area = ['500px', '350px'];
            }else if($(this).hasClass('popup-small')){
                area = ['350px', '200px'];
            }
            top.layer.open({
                title: ' ',
                type: 2,
                shift: 2,
                fixed: true,
                area: area,
                shadeClose: false, //开启遮罩关闭
                content: url,
                duccess: function(){
                    console.log();
                }
            });
            return false;
        });
    };

    // 操作成功提示
    var success = function (msg) {
        top.layer.msg(msg, {
            icon: 1
        });
    };

    // 操作失败提示
    var error = function (msg) {
        top.layer.msg(msg, {
            icon: 2,
            shift: 6
        });
    };

    // 一般提示
    var info = function (msg) {
        top.layer.msg(msg);
    };

    // 操作确认弹窗
    var confirm = function (msg, callback) {
        top.layer.confirm(msg, {icon: 3, title: '操作提示'}, function (index) {
            callback();
            top.layer.close(index);
        });
    };

    // 显示 loading 提示层
    var showLoading = function () {
        this.loadingIndex = top.layer.load();
    };

    // 隐藏 loading 提示层
    var hideLoading = function () {
        top.layer.close(this.loadingIndex);
    };

    // 主页左侧栏菜单自动高亮
    var highlightProfileSidebar = function () {
        var navItem = $('#dashboard-sidebar').find('.list-group');

        if (navItem.size() <= 0) {
            return;
        }

        var highligntSidemenu = function (index) {
            navItem.children('.list-group-item').eq(index).addClass('active').siblings().removeClass('active');
        };

        var pathname = window.location.pathname;

        if (pathname.match(/user\/(profile|avatar)/)) {
            highligntSidemenu(1);
        } else if (pathname.match(/user\/document/)) {
            highligntSidemenu(2);
        } else {
            highligntSidemenu(0);
        }
    };

    return {
        initNormalPage: function () {
            initAjaxForm();
            initImgpreview();
            initCheckAll();
            highlightSidebar();
            highlightProfileSidebar();
            initPopupDialog();
            initUploadfile();
        },
        initDialogPage: function () {
            initAjaxForm();
            initCheckAll();
        },
        success: success,
        error: error,
        info: info,
        confirm: confirm,
        showLoading: showLoading,
        hideLoading: hideLoading
    }
}(jQuery);

jQuery(document).ready(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    $(document).ajaxStart(function () {
        Base.showLoading();
    }).ajaxStop(function () {
        Base.hideLoading();
    });
});
var Login = function() {

    var handleLogin = function() {

        $('.login-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                },
                remember: {
                    required: false
                }
            },

            messages: {
                username: {
                    required: "请输入用户名."
                },
                password: {
                    required: "请输入密码."
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit   
                $('.alert-danger', $('.login-form')).show();
            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                error.insertAfter(element.closest('.input-icon'));
            },

            submitHandler: function(form) {
                var _form = $(form);
                var url = _form.attr('action');
                var formData = _form.serialize();
                $.post(url, formData, function(data, textStatus, xhr) {
                    if (data.status) {
                        location.href = data.url;
                    } else{
                        //登录失败则进行提示
                        _form.find('.alert-danger span').html(data.info);
                        _form.find('.alert-danger').show();

                        //密码输入框置空
                        _form.find("input[name='password']").val('');
                    };
                });
                return false;
            }
        });

        $('.login-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('.login-form').validate().form()) {
                    $('.login-form').submit(); //form validation success, call ajax form submit
                }
                return false;
            }
        });
    }

    var handleForgetPassword = function() {
        $('.forget-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                email: {
                    required: true,
                    email: true
                }
            },

            messages: {
                email: {
                    required: "请输入邮箱地址."
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit   

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                error.insertAfter(element.closest('.input-icon'));
            },

            submitHandler: function(form) {
                form.submit();
            }
        });

        $('.forget-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('.forget-form').validate().form()) {
                    $('.forget-form').submit();
                }
                return false;
            }
        });

        jQuery('#forget-password').click(function() {
            jQuery('.login-form').hide();
            jQuery('.forget-form').show();
        });

        jQuery('#back-btn').click(function() {
            jQuery('.login-form').show();
            jQuery('.forget-form').hide();
        });

    }

    var handleRegister = function() {

        function format(state) {
            if (!state.id) return state.text; // optgroup
            return "<img class='flag' src='../../assets/global/img/flags/" + state.id.toLowerCase() + ".png'/>&nbsp;&nbsp;" + state.text;
        }

        if (jQuery().select2) {
            $("#select2_sample4").select2({
                placeholder: '<i class="fa fa-map-marker"></i>&nbsp;Select a Country',
                allowClear: true,
                formatResult: format,
                formatSelection: format,
                escapeMarkup: function(m) {
                    return m;
                }
            });


            $('#select2_sample4').change(function() {
                $('.register-form').validate().element($(this)); //revalidate the chosen dropdown value and show error or success message for the input
            });
        }

        $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                email: {
                    required: true,
                    email: true
                },
                username: {
                    required: true
                },
                password: {
                    required: true
                },
                rpassword: {
                    equalTo: "#register_password"
                },
                tnc: {
                    required: true
                }
            },

            messages: { // custom messages for radio buttons and checkboxes
                tnc: {
                    required: "你必须同意《注册协议》."
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit   

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                if (element.attr("name") == "tnc") { // insert checkbox errors after the container                  
                    error.insertAfter($('#register_tnc_error'));
                } else if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });

        $('.register-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('.register-form').validate().form()) {
                    $('.register-form').submit();
                }
                return false;
            }
        });

        jQuery('#register-btn').click(function() {
            jQuery('.login-form').hide();
            jQuery('.register-form').show();
        });

        jQuery('#register-back-btn').click(function() {
            jQuery('.login-form').show();
            jQuery('.register-form').hide();
        });
    }

    return {
        //main function to initiate the module
        init: function() {
            handleLogin();
            handleForgetPassword();
            handleRegister();
        }
    };
}();
//# sourceMappingURL=all.js.map

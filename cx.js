// ==UserScript==
// @name         超星网课助手/刷课/搜题（支持图片）/考试/all in one(fake题)
// @namespace    lyj
// @version      3.2.8
// @description  考试版已经合并，自动答题，视频自动完成，章节测验自动答题提交，自动切换任务点等，开放自定义参数
// @author       lyj
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @connect      ti.fakev.cn
// @connect      baidu.com
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/2.0.0/jquery.js
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @original-script https://greasyfork.org/scripts/369625
// @original-author wyn665817
// @original-license MIT
// @antifeature tracking
// ==/UserScript==


var _hmt = _hmt || [];

(function() {
var hm = document.createElement("script");
hm.src = "https://hm.baidu.com/hm.js?c2daa8e62b938a0869a122a0d6da4e9a";
var s = document.getElementsByTagName("script")[0];
s.parentNode.insertBefore(hm, s);
})();


function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const api_array = [
  "http://ti.fakev.cn/hashTopic?question=",
];

// 设置修改后，需要刷新或重新打开网课页面才会生效
var setting = {
    api: getRandomInteger(0, api_array.length), // 答题接口编号，参考上方，默认随机
    // 5E3 == 5000，科学记数法，表示毫秒数
    time:4e3, // 默认响应速度为5秒，不建议小于3秒
    review: 0, // 复习模式，完整挂机视频(音频)时长，支持挂机任务点已完成的视频和音频，默认关闭
    queue: 1, // 队列模式，开启后任务点逐一完成，关闭则单页面所有任务点同时进行，默认开启
    submit: 1, //答案收录，开启后可在作业完成界面自动收录题目，默认开启

    // 1代表开启，0代表关闭
    video: 1, // 视频支持后台、切换窗口不暂停，支持多视频，默认开启
    work: 1, // 自动答题功能(章节测验)，作业需要手动开启查询，高准确率，默认开启
    audio: 1, // 音频自动播放，与视频功能共享vol和rate参数，默认开启
    book: 1, // 图书阅读任务点，非课程阅读任务点，默认开启
    docs: 1, // 文档阅读任务点，PPT类任务点自动完成阅读任务，默认开启
    // 本区域参数，上方为任务点功能，下方为独立功能
    jump: 1, // 自动切换任务点、章节、课程(需要配置course参数)，默认开启
    read: "65", // 挂机课程阅读时间，单位是分钟，'65'代表挂机65分钟，请手动打开阅读页面，默认'65'分钟
    face: 0, // 解除面部识别(不支持二维码类面部采集)，此功能仅为临时解除，默认关闭
    total: 1, // 显示课程进度的统计数据，在学习进度页面的上方展示，默认开启
    copy: 0, // 自动复制答案到剪贴板，也可以通过手动点击按钮或答案进行复制，默认关闭
    hide: 0, // 不加载答案搜索提示框，键盘↑和↓可以临时移除和加载，默认关闭

    // 仅开启video(audio)时，修改此处才会生效
    line: "公网1", // 视频播放的默认资源线路，此功能适用于系统默认线路无资源，默认'公网1'
    http: "标清", // 视频播放的默认清晰度，无效参数则使用系统默认清晰度，默认'标清'
    // 本区域参数，上方为video功能独享，下方为audio功能共享
    vol: "0", // 默认音量的百分数，设定范围：[0,100]，'0'为静音，默认'0'
    rate: "1", // 视频播放默认倍率，参数范围0∪[0.0625,16]，'0'为秒过，默认'1'倍

    // 仅开启work时，修改此处才会生效
    auto: 1, // 答题完成后自动提交，默认打开
    none: 0, // 无匹配答案时执行默认操作，关闭后若题目无匹配答案则会暂时保存已作答的题目，默认关闭
    scale: 0, // 富文本编辑器高度自动拉伸，用于文本类题目，答题框根据内容自动调整大小，默认关闭

    // 仅开启jump时，修改此处才会生效
    course: 0, // 当前课程完成后自动切换课程，仅支持按照根目录课程顺序切换，默认关闭
    lock: 1, // 跳过未开放(图标是锁)的章节，即闯关模式或定时发放的任务点，默认开启


    //验证配置区
    ischeck: 0, //是否检测完毕，可手动更改为1避免全部检测(如果改为1可能会不能使用)
  },
  _self = unsafeWindow,
  url = location.pathname,
  top = _self;


var currentURL = window.location.pathname; // 获取当前网页地址
if (currentURL.slice(0,32) == "/exam/test/reVersionTestStartNew"){

_self = unsafeWindow,
$ = _self.jQuery,
UE = _self.UE;

String.prototype.toCDB = function() {
    return this.replace(/\s/g, '').replace(/[\uff01-\uff5e]/g, function(str) {
        return String.fromCharCode(str.charCodeAt(0) - 65248);
    }).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/。/g, '.');
};

setting.TiMu = [
    filterImg('.Cy_TItle .clearfix').replace(/\s*（\d+\.\d+分）$/, '').replace("题型说明：请输入题型说明",'').replace(/\s*/g,""),
    $('[name^=type]:not([id])').val() || '-1',
    $('.cur a').text().trim() || '无',
    $('li .clearfix').map(function() {
        return filterImg(this);
    })
];

setting.div = $(
    '<div style="border: 2px dashed rgb(0, 85, 68); width: 330px; position: fixed; top: 0; right: 0; z-index: 99999; background-color: rgba(70, 196, 38, 0.6); overflow-x: auto;">' +
        '<span style="font-size: medium;"></span>' +
        '<div style="font-size: medium;">正在搜索答案...</div>' +
        '<button style="margin-right: 10px;">暂停答题</button>' +
        '<button style="margin-right: 10px;' + (setting.jump ? '' : ' display: none;') + '">点击停止本次切换</button>' +
        '<button style="margin-right: 10px;">重新查询</button>' +
        '<button>答题详情</button>' +
        '<div style="max-height: 200px; overflow-y: auto;">' +
            '<table border="1" style="font-size: 12px;">' +
                '<thead>' +
                    '<tr>' +
                        '<th colspan="2">' + ($('#randomOptions').val() == 'false' ? '' : '<font color="red">本次考试的选项为乱序 脚本会选择正确的选项</font>') + '</th>' +
                    '</tr>' +
                    '<tr>' +
                        '<th style="width: 60%; min-width: 130px;">题目（点击可复制）</th>' +
                        '<th style="min-width: 130px;">答案（点击可复制）</th>' +
                    '</tr>' +
                '</thead>' +
                '<tfoot style="' + (setting.jump ? ' display: none;' : '') + '">' +
                    '<tr>' +
                        '<th colspan="2">已关闭 本次自动切换</th>' +
                    '</tr>' +
                '</tfoot>' +
                '<tbody>' +
                    '<tr>' +
                        '<td colspan="2" style="display: none;"></td>' +
                    '</tr>' +
                '</tbody>' +
            '</table>' +
        '</div>' +
    '</div>'
).appendTo('body').on('click', 'button, td', function() {
    var num = setting.$btn.index(this);
    if (num == -1) {
        GM_setClipboard($(this).text());
    } else if (num === 0) {
        if (setting.loop) {
            clearInterval(setting.loop);
            delete setting.loop;
            num = ['已暂停搜索', '继续答题'];
        } else {
            setting.loop = setInterval(findTiMu, 2E3);
            num = ['正在搜索答案...', '暂停答题'];
        }
        setting.$div.html(function() {
            return $(this).data('html') || num[0];
        }).removeData('html');
        $(this).html(num[1]);
    } else if (num == 1) {
        setting.jump = 0;
        setting.$div.html(function() {
            return arguments[1].replace('即将切换下一题', '未开启自动切换');
        });
        setting.div.find('tfoot').add(this).toggle();
    } else if (num == 2) {
        location.reload();
    } else if (num == 3) {
        GM_setClipboard(setting.div.find('td:last').text());
    } else if (num == 4) {
        ($('.leftCard .saveYl')[0] || $()).click();
    }
}).detach(setting.hide ? '*' : 'html');
setting.$btn = setting.div.children('button');
setting.$div = setting.div.children('div:eq(0)');

$(document).keydown(function(event) {
    if (event.keyCode == 38) {
        setting.div.detach();
    } else if (event.keyCode == 40) {
        setting.div.appendTo('body');
    }
});

if (setting.scale) _self.UEDITOR_CONFIG.scaleEnabled = false;
$.each(UE.instants, function() {
    var key = this.key;
    this.ready(function() {
        this.destroy();
        UE.getEditor(key);
    });
});
setting.loop = setInterval(findTiMu, 2E3);

function findTiMu() {
    GM_xmlhttpRequest({
        method: 'GET',
        url:api_array[setting.api] + encodeURIComponent(setting.TiMu[0]) + '&type=' + setting.TiMu[1],
        headers: {
            'Authorization': setting.token,
        },
        timeout: setting.time,
        onload: function(xhr) {
            if (!setting.loop) {
            } else if (xhr.status == 200) {
                var obj = $.parseJSON(xhr.responseText) || {};
                if (obj.code) {
                    var data = String(obj.data).replace(/&/g, '&amp;').replace(/<(?!img)/g, '&lt;'),
                    que = setting.TiMu[0].match('<img') ? setting.TiMu[0] : setting.TiMu[0].replace(/&/g, '&amp;').replace(/</g, '&lt').replace("题型说明：请输入题型说明",'').replace(/\s*/g,"");
                    obj.data = /^http/.test(data) ? '<img src="' + obj.data + '">' : obj.data;
                    setting.div.find('tbody').append(
                        '<tr>' +
                            '<td title="点击可复制">' + que + '</td>' +
                            '<td title="点击可复制">' + (/^http/.test(data) ? obj.data : '') + data + '</td>' +
                        '</tr>'
                    );
                    setting.copy && GM_setClipboard(obj.data);
                    setting.$btn.eq(3).show();
                    fillAnswer(obj);
                } else {
                    setting.$div.html(obj.data || '服务器繁忙，正在重试...');
                }
                setting.div.children('span').html(obj.msg || '');
            } else if (xhr.status == 403) {
                var html = xhr.responseText.indexOf('{') ? '请求过于频繁，建议稍后再试' : $.parseJSON(xhr.responseText).data;
                setting.$div.data('html', html).siblings('button:eq(0)').click();
            } else {
                setting.$div.text('服务器异常，正在重试...');
            }
        },
        ontimeout: function() {
            setting.loop && setting.$div.text('服务器超时，正在重试...');
        }
    });
}

function fillAnswer(obj, tip) {
    var $input = $(':radio, :checkbox', '.Cy_ulBottom'),
    str = String(obj.data).toCDB() || new Date().toString(),
    data = str.split(/#|\x01|\|/),
    opt = obj.opt || str,
    btn = $('.saveYl:contains(下一题)').offset();
    // $input.filter(':radio:checked').prop('checked', false);
    obj.code > 0 && $input.each(function(index) {
        if (this.value == 'true') {
            data.join().match(/(^|,)(正确|是|对|√|T|ri)(,|$)/) && this.click();
        } else if (this.value == 'false') {
            data.join().match(/(^|,)(错误|否|错|×|F|wr)(,|$)/) && this.click();
        } else {
            index = setting.TiMu[3][index].toCDB() || new Date().toString();
            index = $.inArray(index, data) + 1 || (setting.TiMu[1] == '1' && str.indexOf(index) + 1);
            Boolean(index) == this.checked || this.click();
        }
    }).each(function() {
        if (!/^A?B?C?D?E?F?G?$/.test(opt)) return false;
        Boolean(opt.match(this.value)) == this.checked || this.click();
    });
    if (setting.TiMu[1].match(/^[013]$/)) {
        tip = $input.is(':checked') || setting.none && (($input[Math.floor(Math.random() * $input.length)] || $()).click(), ' ');
    } else if (setting.TiMu[1].match(/^(2|[4-9]|1[08])$/)) {
        data = String(obj.data).split(/#|\x01|\|/);
        tip = $('.Cy_ulTk textarea').each(function(index) {
            index = (obj.code > 0 && data[index]) || '';
            UE.getEditor(this.name).setContent(index.trim());
        }).length;
        tip = (obj.code > 0 && data.length == tip) || setting.none && ' ';
        setting.len = str.length * setting.time / 10;
    }
    if (tip == ' ') {
        tip = '已执行默认操作';
    } else if (tip) {
        tip = '自动答题已完成';
    } else if (tip === undefined) {
        tip = '该题型不支持自动答题';
    } else {
        tip = '未找到有效答案';
    }
    if (btn) {
        tip += setting.jump ? '，即将切换下一题' : '，未开启自动切换';
        setInterval(function() {
            if (!setting.jump) return;
            var mouse = document.createEvent('MouseEvents'),
            arr = [btn.left + Math.ceil(Math.random() * 80), btn.top + Math.ceil(Math.random() * 26)];
            mouse.initMouseEvent('click', true, true, document.defaultView, 0, 0, 0, arr[0], arr[1], false, false, false, false, 0, null);
            _self.event = $.extend(true, {}, mouse);
            delete _self.event.isTrusted;
            _self.getTheNextQuestion(1);
        }, setting.len || Math.ceil(setting.time * Math.random()) * 2);
    } else {
        setting.$btn.eq(1).hide();
        tip = '答题已完成，请自行查看答题详情';
    }
    setting.$div.data('html', tip).siblings('button:eq(0)').hide().click();
}

function filterImg(dom) {
    return $(dom).clone().find('img[src]').replaceWith(function() {
        return $('<p></p>').text('<img src="' + $(this).attr('src') + '">');
    }).end().find('iframe[src]').replaceWith(function() {
        return $('<p></p>').text('<iframe src="' + $(this).attr('src') + '"></irame>');
    }).end().text().trim();
}
    return
}


if (url != "/studyApp/studying" && top != _self.top)
  document.domain = location.host.replace(/.+?\./, "");
try{
 backToOld()
}catch{
}
let tmpSubmit = 1;//本次
Object.defineProperty(setting, "auto", {
get: function () {
    console.log(GM_getValue("autosubmit"))
    if (tmpSubmit >= 2) {
        return tmpSubmit === 3;
    }
    return GM_getValue("autosubmit");
}, set: function (value) {
    tmpSubmit = value + 2;
}
});


try {
  while (top != _self.top) {
    top = top.parent.document ? top.parent : _self.top;
    if (top.location.pathname == "/mycourse/studentstudy") break;
  }
} catch (err) {
  // console.log(err);
  top = _self;
}




var $ = _self.jQuery || top.jQuery,
  parent = _self == top ? self : _self.parent,
  Ext = _self.Ext || parent.Ext || {},
  UE = _self.UE,
  vjs = _self.videojs;


//console.log("vjs",vjs)


String.prototype.toCDB = function () {
  return this.replace(/\s/g, "")
    .replace(/[\uff01-\uff5e]/g, function (str) {
      return String.fromCharCode(str.charCodeAt(0) - 65248);
    })
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/。/g, ".");
};

setting.normal = ""; // ':visible'
// setting.time += Math.ceil(setting.time * Math.random()) - setting.time / 2;
setting.job = [":not(*)"];

setting.video && setting.job.push('iframe[src*="/video/index.html"]');
setting.work && setting.job.push('iframe[src*="/work/index.html"]');
setting.audio && setting.job.push('iframe[src*="/audio/index.html"]');
setting.book && setting.job.push('iframe[src*="/innerbook/index.html"]');
setting.docs &&
  setting.job.push(
    'iframe[src*="/ppt/index.html"]',
    'iframe[src*="/pdf/index.html"]'
  );

setting.tip = !setting.queue || (top != _self && jobSort($ || Ext.query));

if (url == "/mycourse/studentstudy") {
  _self.checkMobileBrowerLearn = $.noop;
  var classId = location.search.match(/cla[zs]{2}id=(\d+)/i)[1] || 0,
    courseId =
      _self.courseId || location.search.match(/courseId=(\d+)/i)[1] || 0;
  setting.lock ||
    $("#coursetree").on("click", "[onclick*=void], [href*=void]", function () {
      _self.getTeacherAjax(
        courseId,
        classId,
        $(this).parent().attr("id").slice(3)
      );
    });
} else if (url == "/ananas/modules/video/index.html" && setting.video) {
  if (setting.review) _self.greenligth = Ext.emptyFn;
  checkPlayer(_self.supportH5Video());
} else if (
  url == "/work/doHomeWorkNew" ||
  url == "/api/work" ||
  url == "/work/addStudentWorkNewWeb"
) {
  if (!UE) {
    var len = ($ || Ext.query || Array)("font:contains(未登录)", document)
      .length;
    setTimeout(
      len == 1 ? top.location.reload : parent.greenligth,
      setting.time
    );
  } else if (setting.work) {
    setTimeout(relieveLimit, 0);
    beforeFind();
  }
} else if (url == "/ananas/modules/audio/index.html" && setting.audio) {
  if (setting.review) _self.greenligth = Ext.emptyFn;
  _self.videojs = hookAudio;
  hookAudio.xhr = vjs.xhr;
} else if (
  url == "/ananas/modules/innerbook/index.html" &&
  setting.book &&
  setting.tip
) {
  setTimeout(function () {
    _self.setting
      ? _self.top.onchangepage(_self.getFrameAttr("end"))
      : _self.greenligth();
  }, setting.time);
} else if (
  url.match(/^\/ananas\/modules\/(ppt|pdf)\/index\.html$/) &&
  setting.docs &&
  setting.tip
) {
  setTimeout(function () {
    _self.setting ? _self.finishJob() : _self.greenligth();
  }, setting.time);
  frameElement.setAttribute("download", 1);
} else if (url == "/knowledge/cards") {
  $ && checkToNext();
} else if (url.match(/^\/(course|zt)\/\d+\.html$/)) {
  setTimeout(function () {
    +setting.read &&
      _self.sendLogs &&
      $(".course_section:eq(0) .chapterText").click();
  }, setting.time);
} else if (url == "/ztnodedetailcontroller/visitnodedetail") {
  setting.read *= 60 / $(".course_section").length;
    //console.log(setting.read)
  setting.read && _self.sendLogs && autoRead();
} else if (url == "/mycourse/studentcourse") {
  var gv = location.search.match(/d=\d+&/g);
  setting.total &&
    $("<a>", {
      href:
        "/moocAnalysis/chapterStatisticByUser?classI" +
        gv[1] +
        "courseI" +
        gv[0] +
        "userId=" +
        _self.getCookie("_uid") +
        "&ut=s",
      target: "_blank",
      title: "点击查看章节统计",
      style: "margin: 0 25px;",
      html:
        "本课程共" +
        $(".icon").length +
        "节，剩余" +
        $("em:not(.openlock)").length +
        "节未完成",
    })
      .appendTo(".zt_logo")
      .parent()
      .width("auto");
} else if (url.match(/^\/visit\/(courses|interaction)$/)) {
  setting.face &&
    $(".zmodel").on("click", "[onclick^=openFaceTip]", DisplayURL);
}  else if (location.hostname == "i.mooc.chaoxing.com") {
    if(setting.ischeck==0){
        opencheckGUI();
    }

} else if (url == "/widget/pcvote/goStudentVotePage") {
  $(":checked").click();
  $(".StudentTimu").each(function (index) {
    var ans = _self.questionlist[index].answer;
    $(":radio, :checkbox", this).each(function (num) {
      ans[num].isanswer && this.click();
    });
    $(":text", this).val(function (num) {
      return $(ans[num].content).text().trim();
    });
  });
} else if (url == "/work/selectWorkQuestionYiPiYue") {
    if(setting.submit==1){
        dynamicLoadCss("https://cdn.bootcdn.net/ajax/libs/milligram/1.4.1/milligram.min.css");
    }
}
function opencheckGUI(){
             _self.layui.use("layer", function () {
    this.layer.open({
      content: "拖动进度条、倍速播放、秒过会导致不良记录！",
      title: "fake题提醒",
      btn: "验证完毕",
      offset: "t",
      closeBtn: 0,
    });
  });
}
function dynamicLoadCss(url) {
		var head = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		link.type='text/css';
		link.rel = 'stylesheet';
		link.href = url;
		head.appendChild(link);
}
function getIframe(tip, win, job) {
  if (!$)
    return (
      Ext.get(frameElement || [])
        .parent()
        .child(".ans-job-icon") || Ext.get([])
    );
  do {
    win = win ? win.parent : _self;
    job = $(win.frameElement).prevAll(".ans-job-icon");
  } while (!job.length && win.parent.frameElement);
  return tip ? win : job;
}

function jobSort($) {
  var fn = $.fn ? [getIframe(1), "length"] : [self, "dom"],
    sel = setting.job.join(
      ", :not(.ans-job-finished) > .ans-job-icon" + setting.normal + " ~ "
    );
  if ($(sel, fn[0].parent.document)[0] == fn[0].frameElement) return true;
  if (!getIframe()[fn[1]] || getIframe().parent().is(".ans-job-finished"))
    return null;
  setInterval(function () {
    $(sel, fn[0].parent.document)[0] == fn[0].frameElement &&
      fn[0].location.reload();
  }, setting.time);
}

function checkPlayer(tip) {
    //console.log("videojs1", _self.videojs)
  _self.videojs = hookVideo;
  hookVideo.xhr = vjs.xhr;
  Ext.isSogou = Ext.isIos = Ext.isAndroid = false;
  var data = Ext.decode(_self.config("data")) || {};
  delete data.danmaku;
  data.doublespeed = 1;
  frameElement.setAttribute("data", Ext.encode(data));
  if (tip) return;
  _self.supportH5Video = function () {
    return true;
  };
  alert("此浏览器不支持html5播放器，请更换浏览器");
}

function hookVideo() {
  _self.alert = console.log;
            //console.log("hookvideo",arguments[1])
    if (arguments[1]==undefined){
        return vjs.apply(this, arguments)
    }
  var config = arguments[1]
    var line =
      Ext.Array.filter(
        Ext.Array.map(config.playlines, function (value, index) {
          return value.label == setting.line && index;
        }),
        function (value) {
          return Ext.isNumber(value);
        }
      )[0] || 0,
    http = Ext.Array.filter(config.sources, function (value) {
      return value.label == setting.http;
    })[0];
  config.playlines.unshift(config.playlines[line]);
  config.playlines.splice(line + 1, 1);
  config.plugins.videoJsResolutionSwitcher.default = http ? http.res : 360;
  config.plugins.studyControl.enableSwitchWindow = 1;
  config.plugins.timelineObjects.url = "/richvideo/initdatawithviewer?";
  config.plugins.seekBarControl.enableFastForward = 1;
  if (!setting.queue) delete config.plugins.studyControl;
  // config.preload = setting.tip ? 'auto' : 'none';
  var player = vjs.apply(this, arguments),
    a =
      '<a href="https://d0.ananas.chaoxing.com/download/' +
      _self.config("objectid") +
      '" target="_blank">',
    img =
      '<img src="https://d0.ananas.chaoxing.com/download/e363b256c0e9bc5bd8266bf99dd6d6bb" style="margin: 6px 0 0 6px;">';
  player.volume(Math.round(setting.vol) / 100 || 0);
  Ext.get(player.controlBar.addChild("Button").el_).setHTML(
    a + img + "</a>"
  ).dom.title = "下载视频";
  player.on("loadstart", function () {
     vjs("video").off("ratechange")
    setting.tip && this.play().catch(Ext.emptyFn);
    this.playbackRate(
      setting.rate > 16 || setting.rate < 0.0625 ? 1 : setting.rate
    );
  });
  player.one(["loadedmetadata", "firstplay"], function () {
    setting.two = setting.rate === "0" && setting.two < 1;
    setting.two &&
      config.plugins.seekBarControl.sendLog(
        this.children_[0],
        "ended",
        Math.floor(this.cache_.duration)
      );
  });
  player.on("ended", function () {
    Ext.fly(frameElement).parent().addCls("ans-job-finished");
  });
  return player;
}

function hookAudio() {
  _self.alert = console.log;
  var config = arguments[1];
  config.plugins.studyControl.enableSwitchWindow = 1;
  config.plugins.seekBarControl.enableFastForward = 1;
  if (!setting.queue) delete config.plugins.studyControl;
  var player = vjs.apply(this, arguments),
    a =
      '<a href="https://d0.ananas.chaoxing.com/download/' +
      _self.config("objectid") +
      '" target="_blank">',
    img =
      '<img src="https://d0.ananas.chaoxing.com/download/e363b256c0e9bc5bd8266bf99dd6d6bb" style="margin: 6px 0 0 6px;">';
  player.volume(Math.round(setting.vol) / 100 || 0);
  player.playbackRate(
    setting.rate > 16 || setting.rate < 0.0625 ? 1 : setting.rate
  );
  Ext.get(player.controlBar.addChild("Button").el_).setHTML(
    a + img + "</a>"
  ).dom.title = "下载音频";
  player.on("loadeddata", function () {
    setting.tip && this.play().catch(Ext.emptyFn);
  });
  player.one("firstplay", function () {
    setting.rate === "0" &&
      config.plugins.seekBarControl.sendLog(
        this.children_[0],
        "ended",
        Math.floor(this.cache_.duration)
      );
  });
  player.on("ended", function () {
    Ext.fly(frameElement).parent().addCls("ans-job-finished");
  });
  return player;
}

function relieveLimit() {
  if (setting.scale) _self.UEDITOR_CONFIG.scaleEnabled = false;
  $.each(UE.instants, function () {
    var key = this.key;
    this.ready(function () {
      this.destroy();
      UE.getEditor(key);
    });
  });
}

function beforeFind() {
var a = '<div style="display: flex;margin-bottom: 2px"><div style="font-size: medium;"><span>做题中....</span></div><a class="btn btn-light btn-sm" style="opacity: 0.9;margin-left: 50px" href="http://2333.pub" target="view_window">自助搜题</a></div>'
var b = '<div style="display: flex;margin-bottom: 2px"><div style="font-size: medium;"><span>已暂停搜索</span></div><a class="btn btn-light btn-sm" style="opacity: 0.9;margin-left: 50px" href="http://2333.pub" target="view_window">自助搜题</a></div>'
setting.regl = parent.greenligth || $.noop;
if ($.type(parent._data) == 'array') return setting.regl();
setting.div = $(
    '<link rel="stylesheet" type="text/css" href="https://www.layuicdn.com/layui/css/layui.css"/>'+
    '<script>function openImg(src) {layui.use(\'layer\', function () {this.layer.open({type: 1,title: \'查看大图\', skin: \'layui-layer-rim\', area: [\'900x\', \'700px\'], content: \'<img  style="max-width: 800px" src="\'+src+\'" >\'});});}</script>'+
    '<style>.top::-webkit-scrollbar {display: none;}</style>'+
    '<link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/4.3.1/css/bootstrap.min.css">'+
    '<div style="border: 2px solid #F9CDAD;padding: 5px;border-radius: 5px; width: 380px; position: fixed; top: 0; right: 0; z-index: 99999; background-color: rgba(249, 205, 173, 0.35); overflow-x: auto;backdrop-filter: blur(5px);">' +
    '<span style="font-size: medium;"></span>' + a +
    '<div class="btn-group"><button class="btn btn-light btn-sm" style="opacity: 0.9">暂停答题</button>' +
    '<button class="btn btn-light btn-sm" style="opacity: 0.9">' + (setting.auto ? '取消本次自动提交' : '开启本次自动提交') + '</button>' +
    '<button class="btn btn-light btn-sm" style="opacity: 0.9">重新查询</button>' +
    '<button class="btn btn-light btn-sm" style="opacity: 0.9">折叠面板</button></div><br />' +
    '<input id="autosubmit" type="checkbox"' + (setting.auto ? ' checked' : '') + '>自动提交</input>' +
    '<div class="top" style="max-height: 440px; overflow-y: auto;">' +
    '<table border="1" style="font-size: 12px;">' +
    '<thead>' +
    '<tr>' +
    '<th style="width: 25px; min-width: 25px;">题号</th>' +
    '<th style="width: 60%; min-width: 130px;">题目(点击可复制,可滚动)</th>' +
    '<th style="min-width: 130px;">答案（同👈）</th>' +
    '</tr>' +
    '</thead>' +
    '<tfoot style="display: none;">' +
    '<tr>' +
    '<th colspan="3">答案提示框 已折叠</th>' +
    '</tr>' +
    '</tfoot>' +
    '<tbody>' +
    '<tr>' +
    '<td colspan="3" style="display: none;"></td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '</div>'
).appendTo('body').on('click', 'button, td, input', function() {
    var len = $(this).prevAll('button').length;
    if (this.nodeName == 'TD') {
        $(this).prev().length && GM_setClipboard($(this).text());
         alert("复制成功")
    } else if (!$(this).siblings().length) {
        $(this).parent().text('正在搜索答案...');
        setting.num++;
    } else if (len == 0 && this.id != "autosubmit") {
        if (setting.loop) {
            clearInterval(setting.loop);
            delete setting.loop;
            len = ['已暂停搜索', '继续答题'];
        } else {
            setting.loop = setInterval(findAnswer, setting.time);
            len = ['正在搜索答案...', '暂停答题'];
        }
        setting.div.children('div:eq(0)').html(function () {
            return $(this).data('html') || len[0];
        }).removeData('html');
        $(this).html(len[1]);
    } else if (len == 1) {
        setting.auto = !setting.auto;
        $(this).html(setting.auto ? '取消本次自动提交' : '开启本次自动提交');
    } else if (len == 2) {
        parent.location.reload();
    } else if (len == 3) {
        setting.div.find('tbody, tfoot').toggle();
    } else if (this.id == "autosubmit") {
        // 题目自动提交配置
        console.log(this.checked);
        GM_setValue("autosubmit", this.checked);
    }
}).find('table, td, th').css('border', '1px solid').end();
  setting.lose = setting.num = 0;
  setting.data = parent._data = [];
  setting.over = '<button style="margin-right: 10px;">跳过此题</button>';
  setting.curs =
    $("script:contains(courseName)", top.document)
      .text()
      .match(/courseName:\'(.+?)\'|$/)[1] ||
    $("h1").text().trim() ||
    "无";
  setting.loop = setInterval(findAnswer, setting.time);
  var tip = { undefined: "任务点排队中", null: "等待切换中" }[setting.tip];
  tip &&
    setting.div
      .children("div:eq(0)")
      .data("html", tip)
      .siblings("button:eq(0)")
      .click();
}

function findAnswer() {
  if (setting.num >= $(".TiMu").length) {
    var arr = setting.lose
      ? [
          '共有 <font color="red">' +
            setting.lose +
            "</font> 道题目待完善（已深色标注）",
          saveThis,
        ]
      : ["答题已完成", submitThis];
    setting.div
      .children("div:eq(0)")
      .data("html", arr[0])
      .siblings("button:eq(0)")
      .hide()
      .click();
    return setTimeout(arr[1], setting.time);
  }
  var $TiMu = $(".TiMu").eq(setting.num),
    question = filterImg($TiMu.find(".Zy_TItle:eq(0) .clearfix"))
      .replace(/^【.*?】\s*/, "")
      .replace(/\s*（\d+\.\d+分）$/, ""),
    type = $TiMu.find("input[name^=answertype]:eq(0)").val() || "-1";
  GM_xmlhttpRequest({
    method: "GET",
    url: api_array[setting.api] + encodeURIComponent(question),
    timeout: setting.time,
    onload: function (xhr) {
      if (!setting.loop) {
      } else if (xhr.status == 200) {
        let response = xhr.responseText;
        if (response.startsWith("null")) {
          response = response.slice(4);
        }
        var obj = $.parseJSON(response) || {};
        obj.data = obj.data || obj.answer;
        obj.code = obj.hasOwnProperty("code")
          ? obj.code
          : obj.hasOwnProperty("data")
          ? obj.data == ""
            ? 0
            : 1
          : 0;
        if (obj.code) {
          setting.div.children("div:eq(0)").text("正在搜索答案...");
          var td = '<td style="border: 1px solid;',
            data = String(obj.data)
              .replace(/&/g, "&amp;")
              .replace(/<(?!img)/g, "&lt;");
          obj.data = /^http/.test(data)
            ? '<img src="' + obj.data + '">'
            : obj.data;
          $(
            "<tr>" +
              td +
              ' text-align: center;">' +
              $TiMu.find(".Zy_TItle:eq(0) i").text().trim() +
              "</td>" +
              td +
              '" title="点击可复制">' +
              (question.match("<img")
                ? question
                : question.replace(/&/g, "&amp;").replace(/</g, "&lt")) +
              "</td>" +
              td +
              '" title="点击可复制">' +
              (/^http/.test(data) ? obj.data : "") +
              data +
              "</td>" +
              "</tr>"
          )
            .appendTo(setting.div.find("tbody"))
            .css(
              "background-color",
              fillAnswer($TiMu.find("ul:eq(0)").find("li"), obj, type)
                ? ""
                : "rgba(0, 150, 136, 0.6)"
            );
          setting.data[setting.num++] = {
            code: obj.code > 0 ? 1 : 0,
            question: question,
            option: obj.data,
            type: Number(type),
          };
        } else {
          setting.div
            .children("div:eq(0)")
            .html(obj.data || setting.over + "服务器繁忙，正在重试...");
        }
        setting.div.children("span").html(obj.msg || obj || "");
      } else if (xhr.status == 403) {
        var html = xhr.responseText.indexOf("{")
          ? "请求过于频繁，建议稍后再试"
          : $.parseJSON(xhr.responseText).data;
        setting.div
          .children("div:eq(0)")
          .data("html", html)
          .siblings("button:eq(0)")
          .click();
      } else {
        setting.div
          .children("div:eq(0)")
          .html(setting.over + "服务器异常，正在重试...");
      }
    },
    ontimeout: function () {
      setting.loop &&
        setting.div
          .children("div:eq(0)")
          .html(setting.over + "服务器超时，正在重试...");
    },
  });
}

function fillAnswer($li, obj, type) {
  var $input = $li.find(":radio, :checkbox"),
    str = String(obj.data).toCDB() || new Date().toString(),
    data = str.split(/#|\x01|\|/),
    opt = obj.opt || str,
    state = setting.lose;
  // $li.find(':radio:checked').prop('checked', false);
  obj.code > 0 &&
    $input
      .each(function (index) {
        if (this.value == "true") {
          data.join().match(/(^|,)(正确|是|对|√|T|ri|right)(,|$)/) &&
            this.click();
        } else if (this.value == "false") {
          data.join().match(/(^|,)(错误|否|错|×|F|wr|false)(,|$)/) &&
            this.click();
        } else {
          var tip =
            filterImg($li.eq(index).find(".after")).toCDB() ||
            new Date().toString();
          Boolean(
            $.inArray(tip, data) + 1 || (type == "1" && str.indexOf(tip) + 1)
          ) == this.checked || this.click();
        }
      })
      .each(function () {
        if (!/^A?B?C?D?E?F?G?$/.test(opt)) return false;
        Boolean(opt.match(this.value)) == this.checked || this.click();
      });
  if (type.match(/^[013]$/)) {
    $input.is(":checked") ||
      (setting.none
        ? ($input[Math.floor(Math.random() * $input.length)] || $()).click()
        : setting.lose++);
  } else if (type.match(/^(2|[4-9]|1[08])$/)) {
    data = String(obj.data).split(/#|\x01|\|/);
    str = $li
      .end()
      .find("textarea")
      .each(function (index) {
        index = (obj.code > 0 && data[index]) || "";
        UE.getEditor(this.name).setContent(index.trim());
      }).length;
    (obj.code > 0 && data.length == str) || setting.none || setting.lose++;
  } else {
    setting.none || setting.lose++;
  }
  return state == setting.lose;
}

function saveThis() {
  if (!setting.auto) return setTimeout(saveThis, setting.time);
  setting.div.children("button:lt(3)").hide().eq(1).click();
  _self.alert = console.log;
  $("#tempsave").click();
  setting.regl();
}

function submitThis() {
  if (!setting.auto) {
  } else if (!$(".Btn_blue_1:visible").length) {
    setting.div.children("button:lt(3)").hide().eq(1).click();
    return setting.regl();
  } else if ($("#confirmSubWin:visible").length) {
    var btn = $("#tipContent + * > a").offset() || { top: 0, left: 0 },
      mouse = document.createEvent("MouseEvents");
    btn = [
      btn.left + Math.ceil(Math.random() * 46),
      btn.top + Math.ceil(Math.random() * 26),
    ];
    mouse.initMouseEvent(
      "click",
      true,
      true,
      document.defaultView,
      0,
      0,
      0,
      btn[0],
      btn[1],
      false,
      false,
      false,
      false,
      0,
      null
    );
    _self.event = $.extend(true, {}, mouse);
    delete _self.event.isTrusted;
    _self.form1submit();
  } else {
    $(".Btn_blue_1")[0].click();
  }
  setTimeout(submitThis, Math.ceil(setting.time * Math.random()) * 2);
}

function checkToNext() {
  var $tip = $(setting.job.join(", "), document).prevAll(
    ".ans-job-icon" + setting.normal
  );
  setInterval(function () {
    $tip.parent(":not(.ans-job-finished)").length || (setting.jump && toNext());
  }, setting.time);
}
//去下一课程
function toNext() {
  var $cur = $("#cur" + $("#chapterIdid").val()),
    $tip = $("span.currents ~ span"),
    sel = setting.review ? "html" : ".blue";
  if (!$cur.has(sel).length && $tip.length) return $tip.eq(0).click();
  $tip = $(".roundpointStudent, .roundpoint").parent();
  $tip = $tip.slice($tip.index($cur) + 1).not(":has(" + sel + ")");
  $tip
    .not(setting.lock ? ":has(.lock)" : "html")
    .find("span")
    .eq(0)
    .click();
  $tip.length || (setting.course && switchCourse());
}

function switchCourse() {
  GM_xmlhttpRequest({
    method: "GET",
    url: "/visit/courses/study?isAjax=true&fileId=0&debug=",
    headers: {
      Referer: location.origin + "/visit/courses",
      "X-Requested-With": "XMLHttpRequest",
    },
    onload: function (xhr) {
      var list = $("h3 a[target]", xhr.responseText).map(function () {
          return $(this).attr("href");
        }),
        index =
          list
            .map(function (index) {
              return this.match(top.courseId) && index;
            })
            .filter(function () {
              return $.isNumeric(this);
            })[0] + 1 || 0;

      setting.course = list[index] ? goCourse(list[index]) : 0;
    },
  });
}

function goCourse(url) {

  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function (xhr) {
     const d = new RegExp("/mycourse/studentstudy.*'").exec(xhr.responseText)
     if (d ===null){
         return
     }
      $.globalEval(
        'location.href = "' +
          d[0].slice(0,-1) +
          '";'
      );
    },
  });
}

function autoRead() {
  $("html, body")
    .animate(
      {
        scrollTop: $(document).height() - $(window).height(),
      },
      Math.round(setting.read) * 1e3,
      function () {
        $(".nodeItem.r i").click();
      }
    )
    .one("click", "#top", function (event) {
      $(event.delegateTarget).stop();
    });
}

function DisplayURL() {
  _self.WAY.box.hide();
  var $li = $(this).closest("li");
  $.get(
    "/visit/goToCourseByFace",
    {
      courseId: $li.find("input[name=courseId]").val(),
      clazzId: $li.find("input[name=classId]").val(),
    },
    function (data) {
      $li
        .find("[onclick^=openFaceTip]")
        .removeAttr("onclick")
        .attr({
          target: "_blank",
          href: $(data)
            .filter("script:last")
            .text()
            .match(/n\("(.+?)"/)[1],
        });
      alert("本课程已临时解除面部识别");
    },
    "html"
  );
}


function filterImg(dom) {
  return $(dom)
    .clone()
    .find("img[src]")
    .replaceWith(function () {
      return $("<p></p>").text('<img src="' + $(this).attr("src") + '">');
    })
    .end()
    .find("iframe[src]")
    .replaceWith(function () {
      return $("<p></p>").text(
        '<iframe src="' + $(this).attr("src") + '"></irame>'
      );
    })
    .end()
    .text()
    .trim();
}

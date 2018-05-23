window.onload = function () {
    var oC = document.getElementById('c1');
    var oGc = oC.getContext('2d');

    var json = {};
    json.num = 0;
    var play = new Array(0, 0, 0, 0);
    var name = Array("陈","魏","蜀","吴");
    var auto;
    var now = 0;
    var step = 0;//到目前下了多少棋
    var fanqi = 1;//是否可以翻棋
    var me = 0;//标记我是几号玩家

    screenW = document.body.clientHeight-50;
    ge = Math.floor(screenW * 5 / 88 * 10) / 10;
    qiW = Math.floor(ge * 4 / 5 * 10) / 10;
    qiW1 = Math.floor(ge / 5 * 10) / 10;
    qir = Math.floor(qiW / 2 * 10) / 10;

    deviation = Math.floor(qiW * 2 / 13 * 10) / 10;
    deviationr = Math.floor((qir - deviation) * 10) / 10;

    playW = Math.floor((qiW * 2 + 16 * ge) * 10) / 10
    oC.width = playW;
    oC.height = playW;

    var over = false;

    oGc.strokeStyle = "#bfbfbf";

    //绘制棋盘
    for (var i = 0; i < 17; i++) {
        oGc.moveTo(qiW + i * ge, qiW);
        oGc.lineTo(qiW + i * ge, qiW + 16 * ge);
        oGc.stroke();
        oGc.moveTo(qiW, qiW + i * ge);
        oGc.lineTo(qiW + 16 * ge, qiW + i * ge);
        oGc.stroke();
    }


    /*	AI难点解析
    	赢法数组：记录了五子棋说有的赢法，三维数组
    	每一种赢法的统计数组，一维数组
    	如何判断胜负
    	计算机落子规则*/

    //赢法数组
    var wins = [];

    for (var i = 0; i < 17; i++) {
        wins[i] = [];
        for (var j = 0; j < 17; j++) {
            wins[i][j] = [];
        }
    }

    var terminal = [];
    var count = 0;
    terminal[count] = [];
    //竖着
    for (var i = 0; i < 17; i++) {
        for (var j = 0; j < 13; j++) {
            //i=0 j=0
            //wins[0][0][0] = true;
            //wins[0][1][0] = true;
            //wins[0][2][0] = true;
            //wins[0][3][0] = true;
            //wins[0][4][0] = true;

            //wins[0][1][1] = true;
            //wins[0][2][1] = true;
            //wins[0][3][1] = true;
            //wins[0][4][1] = true;
            //wins[0][5][1] = true;
            for (var k = 0; k < 5; k++) {
                wins[i][j + k][count] = true;
            }
            terminal[count][i] = [];
            terminal[count][i][j] = true;
            terminal[count][i][j+4] = true;
            count++;
            terminal[count] = [];
        }
    }
    //横着
    for (var i = 0; i < 17; i++) {
        for (var j = 0; j < 13; j++) {
            for (var k = 0; k < 5; k++) {
                wins[j + k][i][count] = true;
            }
            terminal[count][j] = [];
            terminal[count][j][i] = true;
            terminal[count][j+4] = [];
            terminal[count][j+4][i] = true;
            count++;
            terminal[count] = [];
        }
    }
    //左上到右下
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 13; j++) {
            for (var k = 0; k < 5; k++) {
                wins[i + k][j + k][count] = true;
            }
            terminal[count][i] = [];
            terminal[count][i][j] = true;
            terminal[count][i+4] = [];
            terminal[count][i+4][j+4] = true;
            count++;
            terminal[count] = [];
        }
    }
    //左下到右上
    for (var i = 0; i < 13; i++) {
        for (var j = 16; j > 3; j--) {
            for (var k = 0; k < 5; k++) {
                wins[i + k][j - k][count] = true;
            }
            terminal[count][i] = [];
            terminal[count][i][j] = true;
            terminal[count][i+4] = [];
            terminal[count][i+4][j-4] = true;
            count++;
            terminal[count] = [];
        }
    }

    //Ӯ��ͳ������
    var myWin = [];
    myWin[1] = [];
    myWin[2] = [];
    myWin[3] = [];
    var computerWin = [];

    for (var i = 1; i < 4; i++)
        for (var j = 0; j < count; j++) {
            myWin[i][j] = 0;
        }

    function oneStep(i, j) {
        oGc.beginPath();
        oGc.arc(qiW + i * ge, qiW + j * ge, qir, 0, 2 * Math.PI);
        oGc.closePath();
        var gradient = oGc.createRadialGradient(qiW + i * ge + deviation, qiW + j * ge + deviation, deviationr, qiW + i * ge + deviation, qiW + j * ge + deviation, 0);


        switch (now) {
            case 1:
                gradient.addColorStop(0, "#000000");
                gradient.addColorStop(1, "#e6e6e6");
                break;
            case 2:
                gradient.addColorStop(0, "#e6e6e6");
                gradient.addColorStop(1, "#ffffff");
                break;
            case 3:
                gradient.addColorStop(0, "#0000ff");
                gradient.addColorStop(1, "#99ccff");
                break;
        }
        /*if(me){
        	gradient.addColorStop(0,"#0A0A0A");
        	gradient.addColorStop(1,"#636766");
        }else{
        	gradient.addColorStop(0,"#D1D1D1");
        	gradient.addColorStop(1,"#F9F9F9");
        }*/

        oGc.fillStyle = gradient;
        oGc.fill();

    };

    var me = true;
    var chessBoard = [];
    for (var i = 0; i < 17; i++) {
        chessBoard[i] = [];
        for (var j = 0; j < 17; j++) {
            chessBoard[i][j] = 0;
        }
    };

    oC.onclick = function (ev) {
        if (now != json.num) { return; }
        if (over) { return; }

        var x = ev.offsetX - qir;
        var y = ev.offsetY - qir;
        var i = Math.floor(x / ge);
        var j = Math.floor(y / ge);

        if (chessBoard[i][j] == 0) {
            step++;
            json.x = i;
            json.y = j;
            json.type = 2;
            goEasy.publish({
                channel: "sanren101",
                message: JSON.stringify(json),
            });
            console.log("发送了下棋记录");
            console.log(json);
            oneStep(i, j, me);
            chessBoard[i][j] = now;
            checkWin(i, j);
            upnow();
            //step > 15 && 
        }else if(step > 15 && fanqi == 1){
            console.log("准备进行翻棋");
            step ++;
            fanqi = 0;
            if(checkFan(i,j)){
                json.x = i;
                json.y = j;
                json.type = 3;
                goEasy.publish({
                    channel: "sanren101",
                    message: JSON.stringify(json),
                });
                console.log("进行了一次翻棋");
                oneStep(i, j, me);
                chessBoard[i][j] = now;
                checkWin(i, j);
                upnow();
            }
        }


 
        /*if(!over){
        	computerAI();
        	me = !me;
        }*/

    }

    function checkWin(i, j) {
        for (var k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                myWin[now][k]++;

                // switch (now) {
                //     case 1:
                //         myWin[2][k] = 6;
                //         myWin[3][k] = 6;
                //         break;
                //     case 2:
                //         myWin[1][k] = 6;
                //         myWin[3][k] = 6;
                //         break;
                //     case 3:
                //         myWin[1][k] = 6;
                //         myWin[2][k] = 6;
                //         break;
                // }

                if (myWin[now][k] == 5) {
                    $("#over").show();
                    $("#cue"+play[now]).show();
                    //window.alert("恭喜" + play[now] + "，获得了胜利！");
                    over = true;
                }
            }
        }
    }

    function checkFanWin(i, j, last){
        for (var k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                myWin[now][k]++;
                myWin[last][k]--;
            }
            if (myWin[now][k] == 5) {
                window.alert("恭喜" + play[now] + "，获得了胜利！");
                over = true;
            }
        }
    }

    //测试翻棋
    function checkFan(i, j){
        for (var k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                if(myWin[me][k] == 4){
                    if(terminal[k][i][j])
                        return false;
                }
            }
        }
        return true;
    }

    var mySwiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        simulateTouch: true,
        allowTouchMove: true,
        effect: 'cube',
        autoplay: false, //可选选项，自动滑动
    })

    var goEasy = new GoEasy({
        appkey: "BC-1606d6808ea743f7a56d6902d0f08ff5"
    });

    goEasy.subscribe({
        channel: "sanren101",
        onMessage: function (message) {
            var j = JSON.parse(message.content);
            if (j.type == 1) {
                //注册桌子
                if (play[j.num] == 0) {
                    play[j.num] = 1;
                    switch (j.num) {
                        case 1:

                            $("#play1").attr("src", "image/wei2.png");
                            break;
                        case 2:
                            $("#play2").attr("src", "image/shu2.png");
                            break;
                        case 3:
                            $("#play3").attr("src", "image/wu2.png");
                            break;
                    }
                }
            } else if(j.type == 2) {
                //下棋
                console.log("收到了别人下棋");
                console.log(j);
                if (chessBoard[j.x][j.y] == 0) {
                    chessBoard[j.x][j.y] = now;
                    oneStep(j.x, j.y);
                    checkWin(j.x, j.y);
                    upnow();
                }
            }else{
                console.log("收到了别人翻棋");
                var last = chessBoard[j.x][j.y];
                oneStep(j.x, j.y);
                checkFanWin(j.x, j.y,last);
                upnow();
            }
        }
    });

    $("#start").click(function () {
        mySwiper.slideNext(900);
    });


    $("#surename").click(function () {
        if ($("#name").val().length > 0) {
            mySwiper.slideNext(900);
            json.name = $("#name").val();
        } else {
            alert("请输入昵称");
        }
    });

    $("#play1").click(function () {
        sureplay(1);
        $("#play1").attr("src", "image/wei2.png");
    });

    $("#play2").click(function () {
        sureplay(2);
        $("#play2").attr("src", "image/shu2.png");
    });

    $("#play3").click(function () {
        sureplay(3);
        $("#play3").attr("src", "image/wu2.png");
    });
    $("#closehelp").click(function(){
        $("#helppage").hide(500);
    });
    $("#help").click(function(){
        $("#helppage").show(500);
    });

    //选择棋子后开始推送消息
    function sureplay(playid) {
        if (play[playid] == 0) {
            me = playid;
            json.num = playid;
            json.type = 1;
            play[playid] = 1;
            //console.log(json);
            //console.log(play);
            $("#play" + playid).text(json.name);
            console.log("我坐下了");
            console.log(play);
            auto = setInterval(read, 2000);
        }
    }

    function read() {
        if (play[3] != 0 && play[1] != 0 && play[2] != 0) {
            clearInterval(auto);
            console.log('大家都已经就绪了');
            mySwiper.slideNext(900);
            now = 1;
        }
        console.log('sent read');
        goEasy.publish({
            channel: "sanren101",
            message: JSON.stringify(json),
        });
    }

    function upnow() {
        if (now == 3)
            now = 1;
        else
            now++;

        console.log("now进行了更新 : " + now);
        switch (now) {
            case 1:
                //alert("红走");
                $("#p1").show();
                $("#p2").hide();
                $("#p3").hide();
                break;
            case 2:
                //alert("黄走");
                $("#p1").hide();
                $("#p2").show();
                $("#p3").hide();
                break;
            case 3:
                //alert("蓝走");
                $("#p1").hide();
                $("#p2").hide();
                $("#p3").show();
                break;
        }
    }
};
var _C = document.getElementById("C");
const ctx = _C.getContext('2d');

// 配置
var beginPoint = { x: 20, y: 20 };
var gridSize = 25;
var stoneSize = 10;
var boardSize = 19;
// var colorTable={}

// 全局变量
var cursorPos = { x: 0, y: 0 }
var turn = 1; // or 2
var stones = new Array(boardSize * boardSize)
// [sg] ; sg::={ color: color, stones: Map, qis: Map} ; Map::=[int:{x,y}]
var stoneGroups = new Array();

// 各种函数
var toI = function (i, j) {
    return i * boardSize + j
}
var sget = function (i, j) {
    return stones[i * boardSize + j]
}
var sset = function (i, j, color) {
    stones[i * boardSize + j] = color
}
var sgadd = function (x, y, color) {
    if (stoneGroups.length == 0) {
        var e = {
            color: color,
            stones: new Map([[toI(x, y), { x: x, y: y }]]),
            qis: slmergePoss(new Map(), findNeighbors(x, y))
        }
        stoneGroups.push(e)
    } else {
        // 寻找四个气，如同色，则寻找自己所在的区块
        // 最终找到所有的棋子块 stone group
        var myGroups = findGroups(x, y, color)
        console.log("myGroups", myGroups)
        sgmerge(x, y, color, myGroups, findNeighborsColor(x, y, 0))
        sgRemoveAllQiSelf(x, y)
    }
}
// return index
var sgget = function (x, y) {
    for (var i = 0; i < stoneGroups.length; i++) {
        var sgs = stoneGroups[i].stones
        if (sgs.has(toI(x, y))) return i
    }
    return -1
}
var sgRemoveItems = function (indexs) {
    var newsgs = []
    for (var i = 0; i < stoneGroups.length; i++) {
        if (indexs.indexOf(i) == -1) {
            newsgs.push(stoneGroups[i])
        }
    }
    return newsgs
}
var sgmerge = function (x, y, color, indexs, qis) {
    var ss = new Map()
    var newQi = new Map()
    for (let idx of indexs) {
        ss = slmerge(ss, stoneGroups[idx].stones)
        newQi = slmerge(newQi, stoneGroups[idx].qis)
    }
    ss.set(toI(x, y), { x: x, y: y })
    newQi = slmergePoss(newQi, qis)
    newQi.delete(toI(x, y))
    // now ss all together
    var newsgs = sgRemoveItems(indexs)
    newsgs.push({ color: color, stones: ss, qis: newQi })
    stoneGroups = newsgs
}

var slmerge = function (a, b) {
    var ret = new Map();
    for (let entry of a) {
        ret.set(entry[0], entry[1])
    }
    for (let entry of b) {
        ret.set(entry[0], entry[1])
    }
    return ret
}
var slmergePoss = function (a, b) {
    var ret = new Map();
    for (let entry of a) {
        ret.set(entry[0], entry[1])
    }
    for (let entry of b) {
        ret.set(toI(entry.x, entry.y), entry)
    }
    return ret
}
var sgRemoveAllQiSelf = function (x, y) {
    for (var i = 0; i < stoneGroups.length; i++) {
        stoneGroups[i].qis.delete(toI(x, y))
    }
}
// var slget = function (sl, x, y) {
//     return sl[toI(x, y)]
// }
// var slhas = function (sl, x, y) {
//     return (sl[toI(x, y)] === undefined)
// }
// var sladd = function (sl, x, y) {
//     if (!slhas(sl, x, y)) {
//         sl[toI(x, y)] = { x: x, y: y }
//     }
// }
var findNeighbors = function (x, y) {
    var ret = [];
    if (x - 1 >= 0) {
        ret.push({ x: x - 1, y: y })
    }
    if (x + 1 < boardSize) {
        ret.push({ x: x + 1, y: y })
    }
    if (y - 1 >= 0) {
        ret.push({ x: x, y: y - 1 })
    }
    if (y + 1 >= 0) {
        ret.push({ x: x, y: y + 1 })
    }
    return ret;
}
var findNeighborsColor = function (x, y, color) {
    var ret = [];
    if (x - 1 >= 0 && sget(x - 1, y) == color) {
        ret.push({ x: x - 1, y: y })
    }
    if (x + 1 < boardSize && sget(x + 1, y) == color) {
        ret.push({ x: x + 1, y: y })
    }
    if (y - 1 >= 0 && sget(x, y - 1) == color) {
        ret.push({ x: x, y: y - 1 })
    }
    if (y + 1 >= 0 && sget(x, y + 1) == color) {
        ret.push({ x: x, y: y + 1 })
    }
    return ret;
}
var findGroups = function (x, y, color) {
    var poss = findNeighborsColor(x, y, color)
    var ret = [];
    for (let pos of poss) {
        if (sget(pos.x, pos.y) == color) {
            var i = sgget(pos.x, pos.y);
            if (ret.indexOf(i) == -1) {
                ret.push(i)
            }
        }
    }
    return ret
}
var removeStonesOnBoard = function (stones) {
    for (let pos of stones) {
        sset(pos.x, pos.y, 0)
    }
}
var sgUpdateAllQi = function () {
    for (let sg of stoneGroups) {
        var stones = sg.stones
        for (let s of stones.values()) {
            var n = findNeighborsColor(s.x, s.y, 0)
            if (n.length > 0) {
                for (let pos of n) {
                    sg.qis.set(toI(pos.x, pos.y), pos)
                }
            }
        }
    }
}
var tizi = function (x, y, color) {
    // 首先检测周围的不同色棋子是否可以提
    // 如不可，则继续检测自身
    var gs = findGroups(x, y, 3 - color)
    var indexs = [];
    for (let i of gs) {
        if (stoneGroups[i].qis.size == 0) {
            indexs.push(i)
            removeStonesOnBoard(stoneGroups[i].stones.values())
        }
    }
    if (indexs.length > 0) {
        stoneGroups = sgRemoveItems(indexs)
        sgUpdateAllQi()
    } else {
        // 自杀
        var gs = findGroups(x, y, color)
        if (gs.length > 0) {
            var i = gs[0];
            if (stoneGroups[i].qis.size == 0) {
                removeStonesOnBoard(stoneGroups[i].stones.values())
                // removeStonesOnBoard([{ x: x, y: y }])
                stoneGroups = sgRemoveItems([i])
                sgUpdateAllQi()
                return true;
            }
        }
    }
    return false;
}

var drawBackground = function () {
    ctx.save();
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 800, 600)
    ctx.restore();
}
var drawLine = function (x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}
// drawLine(10, 10, 100, 100)
var drawLines = function (n) {
    var lastLine = (n - 1) * gridSize;
    for (var i = 0; i < n; i++) {
        var x = i * gridSize;
        drawLine(x, 0, x, lastLine)
    }
    for (var i = 0; i < n; i++) {
        var y = i * gridSize;
        drawLine(0, y, lastLine, y)
    }
}
// drawLines(19);
var drawStar = function (x, y) {
    ctx.beginPath();

    var radius = 4; // 圆弧半径
    var startAngle = 0; // 开始点
    var endAngle = 2 * Math.PI; // 结束点
    var anticlockwise = false; // 顺时针或逆时针

    ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);

    ctx.fill();
}
// drawStar(10, 10);
var drawStars = function () {
    var n = 3;
    for (var i = 0; i < n; i++) {
        var x = 3 * gridSize + i * (6 * gridSize);
        for (var j = 0; j < n; j++) {
            var y = 3 * gridSize + j * (6 * gridSize);
            drawStar(x, y)
        }
    }
}
var drawPanel = function (n) {
    ctx.translate(beginPoint.x, beginPoint.y)
    drawLines(n)
    drawStars()
}
// drawPanel(boardSize)

var drawCursor = function (x, y) {
    ctx.save()
    var x = x * gridSize;
    var y = y * gridSize
    ctx.beginPath();

    var radius = 6; // 圆弧半径
    var startAngle = 0; // 开始点
    var endAngle = 2 * Math.PI; // 结束点
    var anticlockwise = false; // 顺时针或逆时针

    ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);

    ctx.strokeStyle = 'red'
    ctx.stroke();
    ctx.restore();
}
// drawCursor(10, 10)

var drawStone = function (x, y, color) {
    ctx.save()
    var x = x * gridSize;
    var y = y * gridSize
    ctx.beginPath();

    var radius = stoneSize; // 圆弧半径
    var startAngle = 0; // 开始点
    var endAngle = 2 * Math.PI; // 结束点
    var anticlockwise = false; // 顺时针或逆时针

    ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);

    ctx.strokeStyle = 'black'
    ctx.stroke();
    ctx.fillStyle = color == 1 ? 'black' : 'white'
    ctx.fill();

    ctx.restore();
}

_C.addEventListener("mousemove", function (event) {
    // console.log(event.x-beginPoint.x,event.y-beginPoint.y)
    var x = event.x - beginPoint.x;
    var y = event.y - beginPoint.y
    var i = parseInt(x / gridSize);
    var j = parseInt(y / gridSize);
    cursorPos.x = i; cursorPos.y = j;
})
_C.addEventListener("click", function (event) {
    // console.log("i,j", cursorPos.x, cursorPos.y)
    if (cursorPos.x < gridSize && cursorPos.y < gridSize) {
        // console.log("i,j", i, j)
        // drawCursor(cursorPos.x, cursorPos.y)
        // console.log(sget(cursorPos.x, cursorPos.y))
        if (sget(cursorPos.x, cursorPos.y) == 0) {
            console.log("doit", cursorPos.x, cursorPos.y, turn)
            sgadd(cursorPos.x, cursorPos.y, turn)
            console.log(stoneGroups)

            // 提子
            // 首先检测周围的不同色棋子是否可以提
            // 如不可，则继续检测自身
            if (!tizi(cursorPos.x, cursorPos.y, turn))
                sset(cursorPos.x, cursorPos.y, turn)
            turn = 3 - turn;
        }
    }
})

function init() {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            sset(i, j, 0)
        }
    }
}
function step(timestamp) {
    ctx.save();
    drawBackground();
    drawPanel(boardSize)
    if (cursorPos.x < gridSize && cursorPos.y < gridSize) {
        // console.log("i,j", i, j)
        drawCursor(cursorPos.x, cursorPos.y)
    }
    // drawStone(10, 10, 1)
    // 画棋子
    // stones[0]=1
    // stones[1]=2
    // sset(2, 9, 1)
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (sget(i, j)) {
                drawStone(i, j, sget(i, j))
            }
        }
    }
    ctx.restore()
    window.requestAnimationFrame(step);
}
init();
window.requestAnimationFrame(step);

// ctx.fillStyle = 'green';
// ctx.fillRect(10, 10, 150, 100);

// ctx.translate(10, 0)

// ctx.fillStyle = 'red';
// ctx.fillRect(10, 10, 150, 100);


// ctx.beginPath();
// ctx.moveTo(125, 125);
// ctx.lineTo(125, 45);
// ctx.lineTo(45, 125);
// ctx.closePath();
// ctx.stroke();
// 行数是20
const TETRIS_ROWS = 20;
// 列数是14
const TETRIS_COLS = 14;
// 单个方格边长是24
const CELL_SIZE = 24;

// 分数增加的单位
const SCORE_ADD_UNIT = 100;
// 分数增加到变速的阈值
const SCORE_THRESHOLD = 1000;

// 速度计算基准参考
const SPEED_BASE = 800;
// 速度增加的单位
const SPEED_ADD_UNIT = 1;

// 没方块的状态是0，tetris_status里值为0的坐标对应的格子是白色格子
const NO_BLOCK = 0;

// 全局Canvas
let tetris_canvas;
// 全局Canvas Context
let tetris_canvas_context;

// 记录当前积分
let currentScore = 0;
// 记录当前速度
let currentSpeed = 1;
// 记录曾经的最高积分
let maxScore = 0;

// 当前积分span的Element
let currentScoreElement;
// 当前速度span的Element
let currentSpeedElement;
// 历史最高分span的Element
let maxScoreElement;

// 当前计时器
let currentTimer;

// 记录当前是否游戏中的标记📌
let isPlaying = true;

// 记录正在下掉的四个方块🟥
let currentFall;

// 记录方块🟥的状态，用于获取图里对应坐标的方块的颜色
let tetris_status = [];

// 构建状态矩阵，初始化状态矩阵的值全部为0
for (let i = 0; i < TETRIS_ROWS; i++) {
    // 扩展成二维数组
    tetris_status[i] = [];
    for (let j = 0; j < TETRIS_COLS; j++) {
        tetris_status[i][j] = NO_BLOCK;
    }
}

// 获取网页宽度，注意js引入必须在引入标签之后
let screenWidth = document.body.clientWidth;

// 定义方块的颜色
const COLORS = ["#FFF", "#FF1493", "#9932CC", "#1E90FF", "#228B22", "#FFD700", "#FF8C00", "#FF4500"];

// 定义弹窗Toast内容
const TOAST_TEXT = "您已经输了！是否参与排名？";

// 定义七种可能出现的方块组合，每种都是由四个方块组成
const BLOCKS = [
    // 代表第一种可能出现的方块组合：Z
    [
        {x: TETRIS_COLS / 2 - 1, y: 0, color: 1},
        {x: TETRIS_COLS / 2, y: 0, color: 1},
        {x: TETRIS_COLS / 2, y: 1, color: 1},
        {x: TETRIS_COLS / 2 + 1, y: 1, color: 1}
    ],
    // 代表第二种可能出现的方块组合：S
    [
        {x: TETRIS_COLS / 2 + 1, y: 0, color: 2},
        {x: TETRIS_COLS / 2, y: 0, color: 2},
        {x: TETRIS_COLS / 2, y: 1, color: 2},
        {x: TETRIS_COLS / 2 - 1, y: 1, color: 2}
    ],
    // 代表第三种可能出现的方块组合：O
    [
        {x: TETRIS_COLS / 2 - 1, y: 0, color: 3},
        {x: TETRIS_COLS / 2, y: 0, color: 3},
        {x: TETRIS_COLS / 2 - 1, y: 1, color: 3},
        {x: TETRIS_COLS / 2, y: 1, color: 3}
    ],
    // 代表第四种可能出现的方块组合：L
    [
        {x: TETRIS_COLS / 2 - 1, y: 0, color: 4},
        {x: TETRIS_COLS / 2 - 1, y: 1, color: 4},
        {x: TETRIS_COLS / 2 - 1, y: 2, color: 4},
        {x: TETRIS_COLS / 2, y: 2, color: 4}
    ],
    // 代表第五种可能出现的方块组合：J
    [
        {x: TETRIS_COLS / 2, y: 0, color: 5},
        {x: TETRIS_COLS / 2, y: 1, color: 5},
        {x: TETRIS_COLS / 2, y: 2, color: 5},
        {x: TETRIS_COLS / 2 - 1, y: 2, color: 5}
    ],
    // 代表第六种可能出现的方块组合 : I
    [
        {x: TETRIS_COLS / 2, y: 0, color: 6},
        {x: TETRIS_COLS / 2, y: 1, color: 6},
        {x: TETRIS_COLS / 2, y: 2, color: 6},
        {x: TETRIS_COLS / 2, y: 3, color: 6}
    ],
    // 代表第七种可能出现的方块组合 : T
    [
        {x: TETRIS_COLS / 2, y: 0, color: 7},
        {x: TETRIS_COLS / 2 - 1, y: 1, color: 7},
        {x: TETRIS_COLS / 2, y: 1, color: 7},
        {x: TETRIS_COLS / 2 + 1, y: 1, color: 7}
    ]
];

/**
 * 初始化正在下掉的方块
 */
let initBlock = function () {
    // 生成随机数
    let randNum = Math.floor(Math.random() * BLOCKS.length);
    // 随机生成正在下掉的方块
    currentFall = [
        {x: BLOCKS[randNum][0].x, y: BLOCKS[randNum][0].y, color: BLOCKS[randNum][0].color},
        {x: BLOCKS[randNum][1].x, y: BLOCKS[randNum][1].y, color: BLOCKS[randNum][1].color},
        {x: BLOCKS[randNum][2].x, y: BLOCKS[randNum][2].y, color: BLOCKS[randNum][2].color},
        {x: BLOCKS[randNum][3].x, y: BLOCKS[randNum][3].y, color: BLOCKS[randNum][3].color}
    ];
};

/**
 * 创建Canvas组件
 * @param rows 行
 * @param cols 列
 * @param cellWidth 方格宽度
 * @param cellHeight 方格高度
 */
let initCanvas = function (rows, cols, cellWidth, cellHeight) {
    // 创建Canvas组件
    tetris_canvas = document.createElement("canvas");
    // 居中
    tetris_canvas.style.margin = "0 auto";
    tetris_canvas.style.display = "block";
    // 设置Canvas组件的宽度
    tetris_canvas.width = cols * cellWidth;
    // 设置Canvas组件的高度
    tetris_canvas.height = rows * cellHeight;
    // 设置Canvas组件的边框
    tetris_canvas.style.border = "1px solid black";
    // 获取Canvas上的绘图API
    tetris_canvas_context = tetris_canvas.getContext('2d');
    // 开始创建路径
    tetris_canvas_context.beginPath();
    // 绘制横向网络对应的路径
    for (let i = 1; i < TETRIS_ROWS; i++) {
        tetris_canvas_context.moveTo(0, i * CELL_SIZE);
        tetris_canvas_context.lineTo(TETRIS_COLS * CELL_SIZE, i * CELL_SIZE);
    }
    // 绘制竖向网络对应的路径
    for (let i = 1; i < TETRIS_COLS; i++) {
        tetris_canvas_context.moveTo(i * CELL_SIZE, 0);
        tetris_canvas_context.lineTo(i * CELL_SIZE, TETRIS_ROWS * CELL_SIZE);
    }
    // 结束创建路径
    tetris_canvas_context.closePath();
    // 设置笔触颜色为白色(不是纯白)
    tetris_canvas_context.strokeStyle = "#aaa";
    // 设置线条粗细
    tetris_canvas_context.lineWidth = 0.3;
    // 绘制线条
    tetris_canvas_context.stroke();
}

/**
 * 绘制俄罗斯方块的状态
 */
let drawBlock = function () {
    for (let i = 0; i < TETRIS_ROWS; i++) {
        for (let j = 0; j < TETRIS_COLS; j++) {
            // 有方块的地方绘制颜色
            if (tetris_status[i][j] !== NO_BLOCK) {
                // 设置填充颜色
                tetris_canvas_context.fillStyle = COLORS[tetris_status[i][j]];
                // 绘制矩形
                tetris_canvas_context.fillRect(j * CELL_SIZE + 1, i * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            } else {    // 没有方块的地方绘制白色
                // 设置填充颜色
                tetris_canvas_context.fillStyle = 'white';
                // 绘制矩形
                tetris_canvas_context.fillRect(j * CELL_SIZE + 1, i * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        }
    }
}

/**
 * 从LocalStorage中读取数据用于初始化
 */
let loadLocalStorage = function () {
    // 读取LocalStorage里的tetris_status记录
    let tempStatus = localStorage.getItem("tetris_status");
    // 如果记录非空则更新一下状态
    tetris_status = tempStatus == null ? tetris_status : JSON.parse(tempStatus);
    // 读取LocalStorage里的currentScore记录
    currentScore = localStorage.getItem("currentScore");
    // 如果有记录则取出来赋值，否则初始化为0
    currentScore = currentScore == null ? 0 : parseInt(currentScore);
    // span里加入currentScore的值
    currentScoreElement.innerHTML = currentScore.toString();
    // 读取LocalStorage里的currentSpeed记录
    currentSpeed = localStorage.getItem("currentSpeed");
    // 如果有记录则取出来赋值，否则初始化为1
    currentSpeed = currentSpeed == null ? 1 : parseInt(currentSpeed);
    // span里加入currentSpeed的值
    currentSpeedElement.innerHTML = currentSpeed.toString();
    // 读取LocalStorage里的maxScore记录
    maxScore = localStorage.getItem("maxScore");
    // 如果有记录则取出来赋值，否则初始化为0
    maxScore = maxScore == null ? 0 : parseInt(maxScore);
    // span里加入maxScore的值
    maxScoreElement.innerHTML = maxScore.toString();
}

/**
 * 清空LocalStorage中的数据(除了maxScore)
 */
let removeLocalStorage = function () {
    // 清空LocalStorage中的当前积分值、游戏状态、当前速度
    localStorage.removeItem("currentScore");
    localStorage.removeItem("tetris_status");
    localStorage.removeItem("currentSpeed");
}

/**
 * 当页面加载完成时，执行该函数里的代码
 */
window.onload = function () {
    // 创建Canvas组件
    initCanvas(TETRIS_ROWS, TETRIS_COLS, CELL_SIZE, CELL_SIZE);
    // 把Canvas添加到body中
    document.body.appendChild(tetris_canvas);
    // 获取currentScoreElement元素
    currentScoreElement = document.getElementById("currentScoreElement");
    // 获取currentSpeedElement元素
    currentSpeedElement = document.getElementById("currentSpeedElement");
    // 获取maxScoreElement元素
    maxScoreElement = document.getElementById("maxScoreElement");
    // 从LocalStorage中读取数据用于初始化
    loadLocalStorage();
    // 把方块状态绘制出来
    drawBlock();
    // 初始化正在下掉的方块
    initBlock();
    // 控制每隔固定时间执行一次下落
    currentTimer = setInterval("moveDown();", 500 / currentSpeed);
}

/**
 * 执行消除一行方块的操作
 * @param i 遍历到的行号
 */
let doClearLine = function (i) {
    // 将当前积分增加
    currentScore += SCORE_ADD_UNIT
    // 更新span里的当前得分
    currentScoreElement.innerHTML = currentScore.toString();
    // 记录当前积分
    localStorage.setItem("currentScore", currentScore);
    // 如果当前积分达到升级极限
    if (currentScore >= currentSpeed * currentSpeed * SCORE_THRESHOLD) {
        currentSpeedElement.innerHTML = currentSpeed += SPEED_ADD_UNIT;
        // 使用Local Storage记录curSpeed。
        localStorage.setItem("currentSpeed", currentSpeed);
        clearInterval(currentTimer);
        currentTimer = setInterval("moveDown();", SPEED_BASE / currentSpeed);
    }
    // 把当前行的所有方块下移一行。
    for (let k = i; k > 0; k--) {
        for (let l = 0; l < TETRIS_COLS; l++) {
            tetris_status[k][l] = tetris_status[k - 1][l];
        }
    }
}

/**
 * 判断是否有一行已满，如果已满则清空一行
 */
let clearLine = function () {
    // 依次遍历每一行
    for (let i = 0; i < TETRIS_ROWS; i++) {
        let flag = true;
        // 遍历当前行的每个单元格
        for (let j = 0; j < TETRIS_COLS; j++) {
            if (tetris_status[i][j] === NO_BLOCK) {
                flag = false;
                break;
            }
        }
        // 如果当前行已全部有方块了
        if (flag) {
            // 执行消除一行方块的操作
            doClearLine(i);
            // 消除方块后，重新绘制一遍方块
            drawBlock();
        }
    }
}

/**
 * 将移动前的每个方块的背景色涂成白色
 */
let fillBeforeMove = function () {
    for (let i = 0; i < currentFall.length; i++) {
        let current = currentFall[i];
        // 设置填充颜色
        tetris_canvas_context.fillStyle = 'white';
        // 绘制矩形
        tetris_canvas_context.fillRect(current.x * CELL_SIZE + 1, current.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    }
}

/**
 * 将移动后的每个方块的背景色涂成各方块对应的颜色
 */
let fillAfterMove = function () {
    for (let i = 0; i < currentFall.length; i++) {
        let current = currentFall[i];
        // 设置填充颜色
        tetris_canvas_context.fillStyle = COLORS[current.color];
        // 绘制矩形
        tetris_canvas_context.fillRect(current.x * CELL_SIZE + 1, current.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    }
}

/**
 * 判定能否下落
 * @returns {boolean} 是否能下移
 */
let judgeCanMoveDown = function () {
    // 遍历每个方块，判断是否能向下掉
    for (let i = 0; i < currentFall.length; i++) {
        // 判断是否已经到最底下
        if (currentFall[i].y >= TETRIS_ROWS - 1) {
            return false;
        }
        // 判断下一格是否有方块, 如果下一格有方块，不能向下掉
        if (tetris_status[currentFall[i].y + 1][currentFall[i].x] !== NO_BLOCK) {
            return false;
        }
    }
    return true;
}

/**
 * 下落判定游戏结束前需要做的处理工作
 */
let doBeforeGameOver = function () {
    // 清空LocalStorage中的当前积分值、游戏状态、当前速度
    removeLocalStorage();
    if (confirm(TOAST_TEXT)) {
        // 读取LocalStorage里的maxScore记录
        maxScore = localStorage.getItem("maxScore");
        maxScore = maxScore == null ? 0 : maxScore;
        // 如果当前积分大于localStorage中记录的最高积分
        if (currentScore > maxScore) {
            // 记录最高积分
            localStorage.setItem("maxScore", currentScore);
            // 保证能立刻显示出来
            maxScore = currentScore;
        }
        maxScoreElement.innerHTML = maxScore.toString();
    }
    // 游戏结束
    isPlaying = false;
    // 清除计时器
    clearInterval(currentTimer);
}

/**
 * 控制方块下移
 */
let moveDown = function () {
    // 如果能向下移
    if (judgeCanMoveDown()) {
        // 将下移前的每个方块的背景色涂成白色
        fillBeforeMove();
        // 遍历每个方块, 控制每个方块的y坐标加1，也就是控制方块都下掉一格
        for (let i = 0; i < currentFall.length; i++) {
            currentFall[i].y++;
        }
        // 将下移后的每个方块的背景色涂成该方块的颜色值
        fillAfterMove();
    } else {    // 不能向下掉
        // 遍历每个方块, 把每个方块的值记录到tetris_status数组中
        for (let i = 0; i < currentFall.length; i++) {
            let current = currentFall[i];
            // 如果有方块已经到最上面了，表明输了
            if (current.y < 2) {
                doBeforeGameOver();
                return;
            }
            // 把每个方块当前所在位置赋为当前方块的颜色值
            tetris_status[current.y][current.x] = current.color;
        }
        // 判断是否有“可消除”的行
        clearLine();
        // 使用LocalStorage记录俄罗斯方块的游戏状态
        localStorage.setItem("tetris_status", JSON.stringify(tetris_status));
        // 开始一组新的方块。
        initBlock();
    }
}

/**
 * 判定能否左移
 * @returns {boolean} 能否左移
 */
let judgeCanMoveLeft = function () {
    for (let i = 0; i < currentFall.length; i++) {
        // 如果已经到了最左边，不能左移
        if (currentFall[i].x <= 0) {
            return false;
        }
        // 左边的位置已有方块，不能左移
        if (tetris_status[currentFall[i].y][currentFall[i].x - 1] !== NO_BLOCK) {
            return false;
        }
    }
    return true;
}

/**
 * 控制方块左移
 */
let moveLeft = function () {
    // 如果能左移
    if (judgeCanMoveLeft()) {
        // 将左移前的每个方块的背景色涂成白色
        fillBeforeMove();
        // 左移所有正在下掉的方块
        for (let i = 0; i < currentFall.length; i++) {
            currentFall[i].x--;
        }
        // 将左移后的每个方块的背景色涂成方块对应的颜色
        fillAfterMove();
    }
}

/**
 * 判定能否右移
 * @returns {boolean} 能否右移
 */
let judgeCanMoveRight = function () {
    for (let i = 0; i < currentFall.length; i++) {
        // 如果已到了最右边，不能右移
        if (currentFall[i].x >= TETRIS_COLS - 1) {
            return false;
        }
        // 如果右边的位置已有方块，不能右移
        if (tetris_status[currentFall[i].y][currentFall[i].x + 1] !== NO_BLOCK) {
            return false;
        }
    }
    return true;
}

/**
 * 控制方块右移
 */
let moveRight = function () {
    // 如果能右移
    if (judgeCanMoveRight()) {
        // 将右移前的每个方块的背景色涂成白色
        fillBeforeMove();
        // 右移所有正在下掉的方块
        for (let i = 0; i < currentFall.length; i++) {
            currentFall[i].x++;
        }
        // 将右移后的每个方块的背景色涂成各方块对应的颜色
        fillAfterMove();
    }
}

/**
 * 判断能否旋转
 * @returns {boolean} 能否旋转
 */
let judgeCanRotate = function () {
    for (let i = 0; i < currentFall.length; i++) {
        let preX = currentFall[i].x;
        let preY = currentFall[i].y;
        // 始终以第三个方块作为旋转的中心，所以其坐标不会变，不需要额外判断
        if (i !== 2) {
            // 计算方块旋转后的x、y坐标
            let afterRotateX = currentFall[2].x + preY - currentFall[2].y;
            let afterRotateY = currentFall[2].y + currentFall[2].x - preX;
            // 如果旋转后所在位置已有方块，表明不能旋转
            if (tetris_status[afterRotateY][afterRotateX + 1] !== NO_BLOCK) {
                return false;
            }
        }
    }
    return true;
}

/**
 * 执行旋转前的坐标计算处理
 */
let doRotate = function () {
    for (let i = 0; i < currentFall.length; i++) {
        let preX = currentFall[i].x;
        let preY = currentFall[i].y;
        // 始终以第三个方块作为旋转的中心，所以其坐标不会变，不需要额外判断
        if (i !== 2) {
            // 计算方块旋转后的x、y坐标
            let afterRotateX = currentFall[2].x + preY - currentFall[2].y;
            let afterRotateY = currentFall[2].y + currentFall[2].x - preX;
            // 如果旋转后的坐标已经超出了最左边边界
            if (afterRotateX < 0 || tetris_status[afterRotateY - 1][afterRotateX] !== NO_BLOCK) {
                moveRight();
                afterRotateX = currentFall[2].x + preY - currentFall[2].y;
                afterRotateY = currentFall[2].y + currentFall[2].x - preX;
                break;
            }
            if (afterRotateX < 0 || tetris_status[afterRotateY - 1][afterRotateX] !== NO_BLOCK) {
                moveRight();
                break;
            }
            // 如果旋转后的坐标已经超出了最右边边界
            if (afterRotateX >= TETRIS_COLS - 1 || tetris_status[afterRotateY][afterRotateX + 1] !== NO_BLOCK) {
                moveLeft();
                afterRotateX = currentFall[2].x + preY - currentFall[2].y;
                afterRotateY = currentFall[2].y + currentFall[2].x - preX;
                break;
            }
            if (afterRotateX >= TETRIS_COLS - 1 || tetris_status[afterRotateY][afterRotateX + 1] !== NO_BLOCK) {
                moveLeft();
                break;
            }
        }
    }
}

/**
 * 控制方块旋转
 */
let rotate = function () {
    // 如果能旋转
    if (judgeCanRotate()) {
        // 执行旋转前的坐标计算处理
        doRotate();
        // 将旋转移前的每个方块的背景色涂成白色
        fillBeforeMove();
        for (let i = 0; i < currentFall.length; i++) {
            let preX = currentFall[i].x;
            let preY = currentFall[i].y;
            if (i !== 2) {
                currentFall[i].x = currentFall[2].x + preY - currentFall[2].y;
                currentFall[i].y = currentFall[2].y + currentFall[2].x - preX;
            }
        }
        // 将旋转后的每个方块的背景色涂成各方块对应的颜色
        fillAfterMove();
    }
}

// 将焦点设置到当前窗口
window.focus();

// 为窗口的按键事件绑定事件监听器，从keyCode改为code
// https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/keyCode
window.onkeydown = function (event) {
    switch (event.code) {
        // 按下了“向下”箭头
        case "ArrowDown":
            if (isPlaying) {
                moveDown();
            }
            break;
        // 按下了“向左”箭头
        case "ArrowLeft":
            if (isPlaying) {
                moveLeft();
            }
            break;
        // 按下了“向右”箭头
        case "ArrowRight":
            if (isPlaying) {
                moveRight();
            }
            break;
        // 按下了“向上”箭头
        case "ArrowUp":
            if (isPlaying) {
                rotate();
            }
            break;
        case "Space":
            if (isPlaying) {
                clearInterval(currentTimer);
            } else {
                currentTimer = setInterval("moveDown();", SPEED_BASE / currentSpeed);
            }
            isPlaying = !isPlaying;
    }
}

// 刷新或关闭标签页或关闭网页则清空LocalStorage存的值
window.onbeforeunload = window.onunload = window.closed = removeLocalStorage;

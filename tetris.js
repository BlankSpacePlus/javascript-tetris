// 行数是20
const TETRIS_ROWS = 20;
// 列数是14
const TETRIS_COLS = 14;
// 单个方格边长是24
const CELL_SIZE = 24;

// 没方块的状态是0
const NO_BLOCK = 0;

// Canvas
let tetris_canvas;
// Canvas Context
let tetris_context;

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

// 该数组用于记录底下已经固定下来的方块🟥
let tetris_status = [];

// 构建状态矩阵，初始化状态矩阵的值全部为0
for (let i = 0; i < TETRIS_ROWS; i++) {
  tetris_status[i] = [];
  for (let j = 0; j < TETRIS_COLS; j++) {
    tetris_status[i][j] = NO_BLOCK;
  }
}

// 定义方块的颜色
const colors = ["#fff", "#FF1493", "#9932CC", "#1E90FF", "#228B22", "#FFD700", "#FF8C00", "#FF4500"];

// 定义几种可能出现的方块组合
const blockArray = [
  // 代表第一种可能出现的方块组合：Z
  [
    {x: TETRIS_COLS/2-1, y:0, color:1},
    {x: TETRIS_COLS/2,   y:0, color:1},
    {x: TETRIS_COLS/2,   y:1, color:1},
    {x: TETRIS_COLS/2+1, y:1, color:1}
  ],
  // 代表第二种可能出现的方块组合：S
  [
    {x: TETRIS_COLS/2+1, y:0, color:2},
    {x: TETRIS_COLS/2,   y:0, color:2},
    {x: TETRIS_COLS/2,   y:1, color:2},
    {x: TETRIS_COLS/2-1, y:1, color:2}
  ],
  // 代表第三种可能出现的方块组合：O
  [
    {x: TETRIS_COLS/2-1, y:0, color:3},
    {x: TETRIS_COLS/2,   y:0,  color:3},
    {x: TETRIS_COLS/2-1, y:1, color:3},
    {x: TETRIS_COLS/2,   y:1, color:3}
  ],
  // 代表第四种可能出现的方块组合：L
  [
    {x: TETRIS_COLS/2-1, y:0, color:4},
    {x: TETRIS_COLS/2-1, y:1, color:4},
    {x: TETRIS_COLS/2-1, y:2, color:4},
    {x: TETRIS_COLS/2,   y:2, color:4}
  ],
  // 代表第五种可能出现的方块组合：J
  [
    {x: TETRIS_COLS/2 ,  y:0, color:5},
    {x: TETRIS_COLS/2,   y:1, color:5},
    {x: TETRIS_COLS/2 ,  y:2, color:5},
    {x: TETRIS_COLS/2-1, y:2, color:5}
  ],
  // 代表第六种可能出现的方块组合 : I
  [
    {x: TETRIS_COLS/2,   y:0, color:6},
    {x: TETRIS_COLS/2,   y:1, color:6},
    {x: TETRIS_COLS/2,   y:2, color:6},
    {x: TETRIS_COLS/2,   y:3, color:6}
  ],
  // 代表第七种可能出现的方块组合 : T
  [
    {x: TETRIS_COLS/2,   y:0, color:7},
    {x: TETRIS_COLS/2-1, y:1, color:7},
    {x: TETRIS_COLS/2,   y:1, color:7},
    {x: TETRIS_COLS/2+1, y:1, color:7}
  ]
];

/**
 * 初始化正在下掉的方块
 */
let initBlock = function() {
  let randNum = Math.floor(Math.random() * blockArray.length);
  // 随机生成正在下掉的方块
  currentFall = [
    {x: blockArray[randNum][0].x, y: blockArray[randNum][0].y, color: blockArray[randNum][0].color},
    {x: blockArray[randNum][1].x, y: blockArray[randNum][1].y, color: blockArray[randNum][1].color},
    {x: blockArray[randNum][2].x, y: blockArray[randNum][2].y, color: blockArray[randNum][2].color},
    {x: blockArray[randNum][3].x, y: blockArray[randNum][3].y, color: blockArray[randNum][3].color}
  ];
};

/**
 * 创建Canvas组件
 * @param rows 行
 * @param cols 列
 * @param cellWidth 方格宽度
 * @param cellHeight 方格高度
 */
let createCanvas = function(rows, cols, cellWidth, cellHeight) {
  tetris_canvas = document.createElement("canvas");
  // 设置Canvas组件的高度、宽度
  tetris_canvas.width = cols * cellWidth;
  tetris_canvas.height = rows * cellHeight;
  // 设置Canvas组件的边框
  tetris_canvas.style.border = "1px solid black";
  // 获取Canvas上的绘图API
  tetris_context = tetris_canvas.getContext('2d');
  // 开始创建路径
  tetris_context.beginPath();
  // 绘制横向网络对应的路径
  for (let i = 1; i < TETRIS_ROWS; i++) {
    tetris_context.moveTo(0, i * CELL_SIZE);
    tetris_context.lineTo(TETRIS_COLS * CELL_SIZE, i * CELL_SIZE);
  }
  // 绘制竖向网络对应的路径
  for (let i = 1; i < TETRIS_COLS; i++) {
    tetris_context.moveTo(i * CELL_SIZE, 0);
    tetris_context.lineTo(i * CELL_SIZE, TETRIS_ROWS * CELL_SIZE);
  }
  // 结束创建路径
  tetris_context.closePath();
  // 设置笔触颜色
  tetris_context.strokeStyle = "#aaa";
  // 设置线条粗细
  tetris_context.lineWidth = 0.3;
  // 绘制线条
  tetris_context.stroke();
}

/**
 * 绘制俄罗斯方块的状态
 */
let drawBlock = function() {
  for (let i = 0; i < TETRIS_ROWS; i++) {
    for (let j = 0; j < TETRIS_COLS; j++) {
      // 有方块的地方绘制颜色
      if(tetris_status[i][j] !== NO_BLOCK) {
        // 设置填充颜色
        tetris_context.fillStyle = colors[tetris_status[i][j]];
        // 绘制矩形
        tetris_context.fillRect(j*CELL_SIZE+1, i*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
      } else {    // 没有方块的地方绘制白色
        // 设置填充颜色
        tetris_context.fillStyle = 'white';
        // 绘制矩形
        tetris_context.fillRect(j*CELL_SIZE+1, i*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
      }
    }
  }
}

// 当页面加载完成时，执行该函数里的代码。
window.onload = function() {
  // 创建Canvas组件
  createCanvas(TETRIS_ROWS, TETRIS_COLS, CELL_SIZE, CELL_SIZE);
  document.body.appendChild(tetris_canvas);
  currentScoreElement = document.getElementById("currentScoreElement");
  currentSpeedElement = document.getElementById("currentSpeedElement");
  maxScoreElement = document.getElementById("maxScoreElement");
  // 读取LocalStorage里的tetris_status记录
  let tempStatus = localStorage.getItem("tetris_status");
  tetris_status = tempStatus == null ? tetris_status : JSON.parse(tempStatus);
  // 把方块状态绘制出来
  drawBlock();
  // 读取LocalStorage里的currentScore记录
  currentScore = localStorage.getItem("currentScore");
  currentScore = currentScore == null ? 0 : parseInt(currentScore);
  currentScoreElement.innerHTML = currentScore;
  // 读取LocalStorage里的maxScore记录
  maxScore = localStorage.getItem("maxScore");
  maxScore = maxScore == null ? 0 : parseInt(maxScore);
  maxScoreElement.innerHTML = maxScore;
  // 读取LocalStorage里的currentSpeed记录
  currentSpeed = localStorage.getItem("currentSpeed");
  currentSpeed = currentSpeed == null ? 1 : parseInt(currentSpeed);
  currentSpeedElement.innerHTML = currentSpeed;
  // 初始化正在下掉的方块
  initBlock();
  // 控制每隔固定时间执行一次向下”掉“
  currentTimer = setInterval("moveDown();",  500/currentSpeed);
}

/**
 * 判断是否有一行已满
 */
let lineFull = function() {
  // 依次遍历每一行
  for (let i = 0; i < TETRIS_ROWS; i++) {
    let flag = true;
    // 遍历当前行的每个单元格
    for (let j = 0; j < TETRIS_COLS; j++) {
      if(tetris_status[i][j] === NO_BLOCK) {
        flag = false;
        break;
      }
    }
    // 如果当前行已全部有方块了
    if(flag) {
      // 将当前积分增加100
      currentScoreElement.innerHTML = currentScore += 100;
      // 记录当前积分
      localStorage.setItem("currentScore", currentScore);
      // 如果当前积分达到升级极限。
      if( currentScore >= currentSpeed * currentSpeed * 500) {
        currentSpeedElement.innerHTML = currentSpeed += 1;
        // 使用Local Storage记录curSpeed。
        localStorage.setItem("currentSpeed", currentSpeed);
        clearInterval(currentTimer);
        currentTimer = setInterval("moveDown();",  500/currentSpeed);
      }
      // 把当前行的所有方块下移一行。
      for (let k = i; k > 0; k--) {
        for (let l = 0; l < TETRIS_COLS; l++) {
          tetris_status[k][l] = tetris_status[k-1][l];
        }
      }
      // 消除方块后，重新绘制一遍方块
      drawBlock();      // ②
    }
  }
}

// 控制方块向下掉。
let moveDown = function() {
  // 定义能否下掉的旗标
  let canDown = true;    // ①
  // 遍历每个方块，判断是否能向下掉
  for (let i = 0; i < currentFall.length; i++) {
    // 判断是否已经到“最底下”
    if(currentFall[i].y >= TETRIS_ROWS-1) {
      canDown = false;
      break;
    }
    // 判断下一格是否“有方块”, 如果下一格有方块，不能向下掉
    if(tetris_status[currentFall[i].y + 1][currentFall[i].x] !== NO_BLOCK) {
      canDown = false;
      break;
    }
  }
  // 如果能向下“掉”
  if(canDown) {
    // 将下移前的每个方块的背景色涂成白色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = 'white';
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
    // 遍历每个方块, 控制每个方块的y坐标加1。
    // 也就是控制方块都下掉一格
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      cur.y ++;
    }
    // 将下移后的每个方块的背景色涂成该方块的颜色值
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = colors[cur.color];
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
  } else {    // 不能向下掉
    // 遍历每个方块, 把每个方块的值记录到tetris_status数组中
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 如果有方块已经到最上面了，表明输了
      if(cur.y < 2) {
        // 清空Local Storage中的当前积分值、游戏状态、当前速度
        localStorage.removeItem("currentScore");
        localStorage.removeItem("tetris_status");
        localStorage.removeItem("currentSpeed");
        if(confirm("您已经输了！是否参数排名？")) {
          // 读取Local Storage里的maxScore记录
          maxScore = localStorage.getItem("maxScore");
          maxScore = maxScore == null ? 0 : maxScore;
          // 如果当前积分大于localStorage中记录的最高积分
          if(currentScore >= maxScore) {
            // 记录最高积分
            localStorage.setItem("maxScore", currentScore);
          }
        }
        // 游戏结束
        isPlaying = false;
        // 清除计时器
        clearInterval(currentTimer);
        return;
      }
      // 把每个方块当前所在位置赋为当前方块的颜色值
      tetris_status[cur.y][cur.x] = cur.color;
    }
    // 判断是否有“可消除”的行
    lineFull();
    // 使用Local Storage记录俄罗斯方块的游戏状态
    localStorage.setItem("tetris_status", JSON.stringify(tetris_status));
    // 开始一组新的方块。
    initBlock();
  }
}

// 定义左移方块的函数
let moveLeft = function() {
  // 定义能否左移的旗标
  let canLeft = true;
  for (let i = 0; i < currentFall.length; i++) {
    // 如果已经到了最左边，不能左移
    if(currentFall[i].x <= 0) {
      canLeft = false;
      break;
    }
    // 或左边的位置已有方块，不能左移
    if (tetris_status[currentFall[i].y][currentFall[i].x - 1] !== NO_BLOCK) {
      canLeft = false;
      break;
    }
  }
  // 如果能左移
  if(canLeft) {
    // 将左移前的每个方块的背景色涂成白色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = 'white';
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
    // 左移所有正在下掉的方块
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      cur.x --;
    }
    // 将左移后的每个方块的背景色涂成方块对应的颜色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = colors[cur.color];
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
  }
}

// 定义右移方块的函数
let moveRight = function() {
  // 定义能否右移的旗标
  let canRight = true;
  for (let i = 0; i < currentFall.length; i++) {
    // 如果已到了最右边，不能右移
    if(currentFall[i].x >= TETRIS_COLS-1) {
      canRight = false;
      break;
    }
    // 如果右边的位置已有方块，不能右移
    if (tetris_status[currentFall[i].y][currentFall[i].x + 1] !== NO_BLOCK) {
      canRight = false;
      break;
    }
  }
  // 如果能右移
  if(canRight) {
    // 将右移前的每个方块的背景色涂成白色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = 'white';
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
    // 右移所有正在下掉的方块
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      cur.x ++;
    }
    // 将右移后的每个方块的背景色涂成各方块对应的颜色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = colors[cur.color];
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
  }
}

// 定义旋转方块的函数
let rotate = function() {
  // 定义记录能否旋转的旗标
  let canRotate = true;
  for (let i = 0; i < currentFall.length; i++) {
    let preX = currentFall[i].x;
    let preY = currentFall[i].y;
    // 始终以第三个方块作为旋转的中心,
    // i == 2时，说明是旋转的中心
    if(i !== 2) {
      // 计算方块旋转后的x、y坐标
      let afterRotateX = currentFall[2].x + preY - currentFall[2].y;
      let afterRotateY = currentFall[2].y + currentFall[2].x - preX;
      // 如果旋转后所在位置已有方块，表明不能旋转
      if(tetris_status[afterRotateY][afterRotateX + 1] !== NO_BLOCK) {
        canRotate = false;
        break;
      }
      // 如果旋转后的坐标已经超出了最左边边界
      if(afterRotateX < 0 || tetris_status[afterRotateY - 1][afterRotateX] !== NO_BLOCK) {
        moveRight();
        afterRotateX = currentFall[2].x + preY - currentFall[2].y;
        afterRotateY = currentFall[2].y + currentFall[2].x - preX;
        break;
      }
      if(afterRotateX < 0 || tetris_status[afterRotateY-1][afterRotateX] !== NO_BLOCK) {
        moveRight();
        break;
      }
      // 如果旋转后的坐标已经超出了最右边边界
      if(afterRotateX >= TETRIS_COLS - 1 || tetris_status[afterRotateY][afterRotateX+1] !== NO_BLOCK) {
        moveLeft();
        afterRotateX = currentFall[2].x + preY - currentFall[2].y;
        afterRotateY = currentFall[2].y + currentFall[2].x - preX;
        break;
      }
      if(afterRotateX >= TETRIS_COLS - 1 || tetris_status[afterRotateY][afterRotateX+1] !== NO_BLOCK) {
        moveLeft();
        break;
      }
    }
  }
  // 如果能旋转
  if(canRotate) {
    // 将旋转移前的每个方块的背景色涂成白色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = 'white';
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1 , cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
    for (let i = 0; i < currentFall.length; i++) {
      let preX = currentFall[i].x;
      let preY = currentFall[i].y;
      // 始终以第三个方块作为旋转的中心,
      // i == 2时，说明是旋转的中心
      if(i !== 2) {
        currentFall[i].x = currentFall[2].x + preY - currentFall[2].y;
        currentFall[i].y = currentFall[2].y + currentFall[2].x - preX;
      }
    }
    // 将旋转后的每个方块的背景色涂成各方块对应的颜色
    for (let i = 0; i < currentFall.length; i++) {
      let cur = currentFall[i];
      // 设置填充颜色
      tetris_context.fillStyle = colors[cur.color];
      // 绘制矩形
      tetris_context.fillRect(cur.x*CELL_SIZE+1, cur.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
    }
  }
}

window.focus();
// 为窗口的按键事件绑定事件监听器
window.onkeydown = function(event) {
  switch(event.keyCode) {
      // 按下了“向下”箭头
    case 40:
      if (isPlaying) {
        moveDown();
      }
      break;
      // 按下了“向左”箭头
    case 37:
      if(isPlaying) {
        moveLeft();
      }
      break;
      // 按下了“向右”箭头
    case 39:
      if(isPlaying) {
        moveRight();
      }
      break;
      // 按下了“向上”箭头
    case 38:
      if(isPlaying) {
        rotate();
      }
      break;
  }
}

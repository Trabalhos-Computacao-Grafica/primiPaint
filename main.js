//Make a valid coordinate check fucntion
//Make temporary pixel to help ploting 
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let pixelSize = 0;
let isPainting = false;
let startXY = [0, 0];
let endXY = [0, 0];
let pointsArray = [];
let bezierResolution = 1000
let mode = "paint";

function getWHinputs() {
  width = Number(document.getElementById("width").value);
  height = Number(document.getElementById("height").value);
  pixelSize = Number(document.getElementById("pixelSize").value);
  mainCreateCanvas();
}

function mainCreateCanvas() {
  canvas.width = width;
  canvas.height = height;
  width = canvas.width / pixelSize;
  height = canvas.height / pixelSize;

  const grid = [];
  for (let i = 0; i < width; i++) {
    grid[i] = [];
    for (let j = 0; j < height; j++) {
      grid[i][j] = "#ffffff";
    }
  }

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      ctx.fillStyle = grid[i][j];
      ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
    }
  }
}
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mouseup", stopPainting);
canvas.addEventListener("mousemove", paintPixel);
function startPainting(e) {
  isPainting = true;
  paintPixel(e);
}
function stopPainting() {
  isPainting = false;
}
function paintPixel(e) {
  if (!isPainting) return;
  const rect = canvas.getBoundingClientRect();
  const offsetX = e.clientX - rect.left - canvas.width / 2;
  const offsetY = rect.top + canvas.height / 2 - e.clientY;
  const x = Math.floor(offsetX / pixelSize);
  const y = Math.floor(offsetY / pixelSize)+1;
  handleMode(x, y);
}
function paintPixelCoords(x, y) {
  const color = document.getElementById("color-picker").value;
  const gridX = Math.floor(width / 2) + x;
  //!Testar possiveis problemas futuros! Ajusta para o y ficar em cima do mouse 
  const gridY = Math.floor(height / 2) - y;
  if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
    ctx.fillStyle = color;
    ctx.fillRect(gridX * pixelSize, gridY * pixelSize, pixelSize, pixelSize);
  }
}

//paintArray
function paintArray(coordsArray) {
  var x = 0;
  var y = 0;
  var xy = [[0, 0]];
  for (let i = 0; i < coordsArray.length; i++) {
    xy = coordsArray[i];
    x = xy[0];
    y = xy[1];
    //console.log(xPlot);
    paintPixelCoords(x, y);
  }
  return xy;
}
///Algos
// Bresenham / plotPixel

function plotPixel(x1, y1, x2, y2, dx, dy, decide) {
  let XYS = [];
  //this.XYS = []
  // pk is initial decision making parameter
  // Note:x1&y1,x2&y2, dx&dy values are interchanged
  // and passed in plotPixel function so
  // it can handle both cases when m>1 & m<1
  let pk = 2 * dy - dx;
  for (let i = 0; i <= dx; i++) {
    console.log(x1 + "," + y1);
    if (decide == 0) {
      XYS.push([x1, y1]);
    } else {
      XYS.push([y1, x1]);
    }
    // checking either to decrement or increment the
    // value if we have to plot from (0,100) to
    // (100,0)
    if (x1 < x2) x1++;
    else x1--;
    if (pk < 0) {
      // decision value will decide to plot
      // either x1 or y1 in x's position
      if (decide == 0) {
        pk = pk + 2 * dy;
      } else pk = pk + 2 * dy;
    } else {
      if (y1 < y2) y1++;
      else y1--;
      pk = pk + 2 * dy - 2 * dx;
    }
  }
  return XYS;
}
let coordsList = [];
//Bresenham
function bresenham(x1, y1, x2, y2) {
  // Driver code
  let XYS = [];
  dx = Math.abs(x2 - x1);
  dy = Math.abs(y2 - y1);
  // If slope is less than one
  if (dx > dy) {
    // passing argument as 0 to plot(x,y)
    XYS = plotPixel(x1, y1, x2, y2, dx, dy, 0);
    console.log("0");
  }
  // if slope is greater than or equal to 1
  else {
    // passing argument as 1 to plot (y,x)
    XYS = plotPixel(y1, x1, y2, x2, dy, dx, 1);
    //XYS = plotPixel(x1, y1, x2, y2, dx, dy, 1);
    console.log("1");
  }
  coordsList = XYS;
  let xy = [];
  let xPlot = 0;
  let yPlot = 0;
  const numbers = [1, 2, 3, 4, 5];
  const length = numbers.length;
  //console.log(length);
  // console.log(coordsList.length);
  for (let i = 0; i < coordsList.length; i++) {
    xy = coordsList[i];
    xPlot = xy[0];
    yPlot = xy[1];
    //console.log(xPlot);
    paintPixelCoords(xPlot, yPlot);
  }
  return XYS;
}
//DrawCircle Polynomial
function paintCircle(x1, y1, radius) {
  var x = radius;
  var y = 0;
  var radiusError = 1 - x;

  while (x >= y) {
    paintPixelCoords(x + x1, y + y1);
    paintPixelCoords(-x + x1, y + y1);
    paintPixelCoords(x + x1, -y + y1);
    paintPixelCoords(-x + x1, -y + y1);
    paintPixelCoords(y + x1, x + y1);
    paintPixelCoords(-y + x1, x + y1);
    paintPixelCoords(y + x1, -x + y1);
    paintPixelCoords(-y + x1, -x + y1);

    y++;

    if (radiusError < 0) {
      radiusError += 2 * y + 1;
    } else {
      x--;
      radiusError += 2 * (y - x + 1);
    }
  }
}

//Polyline
//polyLine([10,10],[11,11],[12,12]);
function polyLine(coordsArr) {
  //coordsArr = [[x1,y1],[x2,y2] ....]
  if (coordsArr.length < 3) {
    return "Array < 3!  :(";
  }
  var x = 0,
    y = 0,
    xyFirst = coordsArr[0],
    xyPrev = coordsArr[0],
    xyCurr = [0, 0];

  for (var i = 1; i < coordsArr.length; i++) {
    //x = xyPrev[0];
    //y = xyPrev[1];
    xyCurr = coordsArr[i];
    console.log("wtf");
    bresenham(xyPrev[0], xyPrev[1], xyCurr[0], xyCurr[1]);
    xyPrev = coordsArr[i];
  }
  bresenham(xyPrev[0], xyPrev[1], xyFirst[0], xyFirst[1]);
}
function paintPixelColor(x, y, color) {
  const gridX = Math.floor(width / 2) + x;
  const gridY = Math.floor(height / 2) - y;
  if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
    ctx.fillStyle = color;
    ctx.fillRect(gridX * pixelSize, gridY * pixelSize, pixelSize, pixelSize);
    handleMode(x, y);
  }
}
//Get color - returns color of the coordinate 
//Returns hex
function getRectColor(x,y) {
  const gridX = Math.floor(width / 2) + x;
  const gridY = Math.floor(height / 2) - y;
  
  const imageData = ctx.getImageData(gridX * pixelSize, gridY * pixelSize, pixelSize, pixelSize);
  
  const color = rgbToHex(imageData.data[0],imageData.data[1],imageData.data[2]);

  return color;
}
//Return rgb
function getRectColorRgb(x,y) {
  const gridX = Math.floor(width / 2) + x;
  const gridY = Math.floor(height / 2) - y;
  
  const imageData = ctx.getImageData(gridX * pixelSize, gridY * pixelSize, pixelSize, pixelSize);
  
  const color = `rgb(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]})`;

  //console.log(color);
  return color;
}

// //Recursive Boundary fill

function boundFill(x,y, color, color1){
  const colorCurr = getRectColor(x,y); 
  //console.log(colorCurr);
  if(colorCurr!== color && colorCurr!== color1){
    paintPixelColor(x,y,color);
    boundFill(x + 1, y, color, color1);
    boundFill(x, y + 1, color, color1);
    boundFill(x - 1, y, color, color1);
    boundFill(x, y - 1, color, color1);
  }
}
function boundFill8(x,y, color, color1){
  const colorCurr = getRectColor(x,y); 
  //console.log(colorCurr);
  if(colorCurr!== color && colorCurr!== color1){
    paintPixelColor(x,y,color);
    boundFill8(x + 1, y, color, color1);
    boundFill8(x, y + 1, color, color1);
    boundFill8(x - 1, y, color, color1);
    boundFill8(x, y - 1, color, color1);
    boundFill8(x - 1, y - 1, color, color1);
    boundFill8(x - 1, y + 1, color, color1);
    boundFill8(x + 1, y - 1, color, color1);
    boundFill8(x + 1, y + 1, color, color1);
  }
}
//complete floodfill
function floodFill(x, y, color, color1) {
  const colorCurr = getRectColor(x, y);
  
  if (colorCurr !== color1) {
    paintPixelColor(x, y, color);
    
    floodFill(x + 1, y, color, color1);
    floodFill(x, y + 1, color, color1);
    floodFill(x - 1, y, color, color1);
    floodFill(x, y - 1, color, color1);
    floodFill(x - 1, y - 1, color, color1);
    floodFill(x - 1, y + 1, color, color1);
    floodFill(x + 1, y - 1, color, color1);
    floodFill(x + 1, y + 1, color, color1);
  }
}

function scan(lx, rx, y, stack, colour) {
  var stackLocal = [{ x, y, colour }];
  stackLocal = stack;
  for (let i = lx; i < rx; i++) {
    // if (isValidSquare(i, y, colour)) {
    stackLocal.push({x: i, y: y, colour: colour});
   }
  return stackLocal;
}
function fill(x, y, colour) {
        let stack = [{ x, y, colour }];

        while (stack.length > 0) {
            let {x, y, colour} = stack.pop();
            let lx = x;

            while (isValidSquare(lx, y, colour)) {
                grid[lx][y] = '#367588'
                lx = lx -1;
            }

            let rx = x + 1;
            while (isValidSquare(rx, y, colour)) {
                grid[rx][y] = '#367588'
                rx = rx + 1;
            }
            stack = scan(lx, rx - 1, y + 1, stack, colour);
            stack = scan(lx, rx - 1, y - 1, stack, colour);
        }
        return;
}
function floodFill2(x, y, color) {
  const stack = [];
  stack.push({ x, y });

  const startColor = getRectColor(x, y);
  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const colorCurr = getRectColor(x, y);

    if (colorCurr !== startColor) {
      continue;
    }

    if (colorCurr !== color) {
      paintPixelColor(x, y, color);

      stack.push({ x: x + 1, y });
      stack.push({ x: x, y: y + 1 });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y - 1 });
    }
  }
}

// function floodStackFill(x, y, color, color1) {
//   const stack = [];
//   stack.push({ x, y });

//   while (stack.length > 0) {
//     const { x, y } = stack.pop();
//     const colorCurr = getRectColor(x, y);

//     if (colorCurr !== color && colorCurr !== color1) {
//       paintPixelColor(x, y, color);

//       stack.push({ x: x + 1, y });
//       stack.push({ x: x, y: y + 1 });
//       stack.push({ x: x - 1, y });
//       stack.push({ x, y: y - 1 });
//     }
//   }
// }

function stackFill8(x, y, color, color1) {
  const stack = [];
  stack.push({ x, y });

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const colorCurr = getRectColor(x, y);

    if (colorCurr !== color && colorCurr !== color1) {
      paintPixelColor(x, y, color);

      stack.push({ x: x + 1, y });
      stack.push({ x: x, y: y + 1 });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y - 1 });
      stack.push({ x: x + 1, y: y + 1 });
      stack.push({ x: x - 1, y: y + 1 });
      stack.push({ x: x + 1, y: y - 1 });
      stack.push({ x: x - 1, y: y - 1 });
    }
  }
}
//Bezier curv
// Function to calculate binomial coefficient
function binomialCoefficient(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  return result;
}
function scanFill(startX, startY, replacementColor) {
   const canvasWidth = canvas.width;
   const canvasHeight = canvas.height;
   const targetColor = getRectColor(startX, startY);
   const stack = [[startX, startY]];
   const min = Number.MIN_SAFE_INTEGER;
   const max = Number.MAX_SAFE_INTEGER;
   const visited = new Set();
  //In this version, the visited set is used to keep track of the visited pixels using their coordinates as unique keys ("${x},${y}").
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const key = `${x},${y}`;

    if (!visited.has(key) && getRectColor(x, y) === targetColor) {
      paintPixelCoords(x, y);
      visited.add(key);

      // Check left
      if (x > min) stack.push([x - 1, y]);
      // Check right
      if (x < max) stack.push([x + 1, y]);
      // Check up
      if (y > min) stack.push([x, y - 1]);
      // Check down
      if (y < max) stack.push([x, y + 1]);
    }
  }
}
function scanFill1(startX, startY, replacementColor) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const targetColor = getRectColor(startX, startY);
  const stack = [[startX, startY]];
  const min = Number.MIN_SAFE_INTEGER;
  const max = Number.MAX_SAFE_INTEGER;
  while (stack.length > 0) {
    let [x, y] = stack.pop();

    while (x >= min && getRectColor(x, y) === targetColor) {
      x--;
    }

    x++;

    let leftPixelFound = false;
    let rightPixelFound = false;

    while (x < max && getRectColor(x, y) === targetColor) {
      paintPixelCoords(x, y);

      if (!leftPixelFound && y > min && getRectColor(x, y - 1) === targetColor) {
        stack.push([x, y - 1]);
        leftPixelFound = true;
      } else if (leftPixelFound && y > min && getRectColor(x, y - 1) !== targetColor) {
        leftPixelFound = false;
      }

      if (!rightPixelFound && y < max && getRectColor(x, y + 1) === targetColor) {
        stack.push([x, y + 1]);
        rightPixelFound = true;
      } else if (rightPixelFound && y < max && getRectColor(x, y + 1) !== targetColor) {
        rightPixelFound = false;
      }

      x++;
    }
  }
}

// haduken fill!
// function scanFill(x, y, color) {
//   const canvasWidth = canvas.width;
//   const canvasHeight = canvas.height;
//   const stack = [];
//   stack.push({ x, y });

//   const startColor = getRectColor(x, y);
//   if (startColor === color) {
//     return;
//   }

//   while (stack.length > 0) {
//     const { x, y } = stack.pop();
//     let currentX = x;
//     let currentY = y;

//     // Find the leftmost boundary of the region to fill
//     while (currentX >= 0 && getRectColor(currentX, currentY) === startColor) {
//       currentX--;
//     }
//     currentX++;

//     let spanAbove = false;
//     let spanBelow = false;

//     // Fill the scanline and check for spans above and below
//     while (currentX < canvasWidth && getRectColor(currentX, currentY) === startColor) {
//       paintPixelColor(currentX, currentY, color);

//       // Check above the current scanline
//       if (!spanAbove && currentY > 0 && getRectColor(currentX, currentY - 1) === startColor) {
//         stack.push({ x: currentX, y: currentY - 1 });
//         spanAbove = true;
//       } else if (spanAbove && currentY > 0 && getRectColor(currentX, currentY - 1) !== startColor) {
//         spanAbove = false;
//       }

//       // Check below the current scanline
//       if (!spanBelow && currentY < canvasHeight - 1 && getRectColor(currentX, currentY + 1) === startColor) {
//         stack.push({ x: currentX, y: currentY + 1 });
//         spanBelow = true;
//       } else if (spanBelow && currentY < canvasHeight - 1 && getRectColor(currentX, currentY + 1) !== startColor) {
//         spanBelow = false;
//       }

//       // Move to the next pixel on the scanline
//       currentX++;
//     }
//   }
// }


// Function to calculate the Bezier curve point
function calculateBezierPoint(t, points) {
  const n = points.length - 1;
  let x = 0;
  let y = 0;

  for (let i = 0; i <= n; i++) {
    const coefficient = binomialCoefficient(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    x += points[i][0] * coefficient;
    y += points[i][1] * coefficient;
  }

  return { x, y };
}

// Function to plot the Bezier curve on a grid
function paintBezierCurve(points, resolution) {
  const resolution1 = resolution * points.length;
  const step = 1 / resolution;
 
  for (let t = step; t <= 1; t += step) {
      const rect = canvas.getBoundingClientRect();

    const { x, y } = calculateBezierPoint(t, points);
    //paintPixelCoords(x, y);
    const offsetX = x- rect.left - canvas.width / 2;
    const offsetY = rect.top + canvas.height / 2 - y;
    const x1 = Math.floor(offsetX / pixelSize);
    const y1 = Math.floor(offsetY / pixelSize);
    
    
    let gridX = Math.floor(width / 2) + x1;
    let gridY = Math.floor(height / 2) - y1;
    gridX = Math.floor(x); 
    gridY = Math.floor(y); 
    console.log(gridX);
    console.log(gridY);
    paintPixelCoords(gridX, gridY);
    // // console.log("plot!");
    // // console.log(gridX);
    // // console.log(gridY);
    
  }
}

 // const points = [
 //   [50, 100],   
 //   [200, 50],   
 //   [300, 150], 
 //   [450, 100]   
 // ];

//const resolution = 100; // Increase the resolution for smoother curves

//paintBezierCurve([[50, 100],[200, 50],[300, 150],[450, 100]], 100);
    
function handleMode(x, y) {
  if(mode === "paint"){
    paintPixelCoords(x, y);
  }
  if (mode === "line" || mode === "lineBegin") {
    if (mode === "line") {
      console.log("startXYplaced");
      startXY = [x, y];
      mode = "lineBegin";
      return;
    }
    if (mode === "lineBegin") {
      console.log("endXYplaced");

      endXY = [x, y];
      mode = "paint";
      bresenham(startXY[0], startXY[1], endXY[0], endXY[1]);
    }
  }
  if(mode === "circle" || mode === "circleBegin"){
      if(mode === "circle"){
        console.log("startXYplaced");
        startXY = [x, y];
        mode = "circleBegin";
        return;
      }
      
      if (mode === "circleBegin") {
        console.log("radiusPlaced");
        endXY = [x, y];
        var dist = Math.sqrt( Math.pow((startXY[0]-endXY[0]), 2) + Math.pow((startXY[1]-endXY[1]),2) );
        mode = "paint";
        paintCircle(startXY[0],startXY[1],dist);
      }
  }
  if(mode === "fill"){
    var color = document.getElementById("color-picker").value;
    console.log("fillBegin");
    startXY = [x, y];
    console.log(startXY[0]);
    floodFill2(startXY[0],startXY[1],color);
    console.log("fillEnd");
    mode = "paint"
  }
  if(mode === "fill2"){
    var color = document.getElementById("color-picker").value;
    console.log("fillBegin");
    startXY = [x, y];
    console.log(startXY[0]);
    scanFill(startXY[0],startXY[1],color);
    console.log("fillEnd");
    mode = "paint"
  }
  if(mode === "bezier"){
     console.log("startXYplaced");
     pointsArray.push([x, y]);
     //mode = "bezierEnd";
     return;
  }
  if(mode === "polyLine"){
     console.log("startXYplaced");
     pointsArray.push([x, y]);
     //mode = "bezierEnd";
     return;
  } 
}
function bresenhamMouse() {
  mode = "line";
}
function circleMouse() {
  mode = "circle";

}
function polyLineMouse() {
  mode = "polyLine";
}
function polyLineEnd() {
  console.log("array");
  console.log(pointsArray);
  polyLine(pointsArray, bezierResolution);
  mode = "paint";
  pointsArray = [];
}
function fillMouse(){
  mode = "fill";
}
function fill2Mouse(){
  mode = "fill2";
}
function bezierCurveMouse(){
  mode = "bezier";
}
function endBezier(){
  console.log("array");
  console.log(pointsArray);
  paintBezierCurve(pointsArray, bezierResolution);
  mode = "paint";
  pointsArray = [];

}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function runSelected() {
  var algo = document.getElementById("select").value;
  
  //var text = algo.options[algo.selectedIndex].text;
  console.log(algo);
  
  var x1 = Number(document.getElementById("x1").value);
  var y1 = Number(document.getElementById("y1").value);
  var x2 = Number(document.getElementById("x2").value);
  var y2 = Number(document.getElementById("y2").value);
  var text = document.getElementById("text").value;
  //depois converter hex to rgb
  var color = document.getElementById("color-picker").value;
  switch (algo) {
    case "0":
      paintPixelCoords(x1,y1);
      break;
    case "1":
      bresenham(x1,y1,x2,y2);
      break;
    case "2":
      paintCircle(x1,y1,x2);
      break;
    case "3":
    case "4":
    case "5":
    case "6":
      floodFill2(x1,y1,color);
      break;
    case "7":
      scanFill(x1,y1,color);
      break;
    case "8":
      
  }
}
//Examples:
//paintPixelCoords(0,0);
//bresenham(10,10,20,20);
//paintCircle(10,10,15);
//boundFill(10,10,"rgb(200, 0, 0)", "rgb(0, 0, 0)");
//floodFill(10,10,"rgb(200, 0, 0)", "rgb(0, 0, 0)"); <-- muito lento kkkk
//stackFill(10,10,"rgb(200, 0, 0)", "rgb(0, 0, 0)");
//floodFill2(10,10,"rgb(200, 0, 0)");
//polyLine([[-30,-1],[-8,21],[13,-1]]);
//paintBezierCurve([[50, 100],[200, 50],[300, 150],[450, 100]], 100);
//paintBezierCurve([[10, 20],[40, 10],[60, 30],[90, 20]], 100);

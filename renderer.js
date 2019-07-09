// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict'

//const remote = require('remote')
const os = require('os')
const path = require('path')
const fs = require('fs')
const dataUriToBuffer = require('data-uri-to-buffer')
const vex = require('vex-js')
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os'


// ファイルの保存先
const desktopDirName = 'Desktop'
const imageFileName = 'my-canvas.png'
const homeDirPath = os.homedir()
const desktopDirPath = path.join(homeDirPath, desktopDirName)
const imageFilePath = path.join(desktopDirPath, imageFileName)
console.log(desktopDirPath);

// 各要素を保持
const clearCanvasButton = document.querySelector('#clear-canvas')
const saveCanvasButton = document.querySelector('#save-canvas')
const myCanvas = document.querySelector('#my-canvas')

// <canvas>のレンダリングコンテキストを保持
const ctx = myCanvas.getContext('2d')

// <canvas>の描画設定
const backgroundColor = '#fff'
const lineColor = '#000'
const lineWidth = 3
const textColor = '#000'

// <canvas>の背景を塗りつぶし
clearCanvas()

// <canvas>の描画処理の変数
let drawing = false
let startPoint = {x: 0, y: 0}

function saveCanvas () {
  const canvasDataUrl = myCanvas.toDataURL()
  const decoded = dataUriToBuffer(canvasDataUrl)
  fs.writeFile(imageFilePath, decoded, (err) => {
    if (err) {
      window.alert('ファイルの保存に失敗しました')
      console.log(err)
    } else {
      window.alert('ファイルを保存しました')
    }
  })
}

function clearCanvas () {
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height)
}

function getPointOnCanvas (event) {
  const x = event.pageX - myCanvas.offsetLeft
  const y = event.pageY - myCanvas.offsetTop
  return {x, y}
}

CanvasRenderingContext2D.prototype.fillTextVertical = function (text, x, y) {
  var context = this;
  var canvas = context.canvas;
  
  var arrText = text.split('');
  var arrWidth = arrText.map(function (letter) {
      return context.measureText(letter).width;
  });
  
  var align = context.textAlign;
  var baseline = context.textBaseline;
  
  if (align == 'left') {
      x = x + Math.max.apply(null, arrWidth) / 2;
  } else if (align == 'right') {
      x = x - Math.max.apply(null, arrWidth) / 2;
  }
  if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
      y = y - arrWidth[0] / 2;
  } else if (baseline == 'top' || baseline == 'hanging') {
      y = y + arrWidth[0] / 2;
  }
  
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // 开始逐字绘制
  arrText.forEach(function (letter, index) {
      // 确定下一个字符的纵坐标位置
      var letterWidth = arrWidth[index];
      // 是否需要旋转判断
      var code = letter.charCodeAt(0);
      if (code <= 256) {
          context.translate(x, y);
          // 英文字符，旋转90°
          context.rotate(90 * Math.PI / 180);
          context.translate(-x, -y);
      } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
          // y修正
          y = y + arrWidth[index - 1] / 2;
      }
      context.fillText(letter, x, y);
      // 旋转坐标系还原成初始态
      context.setTransform(1, 0, 0, 1, 0, 0);
      // 确定下一个字符的纵坐标位置
      var letterWidth = arrWidth[index];
      y = y + letterWidth;
  });
  // 水平垂直对齐方式还原
  context.textAlign = align;
  context.textBaseline = baseline;
};

clearCanvasButton.addEventListener('click', clearCanvas, false)

saveCanvasButton.addEventListener('click', saveCanvas, false)

myCanvas.addEventListener('mousedown', (event) => {
  event.preventDefault()
  drawing = true
  startPoint = getPointOnCanvas(event)
}, false)

myCanvas.addEventListener('mouseup', (event) => {
  event.preventDefault()
  const endPoint = getPointOnCanvas(event)

  ctx.strokeStyle = lineColor
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.rect(startPoint.x, startPoint.y, Math.abs(endPoint.x - startPoint.x), Math.abs(endPoint.y - startPoint.y));
  ctx.stroke()

  ctx.font = '24px Microsoft YaHei, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = textColor
  vex.dialog.prompt({
    message: '你说你' + String.fromCodePoint('0x1F434') + '呢？',
    placeholder: String.fromCodePoint('0x00BF'),
    callback: function (value) {
      ctx.fillTextVertical(value, startPoint.x + 15, startPoint.y)
    }
})
  
  drawing = false
}, false)

myCanvas.addEventListener('mousemove', (event) => {
  if (!drawing) return
  event.preventDefault()
}, false)
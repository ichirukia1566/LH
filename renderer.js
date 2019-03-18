// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict'

//const remote = require('remote')
const os = require('os')
const path = require('path')
const fs = require('fs')
const dataUriToBuffer = require('data-uri-to-buffer')


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

clearCanvasButton.addEventListener('click', clearCanvas, false)

saveCanvasButton.addEventListener('click', saveCanvas, false)

myCanvas.addEventListener('mousedown', (event) => {
  event.preventDefault()
  drawing = true
  startPoint = getPointOnCanvas(event)
}, false)

myCanvas.addEventListener('mouseup', (event) => {
  event.preventDefault()
  drawing = false
}, false)

myCanvas.addEventListener('mousemove', (event) => {
  if (!drawing) return
  event.preventDefault()

  const endPoint = getPointOnCanvas(event)

  ctx.strokeStyle = lineColor
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.moveTo(startPoint.x, startPoint.y)
  ctx.lineTo(endPoint.x, endPoint.y)
  ctx.stroke()

  startPoint = endPoint
}, false)
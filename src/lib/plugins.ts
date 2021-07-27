
import * as fs from 'fs'
import * as path from 'path'

let html = 'html-webpack-plugin'
let webpack = 'webpack'
let chunk = 'webpack/lib/Chunk'

let relativePath = path.relative(__dirname, process.cwd())
let p = relativePath.split(path.sep)
if (p.length === 4 && p[2] === 'sample') {
  html = path.resolve(__dirname, relativePath, 'node_modules', html)
  webpack = path.resolve(__dirname, relativePath, 'node_modules', webpack)
  chunk = path.resolve(__dirname, relativePath, 'node_modules', chunk)
}
let HtmlWebpackPlugin = require(html)
let Webpack = require(webpack)
let Chunk = require(chunk)
export default {
  HtmlWebpackPlugin,
  Webpack,
  Chunk
}

import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(__dirname, '../../env.js')
let html = 'html-webpack-plugin'
if (fs.existsSync(envPath)) {
  let env = require(envPath)
  if (env.htmlWebpackPlugin) {
    html = env.htmlWebpackPlugin
  }
}
let _HtmlWebpackPlugin = require(html)
export const HtmlWebpackPlugin = _HtmlWebpackPlugin
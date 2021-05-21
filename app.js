const expree = require('express')
const app = expree()
const multiparty = require('multiparty')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
// 处理formdata
const multipart = require('connect-multiparty')
const multipartyMiddleware = multipart()

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  next()
})

// parse application/x-www-form-urlencoded  
app.use(bodyParser.urlencoded({ extended: false }))    

// parse application/json  
app.use(bodyParser.json())   

app.get('/', (req, res) => {
  res.send({
    status: 0,
    query: req.query
  })
})

app.post('/test', (req, res) => {
  res.send({
    status: 0,
    body: req.body
  })
})

app.use('/public', expree.static('public'))

// TODO: 能获取formdata中的参数，但是会中断图片的上传
// app.post('/upload', multipartyMiddleware, (req, res) => {
app.post('/upload', (req, res) => {
  console.log('req------', req.body)
  var form = new multiparty.Form({ uploadDir: './public/images' })
  form.on('file', (name, file) => { // 接收到文件参数时，触发file事件
    console.log('---', name, file)
    let isRename = true
    if (isRename) {
      fs.rename(path.join(__dirname+ '/' + file.path), path.join(__dirname + `/public/images/${file.originalFilename}`), (err, msg) => {
      // fs.rename(path.resolve(file.path), path.resolve(`public/images/${file.originalFilename}`), (err, msg) => {
        if (err) {
          console.log('改名失败', err)
          res.send({
            status: -1,
            msg: 'rename fail',
            err
          })
        } else {
          console.log('改名成功', msg)
          res.json({
            status: 0,
            imgSrc: 'public/images/'+file.originalFilename,
            file
          })
        }
      })
    } else {
      res.json({
        status: 0,
        imgSrc: file.path,
        file
      })
    }
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.send({
        status: -1,
        msg: 'upload fail',
        err
      })
    }
  })
})

app.listen(3000, () => {
  console.log('server is runnig...http://localhost:3000')
})

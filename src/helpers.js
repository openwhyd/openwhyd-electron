const { net, dialog } = require('electron')

function httpReq(options, data, callback) {
  const req = net.request(options)
  req.on('response', (res) => {
    let rawData = ''
    res.setEncoding('utf8')
    res.on('data', (chunk) => { rawData += chunk })
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData)
        callback(null, parsedData)
      } catch (e) {
        callback(e)
      }
    })
  })
  if (typeof data === 'object') {
    req.setHeader('Content-Type', 'application/json')
    data = JSON.stringify(data)
  } else if (typeof data === 'string') {
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded')
  }
  req.end(data)
  return req
}

function httpGet(options, callback) {
  return httpReq(options, null, callback)
}

function httpPost(options, data, callback) {
  return httpReq(Object.assign({ method: 'post' }, options), data, callback)
}

function showError(err) {
  dialog.showMessageBox({ type: 'error', message: err.message || JSON.stringify(err) })  
}

exports.httpGet = httpGet
exports.httpPost = httpPost
exports.showError = showError

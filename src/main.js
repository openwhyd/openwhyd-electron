const { app, session, BrowserWindow, Menu, net } = require('electron')
const { menu } = require('./menu')

require('electron-debug')({
  enabled: true, // => DevTools are also usable in production
  showDevTools: false // `true` to show DevTools on each created BrowserWindow
})

const URL_PREFIX = 'https://openwhyd.org'
const FB_APP_ID = 169250156435902

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

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
  return req;
}

function httpGet(options, callback) {
  return httpReq(options, null, callback)
}

function httpPost(options, data, callback) {
  return httpReq(Object.assign({ method: 'post' }, options), data, callback)
}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    icon: __dirname + '/icon.ico',
    width: 1024,
    height: 900,
    webPreferences: {
      nodeIntegration: false, // to let jquery load in web mode
    },
  })

  Menu.setApplicationMenu(menu)
  //win.setMenu(menu) // for linux and windows only (necessary?)

  // and load the index.html of the app.
  win.loadURL(URL_PREFIX)

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  win.webContents.on('did-navigate', (evt, url) => {
    console.log('⚡️  did-navigate', url)
    if (url.match(/^https\:\/\/www.facebook.com\/connect\/login_success.html#access_token=([^&$]+)/)) {
      const token = RegExp.$1
      console.log('🔐  got fb access token:', token)
      httpGet({ url: `https://graph.facebook.com/me?access_token=${token}` }, (err, res) => {
        console.log('👱  graph.facebook.com/me =>', err || res)
        const body = {
          ajax: 'renderJSON',
          fbUid: res.id,
          fbAccessToken: token
        }
        // cf https://github.com/openwhyd/openwhyd/blob/34b05676c8f3e286284bf217cb1f8384fe7a3b39/whydJS/public/js/facebook.js#L138
        httpPost({ url: `${URL_PREFIX}/facebookLogin` }, body, (err, res) => {
          console.log('🔐  facebookLogin =>', err || res)
          // TODO: handle errors from res.result, e.g. 'nok, user id=510739408 not found in db'
          win.loadURL(URL_PREFIX + res.redirect)
        })
      })
    }
  })

  win.webContents.on('new-window', (evt, url) => {
    evt.preventDefault()
    console.log('⚡️  intercepted new window event:', url)
    // TODO: test if facebook login url
    const redirect = 'https://www.facebook.com/connect/login_success.html'
    win.loadURL(`https://www.facebook.com/v2.10/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirect}&response_type=token`)
  })

  // clear cookies on start, https://stackoverflow.com/a/37521169/592254
  //session.defaultSession.clearStorageData([], (data) => {}) // for testing / troubleshooting
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

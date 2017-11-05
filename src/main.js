const { app, session, BrowserWindow, Menu } = require('electron')
const { menu } = require('./menu')
const { httpGet, httpPost, showError } = require('./helpers')

require('electron-debug')({
  enabled: true, // => DevTools are also usable in production
  showDevTools: false // `true` to show DevTools on each created BrowserWindow
})

const TROUBLESHOOTING = true
const URL_PREFIX = 'https://openwhyd.org'
const FB_APP_ID = 169250156435902
const BROWSER_WINDOW_SETTINGS = {
  icon: __dirname + '/icon.ico',
  width: 1024,
  height: 900,
  webPreferences: {
    nodeIntegration: false, // to let jquery load in web mode
  },
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  win = new BrowserWindow(BROWSER_WINDOW_SETTINGS)
  
  if (TROUBLESHOOTING) {
    // clear cookies on start, https://stackoverflow.com/a/37521169/592254
    session.defaultSession.clearStorageData([], (data) => {}) // for testing / troubleshooting
    win.webContents.openDevTools() // for testing / troubleshooting
  }

  Menu.setApplicationMenu(menu)
  win.setMenu(menu) // for linux and windows only (necessary?)
  win.loadURL(URL_PREFIX)

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null // to allow garbage collection
  })

  win.webContents.on('did-navigate', (evt, url) => {
    console.log('⚡️  did-navigate', url)
    // intercept login/auth response from facebook
    if (url.match(/^https\:\/\/www.facebook.com\/connect\/login_success.html#access_token=([^&$]+)/)) {
      const token = RegExp.$1
      console.log('🔐  got fb access token:', token)
      // get facebook user id (required by openwhyd api)
      httpGet({ url: `https://graph.facebook.com/me?access_token=${token}` }, (err, res) => {
        if (err) showError(err)
        console.log('👱  graph.facebook.com/me =>', err || res)
        const body = {
          ajax: 'renderJSON',
          fbUid: res.id,
          fbAccessToken: token
        }
        // login to openwhyd using facebook access token and user id
        // cf https://github.com/openwhyd/openwhyd/blob/34b05676c8f3e286284bf217cb1f8384fe7a3b39/whydJS/public/js/facebook.js#L138
        httpPost({ url: `${URL_PREFIX}/facebookLogin` }, body, (err, res) => {
          console.log('🔐  facebookLogin =>', err || res)
          if (err) {
            showError(err)
          } else if (!res.redirect) {
            showError(res)
          } else {
            win.loadURL(URL_PREFIX + res.redirect)
          }
          // TODO: better handle errors from res.result, e.g. 'nok, user id=510739408 not found in db'
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
}

// Electron is ready to create browser windows, and APIs can be used
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS, user quits explicitly the application with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, re-create a window when user clicks the dock icon and no other window is open
  if (win === null) {
    createWindow()
  }
})

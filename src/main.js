const { app, session, BrowserWindow, Menu } = require('electron')
const { menu } = require('./menu')
const { initFacebookLogin } = require('./facebookLogin')

require('electron-debug')({
  enabled: true, // => DevTools are also usable in production
  showDevTools: false // `true` to show DevTools on each created BrowserWindow
})

const TROUBLESHOOTING = false
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

  initFacebookLogin(win, FB_APP_ID, URL_PREFIX)

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null // to allow garbage collection
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

const { globalShortcut } = require('electron')

const KEY_MAPPING = {
  mediaplaypause: 'window.whydPlayer.playPause();',
  medianexttrack: 'window.whydPlayer.next();',
  mediaprevioustrack: 'window.whydPlayer.prev();'
}

// Setup media keys
// Copied from https://gist.github.com/twolfson/0a03820e27583cc9ad6e
exports.setup = function ({ win }) {
  Object.keys(KEY_MAPPING).forEach(key => {
    const command = KEY_MAPPING[key]
    globalShortcut.register(key, function () {
      win.webContents.executeJavaScript(command)
    })
  })
}

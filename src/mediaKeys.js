const { globalShortcut, remote } = require('electron')

const KEY_MAPPING = {
  'mediaplaypause': 'window.whydPlayer.playPause();',
  'medianexttrack': 'window.whydPlayer.next();',
  'mediaprevioustrack': 'window.whydPlayer.prev();',
}

// Setup media keys
// Copied from https://gist.github.com/twolfson/0a03820e27583cc9ad6e
exports.setup = function({ win }) {

  Object.keys(KEY_MAPPING).forEach(key => {
    const command = KEY_MAPPING[key]
    var registered = globalShortcut.register(key, function () {
      // console.log('[mediaKeys]', key, 'pressed')
      win.webContents.executeJavaScript(command)
    })
    /*
    if (!registered) {
      console.log('[mediaKeys]', key, 'registration failed')
    } else {
      console.log('[mediaKeys]', key, 'registration bound!')
    }
    */
  });
}
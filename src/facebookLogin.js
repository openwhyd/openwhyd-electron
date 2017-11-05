const { httpGet, httpPost, showError } = require('./helpers')

function initFacebookLogin(win, FB_APP_ID, URL_PREFIX) {

  console.log('🔐  Facebook Login for', { FB_APP_ID, URL_PREFIX })

  win.webContents.on('did-navigate', (evt, url) => {
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
    // TODO: test if facebook login url
    const redirect = 'https://www.facebook.com/connect/login_success.html'
    win.loadURL(`https://www.facebook.com/v2.10/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirect}&response_type=token`)
  })
}

exports.initFacebookLogin = initFacebookLogin

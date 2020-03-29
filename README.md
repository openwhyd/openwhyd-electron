# Openwhyd-electron

[Openwhyd](https://openwhyd.org) as a native app for your favorite OS, powered by Electron.
This installable application allows to play Openwhyd tracks in the background! 👌

![screenshot](docs/screenshot.png)

Download and install the file corresponding to your Operating System, from [that list](https://github.com/openwhyd/openwhyd-electron/releases).

ℹ️ Mac OS / Darwin users: The application is not signed yet, so you may need to follow these instructions in order to run it: https://support.apple.com/kb/ph18657

⭐️ Did it work for you? Please leave your feedback [on Github](https://github.com/openwhyd/openwhyd-electron/issues/6) or [on Facebook](https://www.messenger.com/t/openwhyd).

🛠 Contributors are welcome! If you want to help, you can create [issues](https://github.com/openwhyd/openwhyd-electron/issues) for bugs you may find and/or improvement requests. If you want to contribute, check out our [backlog](https://github.com/openwhyd/openwhyd-electron/projects/1) and come say "hi" on one of the issues you'd be interested in contributing to.

### Dev Setup

1. Run openwhyd locally following the install guide [https://github.com/openwhyd/openwhyd/blob/master/docs/INSTALL.md](https://github.com/openwhyd/openwhyd/blob/master/docs/INSTALL.md)
2. clone `https://github.com/openwhyd/openwhyd-electron` on your computer.
3. Modify the `const URL_PREFIX` found in the file `src/main.js` from `https://openwhyd.org` to `http://localhost:8080`
4. Now open a second terminal window and type the following commands

```sh
$ cd openwhyd-electron # Go into the repository
$ npm install # Install dependencies
$ npm start # The local electron app should pop open with Openwhyd's home page! 🎉
```
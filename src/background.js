
import path from 'path';
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  Tray,
  Menu,
  netLog,
} from 'electron';

import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';

import Badge from 'electron-windows-badge';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

const isDevelopment = process.env.NODE_ENV !== 'production';

// 自动更新
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
  // win.setProgressBar(0.5)
}

log.info('App starting...');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray;
let badgeNum = 0;

// 主进程状态和配置管理
let customConfig;
if (process.platform === 'darwin') {
  customConfig = {
    logoPath: 'finger.jpg',
    tipsLogoPath: 'finger.jpg',
    netLog: '/test/',
  };
} else {
  customConfig = {
    logoPath: 'finger.jpg',
    tipsLogoPath: 'finger.jpg',
    netLog: 'D:/test/',
  };
}
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__static, customConfig.logoPath),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 在这里执行顺序很重要，如果在页面 loadURL 之后声明执行，将导致依赖的一些对象初始化时机过迟，报错

  // 系统托盘，自定义操作
  tray = new Tray(path.join(__static, customConfig.logoPath));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'devtools',
      click(menuItem, browserWindow, event) {
        log.info('tray openDevTools');
        win.webContents.openDevTools();
      },
    },
    {
      label: '关闭窗口',
      click(menuItem, browserWindow, event) {
        log.info('tray 关闭窗口');
        if (process.platform === 'darwin') {
          app.hide();
        } else {
          win.hide();
        }
      },
    },
    {
      label: '退出',
      click(menuItem, browserWindow, event) {
        log.info('tray 退出');
        win.destroy();
        app.quit();
      },
    },
  ]);
  tray.setToolTip('fans');
  tray.setContextMenu(contextMenu);

  tray.on('click', (event) => {
    log.info('tray click');
    win.show();
    // 重新绑定徽章逻辑，因为在执行 close 生命周期的时候，win 被 destroy
    const badgeOptions = {};
    const newBagde = new Badge(win, badgeOptions);
    newBagde.update(badgeNum);
    badgeNum = 0;
  });

  // 初始化 下角标提示
  const badgeOptions = {};
  new Badge(win, badgeOptions);

  // 页面加载start
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }
  // win.webContents.openDevTools()

  win.on('close', (e) => {
    log.info('win close');
    e.preventDefault();
    if (win.isFocused()) {
      if (process.platform === 'darwin') {
        app.hide();
      } else {
        win.hide();
      }
    } else {
      app.quit();
      app.exit();
    }

    e.returnValue = false;
  });

  // 处理外链打开逻辑
  win.webContents.on('new-window', (e, url, frameName, disposition, options) => {
    log.info('win new-window');
    e.preventDefault();
    shell.openExternal(url);
    e.returnValue = false;
  });
  // win.onbeforeunload = (e) => {
  //     console.log('I do not want to be closed')
  //
  //     // 与通常的浏览器不同,会提示给用户一个消息框,
  //     //返回非空值将默认取消关闭
  //     //建议使用对话框 API 让用户确认关闭应用程序.
  //     e.returnValue = false // 相当于 `return false` ，但是不推荐使用
  // }
  // win.on('closed', (e) => {
  //     e.preventDefault();
  //     return false;
  // });

  // 监控文件下载进度
  win.webContents.session.on('will-download', (event, item, webContents) => {
    // 阻止文件下载
    // event.preventDefault()
    // require('request')(item.getURL(), (data) => {
    //   require('fs').writeFileSync('/somewhere', data)
    // })

    // 控制文件下载
    // item.setSavePath('/tmp/save.pdf') // 如果预设路径，将不弹出对话框
    // win.webContents.downloadURL('');
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        win.webContents.send('down-fail');
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
          win.webContents.send('down-process');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
          if (win.isDestroyed()) {
            return;
          }
          win.webContents.send('down-process', {
            filename: item.getFilename(),
            receive: item.getReceivedBytes(),
            total: item.getTotalBytes(),
          });
          win.setProgressBar(Math.floor(item.getReceivedBytes() / item.getTotalBytes()));
        }
      }
    });
    item.once('done', (event, state) => {
      win.setProgressBar(-1);
      if (state === 'completed') {
        console.log('Download successfully');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });


  // window10 通知fix
  app.setAppUserModelId('com.electron.fans');
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();

  // 进行ready 之后的操作管理
  // netLog.startLogging(path.join(__static, customConfig.logoPath))
  netLog.startLogging(customConfig.logoPath);

  // // After some network events
  // const path = await netLog.stopLogging()
  // console.log('Net-logs written to', path)

  autoUpdater.checkForUpdates();
});

// IPC 进程间通信
ipcMain.on('beep', (event, text) => {
  shell.beep();
  event.returnValue = ''; // sendSync
});

ipcMain.once('beep-once', (event, text) => {
  shell.beep();
  event.returnValue = ''; // sendSync
});

ipcMain.on('update-badge', (event, num) => {
  badgeNum = num;
  if (num) {
    tray.setImage(path.join(__static, 'finger.jpg'));
  } else {
    tray.setImage(path.join(__static, 'finger.jpg'));
  }
  event.returnValue = 'info';
});

ipcMain.on('online-status-changed', (event, status) => {
  console.log(status);
  showMessageBoxSync(win, status);
});


// 对话框组件
function showMessageBoxSync(browserWindow, message) {
  dialog.showMessageBoxSync(browserWindow, {
    type: 'none',
    title: '用户提示',
    // buttons: ['确认', '取消'],
    message,
  });
}

// 自动更新操作 todo:bugfix  自动更新之后，触发安装闪退

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow(`Error in auto-updater. ${err}`);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
  log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
  sendStatusToWindow(log_message);
  win.setProgressBar(progressObj.percent);
});
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 5000);
});


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

// 捕获全局错误，进行进程管理
process.on('uncaughtException', (error) => {
  log.error(error.stack || JSON.stringify(error));
  app.exit();
});

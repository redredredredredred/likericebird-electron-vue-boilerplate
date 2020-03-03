/* eslint-disable no-unused-vars */
/**
 *  main process
 *  1、主进程中包含了对于 App 的生命周期、系统原生元素（菜单、菜单栏、dock栏、托盘）的控制逻辑
 *  2、主进程还负责创建应用的所有渲染进程（render process）
 *  3、主进程中集成了所有的node api、
 *
 */

import path from 'path';
// import os from 'os';
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  Tray,
  Menu,
  globalShortcut,
  netLog,
  Notification,
} from 'electron';

import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';

import Badge from 'electron-windows-badge';
// import { getSessionState } from '@meetfranz/electron-notification-state';
import log from 'electron-log';
import electronDebug from 'electron-debug';
import { autoUpdater } from 'electron-updater';
import { openProcessManager } from 'electron-process-manager'; // 显示electron进程的资源使用情况
import { download } from 'electron-dl'; // 只能使用在主进程中的下载状态插件
import PDFWindow from 'electron-pdf-window'; // 在电子浏览器窗口预览PDF文件
import Elstorage from 'electron-json-storage'; // 自定义存储功能

const isDevelopment = process.env.NODE_ENV !== 'production';

// 自动更新
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

log.info('App starting...');

electronDebug();

/**
 * 离屏渲染逻辑：第一步禁用GPU加速
 */
app.disableHardwareAcceleration(); // 配合离屏渲染，禁用GPU加速；

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
// let pdfwin = null;
let tray;
let badgeNum = 0;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
  // win.setProgressBar(0.5)
}

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
  // // 在电子浏览器窗口预览PDF文件
  // pdfwin = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     webSecurity: false,
  //   },
  // });

  // PDFWindow.addSupport(pdfwin);

  // // pdfwin.loadURL('app://./穷游锦囊中国铁道旅行.pdf');
  // // pdfwin.loadURL('http://localhost:10844/穷游锦囊中国铁道旅行.pdf');
  // // pdfwin.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  // pdfwin.loadURL('file:///boilerplate/likericebird-electron-vue-boilerplate/public/穷游锦囊中国铁道旅行.pdf');

  // pdfwin.show();

  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // eslint-disable-next-line no-undef
    icon: path.join(__static, customConfig.logoPath),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      offscreen: true, // 第二步，添加离屏渲染功能；
    },
  });

  // 在这里执行顺序很重要，如果在页面 loadURL 之后声明执行，将导致依赖的一些对象初始化时机过迟，报错

  // 系统托盘，自定义操作
  // eslint-disable-next-line no-undef
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
  // eslint-disable-next-line no-new
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
  // win.loadURL('app://./pdf.html');
  // win.webContents.openDevTools()

  /**
   * 离屏渲染逻辑：第三步进行渲染帧速率设置
   */
  win.webContents.on('paint', (event, dirty, image) => {
    // updateBitmap(dirty, image.getBitmap())
  })
  win.webContents.setFrameRate(30)

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

  // 处理外链打开逻辑,在浏览器中打开链接
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

  /**
   * 监控文件下载进度
   */
  win.webContents.session.on('will-download', (event, item, webContents) => {
    // 阻止文件下载
    // event.preventDefault()
    // require('request')(item.getURL(), (data) => {
    //   require('fs').writeFileSync('/somewhere', data)
    // })

    // 控制文件下载
    // item.setSavePath('/tmp/save.pdf') // 如果预设路径，将不弹出对话框
    // win.webContents.downloadURL('');
    // eslint-disable-next-line no-shadow
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
          // 此处与 electron-dl 下载进度冲突，故临时禁用
          // win.setProgressBar(Math.floor(item.getReceivedBytes() / item.getTotalBytes()));
        }
      }
    });
    // eslint-disable-next-line no-shadow
    item.once('done', (event, state) => {
      win.setProgressBar(-1);
      if (state === 'completed') {
        console.log('Download successfully');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });


  /**
   * Windows 7和更高版本系统中的任务栏广泛使用应用程序用户模型ID（AppUserModelIDs），以将进程，文件和窗口与特定应用程序相关联。
   * 拥有多个进程的应用程序或在宿主进程中运行的应用程序可能需要显式地标识自己，以便可以将其原本不同的窗口组合在单个任务栏按钮下，并控制该应用程序的跳转列表的内容。
   */
  // window10 通知fix，与任务栏、多进程、和多窗口问题相关。
  // %兼容性说明%：Windows 8中，通知正文的最大长度为250个字符，Windows团队建议将通知保留为200个字符。 然而，Windows 10中已经删除了这个限制
  app.setAppUserModelId('com.electron.fans');

  /**
   * 启动应用时在windows 任务栏闪烁突出应用图标
   */
  win.once('focus', () => win.flashFrame(false));
  win.flashFrame(true);
}

/**
 * 应用程序的生命周期逻辑
 */
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
    // eslint-disable-next-line max-len
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();

  /**
   * 4、基础功能：自定义 Dock 菜单；配置需添加在
   */
  (function configDockMenu() {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'New Window',
        click() { console.log('New Window'); },
      }, {
        label: 'New Window with Settings',
        submenu: [
          { label: 'Basic' },
          { label: 'Pro' },
        ],
      },
      { label: 'New Command...' },
    ]);

    app.dock.setMenu(dockMenu);
  }());

  /**
   * 全局快捷键访问回调事件
   */
  globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed');
  })
  // 进行ready 之后的操作管理
  // netLog.startLogging(path.join(__static, customConfig.logoPath))
  await netLog.startLogging(customConfig.logoPath);

  // // After some network events
  // const path = await netLog.stopLogging()
  // console.log('Net-logs written to', path)

  /**
   * 应用更新逻辑：检查更新
    */
  await autoUpdater.checkForUpdates();
  // openProcessManager();
  win.setRepresentedFilename('/documents/哔哩哔哩APP主站软件质量规范文档.docx');
  win.setDocumentEdited(true);

  app.setAccessibilitySupportEnabled(true)
});

/**
 * *********  IPC 主进程与渲染进程进行进程间通信  *********
 * */

/**
 * 1、通知（Notifications）
 实现操作系统本地通知，调用 Notification APIs
 */
// electron-windows-notifications 允许高级通知，自定义模板，图像和其他灵活元素。
ipcMain.on('custom_notification', (event, notificationOptionsJson) => {
  // 判断是否支持桌面通知
  if (Notification.isSupported()) {
    Notification.isSupported();
    console.log('Notification.i;spported()', Notification.isSupported());
  }
  // 免打扰模式 / 演示模式 状态判断
  // console.log(getSessionState());
  const notificationOptions = JSON.parse(notificationOptionsJson);
  console.log('notificationOptionsJson:', notificationOptionsJson);
  console.log('notificationOptions:', notificationOptions);
  const customNotification = new Notification({
    title: 'test title', // 标题
    subtitle: 'test2 title', // 副标题 macOS
    body: 'peace', // 消息体
    silent: false, // 有无系统提示音
    // sound: '', // 声音文件 macOS
    // icon: 'finger.jpg', // String | NativeImage
    // hasReply: false, // 是否有回复选项  macOS
    // replyPlaceholder: '', // 答复输入框中的占位符  macOS
    // timeoutType: '', // 'default' or 'never' Windows
    // closeButtonText: '', // 自定义的警告框关闭按钮文字 macOS
    // actions: '', // 要添加到通知中的操作 macOS
    ...notificationOptions,
  });

  customNotification.show();
  customNotification.click = function (event) {
    console.log('customNotification.click -> customNotification.click', event);
  };
  customNotification.close = function (event) {
    console.log('customNotification.close -> customNotification.close', event);
  };
  customNotification.reply = function (event) {
    console.log('customNotification.reply -> customNotification.reply ', event);
  };
  customNotification.action = function (event) {
    console.log('customNotification.action -> customNotification.action', event);
  };

  // eslint-disable-next-line no-param-reassign
  event.returnValue = ''; // sendSync
});

/**
 * 2、添加最近访问文件 app.addRecentDocument
 */
// app.addRecentDocument('/documents/1.docx') // 本地文件路径
// app.clearRecentDocuments()

/**
 * 3、任务栏进度条
 */
ipcMain.on('progress-bar', (event, progressValue) => {
  console.log('progress-bar ', progressValue);
  win.setProgressBar(+progressValue);
  event.returnValue = 'progress-bar';
});

/**
 * 4、自定义 Dock 菜单
 * 此处见ready事件处理逻辑
 */

/**
 * 5、Windows 任务栏
 */

//
// (function configMenu() {
//   if (isDevelopment) {
//     const template = [
//       {
//         label: 'Application',
//         submenu: [
//           {
//             label: 'Show App',
//             click() {
//               // win.show();
//             },
//           },
//           {
//             label: 'Quit',
//             accelerator: 'CmdOrCtrl+Q',
//             click() {
//               app.isQuiting = true;
//               app.quit();
//               app.exit(0);
//             },
//           },
//           {
//             label: 'Fresh App',
//             accelerator: 'CmdOrCtrl+F5',
//             click() {
//               electronLogger.info('fresh action.');
//               // win.reload()
//               loadUrl(win, query);
//             },
//           },
//           {
//             label: 'Dev tools',
//             accelerator: 'CmdOrCtrl+F12',
//             click() {
//               electronLogger.info('toggleDevTools F12');
//               if (!win) return;
//               win.webContents.toggleDevTools();
//             },
//           }, {
//             label: 'Quit',
//             accelerator: 'CmdOrCtrl+Q',
//             click() {
//               electronLogger.info('quit action.');
//               app.quit();
//               app.exit(0);
//             },
//           }],
//       },
//       {
//         label: 'Help',
//         submenu: [
//           {
//             label: 'Support',
//             click: (item, focusedWindow) => {
//               if (focusedWindow) {
//                 // TODO: 上传logs文件
//                 electronLogger.info('upload logs action.');
//               }
//             },
//           },
//         ],
//       },
//     ];
//     Menu.setApplicationMenu(Menu.buildFromTemplate(template));
//   } else if (process.platform === 'darwin') {
//     const template = [
//       {
//         label: 'Application',
//         submenu: [
//           {
//             label: 'Show App',
//             click() {
//               // win.show();
//             },
//           },
//           {
//             label: 'Quit',
//             accelerator: 'CmdOrCtrl+Q',
//             click() {
//               app.isQuiting = true;
//               app.quit();
//               app.exit(0);
//             },
//           }],
//       },
//       {
//         label: 'Edit',
//         submenu: [
//           { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
//           { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
//           { type: 'separator' },
//           { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
//           { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
//           { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
//           { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
//         ],
//       },
//       {
//         label: 'Help',
//         submenu: [
//           {
//             label: 'Support',
//             click: (item, focusedWindow) => {
//               if (focusedWindow) {
//                 // TODO: 上传logs文件
//                 electronLogger.info('upload logs action.');
//               }
//             },
//           },
//         ],
//       },
//     ];
//     Menu.setApplicationMenu(Menu.buildFromTemplate(template));
//   } else {
//     Menu.setApplicationMenu(null);
//   }
// }());

/**
 * 6、快捷键设置
 */

/**
 * 7、在线/离线事件探测
 * 在网页上使用HTML5 API navigator.onLine，进行判断，但是状态仅仅能做到脱机（从网络断开）判断
 * todo：为了对网络进行更多的检测，需要使用node进行一些底层开发
 */
ipcMain.on('online-status-changed', (event, status) => {
  console.log('online-status-changed', status);
  event.returnValue = 'online-status-changed';
})

ipcMain.on('online-status-props-changed', (event, status) => {
  console.log('online-status-props-changed', status);
  event.returnValue = 'online-status-props-changed';
})

/**
 * 8、原生拖拽事件
 */
ipcMain.on('drag-start', (event, filePath) => {
  console.log('main- drag-start filePath = ', filePath)
  event.sender.startDrag({
    file: filePath,
    icon: 'finger.jpg',
  });
  event.returnValue = 'drag-start';
})

/**
 * 9、离屏渲染
 * 禁用GPU加速，启用 软件输出设备 进行渲染
 * 实践以后确实加速效果很明显
 * todo： 副作用是怎么样的？
 */

/**
 * 10、Mojave 系统级黑暗模式
 * 自动更新原生界面；“原生界面”包括文件选择器、窗口边框、对话框、上下文菜单等等
 */



// 蜂鸣声
ipcMain.on('beep', (event, text) => {
  shell.beep();
  // eslint-disable-next-line no-param-reassign
  event.returnValue = ''; // sendSync
});


ipcMain.once('beep-once', (event, text) => {
  shell.beep();
  // eslint-disable-next-line no-param-reassign
  event.returnValue = ''; // sendSync
});

ipcMain.on('update-badge', (event, num) => {
  // badgeNum = num;

  if (num) {
    console.log('TCL: num', num);
    // eslint-disable-next-line no-undef
    tray.setImage(path.join(__static, 'finger.jpg'));
    if (process.platform === 'darwin') {
    // macOS 设置徽章计数器
      debugger;
      app.badgeCount = +num;
    }
  } else {
    // eslint-disable-next-line no-undef
    tray.setImage(path.join(__static, 'finger.jpg'));
  }

  // eslint-disable-next-line no-param-reassign
  event.returnValue = 'info';
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

ipcMain.on('online-status-changed', (event, status) => {
  console.log(status);
  showMessageBoxSync(win, status);
  event.returnValue = 'online-status-changed';
});

// 显示下载进度
ipcMain.on('download-button', (event, { url }) => {
  console.log('TCL: url', url);
  const focuswin = BrowserWindow.getFocusedWindow();
  download(focuswin, url, {
    saveAs: false,
    openFolderWhenDone: true,
    showBadge: true,
  });
  // .then((DownloadItem) => {
  //   // DownloadItem;
  // }).catch();
  event.returnValue = 'download dl';
});


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
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
  logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
  sendStatusToWindow(logMessage);
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

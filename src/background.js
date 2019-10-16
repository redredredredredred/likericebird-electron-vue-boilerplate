"use strict";
import path from "path";
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  Tray,
  Menu,
  netLog
} from "electron";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
import Badge from "electron-windows-badge";
import electronLogger from "electron-log";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray;
let badgeNum = 0;

// 主进程状态和配置管理
let customConfig;
if (process.platform === "darwin") {
  customConfig = {
    logoPath: "physics3.jpg",
    tipsLogoPath: "physics3.jpg",
    netLog: "/test/"
  };
} else {
  customConfig = {
    logoPath: "physics3.jpg",
    tipsLogoPath: "physics3.jpg",
    netLog: "D:/test/"
  };
}
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__static, customConfig.logoPath),
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 在这里执行顺序很重要，如果在页面 loadURL 之后声明执行，将导致依赖的一些对象初始化时机过迟，报错

  // 系统托盘，自定义操作
  tray = new Tray(path.join(__static, customConfig.logoPath));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "devtools",
      click: function(menuItem, browserWindow, event) {
        electronLogger.info("tray openDevTools");
        win.webContents.openDevTools();
      }
    },
    {
      label: "关闭窗口",
      click: function(menuItem, browserWindow, event) {
        electronLogger.info("tray 关闭窗口");
        if (process.platform === "darwin") {
          app.hide();
        } else {
          win.hide();
        }
      }
    },
    {
      label: "退出",
      click: function(menuItem, browserWindow, event) {
        electronLogger.info("tray 退出");
        win.destroy();
        app.quit();
      }
    }
  ]);
  tray.setToolTip("zhibei");
  tray.setContextMenu(contextMenu);

  tray.on("click", function(event) {
    electronLogger.info("tray click");
    win.show();
    // 重新绑定徽章逻辑，因为在执行 close 生命周期的时候，win 被 destroy
    const badgeOptions = {};
    let newBagde = new Badge(win, badgeOptions);
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
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  // win.webContents.openDevTools()

  win.setProgressBar(0.5);

  win.on("close", e => {
    electronLogger.info("win close");
    e.preventDefault();
    if (win.isFocused()) {
      if (process.platform === "darwin") {
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
  win.webContents.on(
    "new-window",
    (e, url, frameName, disposition, options) => {
      electronLogger.info("win new-window");
      e.preventDefault();
      shell.openExternal(url);
      e.returnValue = false;
    }
  );
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
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
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
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();

  // 进行ready 之后的操作管理
  // netLog.startLogging(path.join(__static, customConfig.logoPath))
  netLog.startLogging(customConfig.logoPath);

  // // After some network events
  // const path = await netLog.stopLogging()
  // console.log('Net-logs written to', path)
});

// IPC 进程间通信
ipcMain.on("beep", (event, text) => {
  shell.beep();
  event.returnValue = ""; // sendSync
});

ipcMain.once("beep-once", (event, text) => {
  shell.beep();
  event.returnValue = ""; // sendSync
});

ipcMain.on("update-badge", function(event, num) {
  badgeNum = num;
  if (num) {
    tray.setImage(path.join(__static, "favicon1.png"));
  } else {
    tray.setImage(path.join(__static, "favicon.png"));
  }
  event.returnValue = "info";
});

ipcMain.on("online-status-changed", (event, status) => {
  console.log(status);
  showMessageBoxSync(win, status);
});

// 对话框组件

function showMessageBoxSync(browserWindow, message) {
  dialog.showMessageBoxSync(browserWindow, {
    type: "none",
    title: "用户提示",
    // buttons: ['确认', '取消'],
    message: message
  });
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

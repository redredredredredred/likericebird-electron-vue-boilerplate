import {
  remote,
  // Menu,
  ipcRenderer,
} from 'electron';

class CustomNotification {
  // eslint-disable-next-line no-shadow
  constructor(remote, ipcRenderer) {
    this.remote = remote;
    this.ipcRenderer = ipcRenderer;
  }

  setBadgeCount(number) {
    ipcRenderer.sendSync('update-badge', number);
  }

  /**
   * 进程间通信的俩种实现方式
   * remote
   */
  setBadgeText(text) {
    // ipcRenderer.sendSync('update-badge', text) // windows 上不可以添加文本内容
    if (process.platform === 'darwin') {
      this.remote.app.dock.setBadge(text);
    } else {
      console.log('非mac 操作系统');
    }
  }

  /**
   * 进程间通信的俩种实现方式
   * sendSync&send
   */
  beep() {
    this.ipcRenderer.sendSync('beep'); //  需要设置 event.returnValue = ''
    // ipcRenderer.send('beep')
  }

  beepOnce() {
    this.ipcRenderer.sendSync('beep-once'); //  需要设置 event.returnValue = ''
    // ipcRenderer.send('beep-once')
  }
}

export const customNotification = new CustomNotification(remote, ipcRenderer);

export function CustomNotify(renderderCallback) {
  this.renderderHandle = function renderderHandle(event, text) {
    renderderCallback(text);
  };
  ipcRenderer.on('message', this.renderderHandle);


  this.destory = function destory() {
    ipcRenderer.removeListener('message', this.renderderHandle);
  };
}

export function DownloadNotify(process) {
  this.process = process;

  ipcRenderer.on('down-process', this.process);
  // ipcRenderer.on("down-cancel", (event, data) => {
  //   console.log("cancle");
  // });
  // ipcRenderer.on("down-done", (event, data) => {
  //   console.log("done");
  // });
  // ipcRenderer.on("down-fail", (event, data) => {
  //   console.log("fail");
  // });

  this.destory = function destory() {
    ipcRenderer.removeListener('down-process', this.process);
  };
}

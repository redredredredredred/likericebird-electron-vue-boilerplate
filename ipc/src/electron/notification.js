import {
    remote,
    // Menu,
    ipcRenderer
} from 'electron';

class CustomNotification {
    constructor(remote) {
        this.remote = remote
    }

    setBadgeCount(number) {
        ipcRenderer.sendSync('update-badge', number)
        // this.remote.app.setBadgeCount(number)
    }

    setBadgeText(text) {
        ipcRenderer.sendSync('update-badge', text)
        // this.remote.app.dock.setBadge(text)
    }


}

export default new CustomNotification(remote)

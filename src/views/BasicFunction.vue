<template>
    <div>
        <h3>1、基础功能</h3>
        <div class="section notification">
            <div><h4>通知（Notifications）</h4></div>
            <div>
                <p><label for="title">title</label>
                    <input id="title" type="text" :value="notificationOptions.title"></p>
                <p><label for="subtitle">subtitle</label>
                    <input id="subtitle" type="text" :value="notificationOptions.subtitle"></p>
                <p><label for="body">body</label>
                    <input id="body" type="text" :value="notificationOptions.body"></p>
                <p><label for="silent">silent</label>
                    <input id="silent" type="checkbox" :value="notificationOptions.silent"></p>
                <p>
                    <button @click="clickSimpleNotificationHandle">简单通知</button>
                </p>
            </div>
        </div>
        <div>
            <div><h4>2、任务栏的进度条 (Windows, macOS, Unity)</h4>
                <div>
                    <p><input type="range"
                              min="0" max="2" step="0.1" @change="changeProgressHandle"></p>
                    <p><span> 进度数值：</span><span>{{progressVal}}</span></p>
                </div>
            </div>
        </div>
        <div>
            <div><h4>3、在线和离线网络事件检测</h4>
                <div>
                    <p><span> 真实网络状态：</span><span>{{navigatorOnLine}}</span></p>
                </div>
            </div>
        </div>
        <div>
            <div><h4>4、原生拖拽事件</h4>
                <div>
                    <div class="DragField"
                         draggable="true"
                         @dragstart="dragstartSimpleHandle">我是一段拖拽热区</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'BasicFunction',
  data() {
    return {
      notificationOptions: {
        title: '通知标题',
        subtitle: '只有macos显示的副标题',
        body: '告诉你一些事情',
        silent: false,
      },
      progressVal: 0,
      navigatorOnLine: navigator.onLine ? 'online' : 'offline',
    };
  },
  props: {},
  computed: {
    // 'window.OnLine': function () {
    //   this.$electron.ipcRenderer
    //   .send('online-status-props-changed', navigator.onLine ? 'online' : 'offline');
    // },
  },
  watch: {
    progressVal() {
      console.log('render watch progress ', this.progressVal);
      this.$electron.ipcRenderer.sendSync('progress-bar', this.progressVal);
    },
  },
  methods: {
    clickSimpleNotificationHandle(event) {
      this.$electron.ipcRenderer.sendSync('custom_notification', JSON.stringify(this.notificationOptions));
    },
    changeProgressHandle(event) {
      this.progressVal = event.target.value;
      console.log('render progress ', event);
    },
    updateOnlineStatus() {
      this.$electron.ipcRenderer.send('online-status-changed', navigator.onLine ? 'online' : 'offline');
      this.navigatorOnLine = navigator.onLine ? 'online' : 'offline';
    },
    dragstartSimpleHandle(event) {
      event.preventDefault();
      this.$electron.ipcRenderer.sendSync('drag-start', event);
    },
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);

    this.updateOnlineStatus();
  },
};
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.section
    margin-bottom 50px

.DragField
    background lightgray
    color #ffffff
    font-weight bold
    height 100px
    width 100px
</style>

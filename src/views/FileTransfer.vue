<template>
  <div class="about">
    <h1>文件上传下载演示</h1>
    <div>
      <p>
        <span>显示多种下载方式</span>
      </p>
      <div>
        <label for>输入下载链接</label>
        <input type="text" :value="downloadUrl" />
      </div>
      <p>
        <a :href="downloadUrl" download>超链接下载点击热区</a>
      </p>
      <div>
        <form :action="formDownloadUrl" ref="DownloadForm"></form>
      </div>
      <p>
        <button @click="clickDownloadByOpenHandle">open原生js方法下载文件</button>
      </p>
      <p>
        <button @click="clickDownloadByFormHandle">使用表单下载文件</button>
      </p>
      <p>
        <button @click="clickDownloadBy3rdHandle">使用第三方（3rd）插件下载文件</button>
      </p>

      <p>
        文件名称：
        <span>{{filename}}</span>
      </p>
      <p>
        文件进度：
        <span>{{downloadProgress}}</span>
      </p>
    </div>

    <div>
      <input type="file" @change="changeUploadFilesHandle" />
    </div>
    <div>
      <button @click="clickUploadBtnHandle">上传</button>
    </div>

    <div>
      <label for>使用electron-dl进行下载</label>
      <textarea type="text" @input="inputDownloadUrlHandle" :value="downloadUrl"></textarea>
    </div>
    <div>
      <button @click="clickDownloadBtnHandle">下载</button>
    </div>
  </div>
</template>

<script>
// import { ipcRenderer } from 'electron';
import download from 'download';

export default {
  data() {
    return {
      files: [],
      downloadProgress: 0,
      filename: '',
      downloadUrl: '',
    };
  },
  computed: {
    formDownloadUrl() {
      return this.downloadUrl;
    },
  },
  methods: {
    clickDownloadByOpenHandle() {
      window.open(this.downloadUrl);
    },
    clickDownloadByFormHandle() {
      this.$refs.DownloadForm.submit();
    },
    clickDownloadBy3rdHandle() {
      download(this.downloadUrl);
    },
    clickUploadBtnHandle() {
      this.$electron.ipcRenderer.sendSync('upload-button', this.files);
    },
    clickDownloadBtnHandle() {
      this.$electron.ipcRenderer.sendSync('download-button', {
        url: this.downloadUrl,
      });
      console.log(
        'TCL: clickDownloadBtnHandle -> this.downloadUrl',
        this.downloadUrl,
      );
    },
    changeUploadFilesHandle(even) {
      this.files = even.target.files;
      // console.log('TCL: download -> even', even);
      // console.log('TCL: printInfo -> printInfo', this.files);
    },
    inputDownloadUrlHandle(even) {
      this.downloadUrl = even.target.value;
    },
  },
};
</script>

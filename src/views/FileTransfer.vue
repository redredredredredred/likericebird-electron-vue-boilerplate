<template>
  <div class="about">
    <h1>This is an about page</h1>

    <div><input type="file" @change="changeUploadFilesHandle"></div>
    <div><button @click="clickUploadBtnHandle">上传</button></div>

    <div><textarea type="text" @input="inputDownloadUrlHandle" :value="downloadUrl"></textarea></div>
    <div><button @click="clickDownloadBtnHandle">下载</button></div>
  </div>

</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      files: [],
      downloadUrl: 'https://d11.baidupcs.com/file/772d3642544c6ca8c520d9e12fc80c9e?bkt=en-3f603aaf964434021454ad7e8c75c21d7ce3eba15b82a4d9a8c20567e8c911df02329eca50cecd9e99db499b6b99667a914c9e24596d81130dfcf4a6a8468af5&xcode=6c35e27cbf6a1d31f3ec8f8b80aaeb79971e8bf6fff7e53d538220fac8d3dbd60edc6bae15c3df7fd8b3e8c06cc0dad0316128a2cdfcce4d&fid=2819876973-250528-977513996209853&time=1582881471&sign=FDTAXGERQlBHSKf-DCb740ccc5511e5e8fedcff06b081203-YDAkHQ09Z45uVf5WekNbQMgc6q0%3D&to=d11&size=24944295&sta_dx=24944295&sta_cs=814&sta_ft=pdf&sta_ct=7&sta_mt=7&fm2=MH%2CQingdao%2CAnywhere%2C%2Czhejiang%2Cct&ctime=1359685650&mtime=1406702154&resv0=0&resv1=0&resv2=rlim&resv3=5&resv4=24944295&vuk=2819876973&iv=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-bc45238fb7673488ff4d69f2d8f6b15f61afd6a8bbbf2823175fd116cfaf3f5eb89052deaab4e232f8f4b6171f689b1fb4e80616982b8d51305a5e1275657320&expires=8h&rt=pr&r=109298619&vbdid=2794417258&fin=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&fn=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&rtype=1&dp-logid=1361898785781093619&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=0&csign=XpJg1GRjnEBFsnHKl461hz1zjqg%3D&so=0&ut=6&uter=4&serv=0&uc=1656779210&ti=0887d9faa0e9926418f83d04d07638c16f4c8518c89cf187305a5e1275657320&reqlabel=250528_f_8e69f37a0f9563466d4baf625df36008_-1_3261fc55a8bff5d907d1d9bccae73693&by=themis',
    };
  },
  methods: {
    clickUploadBtnHandle() {
      ipcRenderer.sendSync('upload-button', this.files);
    },
    clickDownloadBtnHandle() {
      ipcRenderer.sendSync('download-button', { url: this.downloadUrl });
      console.log('TCL: clickDownloadBtnHandle -> this.downloadUrl', this.downloadUrl);
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

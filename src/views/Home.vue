<template>
    <div class="home">
        <div msg="Welcome to Your Vue.js App"/>
        <section class="base-card shadow-gary">
            <div>
                <input type="text" v-model="BadgeCount"/>
                <button class="button-primary" @click="setBadgeCount">
                    点击显示徽章计数
                </button>
            </div>
            <div>
                <input type="text" v-model="BadgeText"/>
                <button class="button-primary" @click="setBadgeText">
                    点击改变徽章文本
                </button>
            </div>

            <div>
                <button class="button-primary" @click="beep">小声哔哔</button>
            </div>

            <div>
                <p><span>版本更新：</span>{{UpdaterText}}</p>
            </div>
            <div>
                <p><span>下载文件：</span>
                <a href="https://d11.baidupcs.com/file/772d3642544c6ca8c520d9e12fc80c9e?bkt=en-3f603aaf964434021454ad7e8c75c21d7ce3eba15b82a4d9a8c20567e8c911df02329eca50cecd9e99db499b6b99667a914c9e24596d81130dfcf4a6a8468af5&xcode=6c35e27cbf6a1d31f3ec8f8b80aaeb79971e8bf6fff7e53d538220fac8d3dbd60edc6bae15c3df7fd8b3e8c06cc0dad0316128a2cdfcce4d&fid=2819876973-250528-977513996209853&time=1582881471&sign=FDTAXGERQlBHSKf-DCb740ccc5511e5e8fedcff06b081203-YDAkHQ09Z45uVf5WekNbQMgc6q0%3D&to=d11&size=24944295&sta_dx=24944295&sta_cs=814&sta_ft=pdf&sta_ct=7&sta_mt=7&fm2=MH%2CQingdao%2CAnywhere%2C%2Czhejiang%2Cct&ctime=1359685650&mtime=1406702154&resv0=0&resv1=0&resv2=rlim&resv3=5&resv4=24944295&vuk=2819876973&iv=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-bc45238fb7673488ff4d69f2d8f6b15f61afd6a8bbbf2823175fd116cfaf3f5eb89052deaab4e232f8f4b6171f689b1fb4e80616982b8d51305a5e1275657320&expires=8h&rt=pr&r=109298619&vbdid=2794417258&fin=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&fn=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&rtype=1&dp-logid=1361898785781093619&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=0&csign=XpJg1GRjnEBFsnHKl461hz1zjqg%3D&so=0&ut=6&uter=4&serv=0&uc=1656779210&ti=0887d9faa0e9926418f83d04d07638c16f4c8518c89cf187305a5e1275657320&reqlabel=250528_f_8e69f37a0f9563466d4baf625df36008_-1_3261fc55a8bff5d907d1d9bccae73693&by=themis" download>文件地址</a>
                </p>
                <p><button @click="clickDownloadByOpenHandle">open下载文件：</button>
                <p><button @click="clickDownloadByFormHandle">form下载文件：</button>
                <p><button @click="clickDownloadBy3rdHandle">3rd下载文件：</button>
                </p>

                <p>文件名称：<span>{{filename}}</span></p>
                <p>文件进度：<span>{{downloadProgress}}</span></p>
                <div>
                  <form :action="formDownloadUrl" ref="DownloadForm">
                  </form>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { CustomNotify, DownloadNotify, customNotification } from '@/electron/notification';
import download from 'download';

export default {
  name: 'home',
  data() {
    return {
      BadgeCount: 0,
      BadgeText: '',
      UpdaterText: '',
      downloadProgress: 0,
      filename: '',
      formDownloadUrl: 'https://d11.baidupcs.com/file/772d3642544c6ca8c520d9e12fc80c9e?bkt=en-3f603aaf964434021454ad7e8c75c21d7ce3eba15b82a4d9a8c20567e8c911df02329eca50cecd9e99db499b6b99667a914c9e24596d81130dfcf4a6a8468af5&xcode=6c35e27cbf6a1d31f3ec8f8b80aaeb79971e8bf6fff7e53d538220fac8d3dbd60edc6bae15c3df7fd8b3e8c06cc0dad0316128a2cdfcce4d&fid=2819876973-250528-977513996209853&time=1582881471&sign=FDTAXGERQlBHSKf-DCb740ccc5511e5e8fedcff06b081203-YDAkHQ09Z45uVf5WekNbQMgc6q0%3D&to=d11&size=24944295&sta_dx=24944295&sta_cs=814&sta_ft=pdf&sta_ct=7&sta_mt=7&fm2=MH%2CQingdao%2CAnywhere%2C%2Czhejiang%2Cct&ctime=1359685650&mtime=1406702154&resv0=0&resv1=0&resv2=rlim&resv3=5&resv4=24944295&vuk=2819876973&iv=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-bc45238fb7673488ff4d69f2d8f6b15f61afd6a8bbbf2823175fd116cfaf3f5eb89052deaab4e232f8f4b6171f689b1fb4e80616982b8d51305a5e1275657320&expires=8h&rt=pr&r=109298619&vbdid=2794417258&fin=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&fn=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&rtype=1&dp-logid=1361898785781093619&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=0&csign=XpJg1GRjnEBFsnHKl461hz1zjqg%3D&so=0&ut=6&uter=4&serv=0&uc=1656779210&ti=0887d9faa0e9926418f83d04d07638c16f4c8518c89cf187305a5e1275657320&reqlabel=250528_f_8e69f37a0f9563466d4baf625df36008_-1_3261fc55a8bff5d907d1d9bccae73693&by=themis',
    };
  },
  components: {},
  methods: {
    setBadgeCount() {
      customNotification.setBadgeCount(this.BadgeCount);
    },
    setBadgeText() {
      customNotification.setBadgeText(`'${this.BadgeText}'`);
    },
    beep() {
      customNotification.beep();
      // customNotification.beepOnce()
    },
    clickDownloadByOpenHandle() {
      window.open('https://d11.baidupcs.com/file/772d3642544c6ca8c520d9e12fc80c9e?bkt=en-3f603aaf964434021454ad7e8c75c21d7ce3eba15b82a4d9a8c20567e8c911df02329eca50cecd9e99db499b6b99667a914c9e24596d81130dfcf4a6a8468af5&xcode=6c35e27cbf6a1d31f3ec8f8b80aaeb79971e8bf6fff7e53d538220fac8d3dbd60edc6bae15c3df7fd8b3e8c06cc0dad0316128a2cdfcce4d&fid=2819876973-250528-977513996209853&time=1582881471&sign=FDTAXGERQlBHSKf-DCb740ccc5511e5e8fedcff06b081203-YDAkHQ09Z45uVf5WekNbQMgc6q0%3D&to=d11&size=24944295&sta_dx=24944295&sta_cs=814&sta_ft=pdf&sta_ct=7&sta_mt=7&fm2=MH%2CQingdao%2CAnywhere%2C%2Czhejiang%2Cct&ctime=1359685650&mtime=1406702154&resv0=0&resv1=0&resv2=rlim&resv3=5&resv4=24944295&vuk=2819876973&iv=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-bc45238fb7673488ff4d69f2d8f6b15f61afd6a8bbbf2823175fd116cfaf3f5eb89052deaab4e232f8f4b6171f689b1fb4e80616982b8d51305a5e1275657320&expires=8h&rt=pr&r=109298619&vbdid=2794417258&fin=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&fn=%E7%B3%BB%E7%BB%9F%E5%88%86%E6%9E%90%E4%B8%8E%E8%AE%BE%E8%AE%A1%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.pdf&rtype=1&dp-logid=1361898785781093619&dp-callid=0.1&hps=1&tsl=0&csl=0&fsl=0&csign=XpJg1GRjnEBFsnHKl461hz1zjqg%3D&so=0&ut=6&uter=4&serv=0&uc=1656779210&ti=0887d9faa0e9926418f83d04d07638c16f4c8518c89cf187305a5e1275657320&reqlabel=250528_f_8e69f37a0f9563466d4baf625df36008_-1_3261fc55a8bff5d907d1d9bccae73693&by=themis');
    },
    clickDownloadByFormHandle() {
      // this.formDownloadUrl =
      this.$refs.DownloadForm.submit();
    },
    clickDownloadBy3rdHandle() {
      // this.formDownloadUrl =
      download(this.formDownloadUrl);
    },
  },
  mounted() {
    this.UpdaterNotify = new CustomNotify((text) => {
      this.UpdaterText = text;
    });
    this.DownloadNotify = new DownloadNotify((event, prc) => {
      this.filename = prc.filename;
      this.downloadProgress = prc.receive / prc.total;
    });
  },
  destroyed() {
    this.UpdaterNotify.destory();
    this.DownloadNotify.destory();
  },
};
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

    .shadow-gary
        box-shadow 0 2px 12px 0 rgba(0, 0, 0, .1)

    .base-card
        border-radius 4px
        border 1px solid #ebeef5
        background-color #fff
        overflow hidden
        color #303133
        transition .3s

    input
        -webkit-appearance none
        background-color #fff
        background-image none
        border-radius 4px
        border 1px solid #dcdfe6
        box-sizing border-box
        color #606266
        display inline-block
        font-size inherit
        height 40px
        line-height 40px
        outline none
        padding 0 15px
        transition border-color .2s cubic-bezier(.645, .045, .355, 1)
        width 100%

    input:hover
        border-color #c0c4cc

    button
        display inline-block
        line-height 1
        white-space nowrap
        cursor pointer
        background #fff
        border 1px solid #dcdfe6
        color #606266
        -webkit-appearance none
        text-align center
        box-sizing border-box
        outline none
        margin 0
        transition .1s
        font-weight 500
        -moz-user-select none
        -webkit-user-select none
        -ms-user-select none
        padding 12px 20px
        font-size 14px
        border-radius 4px

    .button-primary
        color #fff
        background-color #409eff
        border-color #409eff
</style>

<template>
    <div class="home">
        <div msg="Welcome to Your Vue.js App"/>
        <section class="base-card shadow-gary">
            <p>
                <input type="text" v-model="BadgeCount"/>
            </p>
            <p>
                <button class="button-primary" @click="setBadgeCount">
                    点击显示徽章计数
                </button>
            </p>
            <p>
                <input type="text" v-model="BadgeText"/>
            </p>
            <p>
                <button class="button-primary" @click="setBadgeText">
                    点击改变徽章文本
                </button>
            </p>

            <p>
                <button class="button-primary" @click="beep">小声哔哔</button>
            </p>


        </section>
    </div>
</template>

<script>
import { CustomNotify, DownloadNotify, customNotification } from '@/electron/notification';

export default {
  name: 'home',
  data() {
    return {
      BadgeCount: 0,
      BadgeText: '',
      UpdaterText: '',
    };
  },
  components: {},
  methods: {
    setBadgeCount() {
      customNotification.setBadgeCount(this.BadgeCount);
    },
    setBadgeText() {
      customNotification.setBadgeText(`${this.BadgeText}`);
    },
    beep() {
      customNotification.beep();
      // customNotification.beepOnce()
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
        padding 8px 5px
        font-size 12px
        border-radius 8px

    .button-primary
        color #fff
        background-color #409eff
        border-color #409eff
</style>

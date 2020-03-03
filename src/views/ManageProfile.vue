<template>
    <div class="ManagerProfile PageRegion">
        <div class="PageHeader MobilePageHeader">
            <div class="NavArrow">三</div>
            <div class="NavTitle">{{navTitle[3]}}</div>
        </div>
        <div class="NavSlider MobileNavSlider"></div>
    </div>
</template>

<script>
export default {
  name: 'manage-profile',
  date() {
    return {
      screen: 'Mobile', // PC
      navClass: 'MobileNavSlider',
      navTitle: ['档案', '电子邮箱', '安全', '账户首选项', '关联应用程序', '产品'],
    };
  },
  props: {

  },
  computed: {

  },

};
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.PageRegion
    .PageHeader
        height 54px
        padding 8px
        box-sizing border-box
        display flex
        align-content center
        .NavArrow
            box-sizing content-box
            padding 0 6px
            width 32px
            height 32px
    .MobilePageHeader

</style>

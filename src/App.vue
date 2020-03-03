<template>
  <div id="app">
    <div id="nav">
      <router-link class="routerLink" to="/" activeClass="active">Home</router-link>
      <router-link class="routerLink" to="/file-transfer" activeClass="active">
        文件传输</router-link>
      <router-link class="routerLink" to="/badge" activeClass="active">徽标</router-link>
      <router-link class="routerLink" to="/account-preferences"
                   activeClass="active">账户设置</router-link>
      <router-link class="routerLink" to="/auto-upgrade" activeClass="active">
        自动更新</router-link>
    </div>
    <router-view />
  </div>
</template>
<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

#nav
  padding 30px
  display flex
  margin-bottom 30px
  /*justify-content space-between*/

.routerLink
  display: inline-block;
  height: 32px;
  width: 32px;
  /*background: #0052cc;*/
  border-radius: 8px;
  box-shadow: 1px 1px 1px #0052cc;
  outline: none;
  text-decoration: none;
  text-align: center;
  line-height: 100px;
  vertical-align: text-bottom;
  font-weight: bold;
  color: #0052cc;
  white-space: nowrap;
  margin 0 30px
</style>

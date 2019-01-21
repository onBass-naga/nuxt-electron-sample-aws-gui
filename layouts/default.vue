<template>
  <div>
    <nav-bar/>
    <el-container>
      <el-aside width="auto">
        <side-bar/>
      </el-aside>
      <el-main>
        <nuxt />
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import NavBar from '~/components/NavBar.vue'
  import SideBar from '~/components/SideBar.vue'

  export default {
    components: {
      // MyFooter,
      NavBar,
      SideBar
    }
  }
</script>

<style>
  html, body {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100vh;
    /*overflow: hidden*/
  }

  .el-aside {
    border-right: 1px solid #E4E7ED;
    height: 91vh;
  }

  .el-main {
    height: 91vh;
  }

  .centered-text {
    text-align: center;
  }

  /*.el-container {*/
    /*height: 100vh;*/
    /*display: flex;*/
    /*top: 65px;*/
    /*position: relative;*/
  /*}*/

</style>
<template>
  <el-menu :default-openeds="['1']">
    <el-submenu index="1">
      <template slot="title">CloudWatch Logs</template>
      <el-menu-item index="1-1"><a @click="$router.push('/cloudwatchlogs')">新規検索</a></el-menu-item>

      <!--<el-menu-item-group>-->
        <!--<template slot="title">検索条件</template>-->
        <!--<el-menu-item index="1-2">Option 1</el-menu-item>-->
      <!--</el-menu-item-group>-->

      <el-menu-item-group title="履歴から復元">
        <el-menu-item index="1-2">
          <el-input placeholder="ProcessingDate" v-model="form.processingDate" size="mini">
            <el-button @click="showLogs()" slot="append" icon="el-icon-search" size="mini"></el-button>
          </el-input>
        </el-menu-item>
      </el-menu-item-group>

      <!--<el-menu-item-group title="履歴" v-if="histories.length > 0">-->
        <!--<el-menu-item-->
            <!--v-for="history in histories"-->
            <!--@click="showLogs(history)"-->
            <!--:key="history.label"-->
            <!--:index="history.index">{{history.label}}</el-menu-item>-->
      <!--</el-menu-item-group>-->
    </el-submenu>
    <!--<el-submenu index="2">-->
      <!--<template slot="title">Audio</template>-->
      <!--<el-menu-item index="2-1"><a @click="$router.push('/audio')">MP3 Player</a></el-menu-item>-->
    <!--</el-submenu>-->
  </el-menu>
</template>

<style scoped>
.el-menu {
  border: none;
}
</style>

<script>
  import _ from 'lodash'
  import {cloudWatchLogs as logs} from '../store/storage'
  import {CWLogsHistories} from '../utils/CWLogsHistories'
  import {LocalDates} from '../utils/LocalDates'

  export default {
    data() {
      return {
        form: {
          processingDate: ''
        }
      };
    },
    computed: {
      histories() {
        return logs.readHistories().map((it, i) => {
          const dateParsed = CWLogsHistories.processingDateToDate(it.processingDate)
          return _.merge({}, it, {
            label: `${LocalDates.format(dateParsed)} （${it.total}件）`,
            index: `1-${i+3}`
          })
        })
      }
    },
    methods: {
      showLogs() {
        if (this.form.processingDate.length === 0) { return }

        this.$router.push(`/cloudwatchlogs/${this.form.processingDate}`)
      }
    }
  }
</script>

<template>
  <section class="container">
    <div v-if="status === 'loaded'">
      <CloudWatchLogsResult :conditions="conditions"
                            :logMessages="logMessages"
                            loadingMessage = ""
                            scrollToClass=".result-conditions"></CloudWatchLogsResult>
    </div>

    <div v-if="status === 'error'">
      {{error}}
    </div>
  </section>
</template>

<script>
  import {active, cloudWatchLogs as logs} from '../../store/storage'
  import AP from '../../utils/ApplicationPreferences'
  import {CWLogsHistories} from '../../utils/CWLogsHistories'
  import {LocalDates} from '../../utils/LocalDates'
  import Errors from '../../utils/Errors'
  import CloudWatchLogsResult from '../../components/contents/ClowdWatchLogsResult'

  export default {
    async asyncData({route, app}) {
      const history = await CWLogsHistories.read(route.params.processingDate)
      if (history.error) {
        return { status: "error", error: Errors.translate(history.error) }
      }

      return {
        status: "loaded",
        conditions: {
          processingDateLabel: `${LocalDates.format(history.processingDate)}（${LocalDates.zoneAbbr()}）`,
          total: history.total,
          group: history.conditions.group,
          start: LocalDates.format(history.conditions.localDateRange[0]),
          end: LocalDates.format(history.conditions.localDateRange[1]),
          terms: history.conditions.terms,
        },
        logMessages: history.logMessages
      }
    },
    computed: {
      groups() {
        return logs.findGroups()
      },
      activeRegion() {
        return active.region()
      },
    },
    methods: {
      filter() {
        const formRegex = this.filterForm.regex

        if (formRegex.length === 0) {
          this.useFilter = false
          this.filteredMessages.splice(0, this.filteredMessages.length)
          return
        }

        this.useFilter = true

        try {
          const flags = formRegex.replace(/.*\/([gimy]*)$/, '$1');
          const pattern = formRegex.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
          const regex = new RegExp(pattern, flags);
          if (this.filterForm.method === "filter") {
            this.filteredMessages = this.logMessages.filter(it => {
              return it.search(regex) !== -1
            })
          } else {
            this.filteredMessages = this.logMessages.filter(it => {
              return it.search(regex) !== -1
            }).map(it => {
              return it.match(regex)[1]
            })
          }
        } catch (e) {
          this.useFilter = false
        }
      },
      copyToClipboard() {
        const contents = this.useFilter ? this.filteredMessages.join(AP.LineBreakCharacter)
          : this.logMessages.join(AP.LineBreakCharacter)
        const tempElem = document.createElement("textarea");
        document.body.appendChild(tempElem);
        tempElem.setAttribute("id", "temp-id");
        document.querySelector("#temp-id").value = contents;
        tempElem.select();
        document.execCommand("copy");
        document.body.removeChild(tempElem);

        this.notify('クリップボードにコピーしました', 2000)
      },
      notify(message, duration = 3000) {
        this.$notify({
          title: 'Success',
          message: message,
          duration: duration,
          type: 'success'
        });
      },
      addDailyTask() {
        this.notify('定型検索に追加しました', 2000)
      },
      scrollTop() {
        document.querySelector(".result-rows").scrollIntoView(true)
      },
      formatNumber(num) {
        return (num * 100000).toLocaleString()
      }
    },
    data() {
      return {
        searched: true,
        filterForm: {
          regex: '',
          method: 'filter',
        },
        useFilter: false,
        filteredMessages: [],
        logMessages: [],
        status: 'loading'
      };
    },
    components: {
      CloudWatchLogsResult
    }
  }
</script>
<style scoped>
  .container {
    /*height: 1000px;*/
    height: 100vh;
  }

  .search-conditions {
    border: solid 1px #cccccc;
    border-radius: 4px;
    padding: 10px;
  }

  .group-container {
    margin: 0;
  }

  .group-results {
    margin: 10px 0;
    max-height: 300px;
    overflow: auto;
  }

  .el-radio.is-bordered + .el-radio.is-bordered {
    margin-left: 0;
  }

  .el-radio {
    width: 100%;
  }

  .el-input {
    width: 80%;
    max-width: 1000px;
  }

  .filter-type {
    width: 100px;
  }

  .results {
    /*height: 100%;*/
    /*overflow-y: auto;*/
    margin: 10px 0;
    border: solid 1px #cccccc;
    border-radius: 4px;
  }

  .result-rows {
    overflow-wrap: break-word;
  }

  .result-rows:nth-child(even) {
    background-color: #f7f7f7;
    padding: 8px;
  }

  .result-rows:nth-child(odd) {
    padding: 8px;
  }

</style>

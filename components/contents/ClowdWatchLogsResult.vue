<template>
  <div>
    <div class="result-conditions">
      <div>
        検索に使用した条件：
        <div class="conditions">
          {{conditions.group}} | {{conditions.start}} ~ {{conditions.end}} | {{conditions.terms}}
        </div>
        <!--<el-tooltip class="item" effect="dark" content="検索条件を変更する" placement="top">-->
        <!--<el-button circle size="mini" type="text" @click="test()">-->
        <!--<font-awesome-icon icon="wrench"/>-->
        <!--</el-button>-->
        <!--</el-tooltip>-->
      </div>
      <div>
        AWSから取得した件数：<span class="total">{{formatNumber(logMessages.length)}}</span>件
        ［ {{conditions.processingDateLabel}}実行 ］
      </div>
    </div>

    <div class="results">
      <div class="result-utils">
        <div class="result-util-item filter">
          <el-form :model="filterForm" @submit.native.prevent>
            <el-form-item>
              <el-input
                  @keyup.enter.native="filter"
                  @change="filter"
                  placeholder="You can use JavaScript's regular expression. (ex: /[A-Z]/g)"
                  clearable
                  v-model="filterForm.regex">
                <el-select class="filter-type" v-model="filterForm.method" slot="prepend">
                  <el-option label="filter" value="filter"></el-option>
                  <el-option label="capture" value="capture"></el-option>
                </el-select>
              </el-input>
            </el-form-item>
          </el-form>
        </div>

        <div class="result-util-item button">
          <el-tooltip class="item" effect="dark" content="結果をクリップボードにコピーする" placement="top-end">
            <el-button circle size="mini" @click="copyToClipboard()">
              <clipboard-icon></clipboard-icon>
            </el-button>
          </el-tooltip>
        </div>
        <!--<div class="result-util-item button">-->
        <!--<el-tooltip class="item" effect="dark" content="定型検索に追加する" placement="top-end">-->
        <!--<el-button circle size="mini" @click="addDailyTask()">-->
        <!--<star-icon/>-->
        <!--</el-button>-->
        <!--</el-tooltip>-->
        <!--</div>-->
      </div>

      <div v-if="useFilter" class="result-rows" ref="result-rows" v-for="(logMessage, index) in filteredMessages"
           :key="index">
        {{logMessage}}
      </div>

      <div v-if="!useFilter" class="result-rows" ref="result-rows" v-for="(logMessage, index) in logMessages"
           :key="index">
        {{logMessage}}
      </div>
      <pre>{{loadingMessage}}</pre>
    </div>

    <div class="results-footer">
      <el-button type="text" size="mini" @click="scrollTop()">
        <font-awesome-icon icon="arrow-circle-up"/>
        Return to top
      </el-button>
    </div>
  </div>
</template>

<style scoped>

  .filter-type {
    width: 100px;
  }

  .results {
    /*height: 100%;*/
    /*overflow-y: auto;*/
    margin: 0;
    border: solid 1px #cccccc;
    border-radius: 4px;
  }

  .result-conditions {
    margin: 10px 8px;
    line-height: 1.4em;
    color: #333333;
  }

  .result-conditions .conditions {
    background-color: #f7f7f7;
    padding: 4px 8px;
    margin-bottom: 4px;
  }

  .result-conditions .total {
    font-weight: 700;
    font-size: 1.5em;
    color: blue;
  }

  .result-utils {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding: 20px 8px 0 8px;
  }

  .result-util-item.button {
    margin-left: 10px;
  }

  .result-util-item.filter {
    flex-grow: 3;
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

  .results-footer {
    text-align: center;
  }

</style>

<script>
  import AP from '../../utils/ApplicationPreferences'

  export default {
    props: ['conditions', 'logMessages', 'loadingMessage', 'scrollToClass'],
    data() {
      return {
        // conditions: {
        //   terms: '',
        //   group: '',
        //   start: '',
        //   end: '',
        //   processingDateLabel: ''
        // },
        filterForm: {
          regex: '',
          method: 'filter',
        },
        // loadingMessage: '',
        useFilter: false,
        filteredMessages: [],
        // logMessages: []
      };
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
        const convertToText = (lines) => {
          return lines.map(it => {return it.trim()}).join(AP.LineBreakCharacter)
        }

        const contents = this.useFilter ? convertToText(this.filteredMessages)
          : convertToText(this.logMessages)
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
      setConditions() {
        const form = _.cloneDeep(this.form)
        this.conditions.group = form.group
        this.conditions.terms = form.terms
        this.conditions.start = LocalDates.format(form.localDateRange[0])
        this.conditions.end = LocalDates.format(form.localDateRange[1])
        this.conditions.processingDateLabel = `${LocalDates.format(new Date())}（${LocalDates.zoneAbbr()}）`
      },
      scrollTop() {
        document.querySelector(this.scrollToClass).scrollIntoView(true)
      },
      formatNumber(num) {
        return num.toLocaleString()
      }
    },
  }
</script>

<template>
  <section class="container">
    <div>
      <div class="search-conditions">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item label="group" :label-width="formLabelWidth" prop="group">
            <el-input
                @focus="groupsDialogVisible = true"
                placeholder="Log group"
                v-model="form.group">
              <i slot="prefix" class="el-input__icon el-icon-more-outline"></i>
            </el-input>
          </el-form-item>
          <el-form-item :label="localDateRangeLabel" :label-width="formLabelWidth" prop="localDateRange">
            <el-date-picker
                v-model="form.localDateRange"
                type="datetimerange"
                :picker-options="pickerOptions"
                :localTime="true"
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                align="right">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="terms" :label-width="formLabelWidth" prop="terms">
            <el-input v-model="form.terms" autocomplete="off" clearable></el-input>
          </el-form-item>
        </el-form>
        <div class="search-conditions-footer">
          <el-button type="plain" @click="clearForm()">Clear</el-button>
          <el-button type="primary" @click="submitForm('form')">Search</el-button>
        </div>


        <div class="group-container">
          <el-dialog title="Log groups" :visible.sync="groupsDialogVisible">
            <div class="sync-button-wrapper">
              <el-button type="text" icon="el-icon-refresh" @click="syncGroups">Sync with server</el-button>
            </div>
            <div class="group-results">
              <el-form :model="form">
                <el-form-item>
                  <el-radio-group v-model="form.group" size="large">
                    <el-radio border
                              v-for="group in logGroups"
                              :key="group"
                              :label="group"></el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="groupsDialogVisible = false">Close</el-button>
            </span>
          </el-dialog>
        </div>
      </div>
      <div class="first-loading" v-if="!hasSearched && loadingMessage.length !== 0 && logMessages.length === 0">{{loadingMessage}}</div>

      <div v-if="hasSearched">
        <CloudWatchLogsResult :conditions="conditions"
                              :logMessages="logMessages"
                              :loadingMessage="loadingMessage"
                              scrollToClass=".search-conditions"></CloudWatchLogsResult>
      </div>
    </div>
  </section>
</template>

<script>
  import {active, cloudWatchLogs as logs} from '../../store/storage'
  import {CWLogs} from '../../utils/CWLogs'
  import {CWLogsHistories} from '../../utils/CWLogsHistories'
  import {LocalDates} from '../../utils/LocalDates'
  import {Loader} from '../../utils/Loader'
  import _ from 'lodash'
  import CloudWatchLogsResult from '../../components/contents/ClowdWatchLogsResult'

  export default {
    computed: {
      groups() {
        return logs.findGroups()
      },
      activeRegion() {
        return active.region()
      },
    },
    methods: {
      clearForm() {
        this.form.group = ''
        this.form.localDateRange = []
        this.form.terms = ''
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.search()
          } else {
            return false;
          }
        });
      },
      syncGroups() {

        const cwlogs = CWLogs.create(active.profile(), active.region())
        const params = {limit: 50}
        const tempGroups = []

        const onError = err => {
          console.log(err, err.stack);
        }

        const onPerLoad = data => {
          const logGroups = data.logGroups.map(it => it.logGroupName)
          tempGroups.push(...logGroups)
        }

        const onComplete = () => {
          this.logGroups.splice(0, this.logGroups.length)
          logs.sync(tempGroups)

          this.$nextTick(() => {
            this.loadingMessage = ''
            this.logGroups = logs.findGroups()
          })
        }

        Loader(cwlogs)("describeLogGroups", params, onError, onPerLoad, onComplete)
        this.loadingMessage = "Now loading..."
      },
      setConditions() {
        const form = _.cloneDeep(this.form)
        this.conditions.group = form.group
        this.conditions.terms = form.terms
        this.conditions.start = LocalDates.format(form.localDateRange[0])
        this.conditions.end = LocalDates.format(form.localDateRange[1])
        this.conditions.processingDateLabel = `${LocalDates.format(new Date())}（${LocalDates.zoneAbbr()}）`
      },
      search() {
        const cwlogs = CWLogs.create(active.profile(), active.region())
        const params = CWLogs.eventCondition(
          this.form.group,
          this.form.localDateRange,
          this.form.terms
        )

        const history = {
          processingDate: LocalDates.nowAsString(CWLogsHistories.processingDateFormatPattern()),
          responseFiles: [],
          total: 0,
          conditions: _.cloneDeep(this.form)
        }

        const onError = err => {
          console.log(err, err.stack);
        }

        const onPerLoad = data => {
          const messages = data.events.map(it => it.message)
          this.logMessages.push(...messages)
          this.hasSearched = true
          const index = history.responseFiles.length
          const filename = CWLogsHistories.saveResponse(history.processingDate, index, data)
          history.responseFiles.push(filename)
        }

        const onComplete = () => {
          history.total = this.logMessages.length
          CWLogsHistories.save(history)
          // logs.saveHistory(history)
          this.setConditions()

          this.$nextTick(() => {
            this.loadingMessage = ''
          })
        }

        this.logMessages.splice(0, this.logMessages.length)
        Loader(cwlogs)("filterLogEvents", params, onError, onPerLoad, onComplete)
        this.loadingMessage = "Now loading..."
      },
      scrollTop() {
        document.querySelector(".search-conditions").scrollIntoView(true)
      },
      formatNumber(num) {
        return num.toLocaleString()
      }
    },
    data() {
      return {
        hasSearched: false,
        groupsDialogVisible: false,
        formLabelWidth: '130px',
        form: {
          terms: '',
          group: '',
          localDateRange: [],
        },
        conditions: {
          terms: '',
          group: '',
          start: '',
          end: '',
          processingDateLabel: ''
        },
        filterForm: {
          regex: '',
          method: 'filter',
        },
        rules: {
          group: [
            {required: true, message: 'Please select log group', trigger: 'change'}
          ],
          localDateRange: [
            {type: 'array', required: true, message: 'Please select start and end dates', trigger: 'change'}
          ],
          // terms: [
          //   { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
          // ]
        },
        pickerOptions: {
          shortcuts: [
            {
              text: '昨日',
              onClick(picker) {
                const yesterday = LocalDates.aDayBefore(new Date())
                const startAndEnd = LocalDates.startAndEnd(yesterday)
                picker.$emit('pick', [startAndEnd.start, startAndEnd.end]);
              }
            },
            {
              text: '5分以内',
              onClick(picker) {
                const end = new Date();
                const start = LocalDates.subtract(end, 5, 'minute');
                picker.$emit('pick', [start, end]);
              }
            },
            {
              text: '15分以内',
              onClick(picker) {
                const end = new Date();
                const start = LocalDates.subtract(end, 15, 'minute');
                picker.$emit('pick', [start, end]);
              }
            },
            {
              text: '30分以内',
              onClick(picker) {
                const end = new Date();
                const start = LocalDates.subtract(end, 30, 'minute');
                picker.$emit('pick', [start, end]);
              }
            },
            {
              text: '1時間以内',
              onClick(picker) {
                const end = new Date();
                const start = LocalDates.subtract(end, 1, 'hour');
                picker.$emit('pick', [start, end]);
              }
            }
          ]
        },
        localDateRangeLabel: `date range (${LocalDates.zoneAbbr()})`,
        loadingMessage: '',
        logGroups: logs.findGroups(),
        logMessages: []
      };
    },
    components: {
      CloudWatchLogsResult
    }
  }
</script>
<style scoped>
  .container {
    /*min-height: 100vh;*/
  }

  .search-conditions {
    border: solid 1px #cccccc;
    border-radius: 4px;
    padding: 30px 10px 10px 10px;
  }

  .search-conditions-footer {
    text-align: center;
  }

  .group-container {
    margin: 0;
  }

  .group-results {
    max-height: 300px;
    overflow: auto;
  }

  .sync-button-wrapper {
    text-align: right;
    margin-right: 4px;
  }

  .el-radio.is-bordered + .el-radio.is-bordered {
    margin-left: 0;
  }

  .el-radio {
    width: 100%;
  }

  .el-input {
    width: 100%;
  }

  .first-loading {
    text-align: center;
    margin: 20px;
  }


</style>

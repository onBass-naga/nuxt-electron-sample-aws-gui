import AP from './ApplicationPreferences'
import Files from './Files'
import {LocalDates} from './LocalDates'
import {active} from '../store/storage'

const CWLogsHistories = {
  baseDirectory: () => {
    return [AP.WorkDirectory, active.profile(), active.region(), 'logs']
  },
  save: (history) => {
    const filename = `${history.processingDate}.json`
    Files.writeJsonForce(CWLogsHistories.baseDirectory(), filename, history)
    return filename
  },
  saveResponse: (processingDate, index, body) => {
    const filename = CWLogsHistories.responseFilename(index)
    Files.writeJsonForce([...CWLogsHistories.baseDirectory(), processingDate], filename, body)
    return filename
  },
  responseFilename: (index) => {
    return `response.${index.toString().padStart(5, '0')}.json`
  },
  read: (processingDate) => {
    const filename = `${processingDate}.json`
    return Files.readJsonAsync(CWLogsHistories.baseDirectory(), filename).then(historyHeader => {
      return new Promise((resolve, reject) => {
        CWLogsHistories.readDetailsFs()(processingDate, historyHeader.responseFiles).then(details => {

          const events = _.flatten(details.map(it => {
            return it.events
          }))
          const logMessages = events.map(it => it.message)
          const dateParsed = CWLogsHistories.processingDateToDate(processingDate)
          const {total, conditions} = historyHeader
          resolve({total, conditions, processingDate: dateParsed, logMessages})

        }).catch(err => {
          console.error(err)
          reject(err)
        })
      })
    }).catch(err => {
      return ({error: err})
    })
  },
  readDetailsFs: () => {
    return async (processingDate, fileNames) => {
      const read = (filename) => Files.readJsonAsync([...CWLogsHistories.baseDirectory(), processingDate], filename)
      return await Promise.all(fileNames.map(it => {
        return read(it)
      }))
    }
  },
  remove: (name) => {
    console.log(`remove: ${name}`)
  },
  processingDateToDate: (date) => {
    return LocalDates.parse(date, CWLogsHistories.processingDateFormatPattern())
  },
  processingDateFormatPattern: () => {
    return 'YYYYMMDD_HHmmss_SSS'
  }
}

export {CWLogsHistories}

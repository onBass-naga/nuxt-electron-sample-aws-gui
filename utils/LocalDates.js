
import moment from 'moment-timezone'

const LocalDates = {
  aDayBefore: (date) => {
    return moment(date).subtract(1, 'day').toDate()
  },
  startAndEnd: (date) => {
    const m = moment(date)
    return {
      start: m.startOf('date').toDate(),
      end: m.endOf('date').toDate()
    }
  },
  subtract: (date, amount, unit) => {
    return moment(date).subtract(amount, unit).toDate()
  },
  zoneAbbr: () => {
    return moment().tz(moment.tz.guess()).zoneAbbr()
  },
  nowAsString: (pattern = 'YYYY-MM-DD HH:mm') => {
    return moment().format(pattern)
  },
  format: (date, pattern = 'YYYY-MM-DD HH:mm') => {
    return moment(date).format(pattern)
  },
  parse: (date, pattern) => {
    return pattern ? moment(date, pattern).toDate() : moment(date).toDate()
  }
}

export { LocalDates }

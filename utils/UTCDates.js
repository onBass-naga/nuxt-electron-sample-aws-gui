const UTCDates = {
  fromLocalDate: (date) => {
    console.log("src: " + date)
    const localTime = date.getTime()
    const localOffset = date.getTimezoneOffset() * 60000
    const utc = localTime + localOffset
    console.log("result: " + new Date(utc))
    return new Date(utc)
  },
  fromLocalDateStr: (dateStr) => {
    console.log("src: " + dateStr)
    return UTC.fromLocalDate(new Date(dateStr))
  }
}

export {UTCDates}

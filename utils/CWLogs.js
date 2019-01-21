import AP from './ApplicationPreferences'

const CWLogs = {
  create: (profile, region) => {
    const aws = require('aws-sdk')
    const credentials = new aws.SharedIniFileCredentials({profile, region});
    aws.config.credentials = credentials;
    aws.config.update({region});

    return new aws.CloudWatchLogs();
  },
  eventCondition: (group, localDateRange, terms) => {

    const now = new Date().getTime()
    const start = localDateRange[0].getTime()
    const startTime = (start < now) ? start : now
    const end = localDateRange[1].getTime()
    const endTime = (end < now) ? end : now
    const filterPattern = terms.length === 0 ? {} : { filterPattern: terms }

    return Object.assign({
      logGroupName: group,
      limit: AP.LogsLimitPerRequest,
      // nextToken: 'STRING_VALUE',
    }, { startTime }, { endTime }, filterPattern)
  }
}

export { CWLogs }

import _ from 'lodash'

const AWSRegions = {
  Regions: [
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-south-1',
    'ap-southeast-1',
    'ap-southeast-2',
    'ca-central-1',
    'eu-central-1',
    'eu-north-1',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'sa-east-1',
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2'
  ],
  createTransferData: (active) => {
    const clone = _.cloneDeep(AWSRegions.Regions)
    return clone.map(name => {
      return {
        key: name,
        label: name,
        disabled: name === active
      }
    })
  }
}

export { AWSRegions }

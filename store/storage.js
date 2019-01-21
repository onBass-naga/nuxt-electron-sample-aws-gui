import AP from './../utils/ApplicationPreferences'
import Preferences from 'preferences'
import _ from "lodash";

const createDefaultCWLNode = () => {
  return {
    groups: [],
    conditions: [],
    results: [],
    histories: []
  }
}

const defaultCWLRootNode = (() => {
  const root = {}
  root[AP.DefaultProfile] = {}
  root[AP.DefaultProfile][AP.DefaultRegion] = createDefaultCWLNode()
  return root
})()

const defaultPreferences = {
  profiles: [{name: AP.DefaultProfile, color: AP.DefaultHeaderColor, regions: [AP.DefaultRegion], locks: []}],
  activeProfile: AP.DefaultProfile,
  activeRegion: AP.DefaultRegion,
  cloudWatchLogs: defaultCWLRootNode
}

// ~/.config/preferences/com.areab.tools.pref
const pref = new Preferences('com.areab.tools', defaultPreferences, {
  encrypt: false,
  format: 'yaml'
});

const addCWLNodeIfNeed = () => {
  const profile = pref.activeProfile
  const region = pref.activeRegion

  if (!pref.cloudWatchLogs[profile]) {
    pref.cloudWatchLogs[profile] = {}
  }
  if (!pref.cloudWatchLogs[profile][region]) {
    pref.cloudWatchLogs[profile][region] = createDefaultCWLNode()
  }
}

const active = {
  region() {
    return pref.activeRegion
  },
  profile() {
    return pref.activeProfile
  },
}

const profiles = {
  add(name) {
    const names = pref.profiles.map(it => {
      return it.name
    })
    if (!_.includes(names, name)) {
      const profile = {name: name, color: AP.DefaultHeaderColor, regions: [AP.DefaultRegion], locks: []}
      pref.profiles.push(profile)
    }
  },
  list() {
    return pref.profiles
  },
  findActiveOne() {
    return pref.profiles.find(it => {
      return it.name === pref.activeProfile
    })
  },
  saveActiveProfile(name) {
    pref.activeProfile = name
    pref.activeRegion = profiles.findActiveOne().regions[0]
    addCWLNodeIfNeed()
  },
  deleteByName(name) {
    const index = _.findIndex(pref.profiles, it => {
      return it.name === name
    })
    pref.profiles.splice(index, 1)
  },
  saveRegions(regions) {
    profiles.findActiveOne().regions = regions.filter(it => {
      return it !== pref.activeProfile
    })
  },
  saveActiveRegion(region) {
    pref.activeRegion = region
    addCWLNodeIfNeed()
  }
}

const cloudWatchLogs = {
  findGroups() {
    const regionNode = pref.cloudWatchLogs[active.profile()][active.region()]

    if (!regionNode) {
      const defaultNode = createDefaultCWLNode()
      pref.cloudWatchLogs[active.profile()] = {}
      pref.cloudWatchLogs[active.profile()][active.region()] = defaultNode
      return groups
    }

    return regionNode.groups
  },
  sync(groups) {
    pref.cloudWatchLogs[active.profile()][active.region()].groups = groups
  },
  saveHistory(history) {
    console.log(JSON.stringify(history))
    pref.cloudWatchLogs[active.profile()][active.region()].histories.push(history)
    console.log(JSON.stringify(pref.cloudWatchLogs[active.profile()][active.region()]))
  },
  readHistories(limit = AP.LogsHistoryEntriesLimitOfMenu) {
    const histories = _.cloneDeep(_.takeRight(pref.cloudWatchLogs[active.profile()][active.region()].histories, limit))
    return _.reverse(histories)
  }
}

export {active, profiles, cloudWatchLogs}

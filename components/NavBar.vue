<template>
  <div class="nav-container">
    <header class="header_nav" :style="{backgroundColor: activeProfile.color}">
      <el-dropdown @command="handleSelect">
      <span class="el-dropdown-link">
        {{ activeProfile.name }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="profile in profiles"
                            :key="profile.name"
                            :command="profile.name"
                            :disabled="profile.name === activeProfile.name">{{profile.name}}
          </el-dropdown-item>
          <el-dropdown-item command="addProfile" divided>Add profile</el-dropdown-item>
          <el-dropdown-item command="manageProfiles">Manage profiles</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown @command="handleSelectRegion">
      <span class="el-dropdown-link">
        {{ activeRegion }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="region in regions"
                            :key="region"
                            :command="region"
                            :disabled="region === activeRegion">{{region}}
          </el-dropdown-item>
          <el-dropdown-item command="selectRegions" divided>Select regions</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </header>

    <el-dialog title="New profile" :visible.sync="creationDialogVisible">
      <el-form :model="form">
        <el-form-item label="Profile" :label-width="formLabelWidth">
          <el-input v-model="form.profileName" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="creationDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveProfile">Add</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Manage profiles" :visible.sync="manageDialogVisible">
      <el-table
          :data="profiles"
          style="width: 100%">
        <el-table-column
            label="Name"
            width="180">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
            label="Color"
            width="180">
          <template slot-scope="scope">
            <el-color-picker v-model="scope.row.color" size="small"></el-color-picker>
          </template>
        </el-table-column>
        <el-table-column
            label="Operations">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="danger"
                :disabled="scope.row.name === activeProfile.name"
                @click="handleDelete(scope.row.name)">Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="manageDialogVisible = false">Close</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Select favorite regions" :visible.sync="regionDialogVisible">
      <el-transfer
          @change="updateRegions"
          :titles="['AWS Regions','Selected']"
          v-model="regions"
          :data="AllRegions">
      </el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="regionDialogVisible = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>

  .nav-container {
    height: 9vh;
  }

  .header_nav {
    display: block;
    text-align: right;
    background-color: #545c64;
    line-height: 8vh;
    width: 100%;
    color: white;
  }

  .profiles-table {
    margin: 0 10px;
    width: 100%
  }

  .el-dropdown {
    margin-right: 20px;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #ffffff;
  }

  .el-icon-arrow-down {
    font-size: 12px;
  }

</style>

<script>
  import {active, profiles} from '../store/storage'
  import { AWSRegions } from '../utils/AWSRegions'

  export default {
    computed: {
      profiles() {
        return profiles.list()
      },
      theme() {
        const color = profiles.findActiveOne().color
        return {backgroundColor: color}
      }
    },
    methods: {
      showRegionModal() {
        this.AllRegions = AWSRegions.createTransferData(active.region())
        this.form.favoriteRegions = this.regions
        this.regionDialogVisible = true
      },
      updateRegions(rightPanelItems) {
        const selected = rightPanelItems.filter(it => {
          return AWSRegions.Regions.includes(it)
        })
        profiles.saveRegions(selected)
      },
      handleSelect(key, keyPath) {
        console.log(key, keyPath)
        if (key === "addProfile") {
          this.creationDialogVisible = true
          return
        } else if (key === "manageProfiles") {
          this.manageDialogVisible = true
          return
        }

        profiles.saveActiveProfile(key)
        this.$nextTick(() => {
          this.activeProfile = this.findActiveProfile()
          this.activeRegion = active.region()
          this.regions = profiles.findActiveOne().regions
        })
      },
      handleSelectRegion(key) {
        if (key === "selectRegions") {
          this.showRegionModal()
          return
        }

        profiles.saveActiveRegion(key)
        this.$nextTick(() => {
          this.activeRegion = active.region()
        })
      },
      saveProfile() {
        const name = this.form.profileName
        profiles.add(name)
        profiles.saveActiveProfile(name)
        this.creationDialogVisible = false
        this.form.profileName = ''

        const self = this
        this.$nextTick(() => {
          self.activeProfile = self.findActiveProfile()
        })
      },
      handleDelete(name) {
        console.log("delete: " + name)
        profiles.deleteByName(name)
      },
      findActiveProfile() {
        return profiles.findActiveOne()
      }
    },
    data() {
      return {
        creationDialogVisible: false,
        manageDialogVisible: false,
        regionDialogVisible: false,
        form: {
          profileName: '',
          favoriteRegions: ['us-east-1']
        },
        formLabelWidth: '120px',
        activeProfile: this.findActiveProfile(),
        activeRegion: active.region(),
        regions: profiles.findActiveOne().regions,
        AllRegions: []
      };
    }
  }
</script>

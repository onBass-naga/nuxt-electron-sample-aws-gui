import fs from "fs-extra";
import AP from "./ApplicationPreferences";

const Files = {
  writeJsonForce: (directory, filename, body) => {
    const path = Files.path(directory, filename)
    fs.ensureFile(path)
      .then(() => {
        return Files.writeJson(path, body)
      })
      .catch(err => {
        console.error(err)
      })
  },
  writeJson: (path, body) => {
    return fs.writeJson(path, body)
  },
  readJsonAsync: (directory, filename) => {
    return fs.readJson(Files.path(directory, filename))
  },
  path: (directory, filename) => {
    return [...directory, filename].join(AP.FileSeparator)
  }
}

export default Files

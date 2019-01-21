export default {
  translate: err => {
    if (err.errno === -2 && err.code === "ENOENT" && err.syscall === "open") {
      return `ファイル読み込みに失敗しました。[ path: ${err.path} ]`
    }

    return `予期せぬエラーが発生しました。 [ ${err} ]`
  }
}

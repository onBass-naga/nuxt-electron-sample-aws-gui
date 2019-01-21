const Loader = client => {
  return function (loadFs, params, onError, onPerLoad, onComplete) {
    client[loadFs](params, (err, data) => {

      if (err) {
        onError(err);
        return
      }

      if (data.nextToken) {
        onPerLoad(data)
        const nextParam = Object.assign({}, params, {nextToken: data.nextToken});
        Loader(client)(loadFs, nextParam, onError, onPerLoad, onComplete)
      } else {
        onPerLoad(data)
        onComplete()
      }
    })
  }
}

export {Loader}

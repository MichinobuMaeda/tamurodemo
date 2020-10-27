export const functions = ({
  inputs: {},
  results: {},
  httpsCallable (name) {
    return data => {
      this.inputs[name] = data
      return Promise.resolve(this.results[name])
    }
  }
})

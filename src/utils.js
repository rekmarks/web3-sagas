
// for uuidv5, to create IDs that are consistent for e.g. contract types
// across all usages of this package
const NAMESPACE = 'a02f66ef-aeb0-4899-b917-cf514a3e66f1'

const createPromise = (func, args) => new Promise(resolve => {
  func(args, (error, result) => resolve({ error, result }))
})

export {
  NAMESPACE,
  createPromise,
}

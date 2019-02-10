
// for uuidv5, to create IDs that are consistent for e.g. contract types
// across all usages of this package
const NAMESPACE = 'a02f66ef-aeb0-4899-b917-cf514a3e66f1'

export {
  getDisplayAddress,
  NAMESPACE,
}

/**
 * Truncates an Ethereum address for display purposes.
 *
 * @param {string} address the address to truncate
 * @return {string} the truncated address
 */
function getDisplayAddress (address) {
  return address.slice(0, 6) + '...' + address.slice(address.length - 4)
}

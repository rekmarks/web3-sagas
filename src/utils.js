
export {
  getDisplayAddress,
}

/**
 * Truncates an Ethereum address for display purposes.
 *
 * @param {string} address the address to truncate
 */
function getDisplayAddress (address) {
  return address.slice(0, 6) + '...' + address.slice(address.length - 4)
}

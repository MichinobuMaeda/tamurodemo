export const appId = 'tamuro'

export const baseUrl = () => {
  const { protocol, hostname, port } = window.location
  return ((protocol.toLowerCase() === 'http:' && port === '80') || (protocol.toLowerCase() === 'https:' && port === '443'))
    ? `${protocol}//${hostname}${process.env.BASE_URL}`
    : `${protocol}//${hostname}:${port}${process.env.BASE_URL}`
}

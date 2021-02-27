import crypto from 'crypto'

export const topUrl = () => window.location.href.replace(/\?.*/, '').replace(/#.*/, '#/')
export const signInUrl = () => window.location.href.replace(/\?.*/, '').replace(/#.*/, '#/signin')
export const generateRnadome = seed => crypto.createHash('sha256').update(seed).digest('base64').substr(0, 20)
export const generateState = seed => generateRnadome((new Date()).toISOString() + seed)
export const generateNonce = seed => generateRnadome(seed + (new Date()).toISOString())

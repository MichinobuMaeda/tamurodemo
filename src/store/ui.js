import marked from 'marked'
import sanitizeHtml from 'sanitize-html'
import { defaults } from '../conf'

export const msecToDaysAndTime = val => {
  if (val < 0) {
    const d = Math.floor(-val / (24 * 60 * 60 * 1000))
    return `-${d}d ${new Date(-val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
  } else {
    const d = Math.floor(val / (24 * 60 * 60 * 1000))
    return `${d}d ${new Date(val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
  }
}

export const waitFor = state => async (proc, next = null) => {
  const ts = new Date().getTime()
  state.waitProc = ts
  setTimeout(
    () => {
      if (state.waitProc === ts) {
        state.waitProc = null
      }
    },
    defaults.waitProcTimeout
  )
  try {
    const ret = await proc()
    if (next) { await next() }
    return ret
  } finally {
    state.waitProc = null
  }
}

const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']

export const formatText = value => value && value.type === 'markdown'
  ? sanitizeHtml(marked(value.data || ''), { allowedTags })
  : value && value.type === 'html'
    ? sanitizeHtml(value.data || '', { allowedTags })
    : (value.data || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .split(/\n/)
      .map(line => `<div>${line || '&nbsp;'}</div>`)
      .join('\n')

const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn

let version = ''
const proc = spawn('git', ['rev-parse', '--short', 'HEAD'])
proc.stdout.on('data', (chunk) => {
  version += chunk.toString()
})
proc.on('exit', () => {
  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'conf', 'version.js'),
    `export default '${version.trim()}'\n`
  )
})

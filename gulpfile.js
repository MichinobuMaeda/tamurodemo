'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const gulp = require('gulp')
const exec = require('child_process').exec
const fs = require('fs')
const path = require('path')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const jest = require('gulp-jest').default
const runSequence = require('run-sequence')

const dbPath = path.join(__dirname, 'tmp', 'db')
const dbLogPath = path.join(dbPath, 'mongo.log')

const mkdirIfNotExist = trg => {
  try {
    fs.statSync(path.dirname(trg))
  } catch (e) {
    mkdirIfNotExist(path.dirname(trg))
  }
  try {
    fs.statSync(trg)
  } catch (e) {
    fs.mkdirSync(trg)
  }
}

mkdirIfNotExist(dbPath)

gulp.task('test', () => {
  runSequence(
    'mongo-start',
    'build',
    'jest',
    'mongo-stop',
  )
})

gulp.task('start', () => {
  runSequence(
    'mongo-start',
    'build',
    'forever-start',
  )
})

gulp.task('stop', () => {
  runSequence(
    'forever-stop',
    'mongo-stop',
  )
})

gulp.task('build', () => {
  return gulp.src(['src/**/*.js','!src/**/*.test.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'))
})

gulp.task('jest', () => {
  process.env.NODE_ENV = 'test'
  return gulp.src('src')
    .pipe(jest({
      coverage: true,
      cache: false,
    }))
})

const runCommand = command => {
  return cb => {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout)
      console.log(stderr)
      cb(err)
    })
  }
}

gulp.task('mongo-start', runCommand(
  `mongod --fork --dbpath ${dbPath} --logpath ${dbLogPath}`
))

gulp.task('mongo-stop', runCommand(
  'mongo admin --eval "db.shutdownServer();"'
))

const cleanScript = [
  'db.users.remove({})',
  'db.groups.remove({})',
  'db.prims.remove({})',
  'db.creds.remove({})',
  'db.sessions.remove({})',
  'db.logs.remove({})',
].join(';')

gulp.task('mongo-clean', runCommand(
  `mongo tamuro_api --eval "${cleanScript};"`
))

gulp.task('forever-start', runCommand('forever start lib'))

gulp.task('forever-stop', runCommand('forever stop lib'))

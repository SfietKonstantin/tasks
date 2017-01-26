const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const src = path.resolve(__dirname, "../src")
const server = path.join(src, "server")
cp.spawn('npm', ['i'], {env: process.env, cwd: server, stdio: 'inherit'})

const testsCommon = path.join(src, "tests/common")
cp.spawn('npm', ['i'], {env: process.env, cwd: testsCommon, stdio: 'inherit'})

const testsServer = path.join(src, "tests/server")
cp.spawn('npm', ['i'], {env: process.env, cwd: testsServer, stdio: 'inherit'})

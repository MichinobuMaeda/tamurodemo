#!/bin/bash
BASEDIR=`pwd`/`dirname "$BASH_SOURCE"`/../tmp/db
if [ ! -d "$BASEDIR" ]; then
  mkdir $BASEDIR
fi
mongod --fork --dbpath $BASEDIR --logpath $BASEDIR/mongo.log --pidfilepath $BASEDIR/pid.txt

#!/bin/bash
BASEDIR=`pwd`/`dirname "$BASH_SOURCE"`/../tmp/db
kill `cat $BASEDIR/pid.txt`
rm $BASEDIR/pid.txt

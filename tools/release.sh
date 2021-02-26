if [ "$1" = "" ]
then
  echo usage: $0 \"message\"
  exit 1
fi
echo $1
TS=`date '+%Y%m%d%H%M%S'`; sed s/const\ cacheName\ =\ '.*'/const\ cacheName\ =\ \'${TS}\'/g -i public/service-worker.js
git add .
git commit -m "$1"
git push

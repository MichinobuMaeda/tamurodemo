const { dirname, basename } = require('path')
const sharp = require('sharp')

const rotateImage = async ({ path, deg }, { storage, logger }) => {
  if (!deg) {
    return path
  }
  const trg = path.replace(/\.v[0-9]+\./, `.v${new Date().getTime()}.`)
  const bucket = storage.bucket()
  const uploadStream = bucket.file(trg).createWriteStream()
  const pipeline = sharp()
  pipeline.rotate(deg).pipe(uploadStream)
  bucket.file(path).createReadStream().pipe(pipeline)
  await new Promise((resolve, reject) => uploadStream.on('finish', resolve).on('error', reject))
  logger.log(`rotate: ${trg}`)
  return trg
}

const makeThumbnail = async ({ path, width, height, quality }, { storage, logger }) => {
  const trg = `${dirname(path)}/tn/${basename(path)}`
  const bucket = storage.bucket()
  const uploadStream = bucket.file(trg).createWriteStream()
  const pipeline = sharp()
  if (/\.(jpg|jpeg)$/i.test(path)) {
    pipeline.resize({ width, height, fit: sharp.fit.inside }).toFormat('jpeg', { quality }).pipe(uploadStream)
  } else {
    pipeline.resize({ width, height, fit: sharp.fit.inside }).pipe(uploadStream)
  }
  bucket.file(path).createReadStream().pipe(pipeline)
  await new Promise((resolve, reject) => uploadStream.on('finish', resolve).on('error', reject))
  logger.log(`make thumbnail: ${trg}`)
  return trg
}

const provideImage = async (data, context) => {
  const path = await rotateImage(data, context)
  const tn = await makeThumbnail({ ...data, path }, context)
  return { path, tn }
}

module.exports = {
  provideImage
}

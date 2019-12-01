#!/usr/bin/python3
import os, sys
from PIL import Image

def resizePng(src, trg, size):
    im = Image.open(src)
    im.thumbnail(size)
    im.save(trg, "PNG")

src = os.path.dirname(sys.argv[0]) + "/../src/statics/logo.png"
base = os.path.dirname(sys.argv[0]) + "/../src/statics/"

resizePng(src, base + "/app-logo-128x128.png", (128, 128))
resizePng(src, base + "/icons/apple-icon-120x120.png", (120, 120))
resizePng(src, base + "/icons/apple-icon-152x152.png", (152, 152))
resizePng(src, base + "/icons/apple-icon-167x167.png", (167, 167))
resizePng(src, base + "/icons/apple-icon-180x180.png", (180, 180))
resizePng(src, base + "/icons/favicon-16x16.png", (16, 16))
resizePng(src, base + "/icons/favicon-32x32.png", (32, 32))
resizePng(src, base + "/icons/favicon-96x96.png", (96, 96))
resizePng(src, base + "/icons/icon-128x128.png", (128, 128))
resizePng(src, base + "/icons/icon-192x192.png", (192, 192))
resizePng(src, base + "/icons/icon-256x256.png", (256, 256))
resizePng(src, base + "/icons/icon-384x384.png", (384, 384))
resizePng(src, base + "/icons/icon-512x512.png", (512, 512))
resizePng(src, base + "/icons/ms-icon-144x144.png", (144, 144))

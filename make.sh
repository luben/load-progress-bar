#!/bin/sh -x
rm -f load-progress-bar.zip
zip -r load-progress-bar.zip . -x '*.git*' -x '*.swp' -x 'make.sh'

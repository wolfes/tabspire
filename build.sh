#!/bin/bash

crxmake --pack-extension=/Users/wolfe/extensions/tabspire/ext/ --extension-output=/Users/wolfe/extensions/tabspire/tabspire.crx --pack-extension-key=/Users/wolfe/extensions/tabspire.pem;

pandoc -s -S --toc -c swiss.css README.md -o README.html

echo 'Created Chrome Extension at tabspire/tabspire.crx'

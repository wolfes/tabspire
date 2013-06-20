#!/bin/bash

scp /Users/wolfe/extensions/tabspire/tabspire.crx kwards@wstyke.com:wstyke.com/tabspire/tabspire.crx

scp /Users/wolfe/extensions/tabspire/ext/updates.xml kwards@wstyke.com:wstyke.com/tabspire/updates.xml

# Build and upload README.
pandoc -s -S --toc -c swiss.css README.md -o README.html
scp README.html kwards@wstyke.com:wstyke.com/tabspire

echo 'Uploaded tabspire.crx, ext/updates.xml, and README.html to wstyke.com/tabspire/'

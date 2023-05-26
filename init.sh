#!/bin/bash
source ~/.bashrc
asdf install
npm install -g npm-check-updates
npm ci
npm start

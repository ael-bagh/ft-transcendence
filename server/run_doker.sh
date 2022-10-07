#!/bin/bash
pkill Docker

rm -rf ~/Library/Containers/com.docker.docker ~/.docker
mkdir -p ~/goinfre/docker/{com.docker.docker,.docker}
ln -sf ~/goinfre/docker/com.docker.docker    ~/Library/Containers/com.docker.docker
ln -sf ~/goinfre/docker/.docker    ~/.docker

open -g -a Docker
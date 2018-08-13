## Description

This document describes how to build and push docker images used in this project to your Google Container Registry.


## Steps


1. Download files

```
$ git clone https://github.com/thiago-a-souza/kubernetes.git
```

2. Build container images

```
$ cd kubernetes/containers
$ docker build -t gcr.io/YOUR_PROJECT_ID/my-app-image:1.0 ./my-app-image
$ docker build -t gcr.io/YOUR_PROJECT_ID/curl ./curl
```

3. Push images to Google Container Registry

```
$ docker push gcr.io/YOUR_PROJECT_ID/my-app-image:1.0 
$ docker push gcr.io/YOUR_PROJECT_ID/curl 
```

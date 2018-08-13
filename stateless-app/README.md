## Description 

This document describes the steps required to deploy a stateless Kubernetes app to Google Cloud.

## Installing

1. Download files, build container images and push to Google Container Registry [here](../containers/README.md)


2. Deploy application to Kubernetes

```
kubectl apply -f my-deployment.yaml
```

3. After applying the Deployment, you can run some useful commands

```
# Checking the status of the deployment:
kubectl rollout status deployment my-deployment

# Checking the number of replicas desired/available:
kubectl get deployment

# Checking Pods running:
kubectl get pods

# Troubleshooting deployed Pods:
kubectl describe pods -l app=my-pod-label
```


4. Create a service to expose the app to the web

```
kubectl apply -f my-public-service.yaml
```

5. After some time, get the external IP address

```
kubectl get service my-public-service
```

6. Check if the app is responding

```
curl -s http://EXTERNAL-IP-DISPLAYED-BEFORE:81
```





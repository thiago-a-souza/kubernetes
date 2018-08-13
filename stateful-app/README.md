## Description 

This document describes the steps required to deploy a stateful Kubernetes app to Google Cloud.

## Installing

1. Download files, build container images and push to Google Container Registry [here](../containers/README.md)

2. Identify your Google Cloud cluster zone

```
$ gcloud container clusters list
NAME       LOCATION       ...
...        us-central1-a  ...
```

3. Create GCE persistent disks

```
gcloud compute disks create --size=1GiB --zone=us-central1-a my-disk
gcloud compute disks create --size=1GiB --zone=us-central1-a my-disk2
```

4. Create persistent volumes referencing the GCE persistent disks created

```
kubectl apply -f my-persistent-volume.yaml
```


5. Deploy application to Kubernetes

```
kubectl apply -f my-statefulset.yaml
```

6. After creating the resource, you can run some useful commands

```
# Checking the number of replicas desired/current:
kubectl get sts

# Checking Pods running:
kubectl get pods

# Troubleshooting deployed Pods:
kubectl describe pods -l app=my-statefulset-pod-label
```


7. Create a service to expose the app internally

```
kubectl apply -f my-internal-service.yaml
```

8. Listing services

```
$ kubectl get services
NAME                  TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
my-internal-service   ClusterIP   10.11.243.51   <none>        81/TCP    8s
```

9. Run a new Pod to check if the app is working - alternatively, an existing Pod can be used.

```
$ kubectl run -i --tty curl --image=gcr.io/${PROJECT_ID}/curl --restart=Never sh
```

10. From container in the cluster, check if the app is responding

```
# while true ; do curl -s http://my-internal-service:81; sleep 3; done
V1.0 => OS: my-statefulset-1
V1.0 => OS: my-statefulset-0
V1.0 => OS: my-statefulset-1
V1.0 => OS: my-statefulset-0
...
```






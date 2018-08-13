# Author
Thiago Alexandre Domingues de Souza

# Kubernetes

Originally a Google project called Borg, Kubernetes is an open-source system for deploying and managing applications using containers. Kubernetes, also known as K8s (K - 8 letters - s), takes advantage of declarative configuration files describing the desired state of the system, and it automatically matches these requirements. That way, it hides the underlying IT infrastructure, making it possible to handle one or thousands of computing nodes the same way. It also enables moving applications anywhere supporting K8s without starting from scratch. In addition to that, it provides features like scaling, load-balancing, self-healing, and service discovery, releasing developers from implementing them.

Because Kubernetes is continuously monitoring the state of deployed applications, it can detect node failures or application crashes, and take appropriate actions such as restarting containers or relocating the app to a different node. Resources utilization is also considered when scheduling apps to nodes, so they can be distributed based on their requirements and resources available. As application demands may change over time, it can detect load variances and adjust the number of running nodes in real time, using resources more effectively. Regardless the number of nodes running the application, it can be exposed to users as if it was a single unit, and K8s can discover the node running it. This mechanism allows moving applications to different nodes or adjusting the number of nodes without impacting final users.

Kubernetes architecture, illustrated in Figure 1, comprises different components running on master and slave nodes.

<p align="center">
<img src="https://github.com/thiago-a-souza/kubernetes/blob/master/kubernetes-architecture.png"  height="60%" width="60%"> <br>
Figure 1: Kubernetes Architecture <a href="https://github.com/thiago-a-souza/kubernetes/blob/master/README.md#references">(1)</a> </p> 

**Master Node:**

- **API Server:** this is the heart of K8s, it is a RESTful webservice used to authenticate, authorize, validate and then create/read/update/delete resources on the cluster. As other components don't talk to each other, they watch changes on the API server to take actions. External tools can also perform requests to the API server, for example, *kubectl* sends HTTP requests to perform actions.

- **etcd:** it is a key-value store used to persist all data created/modified by the API server.

- **Scheduler:** the watch mechanism notifies the scheduler when new pods are created, and the scheduler update the pod description with the selected node that should run the pod. 

- **Controller Manager:** represents a set of controllers watching for changes on specific resources (e.g. ReplicaSet, Deployment, Service, etc) and perform an action, usually creates/updates/deletes another resource. For example, when a Deployment is submitted to the API server, the Deployment Controller is notified and creates a ReplicaSet, and then the ReplicaSet controller is notified, which creates a pod.

**Slave Node:**

- **Kubelet:** it watches the API servers for Pods assigned by scheduler to the node and then instructs the container runtime to run the declared containers. After starting containers, it checks their status periodically and notify the API Server. In addition to that, it can restart containers when liveness probes fail and stop containers when the pod terminates.

- **Container Runtime:** software that runs containers (e.g. Docker, rkt, etc)

- **kube-proxy:** implements iptables rules to redirect requests to pods. It can also load-balance requests to different pods, improving the service performance.

# Kubernetes Concepts

K8s provides several resources for deploying and managing objects on the cluster [(2)](#references). These resources can be declared in a YAML or JSON file and then created/updated/deleted, allowing storing them in version control systems. Alternatively, they can be created using *kubectl* commands, but this is not recommended to prevent retyping everything and not keeping track of changes.

- **Namespace:** resources can be isolated in their own groups using namespaces, allowing similar resources in different scopes. For example, resources under DEV namespace will not overlap resources from a PRODUCTION namespace. By default, all resources are created in the *default* namespace.

- **Label:** labels are not resources, but rather key-value pairs added to resources. They are useful to organize resources into categories and then list them based on that category. For example, a label can be added to identify backend components, their version, etc. They are also used by selectors to create resources for a given set of objects, for instance, creating a service that matches pods with a given label.

**Workloads:**

- **Pod:** this is the smallest deployable unit because K8s does not deploy containers. Pods can have multiple containers and all of them share the same network space, in other words, the same IP address, hostname and ports. That being said, services running on different containers in the same Pod cannot expose the same ports to avoid conflicts. Even though pods support multiple containers, it should be avoided unless they really need to run together and have the same scalability requirements. For example, a three-tier application (i.e. presentation, logic and data) can run on different Pods because tiers are independent from each other, and also have different scalability requirements.

- **ReplicaSet:** in real world, Pods are not created directly because they do not provide self-healing capabilities offered by controllers like ReplicaSet/Deployment. In that context, a ReplicaSet object allows declaring a number of replicas of a given Pod and it ensures that they are always up and running.

- **Deployment:** it's the recommended controller to create/update/delete pods because it provides a higher-level API including definitions for both ReplicaSets and Pods.

- **Job:** unlike Pods, which run continuously, a Job allows running tasks till successful completion.

- **CronJob:** a Job resource is executed immediately after it is created, CronJobs, on the other hand, can be scheduled to run once or periodically.

- **DaemonSet:** Pods are deployed on any cluster node, but in certain circumstances it is useful to run a Pod replica on all nodes or some nodes. A typical use case would be gathering log files from selected nodes. DaemonSets are suitable for such cases as it ensures that selected nodes run a single copy of a Pod.

- **StatefulSet:** Pods are ephemeral by nature, meaning that they can be replaced with a new replica that has a different name, hostname and data. For most apps, this behavior can be bypassed creating a Service that discoveries the required Pod and a PersistentVolume to store the data. However, some apps really require a stable identity and state. In such cases, StatefulSet fulfills that purpose by creating resources with a stable name, hostname, and their own volumes, preserving their state. As a result, when a StatefulSet object fails, its replacement operates as if it was the failed Pod. Also, scaling StatefulSet resources is predictable. It creates a Pod with the next sequential index when scaling up, and removes the Pod with the highest index to scale down.


**Services:**

- **Service:** since Pods are created/recreated with unpredictable identities, Service allows exposing Pods with a stable IP address and port. That way, clients can reach out to applications regardless of the Pod that's running it, decoupling the app from a specific Pod.

- **Endpoints:** when a Service is created with a Pod selector, K8s creates Endpoints with the matching IP address and port. If a selector is not specified, it's up to you to create them. Endpoints created manually are particularly useful to connect to services running outside the cluster.

- **Ingress:** a Service allows exposing a single service per IP address, so if an app has multiple services to be exposed, each of them will have their own IP. Considering this scenario, Ingress allows exposing multiple services in a single IP address.

**Config:**

- **ConfigMap:** configurations can be passed to containers via environment variables, but these hardcoded variables are difficult to maintain across several environments. ConfigMap is a key-value pair that allows decoupling non-sensitive information in separate scopes, passing map values to containers as environment variables or files in volumes.

- **Secret:** equivalent to ConfigMap but used to store sensitive information. Secrets are stored in memory to prevent leaving traces of sensitive information in disk.

**Storage:**

- **Volume:** there's a wide variety of Volumes supported by K8s, some of them are listed below:
   - **emptyDir:** creates an empty directory to store transient data across containers. However, when a Pod is removed, the data is deleted with it.
   - **hostPath:** mounts a file or directory from the host into the Pod. The data stored using *hostPath* is not removed when a Pod dies, but this alternative should be used carefully because if a new Pod is rescheduled on a different node it will not see the data stored.
   - **nfs:** allows mounting NFS volumes into the Pod
   - **gcePersistentDisk, awsElasticBlockStore, azureDisk:**  cloud providers have their own storage solutions

- **PersistentVolume and PersistentVolumeClaim:** in order to abstract away the storage specifics, K8s introduced PersistentVolume and PersistentVolumeClaim. PersistentVolume specifies low level infrastructure information (e.g. access mode, capacity, file system type, etc) provided by the system administrator. Once a PersistentVolume is created, a developer can create a PersistentVolumeClaim, and K8s will find the appropriate PersistentVolume considering the capacity and the access mode available. Both PersistentVolume and PersistentVolumeClaim define the *accessModes* field, specifying how the volume should be mounted. Access modes requested by a PersistentVolumeClaim should be declared in a PersistentVolume. As a result, when a volume is claimed, the PersistentVolumeClaim requests a specific storage and an access mode, and K8S identifies the matching PersistentVolume. There are three *accessModes* available, described below, but a volume can be mounted only one access mode at a time.       

    - **ReadWriteOnce (RWO):** only one node can mount the volume for reading and write
    - **ReadOnlyMany (ROX):** many nodes can mount the volume for reading-only
    - **ReadWriteMany (RWX):** many nodes can mount the volume for reading and writing. Currently, this access mode is only  supported by a few storage solutions.


- **StorageClass:** claiming storage via PersistentVolume chooses automatically the persistence solution according to the space requested without considering storage classes available. StorageClass allows describing storage classes available (e.g. QoS, backup, default, etc), so it can be specified in the PersistentVolumeClaim to claim an appropriate disk. Similar to PersistentVolume, StorageClass are not tied to namespaces.

# Frequently Used Commands

*Kubectl* is a command line interface (CLI) that interacts with Kubernetes via HTTP requests to the API server. It can  control everything on K8s cluster, for example, creating/modifying/listing/describing resources, troubleshooting, and managing settings. To support all these features, *kubectl* consists of several commands and parameters, but a few of them is enough to get most out of K8s. For a complete reference, check out *kubectl* manuals [(3-5)](#references).

In general, *kubectl* commands have the format below. Resource type (e.g. pod, job, replicaset, etc) is case-insensitive and can be expressed in three forms: singular, plural, or abbreviated. Resource name is case-sensitive and if omitted it displays details for all resources.

```
kubectl [COMMAND] [RESOURCE TYPE] [RESOURCE NAME] [FLAGS]
```

**Remark:** all commands are executed under the *default* namespace. To run the command in a different namespace, use the *--namespace* flag.


**Creating or modifying resources**

Configurations are usually stored in a YAML/JSON file. The *apply* command creates or modifies a resource from stdin or a configuration file.

```
# apply a change from a configuration file
kubectl apply -f ./mypod.yaml
```

Existing resources can be retrieved from the cluster and modified locally using the *edit* command.

```
# syntax
kubectl edit [RESOURCE TYPE] [RESOURCE NAME]

# editing an existing pod named mypod
kubectl edit pod mypod
```

**Listing resources**

Resources are displayed using the *get* command. If the resource name is provided it displays the details about the specific object, otherwise it shows the defails for all objects of the type.

```
# syntax
kubectl get [RESOURCE TYPE] [RESOURCE NAME] [FLAGS]

# listing all pods
kubectl get pod
kubectl get pods
kubectl get po

# listing a specific pod
kubectl get pod mypod

# listing a pod using a YAML format
kubectl get pod mypod -o yaml

# listing pods with additional information
kubectl get pods -o wide

# listing multiple resources of the same type
kubectl get pod mypod1 mypod2

# listing multiple resources types
kubectl get pod/mypod service/myservice

# list pods from a given namespace
kubectl get pods --namespace=NAME

# list pods with their labels
kubectl get pods --show-labels
```

**Describing resources**

The describe command displays detailed information about the state of a resource. It's useful for troubleshooting to identify issues, for example, investigating why a Pod is not running.

```
# syntax
kubectl describe [RESOURCE TYPE] [RESOURCE NAME] [FLAGS]

# describing all deployments
kubectl describe deployments
kubectl describe deployment
kubectl describe deploy

# describing a specific deployment
kubectl get describe deployment myDeploy

# describing pods from a given namespace
kubectl describe pods --namespace=NAME

# describing deployments with a given label
kubectl describe deployments -l myLabelName=myLabelValue
```

**Logs from a container**

Similar to the Docker command, it displays the logs from a container.

```
# logs from a pod that has a single container
kubectl logs myPod

# logs from a pod that has multiple containers
kubectl logs myPod -c myContainer
```


**Deleting resources**

Resources can be deleted using the resource type and name, or providing the configuration file.

```
# syntax
kubectl delete [RESOURCE TYPE] [RESOURCE NAME]

# deleting a pod named mypod
kubectl delete pod mypod

# deleting resource specified in a file
kubectl delete -f ./mypod.yaml

# deleting pods with a given label
kubectl delete pods -l myLabelName=myLabelValue
```

**Accessing a container**

Similar to the *exec* command available in Docker, this command also allows running a command in a container. If the pod has multiple containers, the flag *-c* should be used, otherwise the command will be executed on a default container. The double dash (--) is optional but it's used to identify parameters passed to the container rather than *kubectl* flags.


```
# syntax
kubectl exec -it POD [-c CONTAINER] [-- COMMAND [args...]]

# accessing a container 
kubectl exec -it myPod -c myContainer -- bash
```



**Labels**

Labels should be defined in manifests, but they can also be added/removed via *kubectl*.

```
# adding a label to a Pod
kubectl label pod myPod labelName=labelValue

# overwriting a Pod label value 
kubectl label pod myPod labelName=labelValue2 --overwrite

# removing a label from a Pod
kubectl label pod myPod labelName-
```


# Kubernetes Manifests

Kubernetes resources can be created using a single-line command with *kubectl*, but they are very limited and don't cover all details of the object. Also, it's difficult to maintain several commands rather than configuration files. As a result, Kubernetes manifests are preferred over commands. A manifest can be written in a YAML or JSON format, but because YAML is more human-readable and supports extra features like comments, it has been largely used in configuration files.

In this section, it's covered K8s resources and some key settings. Obviously, manifests have several fields to specify resource details, and they are continuously evolving with K8s. For this reason, you should check out the latest API reference [(6)](#references) for further details. The command `kubectl apply`, illustrated at the  [Frequently Used Commands](#frequently-used-commands) section, can be used to create the following resources.



### Deployment

- **replicas:** specifies the number of Pods required
- **livenessProbe:** *kubelet* periodically checks if the container is alive, restarting the container if the test fails. There are three probes available: 
  - *httpGet:* performs an HTTP request on the container
  - *exec:* runs a specified command on the container
  - *tcpSocket:* opens a TCP connection on the container
- **readinessProbe:** apps take some time to start receiving requests, and users may be impacted if requests are forwarded to containers that are not ready yet. To prevent this behavior, *kubelet* periodically runs readiness probes to verify if the container is able to accept requests. If the test fails, the container is removed from the service Endpoint, so the traffic is not sent to that container. Similar to liveness probe, readiness probe also supports *httpGet*, *exec*, and *tcpSocket*, but their difference is that readiness probe does not restart or kill containers when a test fails.
- **resources:** defines how much CPU and memory each container requires. The *requests* field ensures that the container gets at least the resources specified, and *limits* stablishes a maximum limit. When a Pod is scheduled, only nodes with enough resources not requested are considered, no matter if the sum of requested resources on the node are being used or not. In case  all nodes don't have enough resources, the Pod will be scheduled when the requested resources are freed (i.e. Pod is deleted, killed or terminates). It's important to note that the *limits* field can exceed the node's capacity. However, when the node's capacity is reached, some containers will be killed.

The following example creates a Deployment with 3 replicas, each one exposes the port 8081, performs liveness and readiness probes, defines container resources, and specifies a shared volume between the node and the container. The command `kubectl rollout status deployment NAME` can be used to monitor the status of a given deployment. If you run the command `kubectl get pods`, you will notice that Pods will not become ready until the file */ready.txt* is created.

```
apiVersion: apps/v1beta1
kind: Deployment
metadata: 
  name: my-deployment
  labels:
    app: my-deployment-label
spec:
  replicas: 3 
  template: 
    metadata:
      name: my-pod
      labels:
        app: my-pod-label
    spec:
      containers:
      - image: my-app-image
        name: my-container-name
        ports:
        - containerPort: 8081
          protocol: TCP
        livenessProbe:   # liveness probe to check if the app is responding
          httpGet:
            path: /   
            port: 8081
        readinessProbe:  # readiness probe to check if a given file is avaible
          exec:
            command: ["ls", "/ready.txt"] 
        resources:
          limits:
            cpu: 0.2 
            memory: 32M
          requests:
            cpu: 0.1
            memory: 16M
```

### Job

The job below removes the file */tmp/remove-me.log* from the host *node1*.

```
apiVersion: batch/v1
kind: Job
metadata:
  name: my-job
spec:
  template:
    metadata:
      name: my-job
    spec:
      containers:
      - name: my-job-container-name 
        image: my-job-image
        command: ["rm"]
        args: ["/tmp/remove-me.log"]
        volumeMounts:
        - name: my-tmp-volume
          mountPath: /tmp        # path on the container side
      restartPolicy: Never
      volumes:
      - name: my-tmp-volume
        hostPath:
         path: /tmp              # path on the node side
      nodeSelector:
       node: "node1"
```

### CronJob

The cron job below runs daily at 6AM and removes the file */tmp/remove-me.log* from the host *node1*.

```
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: my-cronjob
spec:
  schedule: "0 6 * * *" # cron schedule
  jobTemplate:
    spec: 
      template:
        metadata:
          labels: 
            app: daily-cronjob
        spec:
          containers:
            - name: my-cronjob-container 
              image: my-cronjob-image
              command: ["rm"]
              args: ["/tmp/remove-me.log"]
              volumeMounts:
                - name: my-tmp-volume  # path on the container side
                  mountPath: /tmp
          restartPolicy: Never
          volumes:
          - name: my-tmp-volume
            hostPath:
              path: /tmp               # path on the node side
          nodeSelector:
            node: "node1"
```


### DaemonSet

The example below creates a DaemonSet running on all test nodes (i.e. *tier: test*). The container creates a volume under the existing directory */log-container* and node has a directory named */log-node*.

```
apiVersion: extensions/v1beta1
kind: DaemonSet 
metadata:
  name: my-daemonset
spec:
  template:
    metadata:
      name: my-daemonset
      labels:
        app: my-log-monitoring
    spec:
      containers:
      - name: my-container-name 
        image: my-log-monitoring-image
        volumeMounts:
        - name: my-tmp-volume
          mountPath: /log-container # path on the container side
      volumes:
      - name: my-tmp-volume
        hostPath:
         path: /log-node            # path on the node side
      nodeSelector:
         tier: test
```

### StatefulSet

The following example creates a StatefulSet with 3 replicas exposing the port 8081.

```
apiVersion: apps/v1beta1
kind: StatefulSet
metadata: 
  name: my-statefulset
  labels:
    app: my-statefulset-label
spec:
  replicas: 3
  serviceName: my-stateful-service-name
  template: 
    metadata:
      name: my-pod-name
      labels:
        app: my-pod-label
    spec:
      containers:
      - image: my-stateful-image
        name: my-container-name 
        ports:
        - containerPort: 8081
          protocol: TCP
```


### Service

The *LoadBalancer* type performs load-balancing across Pods and exposes the service using a single public IP address. For example, the manifest below exposes Pods with label *my-pod-label*. The default type, *ClusterIP*, exposes services internally using a cluster IP address. 

**Remark:** if the *selector* is not specified, K8s will not create the Endpoints resource, and that should be created manually.

```
apiVersion: v1
kind: Service
metadata:
  name: my-public-service-name 
spec:
  ports:
  - name: my-first-service 
    port: 81          # port exposed to clients
    targetPort: 8081  # container port
  selector:
    app: my-pod-label # route traffic to Pods matching this label
  type: LoadBalancer  # expose service using a public IP address
```

### Endpoints

Endpoints name must be the same as the Service name. That being said, assuming that a Service named *my-internal-service2* was created without a *selector*, the following example demonstrates how to create the Endpoints resource manually.

```
apiVersion: v1
kind: Endpoints
metadata:
  name: my-internal-service2  # Endpoints name must match the Service name
subsets:
- addresses:       # list of IP addresses exposing the service
  - ip: 10.8.0.104 
  - ip: 10.8.2.86
  - ip: 10.8.3.18
  ports:           # ports exposing the service
  - port: 8081
```

### Ingress

The example below creates an Ingress that will redirect all requests to the port 80 of the service name provided.

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        backend:
          serviceName: my-service-name  # it should match a Service name
          servicePort: 80
```


### ConfigMap

ConfigMap resources can be created using `kubectl create` or manifests. In case it's created using the direct command, it's possible to pass literals or files/directories. ConfigMaps can be passed to containers via environment variables or volumes.

**1. Creating ConfigMap resources using a manifest**

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-configmap
data:
  myKey1: myVal1
  myKey2: myVal2
```

**2. Creating ConfigMap resources using the create command**

```
# command to create a ConfigMap from a file
kubectl create configmap my-configmap2 --from-file=file.txt 

# command to create a ConfigMap from a literal
kubectl create configmap my-configmap3 --from-literal=myKey3=myVal3
```

**3. Using ConfigMap resources in containers**

```
apiVersion: apps/v1beta1
kind: Deployment
metadata: 
  name: my-deploy
  labels:
    app: my-deploy-label
spec:
  replicas: 1 
  template: 
    metadata:
      name: my-pod
      labels:
        app: my-pod-label
    spec:
      containers:
      - image: my-app-image
        name: my-container-name
        env:
        - name: MY_ENV_VARIABLE1          # env variable from a ConfigMap
          valueFrom:
            configMapKeyRef:
              name: my-configmap
              key: myKey1
        - name: MY_ENV_VARIABLE3          # env variable from a ConfigMap
          valueFrom:
            configMapKeyRef:
              name: my-configmap3
              key: myKey3              
        volumeMounts:
        - name: my-config-volume
          mountPath: /tmp        # container path where the ConfigMap will be available as a file
      volumes:
      - name: my-config-volume
        configMap:               # volume refers to a ConfigMap
         name: my-configmap2     
```

### Secret

Similar to ConfigMap, Secret resources can be created using `kubectl create` or manifests. It's easier to create secrets using the create command because it encodes secret values automatically. Secret manifests require converting secret values from plain text into base64 encoding. K8s decodes secret values and they can be passed to containers via environment variables or volumes.


**1. Creating a secret from a command line**

```
kubectl create secret generic my-secret --from-literal=username=root --from-file=./password.txt
```

**2. Creating Secret resources using a manifest**

**a.** Converting plain-text into base64 encoding: 

```
$ echo -n 'this-is-a-test' | base64
dGhpcy1pcy1hLXRlc3Q=
```

**b.** Using the encoded secret value in the manifest:

```
apiVersion: v1
kind: Secret
metadata:
  name: my-secret2
type: Opaque
data:
  token: dGhpcy1pcy1hLXRlc3Q=
```

**3. Using Secrets in containers**

```
apiVersion: apps/v1beta1
kind: Deployment
metadata: 
  name: my-deploy
  labels:
    app: my-deploy-label
spec:
  replicas: 1 
  template: 
    metadata:
      name: my-pod
      labels:
        app: my-pod-label
    spec:
      containers:
      - image: my-app-image
        name: my-container-name
        env:
        - name: MY_SECRET_USERNAME          # env variable from a Secret
          valueFrom:
            secretKeyRef:
              name: my-secret
              key: username
        - name: MY_SECRET_PWD               # env variable from a Secret
          valueFrom:
            secretKeyRef:
              name: my-secret
              key: password.txt
        volumeMounts:
        - name: my-secret-volume
          mountPath: /tmp/top-secret-dir    # container path where the Secret will be available as a file
          readOnly: true
      volumes:
      - name: my-secret-volume
        secret:
          secretName: my-secret2            
```

### PersistentVolume and PersistentVolumeClaim


**1. Creating a PersistentVolume**

```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-persistent-volume-1
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  - ReadOnlyMany
  persistentVolumeReclaimPolicy: Retain
  gcePersistentDisk:
    pdName: mydisk
    fsType: ext4
```




**2. Claiming volumes with Deployment resources**

Deployment replicas reference a PersistentVolumeClaim by name. Since all replicas reference the same PersistentVolumeClaim,  the number of replicas and the nodes scheduled to run the Pods created may limit access modes. Deployments with one replica can request any of the three access modes - *ReadWriteOnce*, *ReadOnlyMany*, and *ReadWriteMany*. However, *ReadWriteOnce* is not recommended even with one replica because it may cause deadlocks. As a result, **StatefulSet should be used with *ReadWriteOnce* volumes**. When multiple replicas are defined, *ReadOnlyMany* or *ReadWriteMany* can be used because different nodes cannot mount *ReadWriteOnce* volumes - unless replicas are scheduled on the same node. For example, assume that a Deployment with 3 replicas request a PersistentVolumeClaim using a *ReadWriteOnce* volume. Now, consider that Pod A and B are scheduled to node 1 and Pod C is scheduled to node 2. After that, imagine that Pod A was the first one to mount the requested volume. Because Pod A and B are running on node 1, Pod B will also be able to mount that volume. However, Pod C will not run because it was scheduled to node 2.


Creating a PersistentVolumeClaim using the *ReadWriteOnce* access mode:

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-persistent-volume-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi      
```

Deployment referencing an existing PersistentVolumeClaim:

```
apiVersion: apps/v1beta1
kind: Deployment
metadata: 
  name: my-pvc-deployment
  labels:
    app: my-pvc-deployment-label
spec:
  replicas: 1
  template: 
    metadata:
      name: my-pod
      labels:
        app: my-pod-label
    spec:
      containers:
      - image: my-app-image
        name: my-container-name
        volumeMounts:
        - name: my-pvc-volume 
          mountPath: /data                        # container mount path
      volumes:
      - name: my-pvc-volume
        persistentVolumeClaim:
          claimName: my-persistent-volume-claim   # field should match a PersistentVolumeClaim
```

**3. Volume claiming with StatefulSet resources**

Because each StatefulSet replica has its own storage, each replica references its own PersistentVolumeClaim. To accomplish this, StatefulSet resources creates a PersistentVolumeClaim per replica using the field *volumeClaimTemplates*.

```
apiVersion: apps/v1beta1
kind: StatefulSet
metadata: 
  name: my-statefulset
  labels:
    app: my-statefulset-pvc
spec:
  replicas: 2
  serviceName: my-app-stateful
  template: 
    metadata:
      name: my-pod
      labels:
        app: my-pod-label
    spec:
      containers:
      - image: my-app-image
        name: my-container-name
        volumeMounts:
        - name: my-pvc-volume 
          mountPath: /data    # container mount path
  volumeClaimTemplates:
  - metadata:
      name: my-pvc-volume
    spec:
      resources:
        requests:
          storage: 1Gi
      accessModes:
      - ReadWriteOnce 
```

# References

(1) Luksa, Marko. Kubernetes in Action. Manning Publications, 2017.

(2) Kubernetes Concepts - https://kubernetes.io/docs/concepts/

(3) Kubectl Commands - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands

(4) Kubectl Overview - https://kubernetes.io/docs/reference/kubectl/overview/

(5) Kubectl Cheat Sheet - https://kubernetes.io/docs/reference/kubectl/cheatsheet/

(6) Kubernetes API Reference - https://kubernetes.io/docs/reference/#api-reference








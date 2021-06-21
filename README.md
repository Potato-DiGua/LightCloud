```shell
docker run -d -p 80:80 -v /data:/var/light_cloud/data -e "LIGHT_CLOUD_ACCOUNT=root" -e "LIGHT_CLOUD_PWD=123456" potato9527/light-cloud:latest
```
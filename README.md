# LightCloud
## 安装
### Docker
```shell
docker run -d -p 80:80 -v /data:/var/light_cloud/data -e "LIGHT_CLOUD_ACCOUNT=root" -e "LIGHT_CLOUD_PWD=123456" potato9527/light-cloud:latest
```
### docker-compose
```shell
# github
wget https://raw.githubusercontent.com/Potato-DiGua/LightCloud/master/docker-compose.yml
# gitee
wget https://gitee.com/potato-digua/LightCloud/raw/master/docker-compose.yml
docker-compose up -d
```

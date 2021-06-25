# LightCloud
## 安装
### Docker
```shell
docker run -d \
  -p 80:80 \
  -v /data:/var/light_cloud/data # 数据存放位置
  -e "LIGHT_CLOUD_ACCOUNT=root" \ # 用户名
  -e "LIGHT_CLOUD_PWD=123456" \ # 密码
  potato9527/light-cloud:latest
```
### docker-compose
```shell
# 获取docker-compose.yml
# github
wget https://raw.githubusercontent.com/Potato-DiGua/LightCloud/master/docker-compose.yml
# 国内gitee加速
wget https://gitee.com/potato-digua/LightCloud/raw/master/docker-compose.yml
# 安装
docker-compose up -d
```

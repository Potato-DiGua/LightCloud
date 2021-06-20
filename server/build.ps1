$project = Split-Path -Parent $MyInvocation.MyCommand.Definition
echo $project
cd $project
cd ../client
pwd
yarn
yarn build
cd $project
echo "delete public dir"
rm -r .\src\main\resources\public
echo "copy build to public dir"
cp -r ..\client\build .\src\main\resources\public
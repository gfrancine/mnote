# install powershell
cd ..
sudo apt-get update
sudo apt-get install -y wget apt-transport-https software-properties-common
wget -q https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y powershell

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh
export DENO_INSTALL="/home/gitpod/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# install dependencies
cd mnote
npm i -g npm@7
npm --version
npm i -g prettier
pwsh .\\install.ps1
git reset --hard

pwsh

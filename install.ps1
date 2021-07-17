npm --version

# Get-ChildItem -Path "." "package-lock.json" -Recurse | foreach { Remove-Item -Path $_.FullName }

npm i --legacy-peer-deps
cd mnote-util
npm i
cd ../mnote-styles
npm i
cd ../mnote-extensions
npm i --legacy-peer-deps
cd ../mnote-core
npm i
cd ../mnote-app
npm i
cd ..
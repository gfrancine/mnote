del package-lock.json /a /s

rmdir /s /q node_modules
cd mnote-util && rmdir /s /q node_modules
cd ../mnote-styles && rmdir /s /q node_modules
cd ../mnote-extensions && rmdir /s /q node_modules
cd ../mnote-core && rmdir /s /q node_modules
cd ../mnote-app && rmdir /s /q node_modules
cd ..

npm i^
  && cd mnote-util && npm i^
  && cd ../mnote-styles && npm i^
  && cd ../mnote-extensions && npm i^
  && cd ../mnote-core && npm i^
  && cd ../mnote-app && npm i^
  && cd ..

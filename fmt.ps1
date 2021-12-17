prettier --ignore-path="./.gitingore" -w **.scss **.ts **.tsx "{mnote-deps,mnote-extensions}/**/*.{js,jsx,css}"

cd mnote-app/src-tauri
cargo fmt
cd ../..

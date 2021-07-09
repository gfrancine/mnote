deno fmt mnote-core/src
deno fmt mnote-extensions/markdown
deno fmt mnote-app/src 
deno fmt mnote-app/src-web
cd mnote-app/src-tauri && cargo fmt && cd ../..

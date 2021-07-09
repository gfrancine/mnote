deno fmt mnote-core/src
deno fmt mnote-extensions/markdown
deno fmt app/src 
deno fmt app/src-web
cd app/src-tauri && cargo fmt && cd ../..
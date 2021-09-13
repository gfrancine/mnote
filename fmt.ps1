prettier -w **.scss

deno fmt `
  mnote-core/src `
  mnote-extensions/plaintext `
  mnote-extensions/richtext `
  mnote-extensions/settings `
  mnote-extensions/calendar `
  mnote-extensions/kanban `
  mnote-extensions/markdown `
  mnote-extensions/excalidraw `
  mnote-extensions/todo `
  mnote-components/react `
  mnote-components/vanilla `
  mnote-app/src `
  mnote-app/src-web `
  mnote-app/bundle-scripts `
  mnote-util `
  mnote-deps/kanban `
  mnote-deps/resizable

cd mnote-app/src-tauri
cargo fmt
cd ../..

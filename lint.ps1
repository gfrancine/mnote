deno lint `
  mnote-core/src `
  mnote-extensions/plaintext `
  mnote-extensions/richtext `
  mnote-extensions/settings `
  mnote-extensions/calendar `
  mnote-extensions/kanban `
  mnote-extensions/markdown `
  mnote-extensions/image-viewer `
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

# call with ".\lint.ps1 full"
# to avoid compiling

if ($args[0] -eq "full") {
  cd mnote-app/src-tauri
  cargo clippy
  cargo check
  cd ../..
}
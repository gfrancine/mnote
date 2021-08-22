prettier -w **.scss
deno fmt `
  mnote-core/src `
  mnote-extensions/calendar `
  mnote-extensions/kanban `
  mnote-extensions/markdown `
  mnote-extensions/excalidraw `
  mnote-extensions/todo `
  mnote-app/src `
  mnote-app/src-web `
  mnote-util `
  mnote-deps/kanban `
  mnote-deps/resizable

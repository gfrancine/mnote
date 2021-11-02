// mock file tree

export const tree = {
  path: "dir-a",
  children: [
    { path: "dir-a/file-b.txt" },
    { path: "dir-a/file-c" },
    {
      path: "dir-a/dir-d",
      children: [
        { path: "dir-a/dir-d/file-e" },
        { path: "dir-a/dir-d/file-f" },
        { path: "dir-a/dir-d/file-f.txt" },
      ],
    },
    {
      path: "dir-a/dir-",
      children: [],
    },
    { path: "dir-a/zzzzzthisshouldbesorted" },
    {
      path: "dir-a/zzzzzthisshouldbeabovefiles",
      children: [],
    },
    { path: "dir-a/file-g.md" },
    { path: "dir-a/file-h.excalidraw" },
    { path: "dir-a/file-i.mnkanban" },
    { path: "dir-a/file-j.mncalendar" },
    { path: "dir-a/file-j.mntodo" },
    { path: "dir-a/file-j.html" },
    { path: "dir-a/file-j.png" },
  ],
};

// extensions and their test data

const exampleImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVBhXY1Da6PNWRoXh/0k+e48zACTuBXYvab1wAAAAAElFTkSuQmCC";

export const contents: Record<string, string> = {
  md: `# lorem ipsum
  > quote

  paragraph \`inline code\`

  <!---->

  ![](${exampleImage})

  - bullet
    - list
      - nested

  \`\`\`js
  code fence
  \`\`\``,
  mncalendar: `{"view":"dayGridMonth","events":[{"id":"_da8uCArt2UXUq3Kyu2aS",
  "title":"dgfs'","start":"2021-08-31T17:00:00.000Z",
  "end":"2021-09-17T17:00:00.000Z"}]}`,
  mnkanban: `{"board":{"lists":[]},"listsById":{},"cardsById":{}}`,
  excalidraw: `{"elements":[{"id":"H_6ROOV6mTGcLrQqWBi4v","type":"rectangle",
  "x":336.5,"y":298,"width":158,"height":241,"angle":0,"strokeColor":"#000000",
  "backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,
  "strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],
  "strokeSharpness":"sharp","seed":1055297360,"version":17,
  "versionNonce":1592147792,"isDeleted":false,"boundElementIds":null}],
  "appState":{"theme":"dark","collaborators":{},"currentChartType":"bar",
  "currentItemBackgroundColor":"transparent","currentItemEndArrowhead":"arrow",
  "currentItemFillStyle":"hachure","currentItemFontFamily":1,
  "currentItemFontSize":20,"currentItemLinearStrokeSharpness":"round",
  "currentItemOpacity":100,"currentItemRoughness":1,"currentItemStartArrowhead":
  null,"currentItemStrokeColor":"#000000","currentItemStrokeSharpness":"sharp",
  "currentItemStrokeStyle":"solid","currentItemStrokeWidth":1,
  "currentItemTextAlign":"left","cursorButton":"up","draggingElement":null,
  "editingElement":null,"editingGroupId":null,"editingLinearElement":null,
  "elementLocked":false,"elementType":"selection","errorMessage":null,
  "exportBackground":true,"exportScale":1,"exportEmbedScene":false,
  "exportWthDarkMode":false,"fileHandle":null,"gridSize":null,"isBindingEnabled":true,
  "isLibraryOpen":false,"isLoading":false,"isResizing":false,"isRotating":false,
  "lastPointerDownWith":"mouse","multiElement":null,"name":"Untitled-2021-07-11-1340",
  "openMenu":null,"openPopup":null,"pasteDialog":{"shown":false,"data":null},
  "previousSelectedElementIds":{"bRDhbhkjm2Z73bT3Nyzqu":true},"resizingElement":null,
  "scrolledOutside":false,"scrollX":0,"scrollY":0,"selectedElementIds":
  {"H_6ROOV6mTGcLrQqWBi4v":true},"selectedGroupIds":{},"selectionElement":null,
  "shouldCacheIgnoreZoom":false,"showHelpDialog":false,"showStats":false,
  "startBoundElement":null,"suggestedBindings":[],"toastMessage":null,
  "viewBackgroundColor":"#ffffff","zenModeEnabled":true,"zoom":{"value":0.8,
  "translation":{"x":0,"y":0}},"viewModeEnabled":false,"offsetLeft":242.5,
  "offsetTop":36,"width":957.5,"height":764}}`,
  mntodo: `{"version":1,"data":{"items":{"1":{"id":"1","done":true,"text":
  "Do something useful","depth":0}},"itemsOrder":["1"]}}`,
  html:
    `<p><br></p><p><br></p><p>Lorem&nbsp;<strong><u><em>Ipsum</em></u></strong></p><p>Dolor<sup>sit </sup><sub>amet</sub>​</p>`,
  png: exampleImage,
};

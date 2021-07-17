// mock file tree

export const tree = {
  path: "dir-a",
  children: [
    { path: "file-b" },
    { path: "file-c" },
    {
      path: "dir-d",
      children: [
        { path: "file-e" },
        { path: "file-f" },
      ],
    },
    { path: "file-g.md" },
    { path: "file-h.excalidraw" },
    { path: "file-i.mnkanban" },
    { path: "file-j.mncalendar" },
  ],
};

// extensions and their test data

export const contents: Record<string, string> = {
  md: `# lorem ipsum`,
  mncalendar: `{"events":[{"start":"2021-07-11T19:00:00.000Z","end":
  "2021-07-11T21:30:00.000Z","title":"a","allDay":false,"id":null}]}`,
  mnkanban: `{"lanes":[{"cards":[{"id":"76418ea0-e61d-11eb-95dd-f373e7778efd",
  "title":"Do something exciting","description":"Look it up","laneId":
  "6379aa50-e61d-11eb-95dd-f373e7778efd","label":"15 min"}],"id":
  "6379aa50-e61d-11eb-95dd-f373e7778efd","title":"Lane","currentPage":1},{
  "cards":[{"id":"68765e40-e61d-11eb-95dd-f373e7778efd","title":"","laneId":
  "67404f40-e61d-11eb-95dd-f373e7778efd"},{"id":
  "692cb5f0-e61d-11eb-95dd-f373e7778efd",
  "title":"","laneId":"67404f40-e61d-11eb-95dd-f373e7778efd"},{"id":
  "6a28f040-e61d-11eb-95dd-f373e7778efd","title":"","laneId":
  "67404f40-e61d-11eb-95dd-f373e7778efd"},{"id":
  "6ad1b360-e61d-11eb-95dd-f373e7778efd",
  "title":"","laneId":"67404f40-e61d-11eb-95dd-f373e7778efd"},{"id":
  "6b779050-e61d-11eb-95dd-f373e7778efd","title":"","laneId":
  "67404f40-e61d-11eb-95dd-f373e7778efd"
  },{"id":"6c3ab940-e61d-11eb-95dd-f373e7778efd","title":"","laneId":
  "67404f40-e61d-11eb-95dd-f373e7778efd"},{"id":
  "6d446110-e61d-11eb-95dd-f373e7778efd",
  "title":"","laneId":"67404f40-e61d-11eb-95dd-f373e7778efd"},{"id":
  "6f1acec0-e61d-11eb-95dd-f373e7778efd","title":"","laneId":
  "67404f40-e61d-11eb-95dd-f373e7778efd"
  }],"id":"67404f40-e61d-11eb-95dd-f373e7778efd","title":"Long list","currentPage":1}]}`,
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
  "exportWithDarkMode":false,"fileHandle":null,"gridSize":null,"isBindingEnabled":true,
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
};

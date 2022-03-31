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

  - [ ] bullet
    - [x] list
      - [ ] nested

  <!---->

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
  excalidraw: `{
    "type": "excalidraw",
    "version": 2,
    "source": "https://excalidraw.com",
    "elements": [
      {
        "id": "O6DJSjI-GcFDITRtYKj3h",
        "type": "image",
        "x": 567.685546875,
        "y": 260.55877685546875,
        "width": 337.21108094060446,
        "height": 294.6117553710938,
        "angle": 0,
        "strokeColor": "transparent",
        "backgroundColor": "transparent",
        "fillStyle": "hachure",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "strokeSharpness": "round",
        "seed": 43156822,
        "version": 64,
        "versionNonce": 760416714,
        "isDeleted": false,
        "boundElements": null,
        "updated": 1648706813286,
        "link": null,
        "status": "saved",
        "fileId": "ea369e004adfae49c14bfa8827c0db71a58eecea",
        "scale": [
          1,
          1
        ]
      },
      {
        "id": "o5QLWPbMqfPzmWSCevMp6",
        "type": "text",
        "x": 576.8944091796875,
        "y": 191.0230712890625,
        "width": 64,
        "height": 25,
        "angle": 0,
        "strokeColor": "#000000",
        "backgroundColor": "transparent",
        "fillStyle": "hachure",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "strokeSharpness": "sharp",
        "seed": 379797642,
        "version": 8,
        "versionNonce": 897135830,
        "isDeleted": false,
        "boundElements": null,
        "updated": 1648706818529,
        "link": null,
        "text": "Image:",
        "fontSize": 20,
        "fontFamily": 1,
        "textAlign": "left",
        "verticalAlign": "top",
        "baseline": 18,
        "containerId": null,
        "originalText": "Image:"
      }
    ],
    "appState": {
      "theme": "dark",
      "gridSize": null,
      "viewBackgroundColor": "#ffffff"
    },
    "files": {
      "ea369e004adfae49c14bfa8827c0db71a58eecea": {
        "mimeType": "image/png",
        "id": "ea369e004adfae49c14bfa8827c0db71a58eecea",
        "dataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAABRJREFUGFdjlJOT+8/AwMDACGMAABswArX/cUyFAAAAAElFTkSuQmCC",
        "created": 1648706805616
      }
    }
  }`,
  html: `<p><br></p><p><br></p><p>Lorem&nbsp;<strong><u><em>Ipsum</em></u></strong></p><p>Dolor<sup>sit </sup><sub>amet</sub></p>`,
  png: exampleImage,
};

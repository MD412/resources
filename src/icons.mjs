const shapes = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7v5l3 2"/>',
  box: '<path d="m12 3 8.5 4.6v8.8L12 21l-8.5-4.6V7.6L12 3Zm0 9 8.5-4.4M12 12v9m0-9L3.5 7.6"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9.5 9 5 9-5M3 17l9 5 9-5"/>',
  book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>',
  x: '<path d="m4 3 12.8 18H21L8.2 3H4Zm0 18L10.5 13M14 10l6-7"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  external: '<path d="M6 18 18 6M7 6h11v11"/>',
  search: '<circle cx="10.7" cy="10.7" r="6.2"/><path d="m15.4 15.4 4.6 4.6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  folder: '<path d="M3 7V5h7l2 2h9v12H3Z"/>',
  spark:
    '<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="m5 5 14 14M19 5 5 19"/>',
  link: '<path d="m10 13 4-4m-2 7-2 2a4 4 0 0 1-6-6l4-4m4 0 2-2a4 4 0 0 1 6 6l-4 4"/>',
  archive:
    '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9m-9 4h4"/>',
  git: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1.2-.4-2-1-2.5 3.2-.4 6.5-1.5 6.5-7 0-1.3-.4-2.4-1.2-3.3.2-.9.1-2.2-.4-3.2 0 0-1.2-.4-3.8 1.4a14 14 0 0 0-6.2 0C6.4 1.6 5.2 2 5.2 2c-.5 1-.6 2.3-.4 3.2A5 5 0 0 0 3.6 8.5c0 5.5 3.3 6.6 6.5 7-.7.5-1.1 1.6-1.1 2.5v4"/>',
};
export function icon(name, size = 18) {
  return (
    '<svg aria-hidden="true" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    (shapes[name] || shapes.link) +
    "</svg>"
  );
}
export const logo =
  '<svg aria-hidden="true" viewBox="0 0 38 38" width="38" height="38"><rect width="38" height="38" rx="10" fill="#7953e8"/><g fill="none" stroke="white" stroke-width="2.1" stroke-linejoin="round"><path d="m7.5 14 11.5-6 11.5 6L19 20Z"/><path d="m8 19.2 11 5.7 11-5.7M8 24.3l11 5.7 11-5.7"/></g></svg>';

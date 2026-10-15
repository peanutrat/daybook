function belongsTo(host:HTMLElement,range:Range|null){return !!range&&host.contains(range.startContainer)&&host.contains(range.endContainer)}
// Read the live range at the moment a toolbar action runs; selection events may
// arrive after pointerup (drag selection, keyboard selection and mobile handles).
export function editorSelection(host:HTMLElement,live:Selection|null,saved:Range|null,editing=true):Range|null{
 const current=live?.rangeCount?live.getRangeAt(0):null;
 if(belongsTo(host,current)&&(!current!.collapsed||editing||!belongsTo(host,saved)||saved!.collapsed))return current!.cloneRange();
 return belongsTo(host,saved)?saved!.cloneRange():null;
}

import {memo,useEffect,useRef} from 'react';
import type {Doodle} from './doodle';
import {paperShown} from './canvas-paper';
import {canvasSize} from './canvas-size';
import {layered,loadDoodleImages,paintLayers} from './doodle-layers';

export function CanvasThumbnail({doodle}:{doodle:Doodle}){
 const {width,height}=canvasSize(doodle),ratio=Math.min(240/width,240/height),previewWidth=Math.max(1,Math.round(width*ratio)),previewHeight=Math.max(1,Math.round(height*ratio));
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{let stale=false;const value=layered(doodle);if(ref.current)paintLayers(ref.current,value);void loadDoodleImages(value).then(()=>{if(!stale&&ref.current)paintLayers(ref.current,value)}).catch(()=>{});return()=>{stale=true}},[doodle]);
 return <canvas ref={ref} width={previewWidth} height={previewHeight} className={'canvasThumbnail '+(!paperShown(doodle)?'canvasChecker':'')} style={{aspectRatio:width+'/'+height}} aria-hidden="true"/>;
}
export default memo(CanvasThumbnail);

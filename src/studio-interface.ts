import {defaultConfiguration,type DrawingPreferences} from './workspace-config';
import {mobileHiddenDefaults} from './mobile-studio';
import {emptyPanelLayout,updatePanelLayout} from './panel-docking';
// Input/output use the current device's projected tool preferences.
export function resetStudioInterface(value:DrawingPreferences,mobile:boolean){
 const namespace=mobile?'mobile':'desktop',prefix='daybook-floating-panel:'+namespace+':';
 try{const keys:string[]=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(prefix))keys.push(key)}keys.forEach(key=>localStorage.removeItem(key))}catch{}
 updatePanelLayout(namespace,emptyPanelLayout);const defaults=defaultConfiguration();
 return {...value,placements:mobile?[]:defaults.placements,pinnedTools:mobile?[]:defaults.pinnedTools,hiddenTools:mobile?[...mobileHiddenDefaults]:defaults.hiddenTools};
}

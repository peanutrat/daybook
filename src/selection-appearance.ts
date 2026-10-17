import type {WorkspaceConfiguration} from './workspace-config';

// Only the temporary selection overlay uses these colors; artwork is untouched.
export function selectionDisplayColor(preferences:Pick<WorkspaceConfiguration,'selectionColorMode'|'selectionColor'>,theme:string){
 const value=preferences.selectionColorMode==='custom'?preferences.selectionColor:theme.trim();
 if(/^#[0-9a-f]{6}$/i.test(value))return value;
 if(/^#[0-9a-f]{3}$/i.test(value))return '#'+value.slice(1).split('').map(c=>c+c).join('');
 return '#708269';
}

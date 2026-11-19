export const RELOAD_SECONDS=1.8;
export function beginReload(player){if(player.reload>0)return false;player.reload=player.reloadSeconds??RELOAD_SECONDS;player.charge=0;return true;}
export function tickWeaponEnergy(player,dt){
 if(player.reload>0){player.reload=Math.max(0,player.reload-dt);if(player.reload===0)player.energy=player.capacity??100;}
}

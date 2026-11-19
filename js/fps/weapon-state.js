export const RELOAD_SECONDS=1.8;
export function beginReload(player){if(player.reload>0)return false;player.reload=RELOAD_SECONDS;player.charge=0;return true;}
export function tickWeaponEnergy(player,dt){
 if(player.reload>0){player.reload=Math.max(0,player.reload-dt);if(player.reload===0){player.energy=100;player.energyDelay=.25;}return;}
 const delay=player.energyDelay||0;player.energyDelay=Math.max(0,delay-dt);player.energy=Math.min(100,player.energy+Math.max(0,dt-delay)*25);
}

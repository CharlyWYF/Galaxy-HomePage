// Pure geometry shared by the touch controller and its gesture checks.
export function measureGesture(points){
 const [a,b]=points;
 if(!a||!b)return null;
 return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,span:Math.hypot(b.x-a.x,b.y-a.y),angle:Math.atan2(b.y-a.y,b.x-a.x)};
}
export function gestureChange(before,after){
 return {dx:after.x-before.x,dy:after.y-before.y,zoom:before.span>8&&after.span>8?before.span/after.span:1,twist:Math.atan2(Math.sin(after.angle-before.angle),Math.cos(after.angle-before.angle))};
}

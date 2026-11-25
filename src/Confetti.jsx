import {useEffect,useRef} from 'react';
export default function Confetti({fire}){
  const ref=useRef(),ps=useRef([]),raf=useRef();
  useEffect(()=>{
    if(!fire)return;const c=ref.current;c.width=innerWidth;c.height=innerHeight;const x=c.getContext('2d');
    const cols=['#ff4d6d','#ffd166','#06d6a0','#4cc9f0','#ffffff','#c77dff'];
    for(let i=0;i<240;i++)ps.current.push({x:innerWidth/2,y:innerHeight*.5,vx:(Math.random()-.5)*30,vy:-Math.random()*26-6,w:6+Math.random()*8,h:4+Math.random()*6,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%6],l:0});
    cancelAnimationFrame(raf.current);
    const tick=()=>{x.clearRect(0,0,c.width,c.height);ps.current=ps.current.filter(p=>p.y<c.height+30&&p.l<420);
      ps.current.forEach(p=>{p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l++;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});
      if(ps.current.length)raf.current=requestAnimationFrame(tick)};
    tick();return()=>cancelAnimationFrame(raf.current);
  },[fire]);
  return <canvas ref={ref} className="confetti"/>;
}

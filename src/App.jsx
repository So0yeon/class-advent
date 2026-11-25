import {useEffect,useRef,useState} from 'react';
import Confetti from './Confetti';
import Settings from './Settings';
import {load,save,demo,empty,daysLeft,active,remaining,isSchoolDay,uid,ymd} from './store';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const flakes=Array.from({length:45},(_,i)=>({l:(i*37)%100,d:8+(i*7)%10,s:(i*3)%9,z:3+(i%5)*2}));

export default function App(){
  const [s,setS]=useState(load),[view,setView]=useState('main'),[phase,setPhase]=useState('idle');
  const [name,setName]=useState(''),[res,setRes]=useState(null),[fire,setFire]=useState(0),lock=useRef(false);
  useEffect(()=>{save(s)},[s]);
  const left=remaining(s),dl=s.init?daysLeft(s):0,today=ymd();
  const done=s.init&&active(s).some(h=>h.date===today);
  const why=!s.students.length?'학생 명단을 등록해 주세요':!s.gifts.length?'선물을 등록해 주세요':!left.length?'모든 학생이 추첨되었어요 🎉':!isSchoolDay(s)?'오늘은 쉬는 날이에요':done?'오늘의 추첨은 이미 끝났어요':'';
  const draw=async()=>{
    if(lock.current||why)return;lock.current=true;
    const w=left[Math.random()*left.length|0],g=s.gifts[Math.random()*s.gifts.length|0];
    setPhase('shake');await wait(1400);setPhase('spin');
    for(let n=0;n<26;n++){setName(left[Math.random()*left.length|0].name);await wait(60+n*n*.35)}
    setName(w.name);setPhase('pick');await wait(1100);setPhase('open');await wait(1300);
    const rec={id:uid(),date:today,studentId:w.id,studentName:w.name,giftName:g.name,giftEmoji:g.emoji||'🎁',giftDesc:g.desc||''};
    setS(p=>({...p,history:[...p.history,rec]}));setRes(rec);setPhase('reveal');
    setFire(f=>f+1);setTimeout(()=>setFire(f=>f+1),700);
  };
  const close=()=>{setPhase('idle');setRes(null);setName('');lock.current=false};
  const busy=phase!=='idle'&&phase!=='reveal';
  if(!s.init)return <div className="stage"><div className="panel welcome"><h1>🎄 우리 반 어드벤트</h1><p>매일 한 명의 주인공에게 선물이 도착해요.</p>
    <button className="btn" onClick={()=>setS(demo())}>데모 데이터로 시작 (학생 27명)</button>
    <button className="btn ghost" onClick={()=>setS(empty())}>빈 학급으로 시작</button></div></div>;
  if(view==='settings')return <div className="stage"><Settings s={s} setS={setS} back={()=>setView('main')}/></div>;
  const hist=active(s).slice().reverse();
  return <div className="stage" style={s.bg?{'--bg':`url(${s.bg})`}:undefined}>
    <div className="snow">{flakes.map((f,i)=><i key={i} style={{left:f.l+'%',width:f.z,height:f.z,animationDuration:f.d+'s',animationDelay:-f.s+'s'}}/>)}</div>
    <div className={`dim ${busy?'on':''}`}/>
    <header className="panel top">
      <div><div className="cls">{s.className}</div><h1>{s.title}</h1></div>
      <div className="meta"><span>목표일 {s.target}</span><b className="days">{dl}<small>일 남음</small></b></div>
      {!busy&&<button className="gear" onClick={()=>setView('settings')}>⚙ 선생님 설정</button>}
    </header>
    {s.students.length>dl&&<div className="warn">⚠ 남은 학교 영업일({dl}일)이 학생 수({s.students.length}명)보다 적어요</div>}
    <main className="center">
      <div className={`box ${phase} ${busy?'active':''}`}>
        {Array.from({length:14},(_,i)=><b key={i} className="sp" style={{'--a':`${i*360/14}deg`,'--d':`${i*.07}s`}}/>)}
        <div className="glow"/><div className="lid"><i/></div><div className="body"><i/></div>
      </div>
      <div className="slot">{(phase==='spin'||phase==='pick'||phase==='open')?<span className={phase==='pick'?'locked':''}>{name}</span>:<span className="hint">남은 학생 {left.length}명</span>}</div>
      <button className="btn big" disabled={!!why||phase!=='idle'} onClick={draw}>{phase==='idle'?'🎁 오늘의 추첨':'추첨 중…'}</button>
      <div className="why">{why||'버튼을 눌러 오늘의 주인공을 만나보세요'}</div>
    </main>
    <footer className="panel bottom">
      <div className="prog"><span>추첨 완료 {active(s).length} / {s.students.length}명</span><div className="bar"><div style={{width:(s.students.length?active(s).length/s.students.length*100:0)+'%'}}/></div></div>
      <div className="chips">{hist.length?hist.map(h=><span key={h.id} className="chip">{h.giftEmoji} <b>{h.studentName}</b> <small>{h.date.slice(5)}</small></span>):<em>아직 기록이 없어요</em>}</div>
    </footer>
    {phase==='open'&&<div className="flash"/>}
    {phase==='reveal'&&res&&<div className="reveal"><div className="star">오늘의 주인공!</div><div className="wname">{res.studentName}</div>
      <div className="gcard"><div className="gem">{res.giftEmoji}</div><div className="gname">{res.giftName}</div>{res.giftDesc&&<div className="gdesc">{res.giftDesc}</div>}</div>
      <button className="btn" onClick={close}>확인</button></div>}
    <Confetti fire={fire}/>
  </div>;
}

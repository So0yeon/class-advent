import {useState} from 'react';
import {uid,empty,clearAll,remaining,daysLeft,active} from './store';
export default function Settings({s,setS,back}){
  const [tab,setTab]=useState('class'),[bulk,setBulk]=useState(''),[hol,setHol]=useState('');
  const up=p=>setS(x=>({...x,...p})),ask=(m,f)=>confirm(m)&&f();
  const doneIds=new Set(active(s).map(h=>h.studentId));
  const addStudents=()=>{const n=bulk.split('\n').map(t=>t.trim()).filter(Boolean);if(!n.length)return;up({students:[...s.students,...n.map(name=>({id:uid(),name}))]});setBulk('')};
  const setGift=(id,p)=>up({gifts:s.gifts.map(g=>g.id===id?{...g,...p}:g)});
  const pickBg=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,1920/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);up({bg:c.toDataURL('image/jpeg',.8)})};im.src=URL.createObjectURL(f)};
  const dl=daysLeft(s);
  return <div className="panel settings">
    <div className="srow"><h2>⚙ 선생님 설정</h2><button className="btn" onClick={back}>← 돌아가기</button></div>
    <div className="tabs">{[['class','학급'],['gift','선물'],['log','추첨 관리']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</div>
    {tab==='class'&&<div className="cols">
      <section><label>학급 이름<input value={s.className} onChange={e=>up({className:e.target.value})}/></label>
        <label>이벤트 제목<input value={s.title} onChange={e=>up({title:e.target.value})}/></label>
        <label>목표 날짜<input type="date" value={s.target} onChange={e=>up({target:e.target.value})}/></label>
        <label className="chk"><input type="checkbox" checked={s.skipWeekend} onChange={e=>up({skipWeekend:e.target.checked})}/> 주말 제외</label>
        <label>제외할 공휴일·휴업일<span className="inl"><input type="date" value={hol} onChange={e=>setHol(e.target.value)}/><button className="btn sm" onClick={()=>{if(hol&&!s.holidays.includes(hol))up({holidays:[...s.holidays,hol].sort()});setHol('')}}>추가</button></span></label>
        <div className="tags">{s.holidays.map(h=><span key={h} className="chip">{h} <a onClick={()=>up({holidays:s.holidays.filter(x=>x!==h)})}>✕</a></span>)}</div>
        <label>배경 이미지<input type="file" accept="image/*" onChange={pickBg}/></label>
        {s.bg&&<button className="btn sm ghost" onClick={()=>up({bg:''})}>배경 이미지 제거</button>}
        <p className="note">또는 <code>public/bg.jpg</code> 파일을 교체하세요. 남은 영업일 {dl}일 / 학생 {s.students.length}명{s.students.length>dl&&' ⚠ 영업일이 부족해요'}</p></section>
      <section><label>학생 추가 (줄바꿈으로 여러 명)<textarea rows="4" value={bulk} onChange={e=>setBulk(e.target.value)}/></label><button className="btn sm" onClick={addStudents}>학생 추가</button>
        <div className="list">{s.students.map(st=><div key={st.id} className="item"><span>{doneIds.has(st.id)?'✅':'⬜'}</span><input value={st.name} onChange={e=>up({students:s.students.map(x=>x.id===st.id?{...x,name:e.target.value}:x)})}/><a onClick={()=>ask(`${st.name} 학생을 삭제할까요?`,()=>up({students:s.students.filter(x=>x.id!==st.id)}))}>삭제</a></div>)}</div>
        <p className="note">남은 학생 {remaining(s).length}명</p></section></div>}
    {tab==='gift'&&<section><button className="btn sm" onClick={()=>up({gifts:[...s.gifts,{id:uid(),emoji:'🎁',name:'새 선물',desc:''}]})}>+ 선물 추가</button>
      <div className="list tall">{s.gifts.map(g=><div key={g.id} className="item"><input className="em" value={g.emoji} onChange={e=>setGift(g.id,{emoji:e.target.value})}/><input value={g.name} placeholder="선물 이름" onChange={e=>setGift(g.id,{name:e.target.value})}/><input value={g.desc} placeholder="설명 (선택)" onChange={e=>setGift(g.id,{desc:e.target.value})}/><a onClick={()=>ask(`'${g.name}' 선물을 삭제할까요?`,()=>up({gifts:s.gifts.filter(x=>x.id!==g.id)}))}>삭제</a></div>)}</div></section>}
    {tab==='log'&&<section><div className="list tall">{s.history.length?s.history.map(h=><div key={h.id} className={`item ${h.cancelled?'off':''}`}><span>{h.date}</span><b>{h.studentName}</b><span>{h.giftEmoji} {h.giftName}</span>
        <a onClick={()=>ask(h.cancelled?'이 결과를 복구할까요?':'이 결과를 취소할까요? 해당 학생은 다시 추첨 대상이 됩니다.',()=>up({history:s.history.map(x=>x.id===h.id?{...x,cancelled:!x.cancelled}:x)}))}>{h.cancelled?'복구':'취소'}</a></div>):<em>기록이 없어요</em>}</div>
      <div className="srow"><button className="btn sm danger" onClick={()=>ask('추첨 기록을 모두 초기화할까요?',()=>up({history:[]}))}>추첨 결과 초기화</button>
      <button className="btn sm danger" onClick={()=>ask('학생·선물·기록 등 모든 데이터를 삭제할까요?',()=>{clearAll();setS({init:false})})}>전체 데이터 초기화</button></div></section>}
    <p className="note">⚠ 모든 데이터는 이 브라우저에만 저장됩니다. 브라우저 저장 공간을 지우면 사라질 수 있어요.</p>
  </div>;
}

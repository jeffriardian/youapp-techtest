'use client';
import { useState } from 'react';
import Input from './Input';

export default function InterestEditor({ initial, onSave }:{ initial: string[], onSave: (v:string[])=>void }) {
    const [list, setList] = useState<string[]>(initial);
    const [val, setVal] = useState('');
    return (
        <div className="card space-y-3">
        <div className="flex gap-2 flex-wrap">
            {list.map((t,i)=>(
            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                {t} <button className="ml-2 text-mute" onClick={()=>setList(list.filter((_,j)=>j!==i))}>×</button>
            </span>
            ))}
        </div>
        <div className="flex gap-2">
            <Input placeholder="Add interest" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="px-4 rounded-lg bg-accent" onClick={()=>{
            if(val.trim()){ setList([...list, val.trim()]); setVal('');}
            }}>Add</button>
        </div>
        <button className="btn" onClick={()=>onSave(list)}>Save</button>
        </div>
    );
}

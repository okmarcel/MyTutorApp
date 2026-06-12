import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiRequest } from "./api/client";
import type { Lesson, Notification, TutoringGroup, User, UserRole } from "./api/types";

type Role = "ADMIN" | "TUTOR" | "STUDENT";
type View = "dashboard" | "schedule" | "groups" | "students" | "tutors" | "notifications" | "enroll";
type Modal = "lesson" | "student" | "tutor" | "group" | null;
const roleNames: Record<Role,string> = {ADMIN:"Administrator",TUTOR:"Korepetytor",STUDENT:"Kursant"};

function Login({onLogin}:{onLogin:(r:Role)=>void}) {
  const [role,setRole]=useState<Role>("ADMIN");
  return <main className="login"><form className="login-card" onSubmit={e=>{e.preventDefault();onLogin(role)}}>
    <div className="brand">MyTutor</div><div className="subtitle">System zarządzania szkołą korepetycji</div>
    <div className="field"><label>Email</label><input className="input" placeholder="Email"/></div>
    <div className="field"><label>Hasło</label><input className="input" type="password" placeholder="******"/></div>
    <strong>Zaloguj się jako:</strong><div className="role-list">
      {(Object.keys(roleNames) as Role[]).map(r=><button type="button" className={`role-option ${role===r?"active":""}`} onClick={()=>setRole(r)} key={r}><span className="radio"/>{roleNames[r]}</button>)}
    </div><button className="primary wide">Zaloguj się</button>
  </form></main>
}

function useData() {
  const [users,setUsers]=useState<User[]>([]),[groups,setGroups]=useState<TutoringGroup[]>([]),[lessons,setLessons]=useState<Lesson[]>([]),[notifications,setNotifications]=useState<Notification[]>([]);
  const [loading,setLoading]=useState(true),[error,setError]=useState("");
  const refresh=useCallback(async()=>{setLoading(true);setError("");try{const [u,g,l,n]=await Promise.all([apiGet<User[]>("/api/users"),apiGet<TutoringGroup[]>("/api/groups"),apiGet<Lesson[]>("/api/lessons"),apiGet<Notification[]>("/api/notifications")]);setUsers(u);setGroups(g);setLessons(l);setNotifications(n)}catch(e){setError(e instanceof Error?e.message:"Nie udało się pobrać danych")}finally{setLoading(false)}},[]);
  useEffect(()=>{refresh()},[refresh]); return {users,groups,lessons,notifications,loading,error,refresh};
}

function Sidebar({role,view,setView,onLogout,unread}:{role:Role;view:View;setView:(v:View)=>void;onLogout:()=>void;unread:number}) {
  const items: {v:View;l:string}[] = role==="ADMIN" ? [{v:"dashboard",l:"Panel główny"},{v:"schedule",l:"Harmonogram"},{v:"groups",l:"Grupy"},{v:"students",l:"Kursanci"},{v:"tutors",l:"Korepetytorzy"},{v:"notifications",l:"Powiadomienia"}] : role==="TUTOR" ? [{v:"dashboard",l:"Panel główny"},{v:"schedule",l:"Mój harmonogram"},{v:"groups",l:"Moje grupy"},{v:"students",l:"Kursanci"},{v:"notifications",l:"Powiadomienia"}] : [{v:"dashboard",l:"Panel główny"},{v:"enroll",l:"Zapis na zajęcia"},{v:"schedule",l:"Historia zajęć"},{v:"notifications",l:"Powiadomienia"}];
  return <><aside className="sidebar"><div className="side-head"><div className="side-brand">MyTutor</div><div className="muted">{roleNames[role]}<br/>{role.toLowerCase()}1</div></div><nav className="nav">{items.map(i=><button className={view===i.v?"active":""} onClick={()=>setView(i.v)} key={i.v}>{i.l}{i.v==="notifications"&&unread>0?<span className="nav-badge">{unread}</span>:null}</button>)}</nav><button className="secondary logout" onClick={onLogout}>Wyloguj</button></aside><div className="mobile-menu">{items.map(i=><button className={view===i.v?"primary small":"secondary small"} onClick={()=>setView(i.v)} key={i.v}>{i.l}</button>)}</div></>
}

function Dashboard({role,data,open,setView}:{role:Role;data:ReturnType<typeof useData>;open:(m:Modal)=>void;setView:(v:View)=>void}) {
  const students=data.users.filter(u=>u.role==="STUDENT"), tutors=data.users.filter(u=>u.role==="TUTOR"), planned=data.lessons.filter(l=>l.status==="PLANNED");
  const cards=role==="ADMIN"?[[students.length,"Kursanci"],[tutors.length,"Korepetytorzy"],[data.groups.length,"Grupy"],[planned.length,"Zajęcia w tym tygodniu"]]:role==="TUTOR"?[[data.groups.length,"Moje grupy"],[planned.length,"Zajęcia w tym tygodniu"]]:[[planned.length,"Nadchodzące zajęcia"],[data.groups.length,"Moje grupy"]];
  return <><h1>Panel główny</h1><div className="cards">{cards.map(([n,l])=><div className="card" key={l}><strong>{n}</strong><span className="muted">{l}</span></div>)}</div>{role!=="STUDENT"?<><h2 className="section-title">Szybkie akcje</h2><div className="actions"><button onClick={()=>open("lesson")}>Dodaj zajęcia</button><button onClick={()=>open("student")}>Dodaj kursanta</button>{role==="ADMIN"?<button onClick={()=>open("tutor")}>Dodaj korepetytora</button>:null}<button onClick={()=>open("group")}>Utwórz grupę</button></div></>:null}<h2 className="section-title">Nadchodzące zajęcia</h2><div className="panel">{planned.slice(0,6).map(l=><div className="row" key={l.id}><div><div className="row-title">{l.group.name}</div><div>{l.date} | {l.startTime.slice(0,5)}-{l.endTime.slice(0,5)}</div></div><button className="secondary small" onClick={()=>setView("schedule")}>Szczegóły</button></div>)}{!planned.length?<div className="empty">Brak zaplanowanych zajęć</div>:null}</div></>
}

function Schedule({lessons}:{lessons:Lesson[]}) {
  const hours=[9,10,11,12,13,14,15,16,17,18],days=["Poniedziałek","Wtorek","Środa","Czwartek","Piątek"];
  return <><div className="page-head"><h1>Harmonogram</h1></div><div className="calendar-wrap"><div className="calendar"><div className="cal-head">Godzina</div>{days.map(d=><div className="cal-head" key={d}>{d}</div>)}{hours.flatMap(h=>[<div className="cal-time" key={`${h}-t`}>{h}:00</div>,...days.map((_,di)=><div className="cal-cell" key={`${h}-${di}`}>{lessons.filter(l=>new Date(l.date+"T00:00").getDay()===di+1&&Number(l.startTime.slice(0,2))===h).map(l=><div className="cal-event" key={l.id}><b>{l.group.name}</b><br/>{l.startTime.slice(0,5)}-{l.endTime.slice(0,5)}</div>)}</div>)])}</div></div></>
}

function Groups({groups,open}:{groups:TutoringGroup[];open:(m:Modal)=>void}) {return <><div className="page-head"><h1>Grupy</h1><button className="primary" onClick={()=>open("group")}>Utwórz grupę</button></div><div className="toolbar"><input className="input" placeholder="Wyszukaj grupę..."/></div><div className="panel">{groups.map(g=><div className="row" key={g.id}><div><div className="row-title">{g.name}</div><div className="muted">{g.subject} · {g.level} · {g.tutor?.fullName??"Brak korepetytora"}</div></div><div>{g.activeEnrollmentCount}/{g.capacity}</div></div>)}{!groups.length?<div className="empty">Brak grup</div>:null}</div></>}

function Users({users,role,open}:{users:User[];role:UserRole;open:(m:Modal)=>void}) {const rows=users.filter(u=>u.role===role);return <><div className="page-head"><h1>{role==="STUDENT"?"Kursanci":"Korepetytorzy"}</h1><button className="primary" onClick={()=>open(role==="STUDENT"?"student":"tutor")}>Dodaj {role==="STUDENT"?"kursanta":"korepetytora"}</button></div><div className="table-wrap"><table className="table"><thead><tr><th>Imię i nazwisko</th><th>Email</th><th>Telefon</th><th>Rola</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td>{u.fullName}</td><td>{u.email}</td><td>{u.phoneNumber??"—"}</td><td>{roleNames[u.role]}</td></tr>)}</tbody></table>{!rows.length?<div className="empty">Brak użytkowników</div>:null}</div></>}

function Notifications({items}:{items:Notification[]}) {return <><h1>Powiadomienia</h1><div className="panel">{items.map(n=><div className={`notice ${n.status==="UNREAD"?"unread":""}`} key={n.id}><div><div className="row-title">{n.title}</div><div>{n.content}</div><div className="muted">{n.createdAt.slice(0,10)}</div></div><span className="pill">{n.status==="UNREAD"?"Nowe":"Odczytane"}</span></div>)}{!items.length?<div className="empty">Brak powiadomień</div>:null}</div></>}

function ModalForm({type,groups,onClose,onDone}:{type:Exclude<Modal,null>;groups:TutoringGroup[];onClose:()=>void;onDone:()=>void}) {
  const [error,setError]=useState(""); const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setError("");const f=new FormData(e.currentTarget);try{if(type==="lesson")await apiRequest("/api/lessons",{method:"POST",body:JSON.stringify({groupId:Number(f.get("groupId")),date:f.get("date"),startTime:f.get("startTime"),endTime:f.get("endTime")})});else if(type==="group")await apiRequest("/api/groups",{method:"POST",body:JSON.stringify({name:f.get("name"),level:f.get("level"),subject:f.get("subject"),capacity:Number(f.get("capacity")),tutorId:null})});else await apiRequest("/api/users",{method:"POST",body:JSON.stringify({firstName:f.get("firstName"),lastName:f.get("lastName"),email:f.get("email"),phoneNumber:f.get("phone"),password:"secret",role:type==="student"?"STUDENT":"TUTOR"})});onDone()}catch(x){setError(x instanceof Error?x.message:"Nie udało się zapisać")}};
  const title={lesson:"Dodaj zajęcia",student:"Dodaj kursanta",tutor:"Dodaj korepetytora",group:"Utwórz grupę"}[type];
  return <div className="dialog-backdrop"><form className="dialog" onSubmit={submit}><h2>{title}</h2>{error?<div className="error">{error}</div>:null}{type==="lesson"?<><div className="field"><label>Grupa</label><select className="input" name="groupId" required><option value="">Wybierz grupę</option>{groups.map(g=><option value={g.id} key={g.id}>{g.name}</option>)}</select></div><div className="field"><label>Data</label><input className="input" type="date" name="date" required/></div><div className="two-col"><div className="field"><label>Godzina rozpoczęcia</label><input className="input" type="time" name="startTime" required/></div><div className="field"><label>Godzina zakończenia</label><input className="input" type="time" name="endTime" required/></div></div></>:type==="group"?<><div className="field"><label>Nazwa grupy</label><input className="input" name="name" required/></div><div className="field"><label>Poziom</label><input className="input" name="level" required/></div><div className="field"><label>Temat</label><input className="input" name="subject" required/></div><div className="field"><label>Liczba miejsc</label><input className="input" type="number" min="1" name="capacity" defaultValue="10" required/></div></>:<><div className="field"><label>Imię</label><input className="input" name="firstName" required/></div><div className="field"><label>Nazwisko</label><input className="input" name="lastName" required/></div><div className="field"><label>Email</label><input className="input" type="email" name="email" required/></div><div className="field"><label>Telefon</label><input className="input" name="phone"/></div></>}<div className="dialog-actions"><button className="secondary" type="button" onClick={onClose}>Anuluj</button><button className="primary">Zapisz</button></div></form></div>
}

export default function App(){
  const [role,setRole]=useState<Role|null>(null),[view,setView]=useState<View>("dashboard"),[modal,setModal]=useState<Modal>(null); const data=useData();
  const unread=useMemo(()=>data.notifications.filter(n=>n.status==="UNREAD").length,[data.notifications]);
  if(!role)return <Login onLogin={r=>{setRole(r);setView("dashboard")}}/>;
  const content=view==="dashboard"?<Dashboard role={role} data={data} open={setModal} setView={setView}/>:view==="schedule"?<Schedule lessons={data.lessons}/>:view==="groups"||view==="enroll"?<Groups groups={data.groups} open={setModal}/>:view==="students"?<Users users={data.users} role="STUDENT" open={setModal}/>:view==="tutors"?<Users users={data.users} role="TUTOR" open={setModal}/>:<Notifications items={data.notifications}/>;
  return <div className="app"><Sidebar role={role} view={view} setView={setView} unread={unread} onLogout={()=>setRole(null)}/><main className="main">{data.error?<div className="error">{data.error}</div>:null}{data.loading?<div className="muted">Ładowanie...</div>:content}</main>{modal?<ModalForm type={modal} groups={data.groups} onClose={()=>setModal(null)} onDone={()=>{setModal(null);data.refresh()}}/>:null}</div>
}

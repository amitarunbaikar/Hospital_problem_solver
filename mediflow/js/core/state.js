/* App state (db), local-storage save, migrations, permissions, toast, event log */
let db;
try{db=JSON.parse(localStorage.getItem(KEY))||seed()}catch(e){db=seed()}
// Safe additive migration: preserve existing browser demo records while adding newer modules.
db.medicines ??= [{id:"MED-901",name:"Paracetamol",generic:"Paracetamol",strength:"500 mg",form:"Tablet",batch:"DEMO-P500",qty:1200,min:300,expiry:"2027-06-30",location:"Main Pharmacy",supplier:"Demo Supplier A"},{id:"MED-902",name:"Ceftriaxone",generic:"Ceftriaxone",strength:"1 g",form:"Injection",batch:"DEMO-C1G",qty:45,min:60,expiry:"2027-01-31",location:"Main Pharmacy",supplier:"Demo Supplier B"}];
db.supplies ??= [{id:"SUP-901",name:"Examination gloves",category:"PPE",qty:1800,min:500,unit:"pairs",location:"Central Store",expiry:"2028-01-31",supplier:"Demo Supplier A"},{id:"SUP-902",name:"Syringes 5 ml",category:"Consumables",qty:220,min:300,unit:"units",location:"Central Store",expiry:"2027-08-31",supplier:"Demo Supplier C"}];
db.oxygen ??= [{id:"OXY-901",type:"Cylinder",location:"ICU",status:"In use",qty:8,min:6,equipment:"Ready",inspection:"2026-10-01"},{id:"OXY-902",type:"Cylinder",location:"Emergency",status:"Filled",qty:4,min:5,equipment:"Ready",inspection:"2026-10-02"}];
db.stockMoves ??= [];
db.beds.emergencyRoomTotal = 25; db.beds.emergencyRoomOccupied ??= 0; db.beds.emergencyRoomActive ??= false; db.beds.emergencyAllocations ??= [];
db.agentDecisions ??= [];
db.appointments ??= [];
db.admissions ??= [
 {id:"ADM-001",patient:"DEMO-A-101",ward:"General Ward",expected:"Today, 12:30 PM",status:"Expected"},
 {id:"ADM-002",patient:"DEMO-A-102",ward:"Surgical Ward",expected:"Today, 02:00 PM",status:"Expected"},
 {id:"ADM-003",patient:"DEMO-A-103",ward:"ICU",expected:"Today, 11:15 AM",status:"Admitted"}
];
db.waitTimes ??= [
 {id:"WT-001",patient:"DEMO-W-201",department:"Emergency",arrived:"10:40 AM",waitMin:45},
 {id:"WT-002",patient:"DEMO-W-202",department:"General Medicine",arrived:"11:00 AM",waitMin:30},
 {id:"WT-003",patient:"DEMO-W-203",department:"Cardiology",arrived:"11:20 AM",waitMin:15}
];
db.wards ??= [
 {name:"General Ward",total:40,occupied:29,blocked:2,cleaning:1},
 {name:"ICU",total:12,occupied:9,blocked:1,cleaning:0},
 {name:"Emergency",total:16,occupied:11,blocked:1,cleaning:1},
 {name:"Maternity Ward",total:18,occupied:10,blocked:0,cleaning:1},
 {name:"Paediatric Ward",total:16,occupied:8,blocked:1,cleaning:0},
 {name:"Surgical Ward",total:24,occupied:17,blocked:1,cleaning:1},
 {name:"Private Rooms",total:20,occupied:12,blocked:0,cleaning:0}
];
db.doctors.forEach(d=>{d.bookedToday ??= (d.id==="DOC-101"?15:d.id==="DOC-104"?6:d.id==="DOC-105"?5:Math.max(0,Number(d.waiting)||0));});
if(!db.doctors.some(d=>d.id==="DOC-104"))db.doctors.push({id:"DOC-104",hospital:"Main Hospital",department:"Cardiology",name:"Dr. Kabir Menon",specialty:"Cardiology",status:"Available",slots:8,waiting:5,avgWait:18,capacity:20,bookedToday:6,cancelled:0,next:"11:00 AM"});
if(!db.doctors.some(d=>d.id==="DOC-105"))db.doctors.push({id:"DOC-105",hospital:"Main Hospital",department:"Cardiology",name:"Dr. Nisha Verma",specialty:"Cardiology",status:"Available",slots:9,waiting:4,avgWait:15,capacity:20,bookedToday:5,cancelled:0,next:"11:30 AM"});
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function toast(msg,type="success"){const el=document.createElement("div");el.className="toast "+type;el.textContent=msg;document.getElementById("toastArea").appendChild(el);setTimeout(()=>el.remove(),3600)}
function logEvent(text,department="System",priority="Low"){db.events.unshift({id:id("EVT"),text,department,time:now(),priority});db.events=db.events.slice(0,60);db.notifications.unshift({id:id("NTF"),text,time:now(),read:false});db.notifications=db.notifications.slice(0,80)}
function userIsSuper(){return ["Medical Superintendent","Hospital Superintendent"].includes(db.user?.role)}
function isMyDept(dept){return db.user?.role===dept}
function canEdit(dept){return userIsSuper()||isMyDept(dept)}
function countUnread(){return db.notifications.filter(x=>!x.read).length}
const inr=v=>"₹"+Math.round(Number(v)||0).toLocaleString("en-IN");

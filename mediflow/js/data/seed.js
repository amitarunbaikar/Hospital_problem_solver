/* Demo seed data (beds, doctors, labs, discharges, staff ...) */
function seed(){return {
beds:{total:240,occupied:206,blocked:12,cleaning:5,clearance:7,waiting:18,emergency:4,emergencyRoomTotal:25,emergencyRoomOccupied:0,emergencyRoomActive:false,emergencyAllocations:[],ward:"General Ward",reason:"Awaiting discharge documentation and cleaning"},
doctors:[
{id:"DOC-101",hospital:"Main Hospital",department:"Cardiology",name:"Dr. Asha Rao",specialty:"Cardiology",status:"Available",slots:4,waiting:12,avgWait:35,capacity:20,bookedToday:15,cancelled:1,next:"10:30 AM"},
{id:"DOC-104",hospital:"Main Hospital",department:"Cardiology",name:"Dr. Kabir Menon",specialty:"Cardiology",status:"Available",slots:8,waiting:5,avgWait:18,capacity:20,bookedToday:6,cancelled:0,next:"11:00 AM"},
{id:"DOC-105",hospital:"Main Hospital",department:"Cardiology",name:"Dr. Nisha Verma",specialty:"Cardiology",status:"Available",slots:9,waiting:4,avgWait:15,capacity:20,bookedToday:5,cancelled:0,next:"11:30 AM"},
{id:"DOC-102",hospital:"Main Hospital",department:"General Medicine",name:"Dr. Rohan Shah",specialty:"General Medicine",status:"Available",slots:3,waiting:16,avgWait:50,capacity:20,cancelled:2,next:"11:15 AM"},
{id:"DOC-103",hospital:"Main Hospital",department:"Orthopaedics",name:"Dr. Neha Iyer",specialty:"Orthopaedics",status:"Unavailable",slots:0,waiting:7,avgWait:65,capacity:12,cancelled:1,next:"Tomorrow"}
],
labs:[
{id:"LAB-201",test:"Complete Blood Count",pending:14,delayed:3,expected:"45 minutes",requesting:"General Medicine",priority:"High",status:"Delayed",notes:"Several results needed before discharge review",created:now()},
{id:"LAB-202",test:"Renal Function Panel",pending:8,delayed:1,expected:"1 hour",requesting:"Nephrology",priority:"Medium",status:"In Progress",notes:"Routine processing",created:now()},
{id:"LAB-203",test:"Chest X-ray",pending:5,delayed:0,expected:"30 minutes",requesting:"Emergency",priority:"High",status:"In Progress",notes:"Prioritise emergency queue",created:now()}
],
discharges:[
{id:"DIS-301",patient:"PT-1042",medical:"Cleared by clinician",documents:"Pending",pharmacy:"Cleared",billing:"Pending",approval:"Pending",release:"2 hours",coordinator:"Meera N.",notes:"Awaiting paperwork",created:now()},
{id:"DIS-302",patient:"PT-1077",medical:"Awaiting clinical review",documents:"Pending",pharmacy:"Pending",billing:"Pending",approval:"Pending",release:"4 hours",coordinator:"Arjun K.",notes:"Do not discharge until clinician confirms",created:now()},
{id:"DIS-303",patient:"PT-1091",medical:"Cleared by clinician",documents:"Complete",pharmacy:"Cleared",billing:"Cleared",approval:"Approved",release:"30 minutes",coordinator:"Meera N.",notes:"Ready for authorised final workflow",created:now()}
],
staff:[
{id:"STF-401",department:"Diagnostics and Laboratories",shift:"Evening",required:12,available:8,shortage:4,uncovered:"2 sample collection, 2 reporting",workload:"High",notes:"Request temporary support"},
{id:"STF-402",department:"General Ward",shift:"Night",required:18,available:16,shortage:2,uncovered:"2 nursing positions",workload:"Medium",notes:"Escalate for roster review"},
{id:"STF-403",department:"Emergency",shift:"Day",required:10,available:10,shortage:0,uncovered:"None",workload:"Normal",notes:"Coverage adequate"}
],
complaints:[
{id:"CMP-501",category:"Waiting time",description:"Long wait for diagnostic report updates",priority:"High",date:now(),department:"Diagnostics and Laboratories",status:"Open",action:"Follow up with lab supervisor",notes:"Fictional demonstration record"},
{id:"CMP-502",category:"Communication",description:"Family requested clearer discharge status updates",priority:"Medium",date:now(),department:"Discharge Coordination",status:"In Progress",action:"Coordinator to provide update",notes:"Fictional demonstration record"}
],
reports:[
{id:"RPT-601",department:"Bed Management",issue:"12 beds blocked; discharge paperwork pending",priority:"High",submittedBy:"Kavya S.",time:now(),status:"Pending Review",details:"Bed release may be delayed by pending documents.",comments:""},
{id:"RPT-602",department:"Diagnostics and Laboratories",issue:"Delayed CBC reports may affect discharge workflow",priority:"High",submittedBy:"Vikram P.",time:now(),status:"Pending Review",details:"3 delayed reports; follow up with lab team.",comments:""},
{id:"RPT-603",department:"Staff and Rosters",issue:"Evening laboratory shift is below required staffing",priority:"Medium",submittedBy:"Sana M.",time:now(),status:"Pending Review",details:"8 available of 12 required staff.",comments:""}
],
transfers:[{id:"TRF-701",patient:"PT-1140",from:"Sanjeevani Main Hospital",to:"Northside General (demo)",reason:"Specialty consultation",specialty:"Neurology",priority:"Medium",status:"Awaiting Receiving Hospital Confirmation",coordinator:"Ravi P.",notes:"Demo only; no real hospital connection",created:now()}],
actions:[
{id:"ACT-801",title:"Review pending discharge documents",department:"Discharge Coordination",priority:"High",description:"Check documentation and billing clearance for clinician-cleared cases.",assigned:"Meera N.",status:"Open",created:now(),auto:true},
{id:"ACT-802",title:"Follow up on delayed laboratory reports",department:"Diagnostics and Laboratories",priority:"High",description:"Review delayed CBC reports that may affect discharge workflow.",assigned:"Vikram P.",status:"In Progress",created:now(),auto:true},
{id:"ACT-803",title:"Review evening staffing shortage",department:"Staff and Rosters",priority:"Medium",description:"Explore coverage for four uncovered laboratory positions.",assigned:"Sana M.",status:"Open",created:now(),auto:true}
],
events:[{id:id("EVT"),text:"Hackathon demo data loaded",department:"System",time:now(),priority:"Low"}],
notifications:[{id:id("NTF"),text:"3 reports are awaiting Superintendent review.",time:now(),read:false}],
reviewHistory:[], user:null, active:"overview"
}}

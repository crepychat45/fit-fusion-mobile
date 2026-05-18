const c={"workout-start":"/sounds/workout-start.mp3","workout-complete":"/sounds/workout-complete.mp3",notification:"/sounds/notification.mp3",achievement:"/sounds/achievement.mp3",error:"/sounds/error.mp3",success:"/sounds/success.mp3",tap:"/sounds/tap.mp3"},u={"workout-start":"/sounds/default-start.mp3","workout-complete":"/sounds/default-complete.mp3",notification:"/sounds/default-notification.mp3",achievement:"/sounds/default-achievement.mp3",error:"/sounds/default-error.mp3",success:"/sounds/default-success.mp3",tap:"/sounds/default-tap.mp3"},p=(e,o=1)=>new Promise((t,a)=>{try{if(!(localStorage.getItem("fitfusion-sound-enabled")!=="false")){t();return}const n=localStorage.getItem("fitfusion-sound-volume"),i=n?parseInt(n)/100*o:o,s=new Audio(c[e]||u[e]);s.volume=Math.min(Math.max(i,0),1),s.onended=()=>t(),s.onerror=d=>{console.error(`Error playing sound ${e}:`,d),t()},s.play().catch(d=>{console.warn(`Could not play sound ${e}:`,d),t()})}catch(r){console.error("Error in playSound:",r),t()}}),m={short:[50],medium:[100],long:[300],double:[50,30,50],success:[50,50,150],error:[100,50,100,50,100],warning:[70,50,70]},f=(e="short")=>{try{if(!(localStorage.getItem("fitfusion-haptic-enabled")!=="false"))return;navigator.vibrate&&navigator.vibrate(m[e])}catch(o){console.error("Error in vibrate:",o)}},l=(e,o="short",t=1)=>(f(o),p(e,t)),h={fileType:"json",categories:["all"],timeRange:{start:new Date(Date.now()-1e3*60*60*24*30),end:new Date},includeMedia:!1,anonymized:!1},w=async(e={})=>{l("notification","medium");const o={...h,...e};return new Promise(t=>{setTimeout(()=>{const n=`/download/${`fitfusion-export-${new Date().toISOString().replace(/:/g,"-")}.${o.fileType}`}`;t(n)},2e3)})},b=e=>{if(e.includes("all"))return"5-15 MB";const o={workouts:.5,progress:1.2,nutrition:2.5,sleep:.8,activity:3.5,"heart-rate":4.2,all:15},t=e.reduce((a,r)=>a+o[r],0);return t<1?`${Math.round(t*1e3)} KB`:`${t.toFixed(1)} MB`},v=(e,o)=>{l("success","success");const t=g(o),a=new Blob([t],{type:y(o.split(".").pop())}),r=URL.createObjectURL(a),n=document.createElement("a");n.href=r,n.download=o,document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>URL.revokeObjectURL(r),100);const i=new CustomEvent("file-download",{detail:{url:e,fileName:o,complete:!0}});window.dispatchEvent(i),console.log(`Downloading file: ${o}`)},g=e=>{const o=e.split(".").pop(),t=new Date().toISOString();switch(o){case"json":return JSON.stringify({exportDate:t,user:{id:"user123",name:"Demo User",email:"demo@example.com"},data:{workouts:[{id:"w1",name:"Morning Run",type:"cardio",duration:45},{id:"w2",name:"Upper Body",type:"strength",duration:60}],progress:{weight:[{date:"2025-04-01",value:75.5},{date:"2025-04-15",value:74.8}],steps:[{date:"2025-04-14",value:8452},{date:"2025-04-15",value:9120}]}}},null,2);case"csv":return["Date,Activity,Duration,Calories","2025-04-01,Morning Run,45,320","2025-04-03,Upper Body,60,450","2025-04-07,HIIT Session,30,280","2025-04-10,Yoga,45,180","2025-04-14,Cycling,60,520"].join(`
`);case"html":return`<!DOCTYPE html>
<html>
<head>
  <title>FitFusion Data Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #3b82f6; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>FitFusion Data Export</h1>
  <p>Export Date: ${t}</p>
  <p>User: Demo User (demo@example.com)</p>
  
  <h2>Workout History</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Activity</th>
      <th>Duration</th>
      <th>Calories</th>
    </tr>
    <tr>
      <td>2025-04-01</td>
      <td>Morning Run</td>
      <td>45 min</td>
      <td>320</td>
    </tr>
    <tr>
      <td>2025-04-03</td>
      <td>Upper Body</td>
      <td>60 min</td>
      <td>450</td>
    </tr>
    <tr>
      <td>2025-04-07</td>
      <td>HIIT Session</td>
      <td>30 min</td>
      <td>280</td>
    </tr>
  </table>
</body>
</html>`;case"pdf":return`FitFusion Data Export
Generated: ${t}
User: Demo User (demo@example.com)

WORKOUT HISTORY
--------------
2025-04-01 | Morning Run | 45 min | 320 calories
2025-04-03 | Upper Body | 60 min | 450 calories
2025-04-07 | HIIT Session | 30 min | 280 calories
2025-04-10 | Yoga | 45 min | 180 calories
2025-04-14 | Cycling | 60 min | 520 calories

PROGRESS SUMMARY
--------------
Weight: 75.5kg -> 74.8kg
Average Steps: 8,786 per day
Sleep Quality: Good`;default:return`FitFusion Data Export
Generated: ${t}
This is a sample export file.`}},y=e=>{switch(e){case"json":return"application/json";case"csv":return"text/csv";case"html":return"text/html";case"pdf":return"application/pdf";default:return"text/plain"}};export{v as d,w as e,b as g};

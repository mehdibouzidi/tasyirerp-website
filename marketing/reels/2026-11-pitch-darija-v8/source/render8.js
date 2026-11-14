const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/reel8.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','v27/video_muet.mp4'],{stdio:['pipe','inherit','inherit']});
const N=Math.round(48.0*30);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/30);const buf=await p.screenshot({type:'jpeg',quality:94});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%120==0)console.log(i);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close()})();

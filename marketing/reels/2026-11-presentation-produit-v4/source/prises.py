import json,os,urllib.request,subprocess,re,difflib
K=os.environ["ELEVENLABS_API_KEY"];vid="dbXZnF5pfQqN00XGwlRF"
REF={"w01":"شحال عندكم بصح سلعة في stock","w02":"ولا شحال بعتوهم produit","w03":"تسقسيو بصح كل service يعطيكم chiffre واحد اخر","w04":"تسيير ERP يcentraliser كلش في بلاصة وحدة ويعطيكم la visibilité اللي كانت خاصتكم","w05":"production stock comptabilité ولا la paie","w06":"jamais la gestion n'a été aussi facile","w07":"الجواب راح يكون قدامكم وفي بلاصة واحدة","w08":"décidez وانتم على بالكم وش راكم تديروا","w05b":"production stock comptabilité ولا la paie","w09":"demandez la démo tout de suite le lien راهو في la bio"}
norm=lambda s:re.sub(r'[^\w]','',s.lower().replace('ة','ه').replace('أ','ا').replace('إ','ا').replace('ـ',''))
def stt(f):
    o=subprocess.run(["curl","-sS","https://api.elevenlabs.io/v1/speech-to-text","-H","xi-api-key: "+K,"-F","model_id=scribe_v1","-F","file=@"+f],capture_output=True,text=True).stdout
    return json.loads(o).get("text","")
def pauses(f):
    e=subprocess.run(["ffmpeg","-i",f,"-af","silencedetect=n=-38dB:d=0.18","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',e)];en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',e)]
    dur=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
    return [(a,b) for a,b in zip(st,en) if a>0.15 and b<dur-0.15]
best={}
for l in open("v13/script.txt"):
    k,t=l.rstrip("\n").split("|",1)
    cands=[]
    for i in range(3):
        body={"text":t,"model_id":"eleven_v4","voice_settings":{"stability":0.3,"similarity_boost":0.8,"speed":1.1}}
        r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":K,"Content-Type":"application/json"})
        o=f"v13/{k}_t{i}.mp3";open(o,"wb").write(urllib.request.urlopen(r).read())
        tr=stt(o);sc=difflib.SequenceMatcher(None,norm(REF[k]),norm(tr)).ratio();ps=pauses(o)
        cands.append((sc,ps,o,tr));print(k,i,round(sc,2),"pauses:",[(round(a,2),round(b-a,2)) for a,b in ps],tr,flush=True)
    good=[c for c in cands if c[0]>=max(x[0] for x in cands)-0.08]
    c=min(good,key=lambda c:(sum(b-a for a,b in c[1]),-c[0]));best[k]=c[2]
json.dump(best,open("v13/best.json","w"),indent=1)
outs=list(best.values());ins=sum([["-i",o] for o in outs],[])
fc="".join(f"[{i}:a]apad=pad_dur=0.2[a{i}];" for i in range(len(outs)))+"".join(f"[a{i}]" for i in range(len(outs)))+f"concat=n={len(outs)}:v=0:a=1,loudnorm=I=-16[o]"
subprocess.run(["ffmpeg","-v","error","-y"]+ins+["-filter_complex",fc,"-map","[o]","-ar","44100","v13/essai-texte-commercial.mp3"],check=True)
print(best)

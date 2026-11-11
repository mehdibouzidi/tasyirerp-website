import json,os,urllib.request,subprocess,re,difflib,sys
K=os.environ["ELEVENLABS_API_KEY"];vid=os.environ.get("VID","NBjtCdChq5Ph56VnCM8Z");tag=os.environ.get("TAG","theo")
REF={"f01":"vous produisez encore au feeling","f02":"achats au cas où coûts et écarts connus trop tard","f03":"tasyir erp toute l'entreprise pilotée par le besoin réel","f04":"du devis à la facture sans ressaisie","f05":"vos besoins annuels calculés la base de votre programme prévisionnel d'importation","f06":"g50 irg cnas et paie générées automatiquement","f07":"utilisé en entreprise depuis plus de deux ans","f08":"demandez votre démo"}
norm=lambda s:re.sub(r'[^\w]','',s.lower().replace('cinquante','50').replace('knass','cnas').replace('tassyir','tasyir').replace('tassir','tasyir'))
def stt(f):
    o=subprocess.run(["curl","-sS","https://api.elevenlabs.io/v1/speech-to-text","-H","xi-api-key: "+K,"-F","model_id=scribe_v1","-F","language_code=fra","-F","file=@"+f],capture_output=True,text=True).stdout
    return json.loads(o).get("text","")
def pauses(f):
    e=subprocess.run(["ffmpeg","-i",f,"-af","silencedetect=n=-38dB:d=0.25","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',e)];en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',e)]
    return [(round(a,2),round(b-a,2)) for a,b in zip(st,en)]
best={}
for l in open(sys.argv[1]):
    k,t=l.rstrip("\n").split("|",1);c=[]
    for i in range(3):
        body={"text":t,"model_id":"eleven_v4","voice_settings":{"stability":0.3,"similarity_boost":0.8,"speed":1.05}}
        r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":K,"Content-Type":"application/json"})
        o=f"v15/{tag}_{k}_t{i}.mp3";open(o,"wb").write(urllib.request.urlopen(r).read())
        tr=stt(o);sc=difflib.SequenceMatcher(None,norm(REF[k]),norm(tr)).ratio();c.append((sc,o));print(k,i,round(sc,2),pauses(o),tr,flush=True)
    best[k]=max(c)[1]
json.dump(best,open(f"v15/best_{tag}.json","w"),indent=1)
outs=list(best.values());ins=sum([["-i",o] for o in outs],[]);n=len(outs)
fc="".join(f"[{i}:a]apad=pad_dur=0.25[a{i}];" for i in range(n))+"".join(f"[a{i}]" for i in range(n))+f"concat=n={n}:v=0:a=1,loudnorm=I=-16[o]"
subprocess.run(["ffmpeg","-v","error","-y"]+ins+["-filter_complex",fc,"-map","[o]","-ar","44100",f"v15/essai-{tag}.mp3"],check=True)

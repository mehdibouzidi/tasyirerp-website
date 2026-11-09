import re,json,os,subprocess,difflib,sys
sys.path.insert(0,'.'); from tts import tts
def stt(f):
    o=subprocess.run(["curl","-sS","https://api.elevenlabs.io/v1/speech-to-text","-H","xi-api-key: "+os.environ["ELEVENLABS_API_KEY"],"-F","model_id=scribe_v1","-F","file=@"+f],capture_output=True,text=True).stdout
    return json.loads(o).get("text","")
norm=lambda s: re.sub(r'[^\w]','',re.sub(r'\[.*?\]','',s).lower().replace('ة','ه').replace('أ','ا').replace('ڨ','ق').replace('گ','ق'))
res={}
for line in open('vo/script2.txt'):
    k,t=line.rstrip('\n').split('|',1)
    best=None
    for i in range(int(os.environ.get("N","3"))):
        f=f'vo/{k}_{os.environ.get("V","b")}{i}.mp3'; tts(t,f); tr=stt(f); sc=difflib.SequenceMatcher(None,norm(t),norm(tr)).ratio()
        print(k,i,round(sc,2),tr,flush=True)
        if not best or sc>best[0]: best=(sc,f,tr)
    res[k]=best
json.dump(res,open('vo/best_{os.environ.get("V","b")}.json','w'),ensure_ascii=False,indent=1)

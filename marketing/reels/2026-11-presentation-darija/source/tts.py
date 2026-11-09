import sys,json,os,urllib.request
voice="dbXZnF5pfQqN00XGwlRF"
def tts(text,out,stab=0.5,sim=0.78,model="eleven_v3"):
    body={"text":text,"model_id":model,"voice_settings":{"stability":stab,"similarity_boost":sim,"speed":1.0}}
    r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":os.environ["ELEVENLABS_API_KEY"],"Content-Type":"application/json"})
    try: open(out,"wb").write(urllib.request.urlopen(r).read())
    except urllib.error.HTTPError as e: print(e.read()); raise
if __name__=="__main__":
    for line in open(sys.argv[1]):
        if not line.strip(): continue
        name,text=line.rstrip("\n").split("|",1); tts(text,name); print("ok",name)

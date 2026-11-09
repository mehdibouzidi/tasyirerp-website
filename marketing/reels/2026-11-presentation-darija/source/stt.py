import sys,json,os,subprocess
for f in sys.argv[1:]:
    out=subprocess.run(["curl","-sS","https://api.elevenlabs.io/v1/speech-to-text","-H","xi-api-key: "+os.environ["ELEVENLABS_API_KEY"],"-F","model_id=scribe_v1","-F","file=@"+f],capture_output=True,text=True).stdout
    d=json.loads(out); print(f, d.get("language_code"), "|", d.get("text"))

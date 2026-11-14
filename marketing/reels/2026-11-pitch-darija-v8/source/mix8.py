import subprocess,json
D=48.0
VO=[("v27/p01.wav",0.25),("v27/p02.wav",2.5),("v27/p03.wav",10.85),("v27/p04.wav",15.85),("v27/p05.wav",23.95),("v27/p06.wav",30.3),("v27/p07.wav",38.15),("v27/p08.wav",42.95)]
FX=[("sfx/stamp.mp3",9.66,-10),("sfx/impact.mp3",10.9,-13),("v2/flip.mp3",16.27,-12),("sfx/stamp.mp3",21.27,-10),("sfx/stamp.mp3",33.3,-10),("sfx/tap.mp3",43.71,-4),("sfx/impact.mp3",46.6,-12)]
# whoosh discret sur chaque transition de scène
FX+=[("sfx/whoosh.mp3",t-0.2,-22) for t in (2.35,10.7,15.7,23.8,30.15,38.0,42.8)]
def run(cmd): subprocess.run(["ffmpeg","-v","error","-y"]+cmd,check=True)
def lufs(f):
    e=subprocess.run(["ffmpeg","-hide_banner","-i",f,"-af","ebur128","-f","null","-"],capture_output=True,text=True).stderr
    return float([l for l in e.splitlines() if l.strip().startswith("I:")][-1].split()[1])
# 1. voix : placement, légère compression, normalisation
ins=sum([["-i",f] for f,_ in VO],[]);n=len(VO)
fc="".join(f"[{i}:a]aformat=channel_layouts=mono,adelay={int(t*1000)}:all=1[a{i}];" for i,(f,t) in enumerate(VO))+"".join(f"[a{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur={D},atrim=0:{D},acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7[o]"
run(ins+["-filter_complex",fc,"-map","[o]","-ar","48000","-ac","2","v27/voix_off.wav"])
# 2. musique : basse, coupée en douceur à la fin
run(["-i","v27/musique.mp3","-af",f"atrim=0:{D},afade=t=in:d=0.4,afade=t=out:st={D-1.2}:d=1.2,loudnorm=I=-27:TP=-3","-ar","48000","-ac","2","v27/musique_basse.wav"])
# 3. bruitages
ins=sum([["-i",f] for f,_,_ in FX],[]);m=len(FX)
fc="".join(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,adelay={int(t*1000)}:all=1[f{i}];" for i,(f,t,db) in enumerate(FX))+"".join(f"[f{i}]" for i in range(m))+f"amix=inputs={m}:normalize=0,apad=whole_dur={D},atrim=0:{D}[o]"
run(ins+["-filter_complex",fc,"-map","[o]","-ar","48000","v27/bruitages.wav"])
# 4. mixage : la musique baisse encore sous la voix
run(["-i","v27/voix_off.wav","-i","v27/musique_basse.wav","-i","v27/bruitages.wav","-filter_complex",
 "[0:a]asplit=3[v][sc][sc2];[1:a][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=300[mu];[mu][2:a]amix=inputs=2:normalize=0[bg0];[bg0][sc2]sidechaincompress=threshold=0.05:ratio=3:attack=10:release=250[bg];[v][bg]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false[o]",
 "-map","[o]","-ar","48000","v27/mix_brut.wav"])
run(["-i","v27/musique_basse.wav","-i","v27/bruitages.wav","-filter_complex","[0:a][1:a]amix=inputs=2:normalize=0[o]","-map","[o]","v27/fond_seul.wav"])
o=subprocess.run(["ffmpeg","-hide_banner","-i","v27/mix_brut.wav","-af","loudnorm=I=-14:TP=-1:LRA=11:print_format=json","-f","null","-"],capture_output=True,text=True).stderr
mm=json.loads(o[o.rindex("{"):])
run(["-i","v27/mix_brut.wav","-af",f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={mm['input_i']}:measured_TP={mm['input_tp']}:measured_LRA={mm['input_lra']}:measured_thresh={mm['input_thresh']}:offset={mm['target_offset']}:linear=true","-ar","48000","v27/mix_final.wav"])
print("voix seule (LUFS):",lufs("v27/voix_off.wav"),"| musique + bruitages (LUFS):",lufs("v27/fond_seul.wav"),"| final:",lufs("v27/mix_final.wav"))
e=subprocess.run(["ffmpeg","-hide_banner","-i","v27/mix_final.wav","-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr
print([l.strip() for l in e.splitlines() if "Peak:" in l][-1])
# crête de chaque bruitage dans le mix final comparée à la voix autour
for f,t,db in FX:
    a=lambda src:float(subprocess.run(["ffmpeg","-hide_banner","-ss",str(t),"-t","0.6","-i",src,"-af","volumedetect","-f","null","-"],capture_output=True,text=True).stderr.split("max_volume: ")[1].split(" ")[0])
    print(f"{f:22s} {t:5.2f}s  crête bruitage {a('v27/bruitages.wav'):6.1f} dB | crête voix {a('v27/voix_off.wav'):6.1f} dB")

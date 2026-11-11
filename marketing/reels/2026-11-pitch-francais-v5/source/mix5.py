import subprocess,json
D=34.1
VO=[("v15/d01.wav",0.25),("v15/d02.wav",3.05),("v15/d03.wav",8.55),("v15/d04.wav",13.35),("v15/d05.wav",16.5),("v15/d06.wav",21.65),("v15/d07.wav",27.1),("v15/d08.wav",29.95)]
FX=[("sfx/stamp.mp3",7.33,-10),("sfx/impact.mp3",8.6,-13),("v2/flip.mp3",13.6,-12),("sfx/stamp.mp3",15.27,-10),("sfx/stamp.mp3",25.81,-10),("sfx/tap.mp3",30.77,-4),("sfx/impact.mp3",33.2,-12)]
def run(cmd): subprocess.run(["ffmpeg","-v","error","-y"]+cmd,check=True)
def lufs(f):
    e=subprocess.run(["ffmpeg","-hide_banner","-i",f,"-af","ebur128","-f","null","-"],capture_output=True,text=True).stderr
    return float([l for l in e.splitlines() if l.strip().startswith("I:")][-1].split()[1])
# 1. voix : placement, légère compression, normalisation
ins=sum([["-i",f] for f,_ in VO],[]);n=len(VO)
fc="".join(f"[{i}:a]aformat=channel_layouts=mono,adelay={int(t*1000)}:all=1[a{i}];" for i,(f,t) in enumerate(VO))+"".join(f"[a{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur={D},atrim=0:{D},acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7[o]"
run(ins+["-filter_complex",fc,"-map","[o]","-ar","48000","-ac","2","v16/voix_off.wav"])
# 2. musique : basse, coupée en douceur à la fin
run(["-i","v14/musique.mp3","-af",f"atrim=0:{D},afade=t=in:d=0.4,afade=t=out:st={D-1.2}:d=1.2,loudnorm=I=-27:TP=-3","-ar","48000","-ac","2","v16/musique_basse.wav"])
# 3. bruitages
ins=sum([["-i",f] for f,_,_ in FX],[]);m=len(FX)
fc="".join(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,adelay={int(t*1000)}:all=1[f{i}];" for i,(f,t,db) in enumerate(FX))+"".join(f"[f{i}]" for i in range(m))+f"amix=inputs={m}:normalize=0,apad=whole_dur={D},atrim=0:{D}[o]"
run(ins+["-filter_complex",fc,"-map","[o]","-ar","48000","v16/bruitages.wav"])
# 4. mixage : la musique baisse encore sous la voix
run(["-i","v16/voix_off.wav","-i","v16/musique_basse.wav","-i","v16/bruitages.wav","-filter_complex",
 "[0:a]asplit=2[v][sc];[1:a][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=300[mu];[mu][2:a]amix=inputs=2:normalize=0[bg];[v][bg]amix=inputs=2:normalize=0[o]",
 "-map","[o]","-ar","48000","v16/mix_brut.wav"])
run(["-i","v16/musique_basse.wav","-i","v16/bruitages.wav","-filter_complex","[0:a][1:a]amix=inputs=2:normalize=0[o]","-map","[o]","v16/fond_seul.wav"])
o=subprocess.run(["ffmpeg","-hide_banner","-i","v16/mix_brut.wav","-af","loudnorm=I=-14:TP=-1:LRA=11:print_format=json","-f","null","-"],capture_output=True,text=True).stderr
mm=json.loads(o[o.rindex("{"):])
run(["-i","v16/mix_brut.wav","-af",f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={mm['input_i']}:measured_TP={mm['input_tp']}:measured_LRA={mm['input_lra']}:measured_thresh={mm['input_thresh']}:offset={mm['target_offset']}:linear=true","-ar","48000","v16/mix_final.wav"])
print("voix seule (LUFS):",lufs("v16/voix_off.wav"),"| musique + bruitages (LUFS):",lufs("v16/fond_seul.wav"),"| final:",lufs("v16/mix_final.wav"))
e=subprocess.run(["ffmpeg","-hide_banner","-i","v16/mix_final.wav","-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr
print([l.strip() for l in e.splitlines() if "Peak:" in l][-1])
# crête de chaque bruitage dans le mix final comparée à la voix autour
for f,t,db in FX:
    a=lambda src:float(subprocess.run(["ffmpeg","-hide_banner","-ss",str(t),"-t","0.6","-i",src,"-af","volumedetect","-f","null","-"],capture_output=True,text=True).stderr.split("max_volume: ")[1].split(" ")[0])
    print(f"{f:22s} {t:5.2f}s  crête bruitage {a('v16/bruitages.wav'):6.1f} dB | crête voix {a('v16/voix_off.wav'):6.1f} dB")

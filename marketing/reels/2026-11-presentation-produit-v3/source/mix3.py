import subprocess,json
VO=[("vo/v3_01.wav",0.2),("vo/v3_02.wav",3.65),("vo/v3_03.wav",5.55),("vo/v3_04.wav",9.3),("vo/v3_05.wav",12.9),("vo/v3_06.wav",16.25),("vo/v3_07.wav",19.1),("vo/v3_08.wav",23.4),("vo/v3_09.wav",27.75)]
D=31.7
def fp(k): return k if k.startswith("v2/") else "sfx/"+k
FX=[("v2/slam",0.3,-8),("v2/slam",1.2,-5),("v2/build",1.362,-14),("pop",2.2,-10),("v2/slam",2.6,-9),("v2/suck",2.869,-8),
("v2/bars",3.4,-8),("impact",3.63,-3),("v2/shine",4.3,-10),
("whoosh",5.413,-12)]+[("pop",5.65+i*0.08,-17) for i in range(6)]+[("v2/slam",7.85,-10),("v2/slam",8.55,-9),
("whoosh",9.118,-10)]+[("v2/flip",x,-8) for x in (9.4,9.75,10.05,10.35,10.6)]+[("stamp",11.25,-5),
("swipe",12.75,-10)]+[("v2/drop",13.05+i*0.22,8) for i in range(6)]+[("glitch",14.55,-12),("whoosh",14.85,-9),("impact",14.85,-14),
("pop",16.15,-10),("tap",16.5,-6),("v2/cascade",16.73,3),("v2/slam",17.35,-8),("whoosh",18.4,-11),("impact",19.34,-4),("v2/slam",20.32,-7),("v2/slam",21.18,-7),("stamp",22.2,-5),
("whoosh",23.313,-10),("whoosh",24.288,-10),("whoosh",24.998,-10),("swipe",26.0,-10),("v2/slam",26.5,-7),
("impact",27.45,-4),("v2/bars",27.568,-9),("pop",28.1,-10),("v2/shine",28.335,-11),("tap",28.9,-6),("pop",28.92,-12),("impact",30.5,-3)]
ins=[];fl=[]
for i,(f,t) in enumerate(VO):
    ins+=["-i",f];fl.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int(t*1000)}:all=1[v{i}]")
n=len(VO);fl.append("".join(f"[v{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur={D}[vo]")
fl.append("[vo]asplit=2[voA][voSC]")
for j,(k,t,db) in enumerate(FX):
    ins+=["-i",fp(k)+".mp3"];idx=n+j
    fl.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,adelay={int(t*1000)}:all=1[f{j}]")
fl.append("".join(f"[f{j}]" for j in range(len(FX)))+f"amix=inputs={len(FX)}:normalize=0,apad=whole_dur={D}[fx]")
mi=n+len(FX);ins+=["-i","v2/musique.mp3"]
fl.append(f"[{mi}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D},volume=-9dB,afade=t=in:d=0.3,afade=t=out:st=30.6:d=1.1[mus0]")
fl.append("[mus0][voSC]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=350[mus]")
fl.append(f"[voA][fx][mus]amix=inputs=3:normalize=0,atrim=0:{D}[out]")
cmd=["ffmpeg","-v","error","-y"]+ins+["-filter_complex",";".join(fl),"-map","[out]","-ar","48000","v3/mix_brut.wav"]
subprocess.run(cmd,check=True)
# normalisation deux passes vers -14 LUFS
o=subprocess.run(["ffmpeg","-hide_banner","-i","v3/mix_brut.wav","-af","loudnorm=I=-14:TP=-1:LRA=11:print_format=json","-f","null","-"],capture_output=True,text=True).stderr
m=json.loads(o[o.rindex("{"):])
af=f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg","-v","error","-y","-i","v3/mix_brut.wav","-af",af,"-ar","48000","v3/mix_final.wav"],check=True)
# voix seule
subprocess.run(["ffmpeg","-v","error","-y"]+sum([["-i",f] for f,_ in VO],[])+["-filter_complex","".join(f"[{i}:a]adelay={int(t*1000)}:all=1[a{i}];" for i,(f,t) in enumerate(VO))+"".join(f"[a{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur={D},atrim=0:{D}[o]","-map","[o]","v3/voix_off.wav"],check=True)
print(subprocess.run(["ffmpeg","-hide_banner","-i","v3/mix_final.wav","-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr.splitlines()[-12:])

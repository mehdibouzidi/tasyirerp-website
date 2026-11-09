import subprocess,json
VO=[("vo/v2_01.wav",0.2),("vo/v2_02.wav",3.35),("vo/v2_03.wav",5.55),("vo/v2_04.wav",9.0),("vo/v2_05.wav",12.85),("vo/v2_06.wav",15.8),("vo/v2_07.wav",23.65),("vo/v2_08.wav",28.6)]
D=32.7
def fp(k): return k if k.startswith("v2/") else "sfx/"+k
FX=[("v2/slam",0.3,-8),("v2/slam",0.88,-5),("v2/build",1.0,-14),("pop",1.62,-10),("v2/slam",2.12,-9),("v2/suck",2.45,-8),
("v2/bars",3.05,-8),("impact",3.28,-3),("v2/shine",4.0,-10),
("whoosh",5.4,-12)]+[("pop",5.6+i*0.08,-17) for i in range(6)]+[("v2/slam",6.85,-10),("v2/slam",7.9,-9),
("whoosh",8.8,-10)]+[("v2/flip",x,-8) for x in (9.0,9.55,10.05,10.5,10.95)]+[("stamp",11.3,-5),
("swipe",12.7,-10)]+[("v2/drop",12.95+i*0.17,8) for i in range(6)]+[("glitch",14.1,-12),("whoosh",14.3,-9),("impact",14.3,-14),
("pop",15.7,-10),("tap",16.1,-6),("v2/cascade",16.25,3),("v2/slam",16.72,-8),("whoosh",17.7,-11),("impact",18.28,-4),("v2/slam",19.36,-7),("v2/slam",20.12,-7),("stamp",22.15,-5),
("whoosh",23.55,-10),("whoosh",24.8,-10),("whoosh",25.43,-10),("swipe",26.45,-10),("v2/slam",26.95,-7),
("impact",28.2,-4),("v2/bars",28.3,-9),("pop",28.75,-10),("v2/shine",29.0,-11),("tap",29.6,-6),("pop",29.62,-12),("impact",31.2,-3)]
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
fl.append(f"[{mi}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D},volume=-9dB,afade=t=in:d=0.3,afade=t=out:st=31.6:d=1.1[mus0]")
fl.append("[mus0][voSC]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=350[mus]")
fl.append(f"[voA][fx][mus]amix=inputs=3:normalize=0,atrim=0:{D}[out]")
cmd=["ffmpeg","-v","error","-y"]+ins+["-filter_complex",";".join(fl),"-map","[out]","-ar","48000","v2/mix_brut.wav"]
subprocess.run(cmd,check=True)
# normalisation deux passes vers -14 LUFS
o=subprocess.run(["ffmpeg","-hide_banner","-i","v2/mix_brut.wav","-af","loudnorm=I=-14:TP=-1:LRA=11:print_format=json","-f","null","-"],capture_output=True,text=True).stderr
m=json.loads(o[o.rindex("{"):])
af=f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg","-v","error","-y","-i","v2/mix_brut.wav","-af",af,"-ar","48000","v2/mix_final.wav"],check=True)
# voix seule
subprocess.run(["ffmpeg","-v","error","-y"]+sum([["-i",f] for f,_ in VO],[])+["-filter_complex","".join(f"[{i}:a]adelay={int(t*1000)}:all=1[a{i}];" for i,(f,t) in enumerate(VO))+"".join(f"[a{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur={D},atrim=0:{D}[o]","-map","[o]","v2/voix_off.wav"],check=True)
print(subprocess.run(["ffmpeg","-hide_banner","-i","v2/mix_final.wav","-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr.splitlines()[-12:])

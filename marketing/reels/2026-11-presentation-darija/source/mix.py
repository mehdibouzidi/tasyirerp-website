import subprocess,json
VO=[("vo/p01.wav",0.15),("vo/p02.wav",3.17),("vo/p03.wav",8.11),("vo/p04.wav",12.62),("vo/p05.wav",16.12),("vo/p06.wav",20.47),("vo/p07.wav",26.31),("vo/p08.wav",28.36)]
FX=[("glitch",0.05,-10),("whoosh",0.85,-12),("glitch",1.6,-16),("swipe",2.45,-12),("glitch",2.55,-12),("whoosh",2.85,-10),("impact",3.08,-4),
("pop",4.5,-12)]+[("pop",4.7+i*0.22,-17) for i in range(6)]+[("swipe",6.4,-14),("pop",6.75,-11),("riser",6.5,-15),("whoosh",7.85,-10),
("tap",8.55,-8),("pop",8.75,-15),("pop",9.0,-15),("pop",9.25,-15),("pop",9.75,-15),("pop",10.4,-15),("stamp",11.15,-6),("whoosh",12.35,-11),
("pop",13.1,-15),("pop",13.6,-15),("pop",14.4,-15),("tap",14.85,-8),("stamp",15.05,-6),("whoosh",15.85,-11),
("swipe",16.4,-13),("swipe",17.4,-13),("glitch",18.6,-12),("pop",19.2,-11),("whoosh",20.2,-11),
("impact",20.45,-12),("swipe",21.9,-14),("swipe",23.2,-14),("swipe",24.6,-14),("riser",24.75,-15),("whoosh",26.05,-10),
("impact",26.28,-3),("swipe",26.9,-15),("pop",28.35,-11),("tap",29.25,-8),("pop",29.6,-13),("impact",30.8,-3)]
ins=[];fl=[]
for i,(f,t) in enumerate(VO):
    ins+=["-i",f];fl.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int(t*1000)}:all=1[v{i}]")
n=len(VO);fl.append("".join(f"[v{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur=32.1[vo]")
fl.append("[vo]asplit=2[voA][voSC]")
for j,(k,t,db) in enumerate(FX):
    ins+=["-i",f"sfx/{k}.mp3"];idx=n+j
    fl.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,adelay={int(t*1000)}:all=1[f{j}]")
fl.append("".join(f"[f{j}]" for j in range(len(FX)))+f"amix=inputs={len(FX)}:normalize=0,apad=whole_dur=32.1[fx]")
mi=n+len(FX);ins+=["-i","music/bed.mp3"]
fl.append(f"[{mi}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:32.1,volume=-9dB,afade=t=in:d=0.3,afade=t=out:st=31.0:d=1.1[mus0]")
fl.append("[mus0][voSC]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=350[mus]")
fl.append("[voA][fx][mus]amix=inputs=3:normalize=0,atrim=0:32.1[out]")
cmd=["ffmpeg","-v","error","-y"]+ins+["-filter_complex",";".join(fl),"-map","[out]","-ar","48000","mix_brut.wav"]
subprocess.run(cmd,check=True)
# normalisation deux passes vers -14 LUFS
o=subprocess.run(["ffmpeg","-hide_banner","-i","mix_brut.wav","-af","loudnorm=I=-14:TP=-1:LRA=11:print_format=json","-f","null","-"],capture_output=True,text=True).stderr
m=json.loads(o[o.rindex("{"):])
af=f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg","-v","error","-y","-i","mix_brut.wav","-af",af,"-ar","48000","mix_final.wav"],check=True)
# voix seule
subprocess.run(["ffmpeg","-v","error","-y"]+sum([["-i",f] for f,_ in VO],[])+["-filter_complex","".join(f"[{i}:a]adelay={int(t*1000)}:all=1[a{i}];" for i,(f,t) in enumerate(VO))+"".join(f"[a{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,apad=whole_dur=32.1,atrim=0:32.1[o]","-map","[o]","voix_off.wav"],check=True)
print(subprocess.run(["ffmpeg","-hide_banner","-i","mix_final.wav","-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr.splitlines()[-12:])

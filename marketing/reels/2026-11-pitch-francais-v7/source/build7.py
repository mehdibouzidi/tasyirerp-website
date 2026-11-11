import re
svg=open('tasyir-erp-negatif.svg').read()
svg=re.sub(r'<title>.*?</title>','',svg).replace('<svg ','<svg width="100%" style="display:block;overflow:visible" ',1)
def cp(suf): return re.sub(r'url\(#(\w+)\)',lambda m:f'url(#{m.group(1)}{suf})',re.sub(r'id="(\w+)"',lambda m:f'id="{m.group(1)}{suf}"',svg))
s=open('reel7.src.html').read()
for k in ['C','H']: s=s.replace('{{LOGO_%s}}'%k,cp('_'+k))
open('reel7.html','w').write(s)

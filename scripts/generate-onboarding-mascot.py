"""Derive a separate onboarding animation from our original capybara vectors."""
import copy, json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
data = json.loads((root/'public/animations/promoflow-capybara-character.json').read_text())
def prop(v): return {"a":0,"k":v}
def motion(points):
 frames=[]
 for index,(time,value) in enumerate(points):
  frame={"t":time,"s":[value]}
  if index+1<len(points): frame.update({"e":[points[index+1][1]],"o":{"x":[.3],"y":[0]},"i":{"x":[.7],"y":[1]}})
  frames.append(frame)
 return {"a":1,"k":frames}
for layer in data['layers']:
 if layer['nm']=='Receiving paw': layer['ks']['r']=motion([(0,145),(20,160),(40,135),(60,160),(80,145),(240,145)])
 if layer['nm']=='Sending paw': layer['ks']['r']=prop(-12)
 if layer['nm']=='Throw swoosh': layer['ks']['o']=prop(0)
parent=next(layer['ind'] for layer in data['layers'] if layer['ty']==3)
def color(hex): return [int(hex[i:i+2],16)/255 for i in (0,2,4)]+[1]
def rectangle(x,y,w,h,r,hex): return {"ty":"gr","it":[{"ty":"rc","p":prop([x,y]),"s":prop([w,h]),"r":prop(r),"d":1},{"ty":"fl","c":prop(color(hex)),"o":prop(100),"r":1},{"ty":"tr","p":prop([0,0]),"a":prop([0,0]),"s":prop([100,100]),"r":prop(0),"o":prop(100)}]}
shapes=[rectangle(393,326,65,86,9,'faf9f0'), rectangle(393,286,28,10,3,'40622e')]
for row,y in enumerate([306,324,342]):
 shapes += [rectangle(375,y,9,9,2,'8ebf64'),rectangle(400,y,26,4,2,'93704f')]
layer={"ddd":0,"ind":max(layer['ind'] for layer in data['layers'])+1,"ty":4,"nm":"First steps checklist","parent":parent,"sr":1,"ks":{"o":prop(100),"r":prop(0),"p":prop([0,0,0]),"a":prop([0,0,0]),"s":prop([100,100,100])},"ao":0,"shapes":shapes,"ip":0,"op":240,"st":0,"bm":0}
data['layers'].insert(0,layer)
data['nm']='PromoFlow — Capivara guia de primeiros passos'
data['markers']=[{"tm":0,"cm":"Boas-vindas","dr":80},{"tm":80,"cm":"Conferir primeiros passos","dr":160}]
(root/'public/animations/promoflow-capybara-onboarding.json').write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
print('Onboarding mascot generated')

"""Generate the original PromoFlow capybara Lottie. No external artwork required."""
import json
from pathlib import Path
FPS, END = 30, 240
colors = {"fur":"#ba9971", "light":"#dac19a", "shade":"#93704f", "ink":"#233b2b", "lime":"#d7fa72", "green":"#40622e", "paper":"#faf9f0", "line":"#48664a"}
def c(value):
    value=colors.get(value,value).lstrip('#')
    return [int(value[i:i+2],16)/255 for i in (0,2,4)]+[1]
def prop(v): return {"a":0,"k":v}
def animated(points):
    keys=[]
    for n,(t,v) in enumerate(points):
        key={"t":t,"s":v}
        if n<len(points)-1:
            key.update({"e":points[n+1][1],"o":{"x":[.3],"y":[0]},"i":{"x":[.7],"y":[1]}})
        keys.append(key)
    return {"a":1,"k":keys}
def fill(color): return {"ty":"fl","c":prop(c(color)),"o":prop(100),"r":1}
def ellipse(x,y,w,h,color): return [{"ty":"el","p":prop([x,y]),"s":prop([w,h]),"d":1},fill(color)]
def rect(x,y,w,h,r,color): return [{"ty":"rc","p":prop([x,y]),"s":prop([w,h]),"r":prop(r),"d":1},fill(color)]
def path(points,color,width=3,closed=False):
    count=len(points)
    return [{"ty":"sh","ks":prop({"i":[[0,0]]*count,"o":[[0,0]]*count,"v":points,"c":closed})},{"ty":"st","c":prop(c(color)),"o":prop(100),"w":prop(width),"lc":2,"lj":2}]
def group(shapes): return {"ty":"gr","it":shapes+[{"ty":"tr","p":prop([0,0]),"a":prop([0,0]),"s":prop([100,100]),"r":prop(0),"o":prop(100),"sk":prop(0),"sa":prop(0)}]}
layers=[]
def layer(name,shapes,parent=None,position=None,rotation=None,opacity=None,anchor=None):
    # Isolate each geometry/paint pair so later fills do not recolor earlier paths.
    painted, current = [], []
    for shape in shapes:
        current.append(shape)
        if shape['ty'] in ('fl', 'st'):
            painted.append(group(current))
            current = []
    if current: painted.extend(current)
    shapes = painted
    obj={"ddd":0,"ind":len(layers)+1,"ty":4,"nm":name,"sr":1,"ks":{"o":opacity or prop(100),"r":rotation or prop(0),"p":position or prop([0,0,0]),"a":prop(anchor or [0,0,0]),"s":prop([100,100,100])},"ao":0,"shapes":[group(shapes)],"ip":0,"op":END,"st":0,"bm":0}
    if parent: obj['parent']=parent
    layers.append(obj)
    return obj['ind']
# Background orbit and work surface.
layer('Soft floor shadow',ellipse(315,407,215,20,'#0b1d16'))
for x,y in [(535,145),(555,250),(530,355)]:
    layer('Group destination',rect(x,y,104,66,14,'#254333'))
    layer('Group members',ellipse(x-10,y-8,12,12,'lime')+ellipse(x+11,y-6,10,10,'light')+rect(x-10,y+6,22,12,6,'lime')+rect(x+11,y+7,17,10,5,'light'))
# Source offer waiting on the left.
layer('Source offer',rect(89,247,102,126,12,'paper'))
layer('Source thumbnail',rect(89,224,80,57,8,'#e0e7cf')+ellipse(89,222,31,30,'green'))
layer('Source text',rect(80,268,58,5,2,'ink')+rect(74,280,45,4,2,'shade')+rect(74,295,46,10,3,'green'))
# The body null makes every character part breathe in sync.
root=len(layers)+1
layers.append({"ddd":0,"ind":root,"ty":3,"nm":"Capybara breathing","sr":1,"ks":{"o":prop(100),"r":prop(0),"p":animated([(0,[0,0,0]),(60,[0,-4,0]),(120,[0,0,0]),(180,[0,-4,0]),(240,[0,0,0])]),"a":prop([0,0,0]),"s":prop([100,100,100])},"ip":0,"op":END,"st":0})
layer('Left foot',rect(274,394,53,30,14,'shade'),root)
layer('Right foot',rect(349,394,53,30,14,'shade'),root)
layer('Body',ellipse(310,331,149,151,'fur'),root)
layer('Belly',ellipse(316,343,111,112,'light'),root)
layer('PromoFlow waistcoat',rect(310,318,148,66,23,'green'),root)
layer('Waistcoat badge',ellipse(321,316,25,25,'lime')+path([[315,316],[320,322],[328,311]],'ink',3),root)
# Back ears and large blunt head, recognisable capybara proportions.
layer('Ears',ellipse(255,190,36,43,'fur')+ellipse(352,183,33,40,'fur'),root)
layer('Inner ears',ellipse(255,191,18,24,'shade')+ellipse(352,184,16,23,'shade'),root)
layer('Head',rect(306,241,171,117,43,'fur'),root)
layer('Wide muzzle',rect(355,258,107,79,31,'light'),root)
layer('Nose',rect(390,245,30,22,8,'ink'),root)
layer('Nose glint',ellipse(386,240,8,4,'#617753'),root)
layer('Cheek',ellipse(304,269,24,12,'#c29c76'),root)
# A curious look becomes a cheeky approving wink during the inspection.
open_eye = animated([(0,[100]),(70,[100]),(76,[0]),(94,[0]),(100,[100]),(183,[100]),(187,[0]),(191,[100]),(240,[100])])
closed_eye = animated([(0,[0]),(70,[0]),(76,[100]),(94,[100]),(100,[0]),(240,[0])])
layer('Blinking eye',ellipse(313,232,10,12,'ink'),root,opacity=open_eye,position=animated([(0,[-2,0,0]),(45,[-3,1,0]),(65,[1,0,0]),(110,[2,-1,0]),(155,[0,0,0]),(240,[-2,0,0])]))
layer('Eye highlight',ellipse(315,229,3,3,'paper'),root,opacity=open_eye)
wink = path([[305,233],[313,228],[321,233]],'ink',2.8)
wink[0]['ks']['k']['o'] = [[2,-4],[3,0],[0,0]]
wink[0]['ks']['k']['i'] = [[0,0],[-3,0],[-2,-4]]
layer('Happy approving wink',wink,root,opacity=closed_eye)
layer('Curious raised eyebrow',path([[304,218],[313,214],[322,217]],'shade',2.5),root,position=animated([(0,[0,0,0]),(45,[0,-3,0]),(65,[0,-5,0]),(110,[0,0,0]),(240,[0,0,0])]))
smile = path([[359,275],[369,281],[382,274]],'shade',2.8)
smile[0]['ks']['k']['o'] = [[2,3],[4,0],[0,0]]
smile[0]['ks']['k']['i'] = [[0,0],[-4,0],[-2,4]]
layer('Confident crooked smile',smile,root)
layer('Pleased rosy cheek',ellipse(307,263,21,10,'#c78963'),root,opacity=animated([(0,[20]),(65,[20]),(78,[65]),(105,[65]),(140,[20]),(240,[20])]))
layer('Whiskers',path([[372,264],[376,265]],'shade',2)+path([[370,269],[374,270]],'shade',2),root)
layer('Cap brim',rect(286,204,103,12,5,'lime'),root)
layer('Green cap',rect(276,190,78,33,14,'green'),root)
layer('Cap symbol',path([[270,187],[276,192],[284,182]],'lime',3),root)
# One 4.8-second playback cycle: reach left, inspect, wind up, flick right, settle.
layer('Receiving paw',rect(253,319,40,68,18,'fur'),root,position=prop([251,293,0]),anchor=[251,293,0],rotation=animated([(0,[-8]),(12,[-8]),(35,[78]),(48,[75]),(67,[-65]),(95,[-60]),(112,[-15]),(145,[-8]),(240,[-8])]))
throw = animated([(0,[8]),(48,[8]),(70,[60]),(98,[65]),(118,[-155]),(135,[-165]),(147,[-65]),(155,[-35]),(171,[-58]),(197,[8]),(240,[8])])
layer('Sending paw',rect(373,315,37,70,17,'fur'),root,position=prop([368,292,0]),anchor=[368,292,0],rotation=throw)
layer('Throw swoosh',path([[413,245],[425,251],[429,264]],'green',2)+path([[419,237],[435,249],[439,265]],'green',1.5),root,opacity=animated([(0,[0]),(135,[0]),(145,[80]),(160,[60]),(174,[0]),(240,[0])]))
# Captured card moves towards the capybara, then fades once checked.
layer('Offer being reviewed',rect(0,0,55,68,8,'paper')+rect(0,-10,38,25,4,'green')+rect(-4,16,30,4,2,'shade'),position=animated([(0,[110,250,0]),(36,[110,250,0]),(65,[253,276,0]),(95,[263,270,0]),(115,[300,270,0]),(240,[300,270,0])]),rotation=animated([(0,[-12]),(65,[8]),(95,[-4]),(240,[-4])]),opacity=animated([(0,[0]),(12,[100]),(95,[100]),(110,[0]),(240,[0])]))
# Three small offer cards fly along curved paths to group placeholders.
for n,(x,y,start) in enumerate([(535,145,105),(555,250,155),(530,355,200)]):
    layer('Chosen offer to group '+str(n+1),rect(0,0,40,48,6,'lime')+path([[-9,0],[-2,7],[11,-8]],'green',3),position=animated([(0,[370,290,0]),(start,[370,290,0]),(start+12,[425,y-40,0]),(start+25,[x,y,0]),(240,[x,y,0])]),rotation=animated([(0,[-15]),(start,[-15]),(start+12,[20]),(start+25,[0]),(240,[0])]),opacity=animated([(0,[0]),(start,[0]),(start+2,[100]),(start+24,[100]),(start+32,[0]),(240,[0])]))
    layer('Group confirmation '+str(n+1),ellipse(x+42,y-27,10,10,'lime'),opacity=animated([(0,[0]),(start+22,[0]),(start+28,[100]),(232,[100]),(240,[0])]))
result={"v":"5.12.2","fr":FPS,"ip":0,"op":END,"w":640,"h":460,"nm":"PromoFlow — Capivara curadora de ofertas","ddd":0,"assets":[],"layers":list(reversed(layers)),"markers":[{"tm":0,"cm":"Capturar","dr":65},{"tm":65,"cm":"Conferir","dr":40},{"tm":105,"cm":"Compartilhar — conceito futuro","dr":135}]}
output=Path(__file__).resolve().parents[1]/'public/animations/promoflow-capybara.json'
output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'Created {output.name}: {len(layers)} vector layers, 8s loop')

# Character-only composition for the home scene; keep the full scene export above.
import copy
character = copy.deepcopy(result)
character['w'], character['h'] = 280, 300
character['layers'] = [item for item in character['layers'] if item.get('parent') == root or item['ind'] == root or item['nm'] == 'Soft floor shadow']
for item in character['layers']:
    if 'parent' in item: continue
    position = item['ks']['p']
    if position['a']:
        for frame in position['k']:
            for field in ('s', 'e'):
                if field in frame:
                    # Adjacent keyframes share endpoint lists; replace instead of mutating twice.
                    x, y, z = frame[field]
                    frame[field] = [x - 180, y - 130, z]
    else:
        position['k'][0] -= 180
        position['k'][1] -= 130
output.with_name('promoflow-capybara-character.json').write_text(json.dumps(character,separators=(',',':')),encoding='utf-8')

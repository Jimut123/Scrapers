import json
from jimner import jimner
import os

with open('data.json') as f:
    data = json.load(f)

a = jimner()

#print(data)
fonts = []
for item in data:
    fonts.append(item)
#print(fonts)
EXCEPT = []
for item in fonts:
    filename = item+".json"
    try:
        with open(filename) as f:
            font_json = json.load(f)
        LENGHT = []
        for ite_ in font_json:
            LENGHT.append(len(font_json[ite_]))
        ML = max(LENGHT)
        print(ML)
        for ite_ in font_json:
            if len(font_json[ite_])==ML:
                print(font_json[ite_])
                font_json[ite_] = ""
                #input("pass")
        #print(json.dumps(font_json,indent=4,sort_keys=True))
        os.remove(filename)
        with open(filename, 'w') as outfile:
            json.dump(font_json, outfile,indent=4,sort_keys=True)
    except Exception as e:
        EXCEPT.append(filename)

#print(EXCEPT)
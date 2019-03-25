import json

with open('3-D.json') as f:
    a = json.load(f)
#print(a)

new_dict = {}
for item in a:
    get_c = []
    c=0
    slash_n = 0
    if a[item]!="":
        for char_ in a[item]:
            #print(char_)
            c = c + 1
            if char_=='\n':
                slash_n = slash_n+1
                get_c.append(c)
                #print(c)
                c=0
        max_c = max(get_c)  
        print("max x = ",max_c)
        print("Slash n = ",slash_n)
        get_life = a[item].split('\n')
        print(get_life)
        final_life = ""
        for it in get_life:
            print(it.rstrip())
            print(len(it.rstrip()))
            if len(it.rstrip())<max_c:
                final_it = it.rstrip()+' '*(max_c-len(it.rstrip()))+"\n"
                print(final_it)
                final_life = final_life + final_it
        print("----",len(final_life))
        new_dict[item]=final_life
    new_dict[' ']=(' '*3+'\n')*slash_n
print(json.dumps(new_dict,indent=4,sort_keys=True))
json_file_name = "test_m1.json"
with open(json_file_name, 'w') as outfile:
        json.dump(new_dict, outfile,indent=4,sort_keys=True)

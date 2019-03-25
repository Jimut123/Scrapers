def change_var(i):
    global c
    if i%50==0:
        c=1

c = 0
i = 0
while c==0:
    print(i)
    i=i+1
    change_var(i)




                                                                                                                                                                                                                                                                                                                                                     

dice_art = ["""
 -------
|       |
|   N   |
|       |
 ------- ""","""
 -------
|       |
|   1   |
|       |
 ------- """] 
"""
player = [0, 1]
lines = [dice_art[i].strip('\n').splitlines() for i in player]
for l in zip(*lines):
    print(*l, sep='')

"""
art_split = [art.split("\n") for art in dice_art]
zipped = zip(*art_split)

for elems in zipped:
    print("".join(elems))
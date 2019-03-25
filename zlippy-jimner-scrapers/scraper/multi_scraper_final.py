# to load the json-data of the whole server content! lol

import json
from multiprocessing.pool import ThreadPool
from pprint import pprint
from selenium import webdriver
from bs4 import BeautifulSoup
from pathlib import Path
from tqdm import tqdm
import time
import json
import datetime

# getting the fuckin JSON scrapped data

with open('data.json') as f:
    data = json.load(f)

#pprint(data)

# to get the total font present from scraped json
total_font_present = []

get_these_text = ['1','2','3','4','5','6','7','8','9','0',
                  '~','`','!','@','#','$','%','^','&','*','(',')','-','_','+','=','{','}','[',']','\\','|',':',';','"','\'','<',',','>','.','?','/',
                  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
]

print(get_these_text)
for item in data:
    #print(item)
    total_font_present.append(item)

#print(total_font_present)

#url :=> http://patorjk.com/software/taag/#p=display&v=3&f=Old%20Banner&t=lol

def req_firefox(url_):
    global get_values, time_before_sleep, CONTINUE_VAR
    
    item_ = str(url_[-1:])
    #if item_ == 'z':
    #    CONTINUE_VAR = 1
    print(item_)
    try:
        profile = webdriver.FirefoxProfile()
        profile.set_preference("general.useragent.override", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0")
        driver = webdriver.Firefox(profile)

        print(url_)
        print("ETA : ",(datetime.datetime.now()-time_before_sleep))
        #driver.maximize_window()
        driver.minimize_window()
        driver.get(url_)

        text=driver.find_element_by_xpath("//div[@id='outputFigDisplay']/pre[@id='taag_output_text']")
        get_values[item_] = text.text
        print(text.text)
        #print("JSON:=>",json.dumps(get_values,sort_keys=True,indent=3))
        driver.close()
    except:
        get_values[item_] = ""
        driver.close()
    if item_ == 'z':
        CONTINUE_VAR = 1




for font_name in total_font_present:
    global get_values, CONTINUE_VAR
    CONTINUE_VAR = 0
    get_values = {}
    file_check = str(font_name)+".json"
    if Path(file_check).exists():
        print("Skipping ... file :=> ",file_check)
        continue
    URL_ = []

    for item in tqdm(get_these_text):
        url_ = "http://patorjk.com/software/taag/#p=display&h=0&v=0&f={}&t={}".format(font_name,item)
        URL_.append(url_)

    ThreadPool(6).imap_unordered(req_firefox, URL_)
    global time_before_sleep
    time_before_sleep = datetime.datetime.now()
    # to sleep the current process until the CONTINUE_VAR becomes 1
    while CONTINUE_VAR == 0:
        time.sleep(1)     # sleep for 25 mins:=> for net with 20-30kbps speed this is fine!
        print("SLEEPING FOR : ",(datetime.datetime.now()-time_before_sleep))
    print("WAKING UP...")
    print("FINAL JSON FILE :=> ",json.dumps(get_values,sort_keys=True,indent=4))
    json_file_name = str(font_name)+".json"
    with open(json_file_name, 'w') as outfile:
        json.dump(get_values, outfile,indent=4,sort_keys=True)
    

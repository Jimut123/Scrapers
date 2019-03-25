# remove the test files and start from scratch!

import json
from pprint import pprint
from selenium import webdriver
from multiprocessing.pool import ThreadPool
from bs4 import BeautifulSoup
from pathlib import Path
from tqdm import tqdm
import datetime
import time
import json



def req_firefox(url_):
    global current_data, time_before_sleep, CONTINUE_VAR, last_element
    
    item_ = str(url_[-1:])

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
        current_data[item_] = text.text
        print(text.text)
        #print("JSON:=>",json.dumps(get_values,sort_keys=True,indent=3))
        driver.close()
    except:
        current_data[item_] = ""
        driver.close()
    if item_ == last_element:
        CONTINUE_VAR = 1


with open('data.json') as f:
    data = json.load(f)

total_font_present = []
for item in data:
    #print(item)
    total_font_present.append(item)

for font_name in total_font_present:
    # font_name have the file's name excluding extension
    file_check = str(font_name)+".json"
    need_keys = []
    check_file = "purified_"+str(font_name)+".json"
    if Path(check_file).exists():
        print("Skipping ...",check_file)
        continue
    
    if Path(file_check).exists():
        print("Purifing file ... :=> ",file_check)
        global current_data, time_before_sleep, last_element
        with open(file_check) as f:
            current_data = json.load(f)
        print(current_data)
        for key in current_data:
            if current_data[key]=="":
                need_keys.append(key)
            #print(key)
        global CONTINUE_VAR
        CONTINUE_VAR = 0
        last_element = str(need_keys[len(need_keys)-1])
        print("\n\n\n",need_keys)
        URL_ = []
        # purifiying the files...
        for item in need_keys:
            url_ = "http://patorjk.com/software/taag/#p=display&h=0&v=0&f={}&t={}".format(font_name,item)
            URL_.append(url_)
        
        ThreadPool(6).imap_unordered(req_firefox, URL_)

        time_before_sleep = datetime.datetime.now()
        while CONTINUE_VAR == 0:
            time.sleep(1)
            print("SLEEPING FOR : ",(datetime.datetime.now()-time_before_sleep))
        
        print("FINAL JSON FILE :=> ",current_data)
        json_file_name = "purified_"+str(font_name)+".json"
        with open(json_file_name, 'w') as outfile:
            json.dump(current_data, outfile,indent=4,sort_keys=True)

        

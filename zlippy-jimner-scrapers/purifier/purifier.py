# remove the test files and start from scratch!

import json
from pprint import pprint
from selenium import webdriver
from bs4 import BeautifulSoup
from pathlib import Path
from tqdm import tqdm
import json

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
        with open(file_check) as f:
            current_data = json.load(f)
        print(current_data)
        for key in current_data:
            if current_data[key]=="":
                need_keys.append(key)
            #print(key)
        print("\n\n\n",need_keys)
        
        # purifiying the files...
        for item in need_keys:
            try:
                profile = webdriver.FirefoxProfile()
                profile.set_preference("general.useragent.override", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0")
                driver = webdriver.Firefox(profile)

                url_ = "http://patorjk.com/software/taag/#p=display&h=0&v=0&f={}&t={}".format(font_name,item)
                print(url_)

                #driver.maximize_window()
                driver.minimize_window()
                driver.get(url_)

                text=driver.find_element_by_xpath("//div[@id='outputFigDisplay']/pre[@id='taag_output_text']")
                current_data[item] = text.text
                print(text.text)
                driver.close()
            except:
                current_data[item] = ""
                driver.close()
        print("FINAL JSON FILE :=> ",current_data)
        json_file_name = "purified_"+str(font_name)+".json"
        with open(json_file_name, 'w') as outfile:
            json.dump(current_data, outfile,indent=4,sort_keys=True)

        

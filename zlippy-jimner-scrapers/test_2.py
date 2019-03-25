from selenium import webdriver
from bs4 import BeautifulSoup
import json


profile = webdriver.FirefoxProfile()
profile.set_preference("general.useragent.override", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0")
driver = webdriver.Firefox(profile)
url= "http://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20"
driver.maximize_window()
driver.get(url)

text=driver.find_element_by_xpath("//div[@id='outputFigDisplay']/pre[@id='taag_output_text']")
print(text.text)
import requests
from bs4 import BeautifulSoup
import csv
import re

# Open CSV file for writing
with open('scraped_psu.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'type', 'wattage'])

    # Request the PSU page
    url = "https://www.pc-kombo.com/us/components/psus"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find PSU item containers
    psus = soup.find_all('div', class_='subtitle')

    for psu in psus:
        try:
            # Name
            name_tag = psu.find_previous('h5', class_='name')
            name = name_tag.text.strip() if name_tag else ''

            # Type
            type_span = psu.find('span', class_='size')
            psu_type = type_span.text.strip() if type_span else ''

            # Wattage
            watt_span = psu.find('span', class_='watt')
            wattage = watt_span.text.strip().replace('W', '').strip() if watt_span else ''

            writer.writerow([name, psu_type, wattage])
            print(f"{name} - {psu_type} - {wattage}W")

        except Exception as e:
            print("Error parsing PSU:", e)

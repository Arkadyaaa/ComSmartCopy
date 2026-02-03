from bs4 import BeautifulSoup
import requests
import csv
import re

# Open CSV file
with open('scraped_hdd.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'capacity', 'type', 'unit', 'form_factor'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/hdds"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all HDD containers
    hdds = soup.find_all('div', class_='subtitle')

    for hdd in hdds:
        try:
            name = hdd.find_previous('h5', class_='name').text.strip()

            # Extract numeric capacity from <span class="size">
            size_span = hdd.find('span', class_='size')
            capacity = ''
            if size_span:
                match = re.search(r'(\d+)', size_span.text)
                if match:
                    capacity = match.group(1)

            # Fixed values
            type_ = 'HDD'
            unit = 'TB'
            form_factor = '3.5'

            writer.writerow([name, capacity, type_, unit, form_factor])
            print(f"{name} - {capacity} - {type_} - {unit} - {form_factor}")

        except Exception as e:
            print("Error parsing item:", e)

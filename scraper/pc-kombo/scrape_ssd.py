from bs4 import BeautifulSoup
import requests
import csv
import re

# Open CSV file
with open('scraped_ssd.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'capacity', 'type', 'unit', 'form_factor'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/ssds"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all SSD containers
    ssds = soup.find_all('div', class_='subtitle')

    for ssd in ssds:
        try:
            name = ssd.find_previous('h5', class_='name').text.strip()

            # Extract raw size from <span class="size">
            size_span = ssd.find('span', class_='size')
            raw_capacity = 0
            unit = 'GB'

            if size_span:
                match = re.search(r'(\d+)', size_span.text.replace(',', ''))
                if match:
                    raw_capacity = int(match.group(1))
                    if raw_capacity >= 1000:
                        raw_capacity = raw_capacity // 1000  # Use integer division
                        unit = 'TB'

            # Determine form factor
            form_factor = '2.5'  # Default
            full_text = ssd.text.lower()
            if 'nvm' in full_text or 'm.2' in full_text:
                form_factor = 'm.2'

            type_ = 'SSD'

            writer.writerow([name, str(raw_capacity), type_, unit, form_factor])
            print(f"{name} - {raw_capacity} - {type_} - {unit} - {form_factor}")

        except Exception as e:
            print("Error parsing item:", e)

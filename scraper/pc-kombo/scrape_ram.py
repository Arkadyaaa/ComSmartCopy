from bs4 import BeautifulSoup
import requests
import csv
import re

# Open CSV file
with open('scraped_ram.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'speed', 'size', 'stick'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/rams"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all RAM containers
    rams = soup.find_all('div', class_='subtitle')

    for ram in rams:
        try:
            name = ram.find_previous('h5', class_='name').text.strip()

            speed = ram.find('span', class_='type')
            speed = speed.text.strip() if speed else ''

            size = ram.find('span', class_='size')
            size = size.text.strip().replace('GB', '').strip() if size else ''

            # Find "Kit of #" text in any span
            stick = ''
            for span in ram.find_all('span'):
                if 'Kit of' in span.text:
                    match = re.search(r'Kit of (\d+)', span.text)
                    if match:
                        stick = match.group(1)
                        break

            writer.writerow([name, speed, size, stick])
            print(f"{name} - {speed} - {size} - {stick}")

        except Exception as e:
            print("Error parsing item:", e)

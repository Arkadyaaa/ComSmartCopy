from bs4 import BeautifulSoup
import requests
import csv
import re

# Open CSV file
with open('scraped_gpu.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'chipset', 'vram', 'tdp'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/gpus"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all GPU item containers
    gpus = soup.find_all('div', class_='subtitle')

    for gpu in gpus:
        try:
            name = gpu.find_previous('h5', class_='name').text.strip()
            chipset = gpu.find('span', class_='series')
            chipset = chipset.text.strip() if chipset else ''

            # VRAM (e.g., "8 GB GDDR6")
            vram_text = gpu.find('span', class_='vram')
            vram = vram_text.text.strip().split(' ')[0] if vram_text else ''

            # TDP (match any span containing digits + 'W')
            tdp = ''
            for span in gpu.find_all('span'):
                text = span.text.strip()
                if re.match(r'^\d+\s*W$', text):
                    tdp = text.replace('W', '').strip()
                    break

            writer.writerow([name, chipset, vram, tdp])
            print(f"{name} - {chipset} - {vram} - {tdp}")

        except Exception as e:
            print("Error parsing item:", e)

import requests
from bs4 import BeautifulSoup
import csv
import time

with open('scraped_case.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'type', 'dimensions', 'psu_type', 'bays'])

    url = "https://www.pc-kombo.com/us/components/cases"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    case_links = soup.find_all('a', href=True)

    for a_tag in case_links:
        name_tag = a_tag.find('h5', class_='name')
        if not name_tag:
            continue

        try:
            name = name_tag.text.strip()
            detail_url = a_tag['href'].strip().replace(" ", "%20")
            if not detail_url.startswith("http"):
                detail_url = "https://www.pc-kombo.com" + detail_url

            type_span = a_tag.find('span', class_='size')
            case_type = type_span.text.strip() if type_span else ''

            # Initialize
            dimensions = psu_type = ''
            drive_bays_total = 0

            detail_soup = BeautifulSoup(requests.get(detail_url).text, 'html.parser')
            spec_sections = detail_soup.select('section.card.column.col-3.col-md-12')

            # For dimensions and PSU (2nd section)
            if len(spec_sections) >= 2:
                section2 = spec_sections[1]
                card_body2 = section2.find('div', class_='card-body')
                if card_body2:
                    dl = card_body2.find('dl')
                    if dl:
                        specs = {
                            dt.text.strip().lower(): dd.text.strip()
                            for dt, dd in zip(dl.find_all('dt'), dl.find_all('dd'))
                        }

                        w = specs.get('width', '').strip()
                        h = specs.get('height', '').strip()
                        d = specs.get('depth', '').strip()
                        if w and h and d:
                            dimensions = f"{w} x {h} x {d}"
                        psu_type = specs.get('psu', '').strip() or specs.get('power supply', '').strip()

            # For drive bays (4th section)
            if len(spec_sections) >= 4:
                section4 = spec_sections[3]
                card_body4 = section4.find('div', class_='card-body')
                if card_body4:
                    dl = card_body4.find('dl')
                    if dl:
                        specs = {
                            dt.text.strip().lower(): dd.text.strip()
                            for dt, dd in zip(dl.find_all('dt'), dl.find_all('dd'))
                        }
                        for key in ['2.5"', '3.5"', '2.5"/3.5"']:
                            val = specs.get(key, '0').split()[0]
                            drive_bays_total += int(val) if val.isdigit() else 0

            writer.writerow([name, case_type, dimensions, psu_type, drive_bays_total])
            print(f"{name} | {dimensions} | PSU: {psu_type} | Bays: {drive_bays_total}")

            time.sleep(0.25)

        except Exception as e:
            print("Error parsing item:", e)

from bs4 import BeautifulSoup
import requests
import csv

# Open CSV file
with open('scraped_cpu.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'microarchitecture', 'core_clock', 'boost_clock', 'cores'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/cpus"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all CPU item containers
    cpus = soup.find_all('div', class_='subtitle')

    for cpu in cpus:
        try:
            name = cpu.find_previous('h5', class_='name').text.strip()
            socket = cpu.find('span', class_='socket').text.strip()

            # Remove "GHz" and trim whitespace
            clock = cpu.find(string=lambda s: "Clock" in s)
            clock = clock.strip().replace('Clock', '').replace('GHz', '').strip() if clock else ''

            turbo = cpu.find(string=lambda s: "Turbo" in s)
            turbo = turbo.strip().replace('Turbo', '').replace('GHz', '').strip() if turbo else ''

            cores = cpu.find('span', class_='cores')
            cores = cores.text.strip() if cores else ''

            writer.writerow([name, socket, clock, turbo, cores])
            print(f"{name} - {socket} - {clock} - {turbo} - {cores}")

        except Exception as e:
            print("Error parsing item:", e)

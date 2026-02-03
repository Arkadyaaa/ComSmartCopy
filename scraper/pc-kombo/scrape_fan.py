from bs4 import BeautifulSoup
import requests
import csv

# Open CSV file
with open('scraped_fan.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'supported_socket', 'type'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/cpucoolers"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all CPU cooler containers
    coolers = soup.find_all('div', class_='subtitle')

    for cooler in coolers:
        try:
            # Find the name
            name_tag = cooler.find_previous('h5', class_='name')
            name = name_tag.text.strip() if name_tag else 'N/A'

            # Find and clean the supported socket text
            socket_tag = cooler.find('span', class_='sockets')
            supported_socket = socket_tag.text.strip().replace("For socket ", "") if socket_tag else 'N/A'

            # Improved AIO detection: check if any element with class 'radiator' exists inside 'cooler'
            radiator = cooler.select_one('.radiator')
            cooler_type = 'AIO' if radiator else 'Air'

            writer.writerow([name, supported_socket, cooler_type])
            print(f"{name} - {supported_socket} - {cooler_type}")

        except Exception as e:
            print("Error parsing item:", e)

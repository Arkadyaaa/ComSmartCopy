from bs4 import BeautifulSoup
import requests
import csv

# Open CSV file
with open('scraped_motherboard.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'form_factor', 'socket', 'ram_slots'])

    # Request the page
    url = "https://www.pc-kombo.com/us/components/motherboards"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find all motherboard containers
    boards = soup.find_all('div', class_='subtitle')

    for board in boards:
        try:
            name = board.find_previous('h5', class_='name').text.strip()

            form_factor = board.find('span', class_='size')
            form_factor = form_factor.text.strip() if form_factor else ''

            socket = board.find('span', class_='socket')
            socket = socket.text.strip() if socket else ''

            # Find ram_slots span inside d-hide span, within current board
            ram_slots = ''
            d_hide = board.find('span', class_='d-hide')
            if d_hide:
                ram_span = d_hide.find('span', class_='ramslots')
                ram_slots = ram_span.text.strip() if ram_span else ''

            writer.writerow([name, form_factor, socket, ram_slots])
            print(f"{name} - {form_factor} - {socket} - {ram_slots}")

        except Exception as e:
            print("Error parsing item:", e)

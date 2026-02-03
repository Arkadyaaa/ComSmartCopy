from bs4 import BeautifulSoup
import requests
import csv

url = "https://www.pc-kombo.com/us/components/motherboards"
page = requests.get(url)
soup = BeautifulSoup(page.text, 'html.parser')

with open('scraped_prices_motherboard.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['name', 'price'])
    
    gpu_items = soup.find_all('li', class_='columns')

    for gpu in gpu_items:
        try:
            name_tag = gpu.select_one(
                'div.column.col-10.col-lg-8.col-sm-12 a h5.name'
            )
            if not name_tag:
                continue
            name = name_tag.text.strip()

            price_tag = gpu.select_one(
                'div.column.col-1.col-lg-2.col-sm-4.text-right a span.price'
            )
            if not price_tag:
                continue  # skip no price

            price = price_tag.text.strip()
            price = price.replace('USD ', '').replace(',', '')
            price = float(price)

            writer.writerow([name, price])
            print(f"{name} - {price}")

        except Exception as e:
            print("Error parsing item:", e)

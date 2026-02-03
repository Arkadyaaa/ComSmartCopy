from bs4 import BeautifulSoup
import requests
import csv

# Open CSV file
with open('scraped_gpu_score_low.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['chipset', 'benchmark'])

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/119.0.0.0 Safari/537.36"
    }

    # Request the page
    url = "https://www.videocardbenchmark.net/low_end_gpus.html"
    page = requests.get(url, headers=headers)
    soup = BeautifulSoup(page.text, 'html.parser')

    # Find the GPU list
    gpu_list = soup.find('ul', class_='chartlist')

    # Each GPU is in <li>
    gpus = gpu_list.find_all('li')

    for gpu in gpus:
        try:
            # Get chipset name
            chipset_span = gpu.find('span', class_='prdname')
            chipset = chipset_span.text.strip() if chipset_span else ''

            # Get benchmark score
            score_span = gpu.find('span', class_='count')
            score = score_span.text.strip().replace(',', '') if score_span else ''

            writer.writerow([chipset, score])
            print(f"{chipset} - {score}")

        except Exception as e:
            print("Error parsing item:", e)

import requests
import json
import os
from dotenv import load_dotenv

api_key = 'keys.Vgcni4wY8_suAcR2ca86NNw1pY_AwVUzufrnExPrgEg'

url = "https://connect.dev.instacart.tools/idp/v1/products/products_link"

data = {
    "title": "Weekly Grocery Shopping",
    "image_url": "https://i.imgur.com/6IUif55.png",  
    "link_type": "shopping_list",
    "expires_in": 1,  
    "instructions": ["This is a shopping list for weekly groceries."],  
    "line_items": [
        {
            "name": "whole milk",
            "quantity": 1,
            "unit": "gallon",
            "display_text": "Whole Milk"
        },
        {
            "name": "eggs",
            "quantity": 12,
            "unit": "count",
            "display_text": "Large Eggs"
        },
        {
            "name": "apples",
            "quantity": 4,
            "unit": "each",
            "display_text": "Granny Smith Apples"
        }
    ],
    "landing_page_configuration": {
        "partner_linkback_url": "https://cartx.us/",
        "enable_pantry_items": False
    }
}

headers = {
    "Accept": "application/json",
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=json.dumps(data))

if response.status_code == 200:
    shopping_list_url = response.json().get("products_link_url")
    print(f"Shopping List URL: {shopping_list_url}")
else:
    print(f"Failed to create shopping list. Status Code: {response.status_code}")
    print(response.text)

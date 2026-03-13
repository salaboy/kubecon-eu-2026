import os
import requests

# A simple app that fetches data from an external API
API_URL = os.getenv("API_URL", "https://api.github.com")

def get_user(username):
    resp = requests.get(f"{API_URL}/users/{username}")
    resp.raise_for_status()
    return resp.json()

if __name__ == "__main__":
    user = get_user("docker")
    print(f"Name: {user.get('name')}")
    print(f"Public repos: {user.get('public_repos')}")

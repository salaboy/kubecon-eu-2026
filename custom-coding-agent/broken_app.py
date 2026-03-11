import json

# Simulated broken application with a few common bugs

def load_config(path):
    with open(path) as f:
        return json.loads(f.read())

def calculate_average(numbers):
    # Bug: no check for empty list — will raise ZeroDivisionError
    return sum(numbers) / len(numbers)

def get_user(users, user_id):
    # Bug: no check for missing key — will raise KeyError
    return users[user_id]

if __name__ == "__main__":
    config = load_config("config.json")  # config.json does not exist

    scores = []
    avg = calculate_average(scores)
    print(f"Average score: {avg}")

    users = {"alice": {"age": 30}}
    user = get_user(users, "bob")
    print(f"User: {user}")

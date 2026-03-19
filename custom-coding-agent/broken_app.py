import json

# Simulated broken application with a few common bugs

def load_config(path):
    try:
        with open(path) as f:
            return json.loads(f.read())
    except FileNotFoundError:
        raise RuntimeError(f"Config file '{path}' not found. Cannot proceed without configuration.")

def calculate_average(numbers):
    if not numbers:
        print("Warning: empty list provided. Returning None.")
        return None
    return sum(numbers) / len(numbers)

def get_user(users, user_id):
    user = users.get(user_id)
    if user is None:
        print(f"Warning: user '{user_id}' not found.")
    return user

if __name__ == "__main__":
    try:
        config = load_config("config.json")  # config.json does not exist
    except RuntimeError as e:
        print(f"Error: {e}")
        config = {}

    scores = []
    avg = calculate_average(scores)
    print(f"Average score: {avg}" if avg is not None else "No scores to average.")

    users = {"alice": {"age": 30}}
    user = get_user(users, "bob")
    if user is not None:
        print(f"User: {user}")
    else:
        print("User not found.")

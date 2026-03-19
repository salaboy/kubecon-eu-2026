# History

## 2026-03-11

**Prompt:** Refine gherkin example

**Refinements applied to both customer.feature and product.feature:**
- Added `Background` section to eliminate repeated "Given database is empty" setup
- Added `@create`, `@read`, `@update`, `@delete`, `@error` tags for selective test execution
- Added `Scenario Outline` with `Examples` tables for data-driven create tests
- Added missing scenarios: get-by-ID, delete customer, error cases (404 for non-existent resources)
- Added empty database edge case scenarios
- Updated step definitions to support all new scenarios

**Refined Features (Gherkin):**

```gherkin
Feature: Customer Management
  Background:
    Given the customer database is empty

  @create
  Scenario: Create a new customer
  @create
  Scenario Outline: Create multiple customers with different data
    Examples: Alice, Bob, Charlie
  @read
  Scenario: Get all customers
  @read
  Scenario: Get a customer by ID
  @read @error
  Scenario: Get a non-existent customer returns 404
  @delete
  Scenario: Delete an existing customer
  @delete @error
  Scenario: Delete a non-existent customer returns 404
  @read
  Scenario: Get all customers from an empty database returns empty list
```

```gherkin
Feature: Product Management
  Background:
    Given the product database is empty

  @create
  Scenario: Create a new product
  @create
  Scenario Outline: Create products with different data
    Examples: Laptop, Mouse, Keyboard
  @read
  Scenario: Get all products
  @read
  Scenario: Get a product by ID
  @read @error
  Scenario: Get a non-existent product returns 404
  @update
  Scenario: Update an existing product
  @update @error
  Scenario: Update a non-existent product returns 404
  @delete
  Scenario: Delete a product
  @delete @error
  Scenario: Delete a non-existent product returns 404
  @read
  Scenario: Get all products from an empty database returns empty list
```

---

## 2026-02-26

**Prompt:** Create a new feature to manage Products, the user should be able to list, create, update and delete products using a REST API

**Feature (Gherkin):**

```gherkin
Feature: Product Management
  As a user of the application
  I want to manage products
  So that I can keep track of product information

  Scenario: Create a new product
    Given the product database is empty
    When I create a product with name "Laptop" and description "A powerful laptop" and price 999.99
    Then the response status should be 201
    And there should be 1 product in the database

  Scenario: Get all products
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    And a product exists with name "Mouse" and description "A wireless mouse" and price 29.99
    When I get all products
    Then the response status should be 200
    And the response should contain "Laptop"
    And the response should contain "Mouse"

  Scenario: Update an existing product
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    When I update the product with name "Gaming Laptop" and description "A powerful gaming laptop" and price 1499.99
    Then the response status should be 200
    And the response should contain "Gaming Laptop"
    And the response should contain "1499.99"

  Scenario: Delete a product
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    When I delete the product
    Then the response status should be 204
    And there should be 0 products in the database

  Scenario: Create and retrieve a product
    Given the product database is empty
    When I create a product with name "Keyboard" and description "Mechanical keyboard" and price 149.99
    Then the response status should be 201
    And the response should contain "Keyboard"
    And the response should contain "149.99"
```

Feature: Product Management
  As a user of the application
  I want to manage products
  So that I can keep track of product information

  Background:
    Given the product database is empty

  @create
  Scenario: Create a new product
    When I create a product with name "Laptop" and description "A powerful laptop" and price 999.99
    Then the response status should be 201
    And there should be 1 product in the database

  @create
  Scenario Outline: Create products with different data
    When I create a product with name "<name>" and description "<description>" and price <price>
    Then the response status should be 201
    And the response should contain "<name>"
    And the response should contain "<price>"

    Examples:
      | name     | description          | price   |
      | Laptop   | A powerful laptop    | 999.99  |
      | Mouse    | A wireless mouse     | 29.99   |
      | Keyboard | Mechanical keyboard  | 149.99  |

  @read
  Scenario: Get all products
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    And a product exists with name "Mouse" and description "A wireless mouse" and price 29.99
    When I get all products
    Then the response status should be 200
    And the response should contain "Laptop"
    And the response should contain "Mouse"

  @read
  Scenario: Get a product by ID
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    When I get the product by ID
    Then the response status should be 200
    And the response should contain "Laptop"
    And the response should contain "A powerful laptop"
    And the response should contain "999.99"

  @read @error
  Scenario: Get a non-existent product returns 404
    When I get the product with id 999
    Then the response status should be 404

  @update
  Scenario: Update an existing product
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    When I update the product with name "Gaming Laptop" and description "A powerful gaming laptop" and price 1499.99
    Then the response status should be 200
    And the response should contain "Gaming Laptop"
    And the response should contain "1499.99"

  @update @error
  Scenario: Update a non-existent product returns 404
    When I update the product with id 999 with name "Ghost" and description "Does not exist" and price 0.00
    Then the response status should be 404

  @delete
  Scenario: Delete a product
    Given a product exists with name "Laptop" and description "A powerful laptop" and price 999.99
    When I delete the product
    Then the response status should be 204
    And there should be 0 products in the database

  @delete @error
  Scenario: Delete a non-existent product returns 404
    When I delete the product with id 999
    Then the response status should be 404

  @read
  Scenario: Get all products from an empty database returns empty list
    When I get all products
    Then the response status should be 200
    And the response should contain "[]"

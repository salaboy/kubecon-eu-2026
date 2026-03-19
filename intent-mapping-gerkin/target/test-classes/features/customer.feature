Feature: Customer Management
  As a user of the application
  I want to manage customers
  So that I can keep track of customer information

  Background:
    Given the customer database is empty

  @create
  Scenario: Create a new customer
    When I create a customer with first name "John" and last name "Doe" and email "john@example.com"
    Then the response status should be 201
    And there should be 1 customer in the database

  @create
  Scenario Outline: Create multiple customers with different data
    When I create a customer with first name "<firstName>" and last name "<lastName>" and email "<email>"
    Then the response status should be 201
    And the response should contain "<firstName>"
    And the response should contain "<lastName>"

    Examples:
      | firstName | lastName | email              |
      | Alice     | Smith    | alice@example.com  |
      | Bob       | Jones    | bob@example.com    |
      | Charlie   | Brown    | charlie@example.com|

  @read
  Scenario: Get all customers
    Given a customer exists with first name "John" and last name "Doe" and email "john@example.com"
    And a customer exists with first name "Jane" and last name "Doe" and email "jane@example.com"
    When I get all customers
    Then the response status should be 200
    And the response should contain "John"
    And the response should contain "Jane"

  @read
  Scenario: Get a customer by ID
    Given a customer exists with first name "Alice" and last name "Smith" and email "alice@example.com"
    When I get the customer by ID
    Then the response status should be 200
    And the response should contain "Alice"
    And the response should contain "Smith"
    And the response should contain "alice@example.com"

  @read @error
  Scenario: Get a non-existent customer returns 404
    When I get the customer with id 999
    Then the response status should be 404

  @delete
  Scenario: Delete an existing customer
    Given a customer exists with first name "John" and last name "Doe" and email "john@example.com"
    When I delete the customer
    Then the response status should be 204
    And there should be 0 customers in the database

  @delete @error
  Scenario: Delete a non-existent customer returns 404
    When I delete the customer with id 999
    Then the response status should be 404

  @read
  Scenario: Get all customers from an empty database returns empty list
    When I get all customers
    Then the response status should be 200
    And the response should contain "[]"

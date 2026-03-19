package com.salaboy.intentmapping.steps;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salaboy.intentmapping.model.Customer;
import com.salaboy.intentmapping.repository.CustomerRepository;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class CustomerStepDefinitions {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SharedTestState sharedTestState;

    private Long lastCustomerId;

    private String baseUrl() {
        return "http://localhost:" + port + "/api/customers";
    }

    @Before
    public void setUp() {
        customerRepository.deleteAll();
    }

    @Given("the customer database is empty")
    public void theCustomerDatabaseIsEmpty() {
        customerRepository.deleteAll();
        assertThat(customerRepository.count()).isZero();
    }

    @Given("a customer exists with first name {string} and last name {string} and email {string}")
    public void aCustomerExistsWithFirstNameAndLastNameAndEmail(String firstName, String lastName, String email) {
        Customer saved = customerRepository.save(new Customer(firstName, lastName, email));
        lastCustomerId = saved.getId();
    }

    @When("I create a customer with first name {string} and last name {string} and email {string}")
    public void iCreateACustomerWithFirstNameAndLastNameAndEmail(String firstName, String lastName, String email) {
        Customer customer = new Customer(firstName, lastName, email);
        sharedTestState.setLastResponse(restTemplate.postForEntity(baseUrl(), customer, String.class));
    }

    @When("I get all customers")
    public void iGetAllCustomers() {
        sharedTestState.setLastResponse(restTemplate.getForEntity(baseUrl(), String.class));
    }

    @When("I get the customer by ID")
    public void iGetTheCustomerById() {
        sharedTestState.setLastResponse(restTemplate.getForEntity(baseUrl() + "/" + lastCustomerId, String.class));
    }

    @When("I get the customer with id {long}")
    public void iGetTheCustomerWithId(Long id) {
        sharedTestState.setLastResponse(restTemplate.getForEntity(baseUrl() + "/" + id, String.class));
    }

    @When("I delete the customer")
    public void iDeleteTheCustomer() {
        sharedTestState.setLastResponse(restTemplate.exchange(
                baseUrl() + "/" + lastCustomerId,
                HttpMethod.DELETE,
                null,
                String.class));
    }

    @When("I delete the customer with id {long}")
    public void iDeleteTheCustomerWithId(Long id) {
        sharedTestState.setLastResponse(restTemplate.exchange(
                baseUrl() + "/" + id,
                HttpMethod.DELETE,
                null,
                String.class));
    }

    @Then("there should be {int} customer(s) in the database")
    public void thereShouldBeCustomersInTheDatabase(int count) {
        assertThat(customerRepository.count()).isEqualTo(count);
    }
}

package com.salaboy.intentmapping.steps;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salaboy.intentmapping.model.Product;
import com.salaboy.intentmapping.repository.ProductRepository;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import static org.assertj.core.api.Assertions.assertThat;

public class ProductStepDefinitions {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SharedTestState sharedTestState;

    private Long lastProductId;

    private String baseUrl() {
        return "http://localhost:" + port + "/api/products";
    }

    @Before
    public void setUp() {
        productRepository.deleteAll();
    }

    @Given("the product database is empty")
    public void theProductDatabaseIsEmpty() {
        productRepository.deleteAll();
        assertThat(productRepository.count()).isZero();
    }

    @Given("a product exists with name {string} and description {string} and price {double}")
    public void aProductExistsWithNameAndDescriptionAndPrice(String name, String description, Double price) {
        Product saved = productRepository.save(new Product(name, description, price));
        lastProductId = saved.getId();
    }

    @When("I create a product with name {string} and description {string} and price {double}")
    public void iCreateAProductWithNameAndDescriptionAndPrice(String name, String description, Double price) {
        Product product = new Product(name, description, price);
        sharedTestState.setLastResponse(restTemplate.postForEntity(baseUrl(), product, String.class));
    }

    @When("I get all products")
    public void iGetAllProducts() {
        sharedTestState.setLastResponse(restTemplate.getForEntity(baseUrl(), String.class));
    }

    @When("I get the product by ID")
    public void iGetTheProductById() {
        sharedTestState.setLastResponse(restTemplate.getForEntity(baseUrl() + "/" + lastProductId, String.class));
    }

    @When("I get the product with id {long}")
    public void iGetTheProductWithId(Long id) {
        sharedTestState.setLastResponse(restTemplate.getForEntity(baseUrl() + "/" + id, String.class));
    }

    @When("I update the product with name {string} and description {string} and price {double}")
    public void iUpdateTheProductWithNameAndDescriptionAndPrice(String name, String description, Double price) {
        Product product = new Product(name, description, price);
        sharedTestState.setLastResponse(restTemplate.exchange(
                baseUrl() + "/" + lastProductId,
                HttpMethod.PUT,
                new HttpEntity<>(product),
                String.class));
    }

    @When("I update the product with id {long} with name {string} and description {string} and price {double}")
    public void iUpdateTheProductWithIdAndNameAndDescriptionAndPrice(Long id, String name, String description, Double price) {
        Product product = new Product(name, description, price);
        sharedTestState.setLastResponse(restTemplate.exchange(
                baseUrl() + "/" + id,
                HttpMethod.PUT,
                new HttpEntity<>(product),
                String.class));
    }

    @When("I delete the product")
    public void iDeleteTheProduct() {
        sharedTestState.setLastResponse(restTemplate.exchange(
                baseUrl() + "/" + lastProductId,
                HttpMethod.DELETE,
                null,
                String.class));
    }

    @When("I delete the product with id {long}")
    public void iDeleteTheProductWithId(Long id) {
        sharedTestState.setLastResponse(restTemplate.exchange(
                baseUrl() + "/" + id,
                HttpMethod.DELETE,
                null,
                String.class));
    }

    @Then("there should be {int} product(s) in the database")
    public void thereShouldBeProductsInTheDatabase(int count) {
        assertThat(productRepository.count()).isEqualTo(count);
    }
}

package com.salaboy.intentmapping.steps;

import io.cucumber.java.en.Then;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class CommonStepDefinitions {

    @Autowired
    private SharedTestState sharedTestState;

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int status) {
        assertThat(sharedTestState.getLastResponse().getStatusCode()).isEqualTo(HttpStatus.valueOf(status));
    }

    @Then("the response should contain {string}")
    public void theResponseShouldContain(String expected) {
        assertThat(sharedTestState.getLastResponse().getBody()).contains(expected);
    }
}

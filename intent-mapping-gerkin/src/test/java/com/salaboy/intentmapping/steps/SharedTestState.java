package com.salaboy.intentmapping.steps;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import io.cucumber.spring.ScenarioScope;

@Component
@ScenarioScope
public class SharedTestState {

    private ResponseEntity<String> lastResponse;

    public ResponseEntity<String> getLastResponse() {
        return lastResponse;
    }

    public void setLastResponse(ResponseEntity<String> lastResponse) {
        this.lastResponse = lastResponse;
    }
}

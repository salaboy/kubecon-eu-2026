package com.salaboy.intentmapping.repository;

import com.salaboy.intentmapping.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}

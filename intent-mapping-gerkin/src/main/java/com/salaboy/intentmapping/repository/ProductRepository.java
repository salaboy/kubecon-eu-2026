package com.salaboy.intentmapping.repository;

import com.salaboy.intentmapping.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
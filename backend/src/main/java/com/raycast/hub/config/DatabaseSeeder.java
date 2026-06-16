package com.raycast.hub.config;

import com.raycast.hub.model.Transaction;
import com.raycast.hub.model.User;
import com.raycast.hub.repository.TransactionRepository;
import com.raycast.hub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.Arrays;

import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(TransactionRepository transactionRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        User demoUser;
        java.util.Optional<User> optionalUser = userRepository.findByEmail("demo@example.com");
        if (optionalUser.isEmpty()) {
            demoUser = new User("demo@example.com", passwordEncoder.encode("password123"), "LOCAL");
            demoUser = userRepository.save(demoUser);
            System.out.println(">>> Preseeded default user: demo@example.com / password123 (BCrypt)");
        } else {
            demoUser = optionalUser.get();
        }

        // Seed default transactions if not exists
        if (transactionRepository.count() == 0) {
            LocalDate now = LocalDate.now();
            Long demoUserId = demoUser.getId();

            Transaction salary = new Transaction(80000.0, "Salary", "INCOME", now.minusDays(14), "Monthly base paycheck", demoUserId);
            Transaction rent = new Transaction(20000.0, "Rent", "EXPENSE", now.minusDays(13), "Apartment rental payment", demoUserId);
            Transaction groceries = new Transaction(5200.0, "Food", "EXPENSE", now.minusDays(10), "Weekly wholefoods shopping", demoUserId);
            Transaction dinnerOut = new Transaction(2500.0, "Food", "EXPENSE", now.minusDays(8), "Weekend dining at Bistro", demoUserId);
            Transaction cloudHost = new Transaction(3500.0, "Utilities", "EXPENSE", now.minusDays(5), "AWS hosting bill", demoUserId);
            Transaction entertainment = new Transaction(6000.0, "Entertainment", "EXPENSE", now.minusDays(3), "Concert tickets", demoUserId);
            Transaction electricity = new Transaction(4200.0, "Utilities", "EXPENSE", now.minusDays(2), "Electric utility bill", demoUserId);
            Transaction coffee = new Transaction(450.0, "Other", "EXPENSE", now.minusDays(1), "Artisanal espresso", demoUserId);

            transactionRepository.saveAll(Arrays.asList(salary, rent, groceries, dinnerOut, cloudHost, entertainment, electricity, coffee));
            System.out.println(">>> Preseeded H2 Database with 8 rupee transactions scoped to demo user.");
        }
    }
}

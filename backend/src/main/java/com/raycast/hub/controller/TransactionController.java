package com.raycast.hub.controller;

import com.raycast.hub.dto.ApiResponse;
import com.raycast.hub.exception.BadRequestException;
import com.raycast.hub.exception.ResourceNotFoundException;
import com.raycast.hub.model.Transaction;
import com.raycast.hub.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Transaction>>> getTransactions(
            @RequestParam Long userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<Transaction> transactions;
        LocalDate start = (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;

        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All Categories")) {
            if (start != null && end != null) {
                transactions = transactionRepository.findByUserIdAndCategoryAndDateBetween(userId, category, start, end);
            } else if (start != null) {
                transactions = transactionRepository.findByUserIdAndCategoryIgnoreCase(userId, category).stream()
                        .filter(t -> !t.getDate().isBefore(start))
                        .collect(Collectors.toList());
            } else if (end != null) {
                transactions = transactionRepository.findByUserIdAndCategoryIgnoreCase(userId, category).stream()
                        .filter(t -> !t.getDate().isAfter(end))
                        .collect(Collectors.toList());
            } else {
                transactions = transactionRepository.findByUserIdAndCategoryIgnoreCase(userId, category);
            }
        } else {
            if (start != null && end != null) {
                transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
            } else if (start != null) {
                transactions = transactionRepository.findByUserId(userId).stream()
                        .filter(t -> !t.getDate().isBefore(start))
                        .collect(Collectors.toList());
            } else if (end != null) {
                transactions = transactionRepository.findByUserId(userId).stream()
                        .filter(t -> !t.getDate().isAfter(end))
                        .collect(Collectors.toList());
            } else {
                transactions = transactionRepository.findByUserId(userId);
            }
        }

        transactions.sort((t1, t2) -> t2.getDate().compareTo(t1.getDate()));
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Transaction>> createTransaction(@RequestBody Transaction transaction) {
        if (transaction.getUserId() == null) {
            throw new BadRequestException("User ID is required to record a transaction");
        }
        if (transaction.getAmount() <= 0) {
            throw new BadRequestException("Transaction amount must be greater than zero");
        }
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }
        Transaction saved = transactionRepository.save(transaction);
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded successfully", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with ID: " + id);
        }
        transactionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(@RequestParam Long userId) {
        List<Transaction> all = transactionRepository.findByUserId(userId);
        
        double totalIncome = 0;
        double totalExpense = 0;
        Map<String, Double> expenseCategorySums = new HashMap<>();
        
        for (Transaction t : all) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome += t.getAmount();
            } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                totalExpense += t.getAmount();
                expenseCategorySums.put(
                    t.getCategory(), 
                    expenseCategorySums.getOrDefault(t.getCategory(), 0.0) + t.getAmount()
                );
            }
        }
        
        double netBalance = totalIncome - totalExpense;
        String topCategory = "None";
        double maxExpense = 0;
        for (Map.Entry<String, Double> entry : expenseCategorySums.entrySet()) {
            if (entry.getValue() > maxExpense) {
                maxExpense = entry.getValue();
                topCategory = entry.getKey();
            }
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("netBalance", netBalance);
        summary.put("topSpendingCategory", topCategory);
        summary.put("topCategoryAmount", maxExpense);
        
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getInsights(@RequestParam Long userId) {
        List<Transaction> all = transactionRepository.findByUserId(userId);
        List<Map<String, String>> insights = new ArrayList<>();
        
        double totalIncome = 0;
        double totalExpense = 0;
        Map<String, Double> categoryTotals = new HashMap<>();
        
        for (Transaction t : all) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome += t.getAmount();
            } else {
                totalExpense += t.getAmount();
                categoryTotals.put(t.getCategory(), categoryTotals.getOrDefault(t.getCategory(), 0.0) + t.getAmount());
            }
        }
        
        if (totalIncome > 0) {
            double netSavings = totalIncome - totalExpense;
            double savingsRate = (netSavings / totalIncome) * 100;
            
            Map<String, String> savingsInsight = new HashMap<>();
            savingsInsight.put("title", "Monthly Savings Rate");
            savingsInsight.put("type", savingsRate >= 30 ? "success" : (savingsRate >= 0 ? "info" : "warning"));
            
            if (savingsRate >= 30) {
                savingsInsight.put("description", String.format("Excellent savings rate at %.1f%%. You are keeping more than 30%% of your earnings.", savingsRate));
            } else if (savingsRate >= 0) {
                savingsInsight.put("description", String.format("Savings rate is %.1f%%. Try auditing subscription bills to raise your savings buffer closer to 30%%.", savingsRate));
            } else {
                savingsInsight.put("description", String.format("Deficit detected. Your spending is exceeding income by ₹%.2f. Pause discretionary purchases.", Math.abs(netSavings)));
            }
            insights.add(savingsInsight);
        } else if (totalExpense > 0) {
            Map<String, String> noIncomeInsight = new HashMap<>();
            noIncomeInsight.put("title", "Budget Deficit Warning");
            noIncomeInsight.put("type", "warning");
            noIncomeInsight.put("description", "You recorded expenses but no income yet. Make sure to log salary or other inflows.");
            insights.add(noIncomeInsight);
        }
        
        if (!categoryTotals.isEmpty()) {
            String topCategory = "";
            double topAmount = 0;
            for (Map.Entry<String, Double> entry : categoryTotals.entrySet()) {
                if (entry.getValue() > topAmount) {
                    topAmount = entry.getValue();
                    topCategory = entry.getKey();
                }
            }
            
            double pct = totalExpense > 0 ? (topAmount / totalExpense) * 100 : 0;
            Map<String, String> categoryInsight = new HashMap<>();
            categoryInsight.put("title", "Dominant Expense Category");
            categoryInsight.put("type", pct > 45 ? "warning" : "info");
            
            if ("Rent".equalsIgnoreCase(topCategory)) {
                categoryInsight.put("description", String.format("Rent is your largest cost center (₹%.2f), taking up %.1f%% of total expenses. Keep other variable bills low.", topAmount, pct));
            } else if ("Food".equalsIgnoreCase(topCategory)) {
                categoryInsight.put("description", String.format("Food consumes %.1f%% of your budget (₹%.2f). Preparing meals at home could yield rapid savings.", pct, topAmount));
            } else if ("Entertainment".equalsIgnoreCase(topCategory)) {
                categoryInsight.put("description", String.format("Entertainment makes up %.1f%% of your expenses (₹%.2f). Consider checking for unused streaming software subscriptions.", pct, topAmount));
            } else {
                categoryInsight.put("description", String.format("Your leading expense is %s at ₹%.2f (%.1f%% of total spending).", topCategory, topAmount, pct));
            }
            insights.add(categoryInsight);
        }
        
        Map<String, String> adviceInsight = new HashMap<>();
        adviceInsight.put("title", "Developer Finance Tip");
        adviceInsight.put("type", "success");
        adviceInsight.put("description", "Supercharge savings by auto-sweeping a set percentage of salary on payday. Set hotkeys to log expenses instantly.");
        insights.add(adviceInsight);
        
        return ResponseEntity.ok(ApiResponse.success(insights));
    }
}

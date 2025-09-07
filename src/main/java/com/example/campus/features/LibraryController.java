package com.example.campus.features;

import com.example.campus.entity.*;
import com.example.campus.repository.*;
import com.example.campus.user.User;
import com.example.campus.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private BookIssueRepository bookIssueRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/books")
    public ResponseEntity<?> getAllBooks(@RequestParam(required = false) String search,
                                       @RequestParam(required = false) String category) {
        try {
            List<Book> books;
            if (search != null && !search.trim().isEmpty()) {
                books = bookRepository.searchBooks(search);
            } else if (category != null && !category.trim().isEmpty()) {
                books = bookRepository.findByCategory(category);
            } else {
                books = bookRepository.findAll();
            }
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/books/available")
    public ResponseEntity<?> getAvailableBooks() {
        try {
            List<Book> books = bookRepository.findAvailableBooks();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/books")
    public ResponseEntity<?> addBook(@RequestBody Map<String, Object> bookData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Book book = new Book();
            book.setTitle(bookData.get("title").toString());
            book.setAuthor(bookData.get("author").toString());
            book.setIsbn(bookData.get("isbn").toString());
            book.setCategory(bookData.get("category").toString());
            book.setTotalCopies(Integer.valueOf(bookData.get("totalCopies").toString()));
            book.setPublisher(bookData.get("publisher").toString());
            book.setPublicationYear(Integer.valueOf(bookData.get("publicationYear").toString()));
            book.setDescription(bookData.get("description").toString());

            bookRepository.save(book);
            return ResponseEntity.ok(Map.of("message", "Book added successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<?> getBook(@PathVariable Long bookId) {
        try {
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Book not found"));
            }
            return ResponseEntity.ok(book);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/books/{bookId}/issue")
    public ResponseEntity<?> issueBook(@PathVariable Long bookId, @RequestBody Map<String, Object> issueData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Book book = bookRepository.findById(bookId).orElse(null);
            if (book == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Book not found"));
            }

            if (book.getAvailableCopies() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "No copies available"));
            }

            // Check if student already has this book issued
            List<BookIssue> existingIssues = bookIssueRepository.findActiveIssuesByStudent(user.getId());
            boolean alreadyIssued = existingIssues.stream()
                .anyMatch(issue -> issue.getBookId().equals(bookId));
            
            if (alreadyIssued) {
                return ResponseEntity.badRequest().body(Map.of("error", "Book already issued to this student"));
            }

            BookIssue bookIssue = new BookIssue();
            bookIssue.setBookId(bookId);
            bookIssue.setStudentId(user.getId());
            bookIssue.setIssueDate(LocalDateTime.now());
            bookIssue.setDueDate(LocalDateTime.now().plusDays(14)); // 14 days from now
            bookIssue.setIssuedBy(userDetails.getUsername());

            bookIssueRepository.save(bookIssue);

            // Update available copies
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.save(book);

            return ResponseEntity.ok(Map.of("message", "Book issued successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/books/{bookId}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long bookId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            List<BookIssue> activeIssues = bookIssueRepository.findActiveIssuesByStudent(user.getId());
            BookIssue bookIssue = activeIssues.stream()
                .filter(issue -> issue.getBookId().equals(bookId))
                .findFirst()
                .orElse(null);

            if (bookIssue == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No active issue found for this book"));
            }

            bookIssue.setReturnDate(LocalDateTime.now());
            bookIssue.setStatus(BookIssue.IssueStatus.RETURNED);

            // Calculate fine if overdue
            if (bookIssue.getReturnDate().isAfter(bookIssue.getDueDate())) {
                long daysOverdue = java.time.Duration.between(bookIssue.getDueDate(), bookIssue.getReturnDate()).toDays();
                bookIssue.setFineAmount(daysOverdue * 5.0); // $5 per day
            }

            bookIssueRepository.save(bookIssue);

            // Update available copies
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book != null) {
                book.setAvailableCopies(book.getAvailableCopies() + 1);
                bookRepository.save(book);
            }

            return ResponseEntity.ok(Map.of("message", "Book returned successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/issues/student")
    public ResponseEntity<?> getStudentIssues(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            List<BookIssue> issues = bookIssueRepository.findByStudentId(user.getId());
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/issues/active")
    public ResponseEntity<?> getActiveIssues(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            List<BookIssue> activeIssues = bookIssueRepository.findActiveIssuesByStudent(user.getId());
            return ResponseEntity.ok(activeIssues);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/issues/overdue")
    public ResponseEntity<?> getOverdueBooks(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BookIssue> overdueBooks = bookIssueRepository.findOverdueBooks(LocalDateTime.now());
            return ResponseEntity.ok(overdueBooks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getLibraryDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            long totalBooks = bookRepository.count();
            long availableBooks = bookRepository.findAvailableBooks().size();
            long totalIssues = bookIssueRepository.count();
            long activeIssues = bookIssueRepository.findByStatus(BookIssue.IssueStatus.ISSUED).size();
            long overdueBooks = bookIssueRepository.findOverdueBooks(LocalDateTime.now()).size();

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("totalBooks", totalBooks);
            dashboard.put("availableBooks", availableBooks);
            dashboard.put("totalIssues", totalIssues);
            dashboard.put("activeIssues", activeIssues);
            dashboard.put("overdueBooks", overdueBooks);

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

package com.example.campus.features;

import com.example.campus.entity.*;
import com.example.campus.repository.*;
import com.example.campus.user.User;
import com.example.campus.user.UserRepository;
import com.example.campus.user.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // System statistics
            long totalStudents = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).count();
            long totalFaculty = userRepository.findAll().stream().filter(u -> u.getRole() == Role.FACULTY).count();
            long totalAssignments = assignmentRepository.count();
            long pendingFeedback = feedbackRepository.findPendingFeedback().size();

            // Fee statistics
            BigDecimal totalFeesCollected = feeRepository.findAll().stream()
                    .filter(f -> f.getStatus() == Fee.PaymentStatus.PAID)
                    .map(Fee::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal pendingFees = feeRepository.findAll().stream()
                    .filter(f -> f.getStatus() == Fee.PaymentStatus.PENDING)
                    .map(Fee::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("totalStudents", totalStudents);
            dashboard.put("totalFaculty", totalFaculty);
            dashboard.put("totalAssignments", totalAssignments);
            dashboard.put("pendingFeedback", pendingFeedback);
            dashboard.put("totalFeesCollected", totalFeesCollected);
            dashboard.put("pendingFees", pendingFees);
            dashboard.put("libraryBooks", 120); // Mock data
            dashboard.put("activeNotifications", notificationRepository.count());

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userRepository.existsByUsername(userData.get("username").toString())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }

            User user = new User();
            user.setUsername(userData.get("username").toString());
            user.setPassword(passwordEncoder.encode(userData.get("password").toString()));
            user.setRole(Role.valueOf(userData.get("role").toString()));

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> userData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            if (userData.get("username") != null) {
                user.setUsername(userData.get("username").toString());
            }
            if (userData.get("password") != null) {
                user.setPassword(passwordEncoder.encode(userData.get("password").toString()));
            }
            if (userData.get("role") != null) {
                user.setRole(Role.valueOf(userData.get("role").toString()));
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attendance/reports")
    public ResponseEntity<?> getAttendanceReports(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Attendance> allAttendance = attendanceRepository.findAll();
            return ResponseEntity.ok(allAttendance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/marks/reports")
    public ResponseEntity<?> getMarksReports(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Mark> allMarks = markRepository.findAll();
            return ResponseEntity.ok(allMarks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/fees/reports")
    public ResponseEntity<?> getFeesReports(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Fee> allFees = feeRepository.findAll();
            return ResponseEntity.ok(allFees);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/assignments/reports")
    public ResponseEntity<?> getAssignmentsReports(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Assignment> allAssignments = assignmentRepository.findAll();
            return ResponseEntity.ok(allAssignments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> getAllFeedback(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Feedback> allFeedback = feedbackRepository.findAll();
            return ResponseEntity.ok(allFeedback);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/feedback/{feedbackId}/respond")
    public ResponseEntity<?> respondToFeedback(@PathVariable Long feedbackId, @RequestBody Map<String, String> response, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Feedback feedback = feedbackRepository.findById(feedbackId).orElse(null);
            if (feedback == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback not found"));
            }

            feedback.setAdminResponse(response.get("response"));
            feedback.setRespondedBy(userDetails.getUsername());
            feedback.setRespondedAt(LocalDateTime.now());
            feedback.setStatus(Feedback.Status.RESOLVED);

            feedbackRepository.save(feedback);
            return ResponseEntity.ok(Map.of("message", "Response added successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/notifications")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> notificationData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Notification notification = new Notification();
            notification.setTitle(notificationData.get("title").toString());
            notification.setMessage(notificationData.get("message").toString());
            notification.setCreatedBy(userDetails.getUsername());
            notification.setTargetRole(Notification.TargetRole.valueOf(notificationData.get("targetRole").toString()));

            notificationRepository.save(notification);
            return ResponseEntity.ok(Map.of("message", "Notification created successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getAllNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Notification> notifications = notificationRepository.findAll();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/fees")
    public ResponseEntity<?> createFee(@RequestBody Map<String, Object> feeData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Fee fee = new Fee();
            fee.setStudentId(Long.valueOf(feeData.get("studentId").toString()));
            fee.setFeeType(Fee.FeeType.valueOf(feeData.get("feeType").toString()));
            fee.setAmount(new BigDecimal(feeData.get("amount").toString()));
            fee.setDueDate(LocalDateTime.parse(feeData.get("dueDate").toString()));

            feeRepository.save(fee);
            return ResponseEntity.ok(Map.of("message", "Fee created successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Map<String, Object> analytics = new HashMap<>();

            // Attendance analytics
            long totalAttendanceRecords = attendanceRepository.count();
            long presentCount = attendanceRepository.findAll().stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();

            // Marks analytics
            List<Mark> allMarks = markRepository.findAll();
            double averageMarks = allMarks.stream()
                    .mapToInt(Mark::getMarksObtained)
                    .average()
                    .orElse(0.0);

            // Fee analytics
            BigDecimal totalFees = feeRepository.findAll().stream()
                    .map(Fee::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            analytics.put("totalAttendanceRecords", totalAttendanceRecords);
            analytics.put("attendancePercentage", totalAttendanceRecords > 0 ? (presentCount * 100.0 / totalAttendanceRecords) : 0.0);
            analytics.put("averageMarks", Math.round(averageMarks * 100.0) / 100.0);
            analytics.put("totalFees", totalFees);
            analytics.put("totalStudents", userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).count());
            analytics.put("totalFaculty", userRepository.findAll().stream().filter(u -> u.getRole() == Role.FACULTY).count());

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

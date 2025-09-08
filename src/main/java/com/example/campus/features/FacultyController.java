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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }


            // Today's schedule (mock data)
            List<String> todaySchedule = Arrays.asList("CS101 - 10:00 AM", "MA102 - 2:00 PM");

            // Assigned subjects
            List<String> assignedSubjects = Arrays.asList("CS101", "MA102");

            // Pending submissions to review
            List<AssignmentSubmission> pendingSubmissions = submissionRepository.findPendingSubmissionsByAssignment(1L);

            // Recent notifications
            List<Notification> notifications = notificationRepository.findByTargetRoleOrAll(Notification.TargetRole.FACULTY);
            notifications = notifications.stream().limit(5).toList();

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("todaySchedule", todaySchedule);
            dashboard.put("assignedSubjects", assignedSubjects);
            dashboard.put("pendingSubmissions", pendingSubmissions.size());
            dashboard.put("notifications", notifications);

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> attendanceData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Attendance attendance = new Attendance();
            attendance.setStudentId(Long.valueOf(attendanceData.get("studentId").toString()));
            attendance.setSubject(attendanceData.get("subject").toString());
            attendance.setDate(LocalDate.parse(attendanceData.get("date").toString()));
            attendance.setStatus(Attendance.AttendanceStatus.valueOf(attendanceData.get("status").toString()));
            attendance.setMarkedBy(user.getUsername());

            attendanceRepository.save(attendance);
            return ResponseEntity.ok(Map.of("message", "Attendance marked successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attendance/class/{subject}")
    public ResponseEntity<?> getClassAttendance(@PathVariable String subject, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get all attendance records for the subject
            List<Attendance> attendance = attendanceRepository.findAll().stream()
                    .filter(a -> a.getSubject().equals(subject))
                    .toList();

            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(@RequestBody Map<String, Object> assignmentData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Assignment assignment = new Assignment();
            assignment.setTitle(assignmentData.get("title").toString());
            assignment.setDescription(assignmentData.get("description").toString());
            assignment.setSubject(assignmentData.get("subject").toString());
            assignment.setAssignedBy(user.getUsername());
            assignment.setMaxMarks(Integer.valueOf(assignmentData.get("maxMarks").toString()));

            if (assignmentData.get("dueDate") != null) {
                assignment.setDueDate(LocalDateTime.parse(assignmentData.get("dueDate").toString()));
            }

            assignmentRepository.save(assignment);
            return ResponseEntity.ok(Map.of("message", "Assignment created successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getAssignments(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            List<Assignment> assignments = assignmentRepository.findByAssignedBy(user.getUsername());
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getAssignmentSubmissions(@PathVariable Long assignmentId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/assignments/{assignmentId}/grade")
    public ResponseEntity<?> gradeAssignment(@PathVariable Long assignmentId, @RequestBody Map<String, Object> gradeData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Long submissionId = Long.valueOf(gradeData.get("submissionId").toString());
            AssignmentSubmission submission = submissionRepository.findById(submissionId).orElse(null);

            if (submission == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Submission not found"));
            }

            submission.setMarksObtained(Integer.valueOf(gradeData.get("marks").toString()));
            submission.setFeedback(gradeData.get("feedback").toString());
            submission.setGradedBy(user.getUsername());
            submission.setGradedAt(LocalDateTime.now());
            submission.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);

            submissionRepository.save(submission);
            return ResponseEntity.ok(Map.of("message", "Assignment graded successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/marks")
    public ResponseEntity<?> addMarks(@RequestBody Map<String, Object> marksData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Mark mark = new Mark();
            mark.setStudentId(Long.valueOf(marksData.get("studentId").toString()));
            mark.setSubject(marksData.get("subject").toString());
            mark.setExamType(Mark.ExamType.valueOf(marksData.get("examType").toString()));
            mark.setMarksObtained(Integer.valueOf(marksData.get("marksObtained").toString()));
            mark.setMaxMarks(Integer.valueOf(marksData.get("maxMarks").toString()));
            mark.setSemester(marksData.get("semester").toString());
            mark.setAcademicYear(marksData.get("academicYear").toString());
            mark.setEnteredBy(user.getUsername());

            markRepository.save(mark);
            return ResponseEntity.ok(Map.of("message", "Marks added successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/marks/subject/{subject}")
    public ResponseEntity<?> getMarksBySubject(@PathVariable String subject, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Mark> marks = markRepository.findAll().stream()
                    .filter(m -> m.getSubject().equals(subject))
                    .toList();

            return ResponseEntity.ok(marks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/notifications")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> notificationData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Notification notification = new Notification();
            notification.setTitle(notificationData.get("title").toString());
            notification.setMessage(notificationData.get("message").toString());
            notification.setCreatedBy(user.getUsername());
            notification.setTargetRole(Notification.TargetRole.valueOf(notificationData.get("targetRole").toString()));

            notificationRepository.save(notification);
            return ResponseEntity.ok(Map.of("message", "Notification created successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Notification> notifications = notificationRepository.findByTargetRoleOrAll(Notification.TargetRole.FACULTY);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/notifications/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable Long id, @RequestBody Map<String, Object> notificationData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Notification notification = notificationRepository.findById(id).orElse(null);
            if (notification == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Notification not found"));
            }

            notification.setTitle(notificationData.get("title").toString());
            notification.setMessage(notificationData.get("message").toString());
            notification.setTargetRole(Notification.TargetRole.valueOf(notificationData.get("targetRole").toString()));

            notificationRepository.save(notification);
            return ResponseEntity.ok(Map.of("message", "Notification updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Notification notification = notificationRepository.findById(id).orElse(null);
            if (notification == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Notification not found"));
            }

            notificationRepository.delete(notification);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Try to find faculty profile, if not found create mock data
            Faculty faculty = facultyRepository.findByEmail(user.getUsername()).orElse(null);
            if (faculty == null) {
                // Create mock faculty profile
                Map<String, Object> mockProfile = new HashMap<>();
                mockProfile.put("id", user.getId());
                mockProfile.put("name", "Dr. Sarah Johnson");
                mockProfile.put("employeeId", "FAC2023001");
                mockProfile.put("department", "Computer Science");
                mockProfile.put("email", user.getUsername());
                mockProfile.put("phone", "+91 9876543210");
                mockProfile.put("address", "456 Faculty Street, City, State");
                mockProfile.put("designation", "Associate Professor");
                mockProfile.put("qualification", "Ph.D. in Computer Science");
                mockProfile.put("experience", "8 years");
                mockProfile.put("coursesTaught", "Operating Systems, Computer Networks, Data Structures");
                return ResponseEntity.ok(mockProfile);
            }

            return ResponseEntity.ok(faculty);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/timetable/today")
    public ResponseEntity<?> getTodayTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Get today's day of week
            String today = LocalDate.now().getDayOfWeek().toString();

            // Try to find actual timetable, if not found create mock data
            List<Timetable> timetable = timetableRepository.findByDayOfWeek(Timetable.DayOfWeek.valueOf(today));
            if (timetable.isEmpty()) {
                // Create mock timetable data for faculty
                List<Map<String, Object>> mockTimetable = new ArrayList<>();

                Map<String, Object> class1 = new HashMap<>();
                class1.put("id", 1L);
                class1.put("subject", "Operating Systems");
                class1.put("teacher", "Dr. Sarah Johnson");
                class1.put("classroom", "A101");
                class1.put("startTime", "09:00");
                class1.put("endTime", "10:00");
                class1.put("dayOfWeek", today);
                mockTimetable.add(class1);

                Map<String, Object> class2 = new HashMap<>();
                class2.put("id", 2L);
                class2.put("subject", "Computer Networks");
                class2.put("teacher", "Dr. Sarah Johnson");
                class2.put("classroom", "B203");
                class2.put("startTime", "10:15");
                class2.put("endTime", "11:15");
                class2.put("dayOfWeek", today);
                mockTimetable.add(class2);

                Map<String, Object> class3 = new HashMap<>();
                class3.put("id", 3L);
                class3.put("subject", "Data Structures");
                class3.put("teacher", "Dr. Sarah Johnson");
                class3.put("classroom", "C102");
                class3.put("startTime", "11:30");
                class3.put("endTime", "12:30");
                class3.put("dayOfWeek", today);
                mockTimetable.add(class3);

                Map<String, Object> result = new HashMap<>();
                result.put("timetable", mockTimetable);
                result.put("totalClasses", 3);
                result.put("totalHours", 3.0);
                result.put("day", today);

                return ResponseEntity.ok(result);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("timetable", timetable);
            result.put("totalClasses", timetable.size());
            result.put("totalHours", timetable.size() * 1.0); // Assuming 1 hour per class
            result.put("day", today);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjects(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Subject> subjects = subjectRepository.findAll();
            if (subjects.isEmpty()) {
                // Create mock subjects
                List<Map<String, Object>> mockSubjects = new ArrayList<>();

                String[] subjectNames = {"Operating Systems", "Computer Networks", "Data Structures",
                        "Database Management", "Software Engineering", "Web Development"};
                String[] subjectCodes = {"CS301", "CS302", "CS303", "CS304", "CS305", "CS306"};

                for (int i = 0; i < subjectNames.length; i++) {
                    Map<String, Object> subject = new HashMap<>();
                    subject.put("id", (long)(i + 1));
                    subject.put("subjectCode", subjectCodes[i]);
                    subject.put("subjectName", subjectNames[i]);
                    subject.put("department", "Computer Science");
                    subject.put("credits", 3);
                    subject.put("semester", "6th Semester");
                    subject.put("academicYear", "2023-24");
                    mockSubjects.add(subject);
                }

                return ResponseEntity.ok(mockSubjects);
            }

            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students/attendance/{subject}")
    public ResponseEntity<?> getStudentsAttendance(@PathVariable String subject, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get all attendance records for the subject
            List<Attendance> attendance = attendanceRepository.findAll().stream()
                    .filter(a -> a.getSubject().equals(subject))
                    .toList();

            // Calculate attendance percentage for each student
            Map<Long, Map<String, Object>> studentAttendance = new HashMap<>();

            for (Attendance att : attendance) {
                Long studentId = att.getStudentId();
                if (!studentAttendance.containsKey(studentId)) {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("studentId", studentId);
                    stats.put("present", 0);
                    stats.put("total", 0);
                    stats.put("percentage", 0.0);
                    studentAttendance.put(studentId, stats);
                }

                Map<String, Object> stats = studentAttendance.get(studentId);
                stats.put("total", (Integer) stats.get("total") + 1);
                if (att.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                    stats.put("present", (Integer) stats.get("present") + 1);
                }

                double percentage = ((Integer) stats.get("present") * 100.0) / (Integer) stats.get("total");
                stats.put("percentage", Math.round(percentage * 100.0) / 100.0);
            }

            return ResponseEntity.ok(studentAttendance.values());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<User> students = userRepository.findByRole(com.example.campus.user.Role.STUDENT);
            List<Map<String, Object>> studentList = new ArrayList<>();

            for (User student : students) {
                Map<String, Object> studentInfo = new HashMap<>();
                studentInfo.put("id", student.getId());
                studentInfo.put("studentId", student.getStudentId());
                studentInfo.put("username", student.getUsername());
                studentInfo.put("name", student.getUsername()); // Using username as name for now
                studentList.add(studentInfo);
            }

            return ResponseEntity.ok(studentList);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/timetable/week")
    public ResponseEntity<?> getWeeklyTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Create mock weekly timetable data
            Map<String, List<Map<String, Object>>> weeklyTimetable = new HashMap<>();

            String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"};
            String[] subjects = {"Operating Systems", "Computer Networks", "Data Structures", "Database Management", "Software Engineering"};
            String[] classrooms = {"A101", "B203", "C102", "D301", "E205"};
            String[] times = {"09:00-10:00", "10:15-11:15", "11:30-12:30", "14:00-15:00", "15:15-16:15"};

            for (String day : days) {
                List<Map<String, Object>> daySchedule = new ArrayList<>();

                for (int i = 0; i < 3; i++) { // 3 classes per day
                    Map<String, Object> classInfo = new HashMap<>();
                    classInfo.put("id", (long)(i + 1));
                    classInfo.put("subject", subjects[i % subjects.length]);
                    classInfo.put("teacher", "Dr. Sarah Johnson");
                    classInfo.put("classroom", classrooms[i % classrooms.length]);
                    classInfo.put("startTime", times[i % times.length].split("-")[0]);
                    classInfo.put("endTime", times[i % times.length].split("-")[1]);
                    classInfo.put("dayOfWeek", day);
                    daySchedule.add(classInfo);
                }

                weeklyTimetable.put(day, daySchedule);
            }

            return ResponseEntity.ok(weeklyTimetable);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/attendance/bulk")
    public ResponseEntity<?> markBulkAttendance(@RequestBody Map<String, Object> attendanceData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            String subject = attendanceData.get("subject").toString();
            String date = attendanceData.get("date").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> students = (List<Map<String, Object>>) attendanceData.get("students");

            for (Map<String, Object> student : students) {
                Attendance attendance = new Attendance();
                attendance.setStudentId(Long.valueOf(student.get("studentId").toString()));
                attendance.setSubject(subject);
                attendance.setDate(LocalDate.parse(date));
                attendance.setStatus(Attendance.AttendanceStatus.valueOf(student.get("status").toString()));
                attendance.setMarkedBy(user.getUsername());
                attendanceRepository.save(attendance);
            }

            return ResponseEntity.ok(Map.of("message", "Attendance marked successfully for " + students.size() + " students"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
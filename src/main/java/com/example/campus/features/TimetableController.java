package com.example.campus.features;

import com.example.campus.entity.Timetable;
import com.example.campus.repository.TimetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAllTimetable() {
        try {
            List<Timetable> timetable = timetableRepository.findAll();
            return ResponseEntity.ok(timetable);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/day/{day}")
    public ResponseEntity<?> getTimetableByDay(@PathVariable String day) {
        try {
            Timetable.DayOfWeek dayOfWeek = Timetable.DayOfWeek.valueOf(day.toUpperCase());
            List<Timetable> timetable = timetableRepository.findByDayOrderByStartTime(dayOfWeek);
            return ResponseEntity.ok(timetable);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/instructor/{instructor}")
    public ResponseEntity<?> getTimetableByInstructor(@PathVariable String instructor) {
        try {
            List<Timetable> timetable = timetableRepository.findByInstructor(instructor);
            return ResponseEntity.ok(timetable);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<?> getTimetableBySubject(@PathVariable String subject) {
        try {
            List<Timetable> timetable = timetableRepository.findBySubject(subject);
            return ResponseEntity.ok(timetable);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentClasses() {
        try {
            LocalDateTime now = LocalDateTime.now();
            Timetable.DayOfWeek currentDay = Timetable.DayOfWeek.values()[now.getDayOfWeek().getValue() - 1];
            List<Timetable> currentClasses = timetableRepository.findCurrentClasses(currentDay, now);
            return ResponseEntity.ok(currentClasses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTimetableEntry(@RequestBody Map<String, Object> timetableData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Timetable timetable = new Timetable();
            timetable.setSubject(timetableData.get("subject").toString());
            timetable.setTitle(timetableData.get("title").toString());
            timetable.setStartTime(LocalDateTime.parse(timetableData.get("startTime").toString()));
            timetable.setEndTime(LocalDateTime.parse(timetableData.get("endTime").toString()));
            timetable.setInstructor(timetableData.get("instructor").toString());
            timetable.setRoom(timetableData.get("room").toString());
            timetable.setDayOfWeek(Timetable.DayOfWeek.valueOf(timetableData.get("dayOfWeek").toString().toUpperCase()));
            timetable.setSemester(timetableData.get("semester").toString());
            timetable.setAcademicYear(timetableData.get("academicYear").toString());

            timetableRepository.save(timetable);
            return ResponseEntity.ok(Map.of("message", "Timetable entry added successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTimetableEntry(@PathVariable Long id, @RequestBody Map<String, Object> timetableData, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Timetable timetable = timetableRepository.findById(id).orElse(null);
            if (timetable == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Timetable entry not found"));
            }

            if (timetableData.get("subject") != null) {
                timetable.setSubject(timetableData.get("subject").toString());
            }
            if (timetableData.get("title") != null) {
                timetable.setTitle(timetableData.get("title").toString());
            }
            if (timetableData.get("startTime") != null) {
                timetable.setStartTime(LocalDateTime.parse(timetableData.get("startTime").toString()));
            }
            if (timetableData.get("endTime") != null) {
                timetable.setEndTime(LocalDateTime.parse(timetableData.get("endTime").toString()));
            }
            if (timetableData.get("instructor") != null) {
                timetable.setInstructor(timetableData.get("instructor").toString());
            }
            if (timetableData.get("room") != null) {
                timetable.setRoom(timetableData.get("room").toString());
            }
            if (timetableData.get("dayOfWeek") != null) {
                timetable.setDayOfWeek(Timetable.DayOfWeek.valueOf(timetableData.get("dayOfWeek").toString().toUpperCase()));
            }
            if (timetableData.get("semester") != null) {
                timetable.setSemester(timetableData.get("semester").toString());
            }
            if (timetableData.get("academicYear") != null) {
                timetable.setAcademicYear(timetableData.get("academicYear").toString());
            }

            timetableRepository.save(timetable);
            return ResponseEntity.ok(Map.of("message", "Timetable entry updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTimetableEntry(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Timetable timetable = timetableRepository.findById(id).orElse(null);
            if (timetable == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Timetable entry not found"));
            }

            timetableRepository.delete(timetable);
            return ResponseEntity.ok(Map.of("message", "Timetable entry deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getTimetableDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            LocalDateTime now = LocalDateTime.now();
            Timetable.DayOfWeek currentDay = Timetable.DayOfWeek.values()[now.getDayOfWeek().getValue() - 1];

            List<Timetable> todayClasses = timetableRepository.findByDayOrderByStartTime(currentDay);
            List<Timetable> currentClasses = timetableRepository.findCurrentClasses(currentDay, now);

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("todayClasses", todayClasses);
            dashboard.put("currentClasses", currentClasses);
            dashboard.put("totalClassesToday", todayClasses.size());
            dashboard.put("currentDay", currentDay.name());

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

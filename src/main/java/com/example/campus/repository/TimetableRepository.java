package com.example.campus.repository;

import com.example.campus.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByDayOfWeek(Timetable.DayOfWeek dayOfWeek);
    List<Timetable> findByInstructor(String instructor);
    List<Timetable> findBySubject(String subject);
    
    @Query("SELECT t FROM Timetable t WHERE t.dayOfWeek = :day AND t.startTime <= :currentTime AND t.endTime >= :currentTime")
    List<Timetable> findCurrentClasses(@Param("day") Timetable.DayOfWeek day, @Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT t FROM Timetable t WHERE t.dayOfWeek = :day ORDER BY t.startTime ASC")
    List<Timetable> findByDayOrderByStartTime(@Param("day") Timetable.DayOfWeek day);
}

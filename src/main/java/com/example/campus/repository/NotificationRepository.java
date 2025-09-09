package com.example.campus.repository;

import com.example.campus.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetRole(Notification.TargetRole targetRole);

    List<Notification> findByTargetUserId(Long targetUserId);

    List<Notification> findByIsRead(Boolean isRead);

    @Query("SELECT n FROM Notification n WHERE n.targetRole = :role OR n.targetRole = com.example.campus.entity.Notification.TargetRole.ALL ORDER BY n.createdAt DESC")
    List<Notification> findByTargetRoleOrAll(@Param("role") Notification.TargetRole role);
}

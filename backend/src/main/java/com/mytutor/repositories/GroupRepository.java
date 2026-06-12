package com.mytutor.repositories;

import com.mytutor.model.TutoringGroup;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<TutoringGroup, Long> {
  List<TutoringGroup> findByTutorId(Long tutorId);
}

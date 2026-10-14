package com.loc.smart_home.modules.sensor.repository;

import com.loc.smart_home.modules.sensor.entity.DataSensor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DataSensorRepository
                extends JpaRepository<DataSensor, Long> {

        @EntityGraph(attributePaths = "sensor")
        @Query(value = DataSensorQueries.SEARCH, countQuery = DataSensorQueries.COUNT_SEARCH)
        Page<DataSensor> search(
                        @Param("field") String field,
                        @Param("keywordPattern") String keywordPattern,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTimeExclusive") LocalDateTime endTimeExclusive,
                        Pageable pageable);

        @EntityGraph(attributePaths = "sensor")
        Optional<DataSensor> findFirstBySensor_NameOrderByTimeDescIdDesc(
                        String sensorName);

        @EntityGraph(attributePaths = "sensor")
        @Query(DataSensorQueries.CHART)
        List<DataSensor> findChartData(
                        @Param("type") String type,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        Pageable pageable);
}
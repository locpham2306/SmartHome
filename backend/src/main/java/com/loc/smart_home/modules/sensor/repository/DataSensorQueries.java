package com.loc.smart_home.modules.sensor.repository;

public final class DataSensorQueries {

    private static final String SEARCH_FROM_WHERE = """
            FROM DataSensor ds
            JOIN ds.sensor s
            WHERE (:startTime IS NULL OR ds.time >= :startTime)
              AND (:endTimeExclusive IS NULL OR ds.time < :endTimeExclusive)
              AND (
                  (
                      :field = 'all'
                      AND (
                          :keywordPattern IS NULL
                          OR CAST(ds.id AS String)
                              LIKE :keywordPattern ESCAPE '!'
                          OR FORMAT(ds.time AS 'yyyy-MM-dd HH:mm:ss')
                              LIKE :keywordPattern ESCAPE '!'
                          OR LOWER(s.name)
                              LIKE :keywordPattern ESCAPE '!'
                          OR CAST(ds.value AS String)
                              LIKE :keywordPattern ESCAPE '!'
                      )
                  )
                  OR
                  (
                      :field = 'time'
                      AND (
                          :keywordPattern IS NULL
                          OR FORMAT(ds.time AS 'yyyy-MM-dd HH:mm:ss')
                              LIKE :keywordPattern ESCAPE '!'
                      )
                  )
                  OR
                  (
                      :field IN ('Temperature', 'Humidity', 'Light')
                      AND s.name = :field
                      AND (
                          :keywordPattern IS NULL
                          OR CAST(ds.id AS String)
                              LIKE :keywordPattern ESCAPE '!'
                          OR FORMAT(ds.time AS 'yyyy-MM-dd HH:mm:ss')
                              LIKE :keywordPattern ESCAPE '!'
                          OR CAST(ds.value AS String)
                              LIKE :keywordPattern ESCAPE '!'
                      )
                  )
              )
            """;
    public static final String SEARCH = "SELECT ds " + SEARCH_FROM_WHERE;
    public static final String COUNT_SEARCH = "SELECT COUNT(ds) " + SEARCH_FROM_WHERE;

    public static final String CHART = """
            SELECT ds
             FROM DataSensor ds
             JOIN ds.sensor s
             WHERE s.name = :type
             AND ds.time >= :startTime
             AND ds.time <= :endTime
             ORDER BY ds.time DESC, ds.id DESC
            """;

    private DataSensorQueries() {
    }
}
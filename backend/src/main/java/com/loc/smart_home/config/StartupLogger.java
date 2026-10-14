package com.loc.smart_home.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupLogger {

    private final Environment environment;

    @EventListener(ApplicationReadyEvent.class)
    public void logSwaggerUrl() {
        String port = environment.getProperty(
                "local.server.port", "8080"
        );

        String contextPath = environment.getProperty(
                "server.servlet.context-path", ""
        );

        String swaggerPath = environment.getProperty(
                "springdoc.swagger-ui.path", "/swagger-ui.html"
        );

        log.info(
                "Swagger UI: http://localhost:{}{}{}",
                port,
                contextPath,
                swaggerPath
        );
    }
}
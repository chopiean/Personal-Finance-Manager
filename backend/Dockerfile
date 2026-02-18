# ---- Build stage ----
    FROM maven:3.9-eclipse-temurin-21 AS build
    WORKDIR /app
    
    # Copy pom first for caching
    COPY pom.xml .
    RUN mvn -q -DskipTests dependency:go-offline
    
    # Copy source and build
    COPY src src
    RUN mvn -DskipTests package
    
    # ---- Run stage ----
    FROM eclipse-temurin:21-jre
    WORKDIR /app
    
    COPY --from=build /app/target/*.jar app.jar
    
    ENV PORT=8080
    EXPOSE 8080
    CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
    
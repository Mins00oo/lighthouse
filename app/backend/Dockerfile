# Stage 1: Build
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
COPY src/ src/

RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/build/libs/Lighthouse_BE-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9090

ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", \
  "-Dspring.config.additional-location=optional:file:/app/config/", \
  "-jar", "app.jar"]

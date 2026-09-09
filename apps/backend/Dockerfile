FROM gradle:8.6-jdk17 AS build
WORKDIR /app

COPY gradlew gradle.properties* ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
COPY src ./src

RUN gradle :bootJar --no-daemon -x test

FROM amazoncorretto:17-alpine
WORKDIR /app
VOLUME /tmp

COPY --from=build /app/build/libs/foodme-backend-0.0.1-SNAPSHOT.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

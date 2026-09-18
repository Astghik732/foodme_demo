# Build context is the repository root (see render.yaml: dockerContext: .),
# so the backend image can bundle the built storefront and admin SPAs and serve
# everything from one origin.

# --- Build storefront (React + Vite + TS) ------------------------------------
FROM node:22-alpine AS web
WORKDIR /web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web/ ./
RUN npm run build

# --- Build admin back office (react-admin + Vite) ----------------------------
FROM node:22-alpine AS admin
WORKDIR /admin
COPY apps/admin/package.json apps/admin/package-lock.json ./
RUN npm ci
COPY apps/admin/ ./
RUN npm run build

# --- Build backend (Spring Boot) and bundle the SPAs as static resources -----
FROM gradle:8.6-jdk17 AS build
WORKDIR /app
COPY apps/backend/gradlew apps/backend/gradle.properties* ./
COPY apps/backend/gradle ./gradle
COPY apps/backend/build.gradle apps/backend/settings.gradle ./
COPY apps/backend/src ./src
# Storefront at "/", admin at "/backoffice" (see SpaWebConfig).
COPY --from=web   /web/dist    ./src/main/resources/static/
COPY --from=admin /admin/dist  ./src/main/resources/static/backoffice/
RUN gradle :bootJar --no-daemon -x test

FROM amazoncorretto:17-alpine
WORKDIR /app
VOLUME /tmp

COPY --from=build /app/build/libs/foodme-backend-0.0.1-SNAPSHOT.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

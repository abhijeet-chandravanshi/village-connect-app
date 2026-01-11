# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run with environment variables explicitly passed
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-supabase} -Dspring.datasource.url=${DATABASE_URL} -Dspring.datasource.username=${DATABASE_USERNAME} -Dspring.datasource.password=${DATABASE_PASSWORD} -Djwt.secret=${JWT_SECRET} -Dcors.allowed-origins=${CORS_ALLOWED_ORIGINS} -jar app.jar"]
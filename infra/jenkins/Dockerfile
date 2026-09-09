# FoodMe Jenkins — bakes in JCasC + the plugin list required for the
# foodme-ci pipeline job (see infra/jenkins/jenkins.yaml).
FROM jenkins/jenkins:lts-jdk17

USER root

# Docker CLI so pipeline stages can build/run images against the mounted
# host Docker socket (docker-workflow plugin drives it).
RUN apt-get update \
    && apt-get install -y --no-install-recommends docker.io \
    && rm -rf /var/lib/apt/lists/*

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins

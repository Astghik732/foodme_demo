// FoodMe CI — declarative pipeline mirroring .github/workflows/ci.yml.
// Run by the "foodme-ci" job seeded via infra/jenkins/jenkins.yaml.
pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Backend Build') {
            steps {
                dir('apps/backend') {
                    sh 'chmod +x gradlew'
                    sh './gradlew build'
                }
            }
        }

        stage('Web Build') {
            steps {
                dir('apps/web') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }

        stage('Admin Build') {
            steps {
                dir('apps/admin') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t foodme-backend:ci apps/backend'
                sh 'docker build -t foodme-web:ci apps/web'
                sh 'docker build -t foodme-admin:ci apps/admin'
            }
        }
    }

    post {
        always {
            junit testResults: 'apps/backend/build/test-results/test/*.xml', allowEmptyResults: true
        }
    }
}

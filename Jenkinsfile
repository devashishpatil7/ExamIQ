pipeline {
    agent any

    environment {
        ACR_NAME = "examiqacr123"
        IMAGE_NAME = "examiqacr123.azurecr.io/examiq:v10"
        SONAR_HOST_URL = "http://20.244.30.137:9000"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                    docker run --rm \
                      -v $(pwd):/usr/src \
                      sonarsource/sonar-scanner-cli \
                      -Dsonar.projectKey=examiq \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=$SONAR_HOST_URL \
                      -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                sh '''
                mkdir -p odc-report

                docker run --rm \
                  -v $(pwd):/src \
                  -v owasp-cache:/usr/share/dependency-check/data \
                  owasp/dependency-check \
                  --scan /src \
                  --format HTML \
                  --out /src/odc-report || true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  aquasec/trivy:0.50.0 image \
                  --scanners vuln \
                  --severity HIGH,CRITICAL \
                  $IMAGE_NAME
                '''
            }
        }

        stage('Push to ACR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'acr-creds',
                    usernameVariable: 'ACR_USER',
                    passwordVariable: 'ACR_PASS'
                )]) {
                    sh '''
                    echo $ACR_PASS | docker login $ACR_NAME.azurecr.io -u $ACR_USER --password-stdin
                    docker push $IMAGE_NAME
                    '''
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    export KUBECONFIG=$KUBECONFIG

                    kubectl get nodes
                    kubectl apply -f k8s/ --validate=false

                    kubectl set image deployment/examiq examiq=$IMAGE_NAME || true
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'odc-report/**/*', fingerprint: true, allowEmptyArchive: true
        }
    }
}
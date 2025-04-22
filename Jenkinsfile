pipeline {
    agent any
 
    environment {
        // 镜像名称，根据实际情况替换
        IMAGE_NAME       = "192.168.2.111/green-doctor/qbi-screen"
        REMOTE_HOST      = "192.168.2.105"
        REMOTE_USER      = "v"
        REMOTE_DEPLOY_DIR = "/home/v/projects/2025/sz/qbi/serve/qbi-screen-dev"
        GIT_BRANCH       = "dev"
    }
    //test char  111
    stages {
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'docker login 192.168.2.111 -u $DOCKER_USER -p $DOCKER_PASS'
                }
            }
        }

        stage('Determine Version') {
            steps {
                script {
                    def tag = sh(
                        script: 'git describe --tags --exact-match || echo ""',
                        returnStdout: true
                    ).trim()
                    if (!tag) {
                        tag = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    }
                    env.VERSION = tag
                    echo "Releasing version ${env.VERSION}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${VERSION} ."
                sh "docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:dev-latest"
            }
        }

        stage('Push Docker Image') {
            steps {
                echo "Pushing ${IMAGE_NAME}:${VERSION} and latest"
                sh "docker push ${IMAGE_NAME}:${VERSION}"
                sh "docker push ${IMAGE_NAME}:dev-latest"
            }
        }

        stage('Deploy on Remote Server') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'root109',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        mkdir -p ~/.ssh
                        ssh-keyscan -H ${REMOTE_HOST} >> ~/.ssh/known_hosts
                    '''
                    sh """
                        ssh -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} '
                            cd ${REMOTE_DEPLOY_DIR} &&
                            docker compose pull &&
                            docker compose up -d
                        '
                    """
                }
            }
        }
    }

    post {
        failure {
            emailext(
                subject: "构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "请查看构建详情: ${env.BUILD_URL}",
                to: "vcb5@cornell.edu,2727583568@qq.com"
            )
        }
        success {
            emailext(
                subject: "构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "恭喜！构建成功。详情请点击: ${env.BUILD_URL}",
                to: "vcb5@cornell.edu,2727583568@qq.com"
            )
        }
    }
}

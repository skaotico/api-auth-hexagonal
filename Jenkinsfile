pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    // environment {
    //     IMAGE_NAME = 'api-auth'
    //     NEXUS_REPO = '25.42.51.28:5000/api-auth'
    // }

    stages {
        stage('Clonar repositorio') {
            steps {
                echo 'Limpiando workspace...'
                cleanWs()

                echo "Clonando rama 'develop' desde GitHub..."
                git branch: 'develop',
                    credentialsId: 'github_token',
                    url: 'https://github.com/skaotico/api-auth'

                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    echo "IMAGE_TAG generado: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Instalar dependencias y validar código') {
            steps {
                echo 'Instalando dependencias y ejecutando herramientas de calidad...'
                script {
                    sh 'npm ci'
                    sh 'npx prettier --write .'
                    sh 'npx eslint . --ext .js,.ts || true'
                }
            }
        }

        // stage('Análisis de código con SonarQube') {
        //     environment {
        //         SCANNER_HOME = tool 'SonarScanner'
        //     }
        //     steps {
        //         echo 'Ejecutando SonarQube Scanner...'
        //         withSonarQubeEnv('sonar-dev') {
        //             sh """
        //         ${SCANNER_HOME}/bin/sonar-scanner \
        //         -Dsonar.projectKey=api-auth \
        //         -Dsonar.projectName="TicketMante API Auth" \
        //         -Dsonar.sources=. \
        //         -Dsonar.host.url=${env.SONAR_HOST_URL} \
        //         -Dsonar.login=${env.SONAR_AUTH_TOKEN}
        //     """
        //         }
        //     }
        // }

        // stage('Obtener secretos desde Vault y crear .env') {
        //     steps {
        //         withVault([
        //             vaultSecrets: [
        //                 [
        //                     path: 'secret/back/node/api-auth/dev',
        //                     engineVersion: '2',
        //                     credentialsId: 'skaotico_token_vault',
        //                     secretValues: [
        //                         [envVar: 'PORT', vaultKey: 'PORT'],
        //                         [envVar: 'DB_HOST', vaultKey: 'DB_HOST'],
        //                         [envVar: 'DB_PORT', vaultKey: 'DB_PORT'],
        //                         [envVar: 'DB_USERNAME', vaultKey: 'DB_USERNAME'],
        //                         [envVar: 'DB_PASSWORD', vaultKey: 'DB_PASSWORD'],
        //                         [envVar: 'DB_DATABASE', vaultKey: 'DB_DATABASE'],
        //                         [envVar: 'JWT_SECRET', vaultKey: 'JWT_SECRET'],
        //                         [envVar: 'API_NAME', vaultKey: 'API_NAME'],
        //                         [envVar: 'API_VERSION', vaultKey: 'API_VERSION'],
        //                         [envVar: 'API_DESCRIPTION', vaultKey: 'API_DESCRIPTION'],
        //                         [envVar: 'REDIS_HOST', vaultKey: 'REDIS_HOST'],
        //                         [envVar: 'REDIS_PORT', vaultKey: 'REDIS_PORT'],
        //                         [envVar: 'REDIS_USERNAME', vaultKey: 'REDIS_USERNAME'],
        //                         [envVar: 'REDIS_PASSWORD', vaultKey: 'REDIS_PASSWORD'],
        //                     ]
        //                 ]
        //             ]
        //         ]) {
        //             script {
        //                 def envFileContent = """
        //                 API_NAME=${env.API_NAME}
        //                 API_VERSION=${env.API_VERSION}
        //                 API_DESCRIPTION=${env.API_DESCRIPTION}
        //                 DB_DATABASE=${env.DB_DATABASE}
        //                 DB_HOST=${env.DB_HOST}
        //                 DB_PORT=${env.DB_PORT}
        //                 DB_USERNAME=${env.DB_USERNAME}
        //                 DB_PASSWORD=${env.DB_PASSWORD}
        //                 JWT_SECRET=${env.JWT_SECRET}
        //                 PORT=${env.PORT}
        //                 REDIS_HOST=${env.REDIS_HOST}
        //                 REDIS_PORT=${env.REDIS_PORT}
        //                 REDIS_PASSWORD=${env.REDIS_PASSWORD}
        //                 REDIS_USERNAME=${env.REDIS_USERNAME}
        //                 """.stripIndent()

        //                 writeFile file: '.env.dev', text: envFileContent
        //                 echo 'Archivo .env.dev creado con todos los secretos de Vault'
        //             }
        //         }
        //     }
        // }

        // stage('Construir imagen Docker') {
        //     steps {
        //         echo "Construyendo imagen Docker: ${IMAGE_NAME}:${IMAGE_TAG}"
        //         script {
        //             sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
        //         }
        //     }
        // }

        // stage('Login en Nexus') {
        //     steps {
        //         echo 'Realizando login en Nexus...'
        //         withCredentials([usernamePassword(
        //             credentialsId: 'skaotico-credencial-nexus-admin',
        //             usernameVariable: 'NEXUS_USER',
        //             passwordVariable: 'NEXUS_PASS'
        //         )]) {
        //             sh "docker login http://25.42.51.28:5000 -u ${NEXUS_USER} -p ${NEXUS_PASS}"
        //         }
        //     }
        // }

        // stage('Subir imagen a Nexus') {
        //     steps {
        //         echo 'Etiquetando y subiendo imagen a Nexus...'
        //         script {
        //             sh """
        //                 docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //                 docker push ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //             """
        //         }
        //     }
        // }

        // stage('Desplegar contenedor Docker local') {
        //     steps {
        //         echo 'Desplegando contenedor local...'
        //         script {
        //             sh """
        //                 # Detener y eliminar contenedor previo si existe
        //                 if [ \$(docker ps -q --filter "name=${IMAGE_NAME}") ]; then
        //                     docker stop ${IMAGE_NAME}
        //                 fi
        //                 if [ \$(docker ps -aq --filter "name=${IMAGE_NAME}") ]; then
        //                     docker rm ${IMAGE_NAME}
        //                 fi

        //                 # Descargar nueva imagen y ejecutar contenedor
        //                 docker pull ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //                 docker run -d --name ${IMAGE_NAME} --env-file .env.dev -p 3001:3001 \
        //                     ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //                 docker network connect  ticketmante-backend-net-redis   api-auth || true
        //                 # Conectar contenedor a las redes necesarias
      
        //             """
        //         }
        //     }
        // }
    }

    post {
        success {
            echo 'Pipeline completado exitosamente.'
        }
        failure {
            echo 'Pipeline falló. Revise los registros para más información.'
        }
    }
}

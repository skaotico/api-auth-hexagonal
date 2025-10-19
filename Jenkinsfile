pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    environment {
        IMAGE_NAME = 'api-auth-hex'
    // NEXUS_REPO = '25.42.51.28:5000/api-auth'
    // VAULT_PATH = 'secret/back/node/api-auth/dev'
    }

    stages {
        stage('Clonar repositorio') {
            steps {
                echo 'Limpiando workspace...'
                cleanWs()
                script {
                    git branch: 'develop',
                         credentialsId: 'git-token-skaotico',
                         url: 'https://github.com/skaotico/api-auth-hexagonal'
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
                sh '''
                    npm ci
                    npx prettier --write .
                    npx eslint . --ext .js,.ts || true
                '''
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
        //                 ${SCANNER_HOME}/bin/sonar-scanner \
        //                 -Dsonar.projectKey=api-auth \
        //                 -Dsonar.projectName="TicketMante API Auth" \
        //                 -Dsonar.sources=. \
        //                 -Dsonar.host.url=\${env.SONAR_HOST_URL} \
        //                 -Dsonar.login=\${env.SONAR_AUTH_TOKEN}
        //             """
        //         }
        //     }
        // }

        stage('Obtener secretos desde Vault y crear .env') {
            steps {
                script {
                    // Mapeo de secretos desde Vault a variables de entorno
                    def dbSecrets = [
                [vaultKey: 'host', envVar: 'DB_HOST'],
                [vaultKey: 'port', envVar: 'DB_PORT'],
                [vaultKey: 'username', envVar: 'DB_USERNAME'],
                [vaultKey: 'password', envVar: 'DB_PASSWORD'],
                [vaultKey: 'db_name', envVar: 'DB_DATABASE']
            ]

                    def configSecrets = [
                [vaultKey: 'api_name', envVar: 'API_NAME'],
                [vaultKey: 'api_version', envVar: 'API_VERSION'],
                [vaultKey: 'api_author', envVar: 'API_AUTHOR'],
                [vaultKey: 'api_description', envVar: 'API_DESCRIPTION']
            ]

                    withVault([vaultSecrets: [[
                path: 'local/api_auth/db',
                engineVersion: '2',
                credentialsId: 'skaotico_token_vault',
                secretValues: dbSecrets
            ]]]) {
                        withVault([vaultSecrets: [[
                    path: 'local/api_auth/config',
                    engineVersion: '2',
                    credentialsId: 'skaotico_token_vault',
                    secretValues: configSecrets
                ]]]) {
                            def envFileContent = """\
                        API_NAME=${env.API_NAME}
                        API_VERSION=${env.API_VERSION}
                        API_AUTHOR=${env.API_AUTHOR}
                        API_DESCRIPTION=${env.API_DESCRIPTION}
                        DB_DATABASE=${env.DB_DATABASE}
                        DB_HOST=${env.DB_HOST}
                        DB_PORT=${env.DB_PORT}
                        DB_USERNAME=${env.DB_USERNAME}
                        DB_PASSWORD=${env.DB_PASSWORD}
                    """.stripIndent()

                            writeFile file: '.env.dev', text: envFileContent
                            echo 'Archivo .env.dev creado con todos los secretos de Vault'
                }
            }
                }
            }
        }

        // stage('Construir imagen Docker') {
        //     steps {
        //         echo "Construyendo imagen Docker: ${IMAGE_NAME}:${IMAGE_TAG}"
        //         sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
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
        //             sh "docker login http://${NEXUS_REPO} -u ${NEXUS_USER} -p ${NEXUS_PASS}"
        //         }
        //     }
        // }

        // stage('Subir imagen a Nexus') {
        //     steps {
        //         echo 'Etiquetando y subiendo imagen a Nexus...'
        //         sh """
        //             docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //             docker push ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //         """
        //     }
        // }

        // stage('Desplegar contenedor Docker local') {
        //     steps {
        //         echo 'Desplegando contenedor local...'
        //         sh '''
        //             # Detener y eliminar contenedor previo si existe
        //             if [ \$(docker ps -q --filter "name=${IMAGE_NAME}") ]; then
        //                 docker stop ${IMAGE_NAME}
        //             fi

        //             if [ \$(docker ps -aq --filter "name=${IMAGE_NAME}") ]; then
        //                 docker rm ${IMAGE_NAME}
        //             fi

        //             # Descargar nueva imagen y ejecutar contenedor
        //             docker pull ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
        //             docker run -d --name ${IMAGE_NAME} --env-file .env.dev -p 3001:3001 \
        //                     ${NEXUS_REPO}/${IMAGE_NAME}:${IMAGE_TAG}

    //             docker network connect ticketmante-backend-net-redis api-auth || true
    //         '''
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

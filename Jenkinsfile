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

stage('Obtener secretos desde Vault') {
    steps {
        script {
            // Lista de secretos a obtener de Vault
            def vaultSecrets = [
                [vaultKey: 'API_DESCRIPTION', envVar: 'API_DESCRIPTION'],
                [vaultKey: 'API_NAME', envVar: 'API_NAME'],
                [vaultKey: 'API_VERSION', envVar: 'API_VERSION'],
                [vaultKey: 'API_AUTHOR', envVar: 'API_AUTHOR'],
                [vaultKey: 'DB_HOST', envVar: 'DB_HOST'],
                [vaultKey: 'DB_PORT', envVar: 'DB_PORT'],
                [vaultKey: 'DB_USER', envVar: 'DB_USER'],
                [vaultKey: 'DB_PASS', envVar: 'DB_PASS'],
                [vaultKey: 'DB_NAME', envVar: 'DB_NAME']
            ]

            // Unificamos los paths en un solo withVault
            withVault([
                vaultSecrets: [
                    [
                        path: 'secret/local/api_auth/db',
                        engineVersion: 2,
                        credentialsId: 'skaotico_token_vault',
                        secretValues: vaultSecrets.findAll { it.envVar.startsWith('DB_') } // solo DB_
                    ],
                    [
                        path: 'secret/local/api_auth/config',
                        engineVersion: 2,
                        credentialsId: 'skaotico_token_vault',
                        secretValues: vaultSecrets.findAll { !it.envVar.startsWith('DB_') } // solo API_
                    ]
                ]
            ]) {
                // Generar archivo .env con todas las variables obtenidas
                def envFileContent = """
                API_DESCRIPTION=${env.API_DESCRIPTION}
                API_NAME=${env.API_NAME}
                API_VERSION=${env.API_VERSION}
                API_AUTHOR=${env.API_AUTHOR}
                DB_HOST=${env.DB_HOST}
                DB_PORT=${env.DB_PORT}
                DB_USER=${env.DB_USER}
                DB_PASS=${env.DB_PASS}
                DB_NAME=${env.DB_NAME}
                """.stripIndent()

                writeFile file: '.env', text: envFileContent
                echo ".env generado con éxito:"
                sh 'cat .env'
            }
        }
    }
}
//   stage('Obtener secretos desde Vault') {
//     steps {
//         script {
//             // Lista de secretos a obtener de Vault
//             def vaultSecrets = [
//                 [vaultKey: 'API_DESCRIPTION', envVar: 'API_DESCRIPTION'],
//                 [vaultKey: 'API_NAME', envVar: 'API_NAME'],
//                 [vaultKey: 'API_VERSION', envVar: 'API_VERSION'],
//                 [vaultKey: 'API_AUTHOR', envVar: 'API_AUTHOR'],
//                 [vaultKey: 'DB_HOST', envVar: 'DB_HOST'],
//                 [vaultKey: 'DB_PORT', envVar: 'DB_PORT'],
//                 [vaultKey: 'DB_USER', envVar: 'DB_USER'],
//                 [vaultKey: 'DB_PASS', envVar: 'DB_PASS'],
//                 [vaultKey: 'DB_NAME', envVar: 'DB_NAME']
//             ]

//             // Obtener secretos desde Vault
//             withVault([
//                 vaultSecrets: [[
//                     path: 'secret/local/api_auth/db',    // Path de los secretos de DB
//                     engineVersion: 2,
//                     credentialsId: 'skaotico_token_vault',
//                     secretValues: vaultSecrets.findAll { it.envVar.startsWith('DB_') } // Solo DB_ para este path
//                 ]],
//                 vaultSecrets: [[
//                     path: 'secret/local/api_auth/config', // Path de los secretos de configuración
//                     engineVersion: 2,
//                     credentialsId: 'skaotico_token_vault',
//                     secretValues: vaultSecrets.findAll { !it.envVar.startsWith('DB_') } // Solo API_ para este path
//                 ]]
//             ]) {
//                 // Generar archivo .env con todas las variables obtenidas
//                 def envFileContent = """
//                 API_DESCRIPTION=${env.API_DESCRIPTION}
//                 API_NAME=${env.API_NAME}
//                 API_VERSION=${env.API_VERSION}
//                 API_AUTHOR=${env.API_AUTHOR}
//                 DB_HOST=${env.DB_HOST}
//                 DB_PORT=${env.DB_PORT}
//                 DB_USER=${env.DB_USER}
//                 DB_PASS=${env.DB_PASS}
//                 DB_NAME=${env.DB_NAME}
//                 """.stripIndent()

//                 writeFile file: '.env', text: envFileContent
//                 echo ".env generado con éxito:"
//                 sh 'cat .env'
//             }
//         }
//     }
// }


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

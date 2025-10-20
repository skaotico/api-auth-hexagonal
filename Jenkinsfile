pipeline {
    agent any

    /**
     * Opciones globales del pipeline:
     * - skipDefaultCheckout: evita el checkout automático del repositorio.
     * - disableConcurrentBuilds: evita que se ejecuten builds concurrentes.
     * - buildDiscarder: mantiene solo los últimos 5 builds para ahorrar espacio.
     */
    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    /**
     * Variables de entorno globales:
     * - IMAGE_NAME: nombre base de la imagen Docker que se construirá.
     * - NEXUS_URL: URL base del Nexus Repository Manager.
     * - NEXUS_REPO: nombre del repositorio Docker en Nexus (debe existir previamente).
     * - NEXUS_CREDENTIALS: ID de las credenciales guardadas en Jenkins para Nexus.
     */
    environment {
        IMAGE_NAME = 'api-auth-hex'
        NEXUS_URL = 'nexus_nexus_dev:5000'
        NEXUS_REPO = 'docker-hosted-api-auth'
        NEXUS_CREDENTIALS = 'nexus_credentials'
    }

    stages {

        /**
         * Stage: Clonar repositorio
         * - Limpia el workspace.
         * - Clona el branch 'develop' del repositorio usando credenciales almacenadas en Jenkins.
         * - Genera un tag incremental para Docker basado en el número de build de Jenkins.
         */
        stage('Clonar repositorio') {
            steps {
                echo 'Limpiando workspace'
                cleanWs()

                script {
                    git branch: 'develop',
                        credentialsId: 'git-token-skaotico',
                        url: 'https://github.com/skaotico/api-auth-hexagonal'

                    env.IMAGE_TAG = "${BUILD_NUMBER}"
                    echo "IMAGE_TAG generado: ${env.IMAGE_TAG}"
                }
            }
        }

        /**
         * Stage: Instalar dependencias y validar código
         * - Instala dependencias usando npm ci.
         * - Aplica formateo automático con Prettier.
         * - Ejecuta ESLint para validación de código (no detiene el build si hay errores de lint).
         */
        stage('Instalar dependencias y validar código') {
            steps {
                echo 'Instalando dependencias y validando código'
                sh '''
                    npm ci
                    npx prettier --write .
                    npx eslint . --ext .js,.ts || true
                '''
            }
        }

        /**
         * Stage: Obtener secretos desde Vault
         * - Define los secretos a obtener y los mapea a variables de entorno.
         * - Separa los secretos de base de datos y de configuración.
         * - Genera un archivo .env con los valores obtenidos de Vault.
         */
        stage('Obtener secretos desde Vault') {
            steps {
                script {
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

                    withVault([
                        vaultSecrets: [
                            [
                                path: 'secret/local/api_auth/db',
                                engineVersion: 2,
                                credentialsId: 'skaotico_token_vault',
                                secretValues: vaultSecrets.findAll { it.envVar.startsWith('DB_') }
                            ],
                            [
                                path: 'secret/local/api_auth/config',
                                engineVersion: 2,
                                credentialsId: 'skaotico_token_vault',
                                secretValues: vaultSecrets.findAll { !it.envVar.startsWith('DB_') }
                            ]
                        ]
                    ]) {
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
                        echo '.env generado con éxito'
                        sh 'cat .env'
                    }
                }
            }
        }

        /**
         * Stage: Construir imagen Docker
         * - Construye la imagen Docker usando el nombre base y el tag incremental.
         * - Muestra el tamaño de la imagen generada.
         */
        stage('Construir imagen Docker') {
            steps {
                script {
                    echo "Construyendo imagen Docker: ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "docker images ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        /**
         * Stage: Subir imagen a Nexus
         * - Realiza login en el registro Docker de Nexus usando credenciales almacenadas en Jenkins.
         * - Etiqueta la imagen local con la URL del registro Nexus.
         * - Sube la imagen al repositorio Docker configurado en Nexus.
         */
        stage('Subir imagen a Nexus') {
            steps {
                script {
                    echo "Subiendo imagen ${IMAGE_NAME}:${IMAGE_TAG} a Nexus en ${NEXUS_URL}"

                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}", usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        // Login al registro Nexus
                        sh "docker login -u ${NEXUS_USER} -p ${NEXUS_PASS} ${NEXUS_URL}"

                        // Etiquetar y subir imagen
                        sh """
                            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${NEXUS_URL}/${NEXUS_REPO}:${IMAGE_TAG}
                            docker push ${NEXUS_URL}/${NEXUS_REPO}:${IMAGE_TAG}
                        """

                        // Logout del registro
                        sh "docker logout ${NEXUS_URL}"
                    }
                }
            }
        }

        /**
         * Stage: Ejecutar contenedor local (opcional)
         * - Elimina contenedores anteriores con el mismo nombre si existen.
         * - Ejecuta el contenedor localmente mapeando el puerto 3000.
         */
        stage('Ejecutar contenedor local (opcional)') {
            steps {
                script {
                    echo "Iniciando contenedor local para pruebas"
                    sh """
                        if [ \$(docker ps -aq -f name=${IMAGE_NAME}) ]; then
                            docker rm -f ${IMAGE_NAME}
                        fi
                        docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                    echo "Contenedor ${IMAGE_NAME} corriendo en localhost:3000"
                }
            }
        }
    }

    /**
     * Sección post:
     * - success: mensaje al completar pipeline exitosamente.
     * - failure: mensaje si el pipeline falla.
     */
    post {
        success {
            echo '✅ Pipeline completado exitosamente. Imagen subida a Nexus.'
        }
        failure {
            echo '❌ Pipeline falló. Revise los registros para más información.'
        }
    }
}

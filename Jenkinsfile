pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }
    environment {
        IMAGE_NAME = 'api-auth-hex'
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
    stage('Obtener secretos de Vault dinámicamente') {
    steps {
        script {
            def vaultPaths = [
                'secret/data/local/api_auth/db',
                'secret/data/local/api_auth/config'
            ]
            
            // Usamos la credencial tipo Secret Text para obtener el token
            withCredentials([string(credentialsId: 'skaotico_token_vault_string', variable: 'VAULT_TOKEN')]) {
                
                def envFileContent = ""
                
                vaultPaths.each { vaultPath ->
                    echo "Obteniendo secretos desde ${vaultPath}..."
                    
                    // Llamada a Vault
                    def response = sh(
                        script: "curl -s --header \"X-Vault-Token: ${VAULT_TOKEN}\" http://vault_vault_dev:8200/v1/${vaultPath}",
                        returnStdout: true
                    ).trim()
                    
                    def json = readJSON text: response
                    def secretsMap = json.data.data // KV v2: secretos en data.data
                    
                    // Guardamos cada secreto en env y en contenido para .env
                    secretsMap.each { key, value ->
                        env[key] = value
                        envFileContent += "${key}=${value}\n"
                        echo "Variable ${key} cargada desde ${vaultPath}"
                    }
                }
                
                // Crear archivo .env
                writeFile file: '.env', text: envFileContent
                echo ".env generado con éxito:"
                sh 'cat .env'
            }
        }
    }
}

        stage('Guardar secretos en archivo .env') {
            steps {
                script {
                    def envFile = "${WORKSPACE}/.env"
                    new File(envFile).withWriter('UTF-8') { writer ->
                        env.getEnvironment().each { key, value ->
                            if (value != null && key in ['DB_HOST','DB_PORT','DB_USER','DB_PASSWORD','API_NAME','API_VERSION']) {
                                writer.writeLine("${key}=${value}")
                            }
                        }
                    }
                    echo "Archivo .env generado en: ${envFile}"
                }
            }
        }
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
#!/data/data/com.termux/files/usr/bin/bash

REPO_OWNER="CesarGracia97"
REPO_NAME="proyect-pegasus"
BRANCH="master"
STATE_DIR="$HOME/.pegasus_cd_state"

mkdir -p "$STATE_DIR"

# 1. Mensaje de inicio de ejecución
echo "$(date '+%Y-%m-%d %H:%M:%S') | Ya empezó la ejecución del script"

# Definición de módulos: "Carpeta:Contenedor:Imagen"
MODULES=(
    "audio-video:ps-audvid-bk:cesargracia97/ps-audvid-backend:v1"
    "documents:ps-doc-backend:cesargracia97/ps-doc-backend:v1"
    "nginx-proxy:reverse-proxy:cesargracia97/ps-reverse-proxy:v1"
    "proyect-pegasus:ps-frontend:cesargracia97/pegasus-frontend:v1"
)

# 2. Evaluación de cada proyecto
for ITEM in "${MODULES[@]}"; do
    IFS=":" read -r FOLDER CONTAINER IMAGE <<< "$ITEM"
    STATE_FILE="$STATE_DIR/$FOLDER.sha"

    # Consultar el último commit SHA de la carpeta del proyecto
    COMMIT_API="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits?path=$FOLDER&sha=$BRANCH&per_page=1"
    LATEST_SHA=$(curl -s "$COMMIT_API" | jq -r '.[0].sha // empty')

    if [ -z "$LATEST_SHA" ] || [ "$LATEST_SHA" == "null" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') | Error: No se pudo obtener información del proyecto '$FOLDER'"
        continue
    fi

    # Leer el último SHA desplegado localmente
    LAST_DEPLOYED_SHA=""
    [ -f "$STATE_FILE" ] && LAST_DEPLOYED_SHA=$(cat "$STATE_FILE")

    # Verificar si existen actualizaciones
    if [ "$LATEST_SHA" != "$LAST_DEPLOYED_SHA" ]; then
        # Consultar el estado del Workflow en GitHub Actions
        WORKFLOW_API="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?branch=$BRANCH&per_page=1"
        WORKFLOW_RES=$(curl -s "$WORKFLOW_API")

        WF_STATUS=$(echo "$WORKFLOW_RES" | jq -r '.workflow_runs[0].status // empty')
        WF_CONCLUSION=$(echo "$WORKFLOW_RES" | jq -r '.workflow_runs[0].conclusion // empty')

        # Si el Workflow ya finalizó correctamente
        if [ "$WF_STATUS" == "completed" ] && [ "$WF_CONCLUSION" == "success" ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') | Actualización encontrada en el proyecto '$FOLDER'"
            
            # Proceso de despliegue en udocker
            udocker rm "$CONTAINER" 2>/dev/null
            udocker pull "$IMAGE"
            udocker create --name="$CONTAINER" "$IMAGE"
            udocker setup --execmode=p1 "$CONTAINER"

            # Actualizar el SHA guardado
            echo "$LATEST_SHA" > "$STATE_FILE"
            echo "$(date '+%Y-%m-%d %H:%M:%S') | Proyecto '$FOLDER' actualizado y desplegado correctamente"
        else
            echo "$(date '+%Y-%m-%d %H:%M:%S') | Actualizacion encontrada a la espera del termino del workflow"
        fi
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') | No hay actualziaciones"
    fi
done
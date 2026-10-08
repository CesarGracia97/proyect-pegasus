# 1. Crear carpeta CD
mkdir -p CD

# 2. Crear Motor Principal (cd_engine.sh)
cat << 'EOF' > CD/cd_engine.sh
#!/data/data/com.termux/files/usr/bin/bash

FOLDER="$1"
CONTAINER="$2"
IMAGE="$3"

if [ -z "$FOLDER" ] || [ -z "$CONTAINER" ] || [ -z "$IMAGE" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Uso: $0 <carpeta> <contenedor> <imagen>"
    exit 1
fi

REPO_OWNER="CesarGracia97"
REPO_NAME="proyect-pegasus"
BRANCH="master"
STATE_DIR="$HOME/.pegasus_cd_state"
STATE_FILE="$STATE_DIR/$FOLDER.sha"

mkdir -p "$STATE_DIR"

get_now() {
    date "+%Y-%m-%d %H:%M:%S"
}

echo "$(get_now) | [$FOLDER] Evaluando repositorio..."

COMMIT_API="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits?path=$FOLDER&sha=$BRANCH&per_page=1"
LATEST_SHA=$(curl -s "$COMMIT_API" | jq -r '.[0].sha // empty')

if [ -z "$LATEST_SHA" ] || [ "$LATEST_SHA" == "null" ]; then
    echo "$(get_now) | [$FOLDER] Error al obtener el SHA del repositorio."
    exit 1
fi

LAST_DEPLOYED_SHA=""
[ -f "$STATE_FILE" ] && LAST_DEPLOYED_SHA=$(cat "$STATE_FILE")

if [ "$LATEST_SHA" != "$LAST_DEPLOYED_SHA" ]; then
    echo "$(get_now) | [$FOLDER] Actualización encontrada. Verificando estado del workflow en GitHub..."

    WORKFLOW_API="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?branch=$BRANCH&per_page=1"
    WORKFLOW_RES=$(curl -s "$WORKFLOW_API")

    WF_STATUS=$(echo "$WORKFLOW_RES" | jq -r '.workflow_runs[0].status // empty')
    WF_CONCLUSION=$(echo "$WORKFLOW_RES" | jq -r '.workflow_runs[0].conclusion // empty')

    if [ "$WF_STATUS" == "completed" ] && [ "$WF_CONCLUSION" == "success" ]; then
        echo "$(get_now) | [$FOLDER] Workflow finalizado correctamente. Reemplazando contenedor..."

        udocker rm "$CONTAINER" 2>/dev/null
        udocker pull "$IMAGE"
        udocker create --name="$CONTAINER" "$IMAGE"
        udocker setup --execmode=p1 "$CONTAINER"

        echo "$LATEST_SHA" > "$STATE_FILE"
        echo "$(get_now) | [$FOLDER] Despliegue finalizado con éxito."
    else
        echo "$(get_now) | [$FOLDER] Workflow ocupado o en progreso ($WF_STATUS / $WF_CONCLUSION). Se reintentará en 30 min."
    fi
else
    echo "$(get_now) | [$FOLDER] No hay actualizaciones."
fi
EOF

# 3. Script CD Front
cat << 'EOF' > CD/cd_front.sh
#!/data/data/com.termux/files/usr/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
while true; do
    "$DIR/cd_engine.sh" "proyect-pegasus" "ps-frontend" "cesargracia97/pegasus-frontend:v1"
    sleep 1800
done
EOF

# 4. Script CD Audio/Video
cat << 'EOF' > CD/cd_audvid.sh
#!/data/data/com.termux/files/usr/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
while true; do
    "$DIR/cd_engine.sh" "audio-video" "ps-audvid-bk" "cesargracia97/ps-audvid-backend:v1"
    sleep 1800
done
EOF

# 5. Script CD Documentos
cat << 'EOF' > CD/cd_documents.sh
#!/data/data/com.termux/files/usr/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
while true; do
    "$DIR/cd_engine.sh" "documents" "ps-doc-backend" "cesargracia97/ps-doc-backend:v1"
    sleep 1800
done
EOF

# 6. Script CD Reverse Proxy
cat << 'EOF' > CD/cd_proxy.sh
#!/data/data/com.termux/files/usr/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
while true; do
    "$DIR/cd_engine.sh" "nginx-proxy" "reverse-proxy" "cesargracia97/ps-reverse-proxy:v1"
    sleep 1800
done
EOF

# Asignar permisos de ejecución
chmod +x CD/*.sh
#!/bin/bash

# Couleurs du texte
ROUGE="\e[31m"
VERT="\e[32m"
JAUNE="\e[33m"
BLEU="\e[34m"
MAGENTA="\e[35m"
CYAN="\e[36m"
BLANC="\e[37m"

# Couleurs de fond
FOND_ROUGE="\e[41m"
FOND_VERT="\e[42m"
FOND_JAUNE="\e[43m"
FOND_BLEU="\e[44m"
FOND_MAGENTA="\e[45m"
FOND_CYAN="\e[46m"
FOND_BLANC="\e[47m"

# Fonction pour afficher du texte en couleur
print_colored_text() {
    local text="$1"
    local color="$2"
    echo -e "${color}${text}${BLANC}"
}

# Fonction pour afficher du texte en couleur
print_colored_text_and_background() {
    local text="$1"
    local color="$2"
    local background_color="$3"
    echo -e "${background_color}${color}${text}${BLANC}"
}

########################################################

clear

print_colored_text "\nBuild frontend..." $JAUNE

cd frontend
npm run build

# Go back racine
cd ..

print_colored_text "\nClean backend dist...\n" $JAUNE

rm -r ./backend/dist

print_colored_text "Move frontend dist to backend...\n" $JAUNE

cp -r ./frontend/dist ./backend/dist

print_colored_text "Build finish" $VERT
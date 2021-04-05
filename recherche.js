function commencer() {
    recherche.commencer();
    afficher_recherche(recherche);
}

function reculer() {
    recherche.reculer();
    afficher_recherche(recherche);
}

function avancer() {
    recherche.avancer();
    afficher_recherche(recherche);
}

function terminer() {
    recherche.terminer();
    afficher_recherche(recherche);
}

function changer_algo() {
    titre = document.getElementsByTagName("h1")[0];
    if (fonction_recherche == recherche_horspool) {
        fonction_recherche = recherche_boyermoore;
        titre.innerHTML = "Algorithme de Boyer-Moore (bad char)";
    } else if (fonction_recherche == recherche_boyermoore) {
        fonction_recherche = recherche_naive;
        titre.innerHTML = "Algorithme naïf";
    } else {
        fonction_recherche = recherche_horspool;
        titre.innerHTML = "Algorithme de Horspool";
    }
    update();
}

/***************************/

function afficher_comparaisons(html) {
    document.getElementById("comparaisons").innerHTML = html;
}

function afficher_motif(html) {
    document.getElementById("motif").innerHTML = html;
}

function afficher_phrase(html) {
    document.getElementById("phrase").innerHTML = html;
}

function afficher_recherche(recherche) {
    afficher_comparaisons(recherche.get_comparaisons_html());
    afficher_motif(recherche.get_motif_html());
    afficher_phrase(recherche.get_phrase_html());
}

function afficher_table_decalages(recherche) {
    let decalages = document.getElementById("decalages");
    let translation = recherche.get_decalages();
    decalages.innerHTML = "";
    if ((Object.keys(translation).length == 0) || ("" in translation && translation[""] == 0)) {
        return;
    }
    decalages.innerHTML = "<tr><th id=\"lettre\">lettre</th><th id=\"decalage\">décalage</th></tr>";
    for (let lettre in translation) {
        decalages.innerHTML += "<tr><td>" + (lettre || "autres") + "</td><td>" + translation[lettre] + "</td></tr>";
    }
}

function update() {
    let iphrase = document.getElementById("iphrase");
    let imotif = document.getElementById("imotif");
    let phrase = iphrase.value;
    let motif = imotif.value;
    recherche = new Recherche(motif, phrase, fonction_recherche);
    afficher_table_decalages(recherche);
    afficher_recherche(recherche);
}

/***************************/

function Chaine(chaine, classe="normal") {
    this.caracteres = [];
    for (let i = 0; i < chaine.length; i++) {
        let lettre = chaine[i];
        this.caracteres.push({"caractere":lettre, "classe":classe});
    }
    this.set_classe = function(i=-1, classe="normal") {
        if (0 <= i && i < this.caracteres.length) {
            this.caracteres[i]["classe"] = classe;
        } else {
            for (i = 0; i < this.caracteres.length; i++) {
                this.caracteres[i]["classe"] = classe;
            }
        }
    }
    this.toHTML = function() {
        let html = "";
        let remplacement = {" ":"&nbsp;", "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;"}
        for (let i = 0; i < this.caracteres.length; i++) {
            let lettre = this.caracteres[i]["caractere"];
            lettre = (lettre in remplacement ? remplacement[lettre] : lettre);
            let classe = this.caracteres[i]["classe"];
            let div_index = "<div class=\"index\">" + i + "</div>";
            let div_lettre = "<div class=\"boite " + classe + "\">" + lettre + "</div>";
            let cadre = "<div class=\"cadre\">" + div_index + div_lettre + "</div>";
            html += cadre;
        }
        return html;
    }
}

function Historique(motif, phrase) {
    this.motif = motif;
    this.phrase = phrase;
    this.historique = [{"type":"deplacer", "position":0}];
    this.deplacer = function(index) {
        this.historique.push({"type":"deplacer", "position":index});
    }
    this.comparer = function(motif_index, phrase_index) {
        this.historique.push({"type":"comparer", "mi":motif_index, "pi":phrase_index});
    }
    this.generer_html = function() {
        let phrase_html = [];
        let motif_html = [];
        let comparaisons_html = [];
        let cmotif = new Chaine(this.motif);
        let cphrase = new Chaine(this.phrase);
        let comparaisons = 0;
        let decalage = 0;
        for (let i = 0; i < this.historique.length; i++) {
            let action = this.historique[i];
            switch (action["type"]) {
                case "deplacer":
                    cphrase.set_classe();
                    cmotif.set_classe();
                    decalage = action["position"];
                    break;
                case "comparer":
                    comparaisons++;
                    let mi = action["mi"];
                    let pi = action["pi"];
                    let classe = (this.motif[mi] == this.phrase[pi] ? "egalite" : "difference");
                    cphrase.set_classe(pi, classe);
                    cmotif.set_classe(mi, classe);
                    break;
            }
            cinvisibles = new Chaine("_".repeat(decalage), "invisible");
            phrase_html.push(cphrase.toHTML());
            motif_html.push(cinvisibles.toHTML() + cmotif.toHTML());
            comparaisons_html.push(comparaisons);
        }
        return {"phrase":phrase_html, "motif":motif_html, "comparaisons":comparaisons_html};
    }
}

function Recherche(motif, phrase, algorithme_recherche) {
    let resultat = algorithme_recherche(motif, phrase);
    let html = resultat["historique"].generer_html();
    this.decalages_table = resultat["table"];
    this.comparaisons_html = html["comparaisons"];
    this.motif_html = html["motif"];
    this.phrase_html = html["phrase"];
    this.index = 0;
    this.get_decalages = function() {
        return this.decalages_table;
    }
    this.get_comparaisons_html = function() {
        return this.comparaisons_html[this.index];
    }
    this.get_motif_html = function() {
        return this.motif_html[this.index];
    }
    this.get_phrase_html = function() {
        return this.phrase_html[this.index];
    }
    this.commencer = function() {
        this.index = 0;
    }
    this.reculer = function() {
        this.index -= 1;
        this.index = Math.min(Math.max(this.index, 0), this.phrase_html.length-1);
    }
    this.avancer = function() {
        this.index += 1;
        this.index = Math.min(Math.max(this.index, 0), this.phrase_html.length-1);
    }
    this.terminer = function() {
        this.index = this.phrase_html.length-1;
    }
}

/***************************/

function calculer_decalages(motif) {
    let decalages = {};
    for (let i = 0; i < motif.length-1; i++) {
        let lettre = motif[i];
        decalages[lettre] = motif.length - 1 - i;
    }
    decalages[""] = motif.length;
    return decalages;
}

function recherche_boyermoore(motif, phrase) {
    let decalages = calculer_decalages(motif);
    delete decalages[""];  // supression du décalage par défaut
    let historique = new Historique(motif, phrase);
    let debut = 0;
    while (debut + motif.length <= phrase.length) {
        let trouve = true;
        let k;
        for (k = motif.length - 1; k >= 0; k--) {
            historique.comparer(k, debut + k);
            if (motif[k] != phrase[debut + k]) {
                trouve = false;
                break;   // motif != phrase[debut:fin+1]
            }
        }
        if (trouve) {
            return {"position":debut, "historique":historique, "table":decalages};   // motif == phrase[debut:debut+...]
        }
        let decalage = k + 1;
        let lettre = phrase[debut + k];
        if (lettre in decalages) {
            let posfin = motif.length - 1 - k;
            decalage = decalages[lettre] - posfin;
        }
        debut += Math.max(decalage, 1);
        historique.deplacer(debut);
    }
    return {"position":-1, "historique":historique, "table":decalages};  // motif non trouvé
}

function recherche_horspool(motif, phrase) {
    let decalages = calculer_decalages(motif);
    let historique = new Historique(motif, phrase);
    let i = motif.length - 1;
    while (i < phrase.length) {
        historique.comparer(motif.length-1, i);
        if (phrase[i] == motif[motif.length-1]) {
            let debut = i + 1 - motif.length;
            let trouve = true;
            for (let k = 0; k < motif.length-1; k++) {
                historique.comparer(k, debut+k);
                if (motif[k] != phrase[debut + k]) {
                    trouve = false;
                    break;   // motif != phrase[debut:i+1]
                }
            }
            if (trouve) {
                return {"position":debut, "historique":historique, "table":decalages};   // motif == phrase[debut:i+1]
            }
        }
        i += decalages[phrase[i]] === undefined ? motif.length : decalages[phrase[i]];
        historique.deplacer(i + 1 - motif.length);
    }
    return {"position":-1, "historique":historique, "table":decalages};  // motif non trouvé
}

function recherche_naive(motif, phrase) {
    let historique = new Historique(motif, phrase);
    let debut = 0;
    while (debut + motif.length <= phrase.length) {
        let trouve = true;
        for (let k = 0; k < motif.length; k++) {
            historique.comparer(k, debut+k);
            if (motif[k] != phrase[debut + k]) {
                trouve = false;
                break;   // motif != phrase[debut:i+1]
            }
        }
        if (trouve) {
            return {"position":debut, "historique":historique, "table":{}};  // motif == phrase[debut:...]
        }
        debut += 1;
        historique.deplacer(debut);
    }
    return {"position":-1, "historique":historique, "table":{}};  // motif non trouvé
}

fonction_recherche = recherche_horspool;

recherche = new Recherche("", "", fonction_recherche);
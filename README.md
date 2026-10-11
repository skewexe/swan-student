# Page d'accueil SWAN GMAO Student

Une page statique (HTML, CSS, JavaScript, sans framework ni serveur) : présentation du logiciel, formulaire d'inscription (nom et prénom, e-mail, université, filière, niveau), puis bouton qui **télécharge directement** l'installateur, sans redirection. Tout est gratuit : hébergement, formulaire et fichier.

```
landing/student/
  index.html              la page
  config.js               le seul fichier à modifier (lien de téléchargement, formulaire)
  release-info.js         généré par `pnpm run landing:student` (version, taille, empreinte SHA-256)
  assets/                 styles, script, police Inter hébergée, images
  apps-script/Code.gs     le récepteur du formulaire (Google Sheet), gratuit et illimité
```

Configuration actuelle : l'installateur est publié sur `https://github.com/skewexe/swan-downloads/releases/tag/1.0.0` et les inscriptions partent vers l'application Web Google Apps Script déjà déployée (voir `config.js`). L'université est saisie librement (aucune liste).

## 1. Construire l'installateur et préparer la page

```
pnpm run package:student        # produit release-student/SWAN-GMAO-Student-Setup-1.0.0.exe
pnpm run landing:student        # écrit release-info.js (taille, SHA-256) et indique ce qu'il reste à faire
```

## 2. Héberger l'installateur gratuitement (GitHub Releases)

1. Créez un dépôt GitHub (public) et ouvrez **Releases > Draft a new release**.
2. Étiquette `1.0.0`, déposez `SWAN-GMAO-Student-Setup-1.0.0.exe` (jusqu'à 2 Go par fichier, bande passante gratuite), publiez.
3. Le lien direct est : `https://github.com/<compte>/<dépôt>/releases/download/1.0.0/SWAN-GMAO-Student-Setup-1.0.0.exe`. Mettez-le dans `downloadUrl` de `config.js`.

Le navigateur reste sur votre page : GitHub répond par un fichier à enregistrer, l'étudiant n'est jamais redirigé vers une autre page.

## 3. Recevoir les inscriptions gratuitement (Google Sheet)

1. Créez une feuille Google Sheets (nom libre). **Extensions > Apps Script**, collez le contenu de `apps-script/Code.gs`.
2. (Facultatif) renseignez `NOTIFY_EMAIL` pour recevoir un e-mail par inscription.
3. **Déployer > Nouveau déploiement > Application Web** : exécuter en tant que **Moi**, accès **Tout le monde**. Autorisez l'accès.
4. Copiez l'URL de l'application Web dans `formEndpoint` de `config.js` (laissez `formProvider: "apps-script"`).

Après toute modification du script : **Déployer > Gérer les déploiements > Modifier (crayon) > Version : Nouvelle version > Déployer** (l'URL ne change pas). Chaque inscription ajoute une ligne : date, nom, e-mail, université, filière, niveau. Les données restent dans votre compte Google. Alternatives gratuites déjà gérées : `formProvider: "formspree"` (50 inscriptions par mois) ou `"web3forms"` (250 par mois, envoyées par e-mail).

## 4. Publier la page

Choisissez l'un des hébergeurs gratuits (le dossier `landing/student` est publié tel quel) :

* **GitHub Pages** : dépôt, Settings > Pages, branche et dossier de la page. Adresse `https://<compte>.github.io/<dépôt>/`.
* **Cloudflare Pages** : Workers & Pages > Create > Pages > Upload assets, déposez le dossier. Adresse `*.pages.dev`.
* **Netlify** : app.netlify.com/drop, glissez le dossier.

Un nom de domaine personnalisé est possible sur les trois, mais pas nécessaire.

## 5. Vérifier avant d'annoncer la page

1. Ouvrez la page publiée dans une fenêtre de navigation privée.
2. Remplissez le formulaire avec une adresse de test : une ligne doit apparaître dans la feuille Google.
3. Cliquez sur « Télécharger pour Windows » : le fichier s'enregistre, la page ne change pas.
4. Après chaque reconstruction de l'installateur : relancez `pnpm run landing:student`, remplacez le fichier de la release GitHub (supprimez l'ancien fichier, déposez le nouveau sous le même nom) et republiez la page (le fichier `release-info.js` porte la nouvelle taille et la nouvelle empreinte).

## Notes

* Le formulaire refuse les envois vides, incomplets ou automatiques (champ piège invisible). Tant que `formEndpoint` n'est pas renseigné, un visiteur voit un message honnête au lieu de perdre son inscription (en aperçu local, `localhost`, l'envoi est simplement ignoré).
* L'installateur n'est pas encore signé numériquement : Windows SmartScreen demande une confirmation au premier lancement, la FAQ de la page l'explique. Un certificat de signature (payant) supprime cet avertissement.
* Les captures d'écran de `assets/img` sont celles du logiciel réel. Pour les refaire : `node tests/ui-crawl.mjs student` puis copier les images voulues.

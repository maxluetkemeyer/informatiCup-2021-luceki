![](https://raw.githubusercontent.com/maxluetkemeyer/luceki_theorie/main/logo.png?token=AFPOOFKZLG6J3FHYGTPZXG3ABWLA2)
# informatiCuo 2021 Team luceki - Handbuch

## Inhaltsverzeichnis
[docker verwenden](#docker-verwenden)
* [Vorgefertigtes Image verwenden](#vorgefertigtes-image-verwenden)
* [Build](#build)
* [Run](#run)

[Manuelle Installation (Mehr Features)](#Manuelle-Installation-(Mehr-Features))
* [Build Project](#build-project)
* [Start](#start)

[Benutzung](#benutzung)

[Troubleshooting](#troubleshooting)

## docker verwenden
### Vorgefertigtes Image verwenden
```
docker pull TODO ÄNDERN
docker tag TODO ÄNDERN luceki
```

### Build
```
docker build --tag luceki .
```

### Run
```
docker run -d -p <YOUR_PORT>:443 -e URL="<game server url>" -e KEY="<your API key>" -e TIME_URL "<time server url>" luceki
```

#### Default Werte
* URL="wss://msoll.de/spe_ed"
* TIME_URL="https://msoll.de/spe_ed_time"


## Manuelle Installation (Mehr Features)
Verwendung des eigenen Testservers und Trainieren der KI (Achtung: nicht alle KI Modelle im Repository, da sie zu groß sind)
Installiere [nodejs v14 (LTS)](https://nodejs.org/en/download/) und [python2](https://www.python.org/downloads/)

Stell sicher, dass du yarn installiert hast:
```
yarn --version
1.22.10	
```

### Build Project
Installiere Abhängigkeiten
```
npm i
```
Projekt bauen
```
yarn build
```
### Start 
Starte den Server
```
yarn start --key="<YOUR_API_KEY>"
```

Der Server erstellt zwei Webserver (http & https) an den Ports 80 und 443. Wird ein spezieller Port angegeben, wird nur der https-Server gestartet.
| Argument  | Typ  |  Defautlt Wert  | Beschreibung
| :------------ | :------------ | :------------ | :------------ |
| --url  |  string | "wss://msoll.de/spe_ed"  | Spielserver Url
| --key  | string  | "keinKey"  | Api Key
| --timeUrl  | string  | "htpps://msoll.de/spe_ed_time"  | Zeit Server Url
| --clientPort  | int  | 443  | Port, auf dem das Monitoring zu erreichen sein soll
| --test  | int  | 0  | 0: Normal, kein Test 1: Test an
| --autoStart  | string  | "no"  | Soll direkt mit einer spiziellen Taktik gestartet werden? (Bisher nur verfügbar "dontHit")


## Benutzung
Öffne den Browser und navigiere zu [https://localhost/](https://localhost/).

Wenn du einen anderen Port verwendet hast, navigiere zu https://localhost:YOUR_PORT

Für eine genaue Beschreibung aller Knöpfe und Inhalte der Seiten, siehe Kapitel 5.3 der theoretischen Ausarbeitung.

## Analyse 

Zur Analyse der Einträge der Datenbank nutze
```
yarn analysis
```
## Troubleshooting
Für die Nutzung von tensorflow.js wird eine Linux Distribution benötigt. Das ist als Erweiterung zu verstehen. Alles restliche funktioniert unter Windows und OSX. 

Bei auftretenden Fehlern installiere python2 und python3 via
```
python --version
Python 2.7.18
```
und
```
python3 --version
Python 3.8.6
```
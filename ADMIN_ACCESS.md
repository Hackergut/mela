# Accesso all'Admin Panel — TechMania

_Il pannello amministrativo è raggiungibile all'indirizzo **`/admin`** del sito pubblicato (es. `https://tua-app.base44.app/admin`)._

## Come funziona l'accesso

Il pannello **non** usa il login utente del negozio: è protetto da una **password condivisa** verificata server-side dalla funzione `admin-cms` contro i secret di runtime di Base44.

| Secret | Ruolo | Cosa permette |
|---|---|---|
| `ADMIN_PASSWORD` | **admin** | Tutto il gestionale: prodotti, varianti, ordini, sconti, clienti, inventario, notifiche, Shopify |
| `SUPER_ADMIN_PASSWORD` | **super admin** | Come admin **più** i settaggi principali del CMS (nome negozio, valuta, spedizioni) e i segreti |

> Se `SUPER_ADMIN_PASSWORD` non è impostato, ogni admin può gestire anche i settaggi. Impostalo sempre in produzione.

La password resta in `sessionStorage` solo per la durata della sessione del browser (chiusa la scheda, serve rieffettuare il login).

## Reimpostare la password (se non la conosci o l'hai persa)

La password **non è nel codice e nessuno può recuperarla**: è memorizzata come secret sul a piattaforma Base44. Si può solo **sovrascrivere** con una nuova.

### Opzione A — dal Builder Base44 (consigliata)

1. Apri il progetto su [Base44](https://base44.com) nel Builder.
2. Vai in **Impostazioni → Secrets** (Settings → Secrets).
3. Crea o sovrascrivi:
   - `ADMIN_PASSWORD` = nuova password operativa
   - `SUPER_ADMIN_PASSWORD` = password del super admin
4. Salva: **le funzioni che usano il secret vengono ridistribuite automaticamente** con il nuovo valore.
5. Apri `https://tuo-dominio/admin` ed effettua il login con la nuova password.

### Opzione B — dalla CLI Base44

```bash
npm install -g base44@latest   # una volta sola
base44 login                   # autenticazione a Base44
cd cartella/del/progetto
base44 link                    # solo la prima volta, per collegare il repo al progetto

# Imposta (o sovrascrive) le password — l'impostazione ridistribuisce le funzioni
base44 secrets set ADMIN_PASSWORD='tua-password-operativa'
base44 secrets set SUPER_ADMIN_PASSWORD='password-super-admin'

base44 secrets list            # verifica che i secret esistano (i valori sono mascherati)
```

### Scegliere una password robusta

È un segreto condiviso: usa una **passphrase lunga e casuale** (es. 4–6 parole o 20+ caratteri generati da un password manager). Gli utenti del negozio non la conoscono, ma chi la possiede ha pieno controllo del catalogo.

## Protezioni attive sul login

- **Rate limiting**: dopo **5 tentativi falliti** dalla stessa IP l'accesso è bloccato per **10 minuti** (HTTP 429). Il blocco si azzera con un login riuscito. Vale anche sulla funzione `shopify-sync`.
- **Confronto a tempo costante**: il server confronta la password senza leak di timing.
- **Segreti mai esposti**: le password vivono solo nei secret di runtime; il token Shopify non viene mai restituito al browser.

## Risoluzione problemi

| Messaggio | Cosa significa | Cosa fare |
|---|---|---|
| «Password non valida» | Secret impostato ma password errata | Controlla maiuscole/spazi; se persa, reimpostala (sopra) |
| «Accesso admin non configurato…» (503) | Nessun secret `ADMIN_PASSWORD`/`SUPER_ADMIN_PASSWORD` impostato | Imposta i secret come da Opzione A/B, poi riprova |
| «Troppi tentativi falliti…» (429) | Rate limiting attivo sulla tua IP | Attendi il tempo indicato (max 10 minuti) |
| «Base44 non è configurato per questa anteprima» | Stai vedendo una preview standalone senza backend | Avvia con `base44 dev` oppure imposta `VITE_BASE44_APP_ID` |

## Sviluppo in locale

```bash
base44 dev    # backend Base44 locale + frontend (usa la config in base44/config.jsonc)
```

In locale i secret della preview si impostano con `base44 secrets set` come in produzione; per lavorare solo sul frontend contro il backend remoto basta `npm run dev`.

## Roadmap sicurezza (dal report di audit)

La migrazione verso **identità Base44 con ruoli per utente e sessioni revocabili** resta la soluzione target al posto della password condivisa (vedi `AUDIT_REPORT.md`, priorità alta #1). Il rate limiting introdotto è la mitigazione interim.

# Sprint Plán: iCAMERA Desktop Stack (Real-Time Deepfake)

Tento dokument slouží jako detailní plán pro budoucí sprint, jehož cílem je **implementace real-time deepfake videa s voice changerem** pro multi-platformní streamování. Dokument vychází z dodané iCAMERA architektury a je připraven k nasazení na dedikovaném Windows hardwaru s NVIDIA GPU.

---

## 🎯 Cíle Sprintu
1. **Zprovoznit lokální deepfake pipeline** na Windows 10/11 (kamera -> Deep-Live-Cam -> OBS).
2. **Implementovat Voice Changer** (mikrofon -> Voice.ai -> OBS).
3. **Nastavit OBS Studio** pro sloučení vrstev (Video + Audio + Proudy.tv Chat Overlay).
4. **Zajistit Multistreaming & Geo-blocking** přes Restream.io (Twitch, YouTube a vlastní Proudy.tv RTMP) včetně blokace českých IP.

---

## 🛠 Hardwarové Požadavky
- **OS:** Windows 10 / 11
- **GPU:** NVIDIA RTX 3060 Ti / RTX 4070 (min. 8GB VRAM)
- **CPU:** Ryzen 5 5600X / i7-12700K
- **RAM:** 16GB DDR4
- **Periferie:** Webkamera (např. Logitech C920), Mikrofon (Rode Wireless)

---

## 📦 Fáze Implementace

### Fáze 1: Příprava Prostředí (Windows)
- [ ] Instalace Python 3.10
- [ ] Instalace NVIDIA CUDA Toolkit 12.1
- [ ] Instalace cuDNN v8.x a přidání do systémové proměnné `PATH`

### Fáze 2: Zprovoznění Deep-Live-Cam
GPU-akcelerovaný real-time face swap pomocí InsightFace / WAN modelu.
- [ ] Naklonování repozitáře `hacksider/deep-live-cam`.
- [ ] Vytvoření Python virtuálního prostředí (`python -m venv venv`).
- [ ] Instalace závislostí (`pip install -r requirements.txt`).
- [ ] Stažení modelů (spuštění `scripts/download_models.py`).
- [ ] Konfigurace spouštění na nejrychlejší model (`insightface_2023d1`) s cílovou latencí pod 50ms.
- [ ] **Výstup:** Nastavení výstupu jako virtuální webkameru.

### Fáze 3: Audio a Voice.ai
Transformace hlasu v reálném čase.
- [ ] Instalace desktopové aplikace Voice.ai.
- [ ] Vytvoření virtuálního audio zařízení (VB-Audio Virtual Cable).
- [ ] Nastavení "Robot" nebo "Feminine" presetu v aplikaci.
- [ ] Ošetření latence (cíl pod 50ms) případným vypnutím echo cancellation.

### Fáze 4: Integrace do OBS Studia
Složení všech prvků do finálního obrazu a zvuku.
- [ ] Přidání zdroje videa z "Deep-Live-Cam VirtualCam".
- [ ] Přidání zdroje audia z "Voice.ai Virtual Audio Device" s příslušnými filtry (Noise Gate -40dB, Compressor 4:1, Limiter -3dB).
- [ ] Přidání Browser source vrstev (Chat Overlay z Proudy.tv `http://localhost:3000/chat-overlay`, Alerty Streamlabs, atd.).
- [ ] Zapnutí GPU enkódování (NVIDIA NVENC, 6000 kbps, 1080p60).

### Fáze 5: Nastavení Restream.io a Proudy.tv (Multistreaming)
- [ ] Propojení Restream s účty na YouTube a Twitch.
- [ ] **Propojení s Proudy.tv:** Přidání "Custom RTMP" zdroje s adresou Proudy.tv serveru (např. `rtmp://[proudy.tv-ip]/live/KLIC`).
- [ ] Nastavení **Geo-blockingu**: Využití Restream API pro blokaci IP adres z CZ, nebo implementace vlastního Python pluginu `obs_geo_blocker.py` přímo v OBS.

---

## ⚖️ Právní a Etické Pokyny (Checklist před spuštěním)
> **POZOR:** Před ostrým spuštěním streamu musí streamer splnit tyto podmínky:
- [ ] **Disclaimer:** Na obrazovce musí být viditelný vodoznak nebo titulek "⚠️ DEEPFAKE VIDEO - Entertainment Only".
- [ ] **Popis:** V informacích o streamu text "This stream uses AI-generated deepfake technology".
- [ ] **Autorská práva:** Použití pouze schválených tváří a royalty-free hudby.
- [ ] **Odpovědnost:** Dodržování Twitch/YouTube ToS, žádná manipulace či podvody.

---

## 🚀 Příklad Ostrého Workflow (Checklist na den streamu)
1. `09:00` Spustit Deep-Live-Cam a nechat ~30s na inicializaci modelů do VRAM.
2. `09:05` Spustit Voice.ai a ověřit mikrofon.
3. `09:10` Otevřít OBS Studio a zkontrolovat synchronizaci zvuku a obrazu v náhledu.
4. `09:15` Spustit vysílání směrem do Restream.io a na Custom RTMP (Proudy.tv).
5. `09:16` Kontrola, že stream správně propadává na YouTube, Twitch a Proudy.tv web.

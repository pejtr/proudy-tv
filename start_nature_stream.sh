#!/bin/bash
# PROUDY.TV - 24/7 Nature Stream Loop Script
#
# Tento skript vezme lokální video soubor (nebo URL IP kamery) a vysílá jej nekonečně (24/7)
# do vašeho lokálního PROUDY.TV serveru na portu 1935.
#
# POUŽITÍ:
# 1. Běžte do administrace na http://localhost:3000/dashboard
# 2. Zkopírujte si váš Stream Key (např. justine-cqnw5)
# 3. Spusťte tento skript s vaším klíčem a případně cestou k videu
#
# PŘÍKLAD (Vysílání záznamu dokola):
#   ./start_nature_stream.sh justine-cqnw5 /Users/petrmatej/Downloads/priroda_zaznam.mp4
#
# PŘÍKLAD (Vysílání z IP kamery na Bali):
#   ./start_nature_stream.sh justine-cqnw5 rtsp://admin:heslo@192.168.1.100/stream

STREAM_KEY=$1
SOURCE_VIDEO=$2

if [ -z "$STREAM_KEY" ]; then
    echo "❌ Chyba: Musíte zadat Stream Key!"
    echo "Příklad: ./start_nature_stream.sh muj-stream-klic /cesta/k/videu.mp4"
    exit 1
fi

if [ -z "$SOURCE_VIDEO" ]; then
    echo "⚠️ Nebylo zadáno zdrojové video, použiji defaultní testovací video MUX..."
    SOURCE_VIDEO="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/xtPOmZSEpelIfxrc.mp4"
fi

echo "🎬 Startuji nekonečný stream pro klíč: $STREAM_KEY"
echo "📹 Zdrojové video: $SOURCE_VIDEO"
echo "Před ukončením stiskněte CTRL+C."
echo "--------------------------------------------------------"

# Pokud je to IP kamera (začíná na rtsp:// nebo http://), nepotřebujeme loop
if [[ "$SOURCE_VIDEO" == rtsp://* ]] || [[ "$SOURCE_VIDEO" == http* ]]; then
  ffmpeg -re -i "$SOURCE_VIDEO" -c:v copy -c:a copy -f flv rtmp://localhost:1935/live/$STREAM_KEY
else
  # Lokální soubor nebo záznam přehráváme dokola s -stream_loop -1
  ffmpeg -re -stream_loop -1 -i "$SOURCE_VIDEO" -c:v copy -c:a copy -f flv rtmp://localhost:1935/live/$STREAM_KEY
fi

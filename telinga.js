// telinga.js - Telinga Manusia, Yang Terakhir Yang Benar
let recognition = null;
let micNyala = false;
let antrianTerakhir = "";
let timerJawab = null;
let sedangNgomong = false;
const WAKTU_TUNGGU = 1500;

function buatTelinga() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Pakai Chrome ya Bos"); return null; }
    const rec = new SpeechRecognition();
    rec.lang = "id-ID";
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = function(event) {
        if (sedangNgomong) return;
        const hasilBaru = event.results[event.results.length - 1][0].transcript.trim();
        if (!hasilBaru) return;
        // SISTEM ANTRIAN: Ada yang baru, buang yang lama
        antrianTerakhir = hasilBaru;
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.innerText = "Dengar: " + antrianTerakhir + " (tunggu...)";
        if (timerJawab) clearTimeout(timerJawab);
        timerJawab = setTimeout(() => {
            if (antrianTerakhir !== "") {
                const yangBenar = antrianTerakhir;
                antrianTerakhir = "";
                kirimKeOtak(yangBenar);
            }
        }, WAKTU_TUNGGU);
    };

    rec.onend = function() {
        if (micNyala && !sedangNgomong) { try { rec.start(); } catch(e) {} }
    };
    rec.onerror = function(e) {
        if (e.error === "not-allowed") { micNyala = false; updateTombolMic(); }
    };
    return rec;
}

function tekanMic() {
    if (!recognition) recognition = buatTelinga();
    if (!recognition) return;
    if (!micNyala) {
        micNyala = true;
        antrianTerakhir = "";
        try { recognition.start(); } catch(e) {}
        updateTombolMic();
        document.getElementById("status").innerText = "Lagi dengerin Bos...";
    } else {
        micNyala = false;
        if (timerJawab) clearTimeout(timerJawab);
        antrianTerakhir = "";
        try { recognition.stop(); } catch(e) {}
        updateTombolMic();
        document.getElementById("status").innerText = "Mic mati";
    }
}

function updateTombolMic() {
    const btn = document.getElementById("btnMic");
    if (btn) {
        btn.innerText = micNyala ? "🔴 Matikan Mic" : "🎤 Nyalakan Mic";
        btn.style.background = micNyala ? "#ff4444" : "#00c853";
    }
}

function kirimKeOtak(teks) {
    document.getElementById("status").innerText = "Mavix mikir: " + teks;
    if (typeof jawabOtak === "function") { jawabOtak(teks); }
    else if (typeof prosesPerintah === "function") { prosesPerintah(teks); }
    else { bicara("Saya dengar Bos bilang: " + teks); }
}

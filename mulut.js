// mulut.js
let suaraTerpilih = null;
function siapkanSuara() {
    const list = window.speechSynthesis.getVoices();
    suaraTerpilih = list.find(v => v.lang === "id-ID") || list.find(v => v.lang.startsWith("id")) || list[0];
}
window.speechSynthesis.onvoiceschanged = siapkanSuara;
siapkanSuara();

function bicara(teks) {
    sedangNgomong = true;
    antrianTerakhir = "";
    if (timerJawab) clearTimeout(timerJawab);
    if (recognition && micNyala) { try { recognition.stop(); } catch(e) {} }
    document.getElementById("status").innerText = "Mavix lagi ngomong... Mic diam";
    window.speechSynthesis.cancel();
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = "id-ID";
    ucapan.rate = 1.0;
    ucapan.pitch = 1.0;
    if (suaraTerpilih) ucapan.voice = suaraTerpilih;
    ucapan.onend = function() {
        sedangNgomong = false;
        document.getElementById("status").innerText = "Lagi dengerin Bos...";
        if (micNyala && recognition) { try { recognition.start(); } catch(e) {} }
    };
    ucapan.onerror = function() {
        sedangNgomong = false;
        if (micNyala && recognition) { try { recognition.start(); } catch(e) {} }
    };
    window.speechSynthesis.speak(ucapan);
}

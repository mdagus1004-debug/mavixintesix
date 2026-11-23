<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>MAVIX - Mode Suara</title>
<style>
  *{ box-sizing:border-box; margin:0; padding:0; }
  body{ font-family: system-ui, -apple-system, sans-serif; background:#0f172a; color:#fff; height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; text-align:center; }
  .judul{ font-size:28px; letter-spacing:4px; font-weight:800; }
  .kecil{ font-size:13px; color:#94a3b8; margin-top:4px; }
  #gelombang{ width:150px; height:150px; border-radius:50%; background:#1e293b; margin:28px 0; display:flex; align-items:center; justify-content:center; font-size:60px; transition:transform .2s; border:3px solid #334155; }
  #gelombang.ngomong{ transform:scale(1.12); background:#2563eb; border-color:#60a5fa; }
  #gelombang.dengar{ background:#dc2626; border-color:#f87171; }
  #statusSuara{ font-size:15px; color:#e2e8f0; min-height:44px; line-height:1.5; padding:0 10px; }
  #teksTerakhir{ font-size:13px; color:#94a3b8; margin-top:10px; min-height:20px; }
  .tombol-besar{ width:100%; max-width:320px; :16px; border-radius:16px; border:none; font-size:17px; font-weight:700; margin-top:18px; }
  #micBtn{ background:#2563eb; color:#fff; }
  #micBtn.aktif{ background:#dc2626; }
  #stopBtn{ background:#334155; color:#fff; }
  .mode{ display:flex; gap:8px; width:100%; max-width:320px; margin-top:16px; }
  .mode button{ flex:1; padding:11px; border-radius:12px; :1px solid #334155; background:#1e293b; color:#cbd5e1; }
  .mode button.aktif{ background:#2563eb; color:#fff; border-color:#2563eb; }
  .pindah{ margin-top:18px; color:#60a5fa; font-size:13px; text-decoration:none; }
  #input{ display:none; }
  #chat{ display:none; }
  #status{ display:none; }
  #kirimBtn{ display:none; }
</style>
</head>
<body>
<div class="judul">MAVIX</div>
<div class="kecil">Mode Suara Penuh</div>

<div id="gelombang">🎤</div>
<div id="statusSuara">Siap Bos. Tekan tombol bawah, lalu bicara.</div>
<div id="teksTerakhir"></div>

<button id="micBtn" class="tombol-besar">🎤 TEKAN UNTUK BICARA</button>
<button id="stopBtn" class="tombol-besar" onclick="berhentiSemua()">⏹ BERHENTI</button>

<div class="mode">
  <button id="modeNgobrol" class="aktif" onclick="gantiMode('NGOBROL')">NGOBROL</button>
  <button id="modeBaca" onclick="gantiMode('BACA')">BACA</button>
</div>

<a class="pindah" href="index.html">← Kembali ke Mode Ketik</a>
<input id="input" type="text">
<div id="chat"></div>
<div id="status"></div>
<button id="kirimBtn"></button>

<script src="otak-ingatan.js"></script>
<script src="otak-kecil.js"></script>
<script src="otak-tengah.js"></script>
<script src="mulut.js"></script>
<script src="telinga.js"></script>
<script src="otak-depan.js"></script>
<script>
  window.modeMavix = "NGOBROL";
  function gantiMode(mode){
    window.modeMavix = mode;
    document.getElementById('modeNgobrol').classList.toggle('aktif', mode === 'NGOBROL');
    document.getElementById('modeBaca').classList.toggle('aktif', mode === 'BACA');
  }
  // Untuk halaman suara, tambah hanya tampilkan teks terakhir, bukan list chat
  function tambah(siapa, teks){
    const el = document.getElementById('teksTerakhir');
    if(el) el.innerText = (siapa === 'user' ? 'Bos: ' : 'Mavix: ') + teks;
    // Simpan juga ke status, supaya Bos lihat
    const s = document.getElementById('statusSuara');
    if(s && siapa === 'mavix') s.innerText = teks;
  }
  window.tambah = tambah;
  function berhentiSemua(){
    if(window.stopMulut) window.stopMulut();
    if(window.hentikanDengar) window.hentikanDengar(true);
    document.getElementById('statusSuara').innerText = "Baik Bos, saya diam.";
    document.getElementById('gelombang').classList.remove('ngomong');
    document.getElementById('gelombang').classList.remove('dengar');
  }
  // Gelombang mulut: nyala waktu Mavix ngomong
  document.addEventListener('mavix-mulai-ngomong', () => {
    document.getElementById('gelombang').classList.add('ngomong');
    document.getElementById('gelombang').innerText = '🔊';
  });
  document.addEventListener('mavix-selesai-ngomong', () => {
    document.getElementById('gelombang').classList.remove('ngomong');
    document.getElementById('gelombang').innerText = '🎤';
  });
  // Ubah tombol mic, supaya jelas sedang dengar atau tidak
  const micAsli = document.getElementById('micBtn');
  // Mic asli di telinga.js pakai id micBtn, jadi kita pakai tombol yang sama
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('statusSuara').innerText = "Halo Bos, saya MAVIX. Tekan tombol biru, lalu bicara.";
    }, 300);
  });
</script>
</body>
</html>

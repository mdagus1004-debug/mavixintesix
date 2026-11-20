// ===== MULUT - PROXY SUARA GADIS KE MICROSOFT =====
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', (client, req) => {
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('ConnectionId') || 'id';
  let antrian = [];
  let edgeBuka = false;
  const edge = new WebSocket('wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB9E23DCC4F7E9424&ConnectionId=' + id, {
    headers: { 'Origin': 'https://azure.microsoft.com', 'User-Agent': 'Mozilla/5.0' }
  });
  client.on('message', (m) => {
    if(edgeBuka){ try{ edge.send(m); }catch(e){} }
    else antrian.push(m);
  });
  edge.on('open', () => {
    edgeBuka = true;
    for(let m of antrian){ try{ edge.send(m); }catch(e){} }
    antrian = [];
  });
  edge.on('message', (m) => { try{ client.send(m); }catch(e){} });
  edge.on('error', (e) => { console.log("EDGE ERROR:", e.message); });
  edge.on('close', () => { try{ client.close(); }catch(e){} });
  client.on('close', () => { try{ edge.close(); }catch(e){} });
  client.on('error', ()=>{});
});

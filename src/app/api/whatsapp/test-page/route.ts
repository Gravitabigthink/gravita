import { NextResponse } from 'next/server';

export async function GET() {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp Test</title>
    <style>
        body { font-family: Arial; padding: 40px; background: #1a1a2e; color: white; }
        button { padding: 15px 30px; font-size: 18px; cursor: pointer; background: #25D366; color: white; border: none; border-radius: 8px; margin: 10px; }
        button:hover { background: #128C7E; }
        #result { margin-top: 20px; padding: 20px; background: #16213e; border-radius: 8px; white-space: pre-wrap; }
        h1 { color: #25D366; }
    </style>
</head>
<body>
    <h1>🧪 WhatsApp Test</h1>
    <p>Haz clic en el botón para enviar un mensaje de prueba a tu número:</p>
    <button onclick="sendTest()">📤 Enviar Mensaje de Prueba</button>
    <button onclick="checkConfig()">🔍 Verificar Configuración</button>
    <div id="result">Los resultados aparecerán aquí...</div>
    
    <script>
        async function sendTest() {
            document.getElementById('result').innerText = 'Enviando...';
            try {
                const res = await fetch('/api/whatsapp/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ testPhone: '524921243272' })
                });
                const data = await res.json();
                document.getElementById('result').innerText = JSON.stringify(data, null, 2);
            } catch (e) {
                document.getElementById('result').innerText = 'Error: ' + e.message;
            }
        }
        
        async function checkConfig() {
            document.getElementById('result').innerText = 'Verificando...';
            try {
                const res = await fetch('/api/whatsapp/test');
                const data = await res.json();
                document.getElementById('result').innerText = JSON.stringify(data, null, 2);
            } catch (e) {
                document.getElementById('result').innerText = 'Error: ' + e.message;
            }
        }
    </script>
</body>
</html>
    `;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

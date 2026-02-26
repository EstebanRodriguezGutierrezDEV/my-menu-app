import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const generateShoppingListPDF = async (items) => {
  if (!items || items.length === 0) {
    Alert.alert("Lista vacía", "No hay elementos para generar el PDF.");
    return false;
  }

  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #F0F4F8;
            padding: 36px 32px;
            color: #1a1a2e;
          }
          .header {
            background: linear-gradient(135deg, #0057A8 0%, #0078D4 55%, #4DA6FF 100%);
            border-radius: 20px;
            padding: 28px 32px;
            margin-bottom: 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .header-left { display: flex; align-items: center; gap: 16px; }
          .header-icon { font-size: 44px; line-height: 1; }
          .header-text h1 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 4px; letter-spacing: -0.3px; }
          .header-text p { font-size: 13px; color: rgba(255,255,255,0.72); text-transform: capitalize; }
          .header-badge {
            background: rgba(255,255,255,0.18);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 14px;
            padding: 10px 18px;
            text-align: center;
          }
          .badge-num { font-size: 26px; font-weight: 900; color: #fff; line-height: 1; }
          .badge-label { font-size: 10px; color: rgba(255,255,255,0.72); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
          .intro {
            background: #fff;
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 22px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid #0078D4;
          }
          .intro p { font-size: 13px; color: #555; line-height: 1.5; }
          .intro strong { color: #0078D4; }
          .table {
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 16px rgba(0,0,0,0.07);
            margin-bottom: 28px;
          }
          .table-head {
            background: #0078D4;
            display: grid;
            grid-template-columns: 44px 1fr 72px;
            padding: 12px 18px;
            gap: 12px;
          }
          .table-head span { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.82); text-transform: uppercase; letter-spacing: 1px; }
          .table-head .center { text-align: center; }
          .row {
            display: grid;
            grid-template-columns: 44px 1fr 72px;
            padding: 13px 18px;
            gap: 12px;
            align-items: center;
            border-bottom: 1px solid #f0f0f0;
          }
          .row:last-child { border-bottom: none; }
          .row.alt { background: #F5F9FF; }
          .row-num {
            width: 26px; height: 26px;
            background: #EBF4FF;
            border-radius: 7px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 12px; color: #0078D4;
          }
          .row-name { font-size: 15px; font-weight: 600; color: #1a1a2e; }
          .cb-wrap { display: flex; align-items: center; justify-content: center; }
          .cb { width: 22px; height: 22px; border: 2px solid #0078D4; border-radius: 6px; background: #fff; }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #dde4ef;
          }
          .footer-brand { font-size: 17px; font-weight: 900; color: #0078D4; letter-spacing: 1px; }
          .footer-sub { font-size: 11px; color: #aaa; margin-top: 3px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <div class="header-icon">🛒</div>
            <div class="header-text">
              <h1>Lista de la Compra</h1>
              <p>${fecha}</p>
            </div>
          </div>
          <div class="header-badge">
            <div class="badge-num">${items.length}</div>
            <div class="badge-label">Productos</div>
          </div>
        </div>

        <div class="intro">
          <span style="font-size:20px">💡</span>
          <p>Marca cada producto conforme lo vayas añadiendo al carrito. Generado con <strong>MyMenú</strong>.</p>
        </div>

        <div class="table">
          <div class="table-head">
            <span>#</span>
            <span>Producto</span>
            <span class="center">Hecho</span>
          </div>
          ${items
            .map(
              (item, i) => `
            <div class="row ${i % 2 !== 0 ? "alt" : ""}">
              <div class="row-num">${i + 1}</div>
              <div class="row-name">${item.name}</div>
              <div class="cb-wrap"><div class="cb"></div></div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="footer">
          <div class="footer-brand">𝓜𝔂𝓜𝓮𝓷𝓾</div>
          <div class="footer-sub">Tu asistente de cocina inteligente</div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
    });
    return true;
  } catch (error) {
    Alert.alert("Error", "No se pudo generar o compartir el PDF");
    return false;
  }
};

const container = document.getElementById("sections");

const sections = [
  {
    title: "Estas usando un navegador",
    content: {
      Nombre: platform.name,
      Version: platform.version,
      Diseño: platform.layout,
      Idioma: navigator.language,
      Cookies: navigator.cookieEnabled,
      "No rastrear": navigator.doNotTrack,
      Complementos: navigator.plugins?.length,
    },
  },
];

function createSectionContentObject(content) {
  return Object.keys(content)
    .map((key) => {
      return `<div class="section-item">
            <div class="section-key">${key}</div>
            <div class="section-value">${content[key]}</div>
          </div>`;
    })
    .join("\n");
}

function createSectionDOMObject(section) {
  return `
    <div class="section">
        <div class="section-body">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${createSectionContentObject(
              section.content
            )}</div>
        </div>
    </div>
  `;
}

async function showDevice() {
  const navigatorConnection = navigator.connection ? {
    Downlink: navigator.connection.downlink,
    "Tipo efectivo": navigator.connection.effectiveType,
    "Tipo de conexión": navigator.connection.type,
  } : {};

  sections.push({
    title: "Estas usando un dispositivo",
    content: {
      Fabricante: platform.manufacturer || navigator.vendor,
      Producto: platform.product,
      OS: platform.os,
      "Tamaño de la pantalla": window.screen.width + "x" + window.screen.height,
      ...navigatorConnection,
    },
  });
}

async function getIP() {
  const req = await fetch("https://api.ipify.org/?format=json");
  const res = await req.json();
  return res.ip;
}

async function showGEO() {
  let error = null;

  const ip = await getIP().catch((e) => {
    console.error(e);
    error = e.message;
    return null;
  });

  const req = ip
    ? await fetch("https://ipwhois.app/json/" + ip).catch((e) => {
        console.error(e);
        error = e.message;
        return null;
      })
    : null;

  const res = req ? await req.json() : null;

  if (res) {
    sections.push({
      title: "Esta es tu dirección actual",
      content: {
        Pais: res.country,
        Region: res.region,
        Ciudad: res.city,
        Coordenadas: "Lat: " + res.latitude + ", Lon: " + res.longitude,
        ISP: res.isp,
        IP: ip,
        "Tipo de IP": res.type,
      },
    });
  } else {
    sections.push({
      title: "Geo",
      content: {
        error: "No se pueden obtener datos geográficos.",
        message: error,
        tip: "¿Anti-Track activado?, Desactiva si se utiliza Brave.",
      },
    });
  }
}

async function start() {
  await showDevice();
  await showGEO();

  for (const section of sections) {
    container.innerHTML += createSectionDOMObject(section);
  }
}

start();

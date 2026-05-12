import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*

  SOSTITUISCI QUESTI 3 VALORI

*/

const SUPABASE_URL = "https://xonkfaybccwruiavqxvr.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbmtmYXliY2N3cnVpYXZxeHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTg2OTEsImV4cCI6MjA5MzY3NDY5MX0.I980bCbIBCBXeUUbLwJKyLKU_0sxRdCDwCl8Gw37Gew";

const EVENT_SLUG = "main-event";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginView = document.getElementById("loginView");

const dashboardView = document.getElementById("dashboardView");

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

const logoutButton = document.getElementById("logoutButton");

const refreshButton = document.getElementById("refreshButton");

const exportButton = document.getElementById("exportButton");

const searchInput = document.getElementById("searchInput");

const totalRsvps = document.getElementById("totalRsvps");

const totalGuests = document.getElementById("totalGuests");

const totalDeclined = document.getElementById("totalDeclined");

const totalNcc = document.getElementById("totalNcc");

const tableBody = document.getElementById("rsvpTableBody");

const dashboardMessage = document.getElementById("dashboardMessage");

let rsvps = [];

init();

async function init() {

  const { data } = await supabase.auth.getSession();

  if (data.session) {

    showDashboard();

    await loadRsvps();

  } else {

    showLogin();

  }

}

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  loginMessage.textContent = "";

  loginMessage.className = "message";

  const formData = new FormData(loginForm);

  const email = String(formData.get("email") || "").trim();

  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({

    email,

    password

  });

  if (error) {

    console.error(error);

    loginMessage.textContent = "Login non riuscito. Controlla email e password.";

    loginMessage.className = "message error";

    return;

  }

  loginForm.reset();

  showDashboard();

  await loadRsvps();

});

logoutButton.addEventListener("click", async () => {

  await supabase.auth.signOut();

  rsvps = [];

  showLogin();

});

refreshButton.addEventListener("click", async () => {

  await loadRsvps();

});

searchInput.addEventListener("input", () => {

  renderTable();

});

exportButton.addEventListener("click", () => {

  exportCSV();

});

async function loadRsvps() {

  dashboardMessage.textContent = "Caricamento dati...";

  dashboardMessage.className = "message";

  const { data, error } = await supabase

    .from("event_rsvps")

    .select(`

      id,

      event_slug,

      first_name,

      last_name_or_nickname,

      attendance_status,

      registering_self_only,

      guests_count,

      food_requests,

      needs_ncc_return,

      phone_country_code,

      phone_number,

      ncc_destination,

      checked_in,

      checked_in_at,

      created_at

    `)

    .eq("event_slug", EVENT_SLUG)

    .order("created_at", { ascending: false });

  if (error) {

    console.error(error);

    dashboardMessage.textContent = "Errore durante la lettura dei dati. Controlla policy RLS e colonne Supabase.";

    dashboardMessage.className = "message error";

    return;

  }

  rsvps = data || [];

  dashboardMessage.textContent = "";

  renderStats();

  renderTable();

}

function renderStats() {

  const confirmed = rsvps.filter((item) => item.attendance_status === "yes");

  const declined = rsvps.filter((item) => item.attendance_status === "no");

  const ncc = rsvps.filter((item) => item.needs_ncc_return === "yes");

  const guests = confirmed.reduce((sum, item) => {

    return sum + Number(item.guests_count || 0);

  }, 0);

  totalRsvps.textContent = rsvps.length;

  totalGuests.textContent = guests;

  totalDeclined.textContent = declined.length;

  totalNcc.textContent = ncc.length;

}

function renderTable() {

  const term = searchInput.value.toLowerCase().trim();

  const filtered = rsvps.filter((item) => {

    const haystack = [

      item.first_name,

      item.last_name_or_nickname,

      item.attendance_status,

      item.registering_self_only,

      item.guests_count,

      item.food_requests,

      item.needs_ncc_return,

      item.phone_country_code,

      item.phone_number,

      item.ncc_destination,

      item.created_at

    ]

      .join(" ")

      .toLowerCase();

    return haystack.includes(term);

  });

  tableBody.innerHTML = "";

  if (!filtered.length) {

    tableBody.innerHTML = `

      <tr>

        <td colspan="9">Nessun risultato.</td>

      </tr>

    `;

    return;

  }

  filtered.forEach((item) => {

    const row = document.createElement("tr");

    const fullName = `${item.first_name || ""} ${item.last_name_or_nickname || ""}`.trim();

    const phone = [item.phone_country_code, item.phone_number].filter(Boolean).join(" ");

    row.innerHTML = `

      <td>${escapeHtml(fullName)}</td>

      <td>${renderBadge(item.attendance_status)}</td>

      <td>${renderBadge(item.registering_self_only)}</td>

      <td>${escapeHtml(item.guests_count || "")}</td>

      <td>${escapeHtml(item.food_requests || "-")}</td>

      <td>${renderBadge(item.needs_ncc_return)}</td>

      <td>${escapeHtml(item.ncc_destination || "-")}</td>

      <td>${escapeHtml(phone || "-")}</td>

      <td>${formatDate(item.created_at)}</td>

    `;

    tableBody.appendChild(row);

  });

}

function renderBadge(value) {

  if (value === "yes") {

    return `<span class="badge yes">Sì</span>`;

  }

  if (value === "no") {

    return `<span class="badge no">No</span>`;

  }

  return `<span class="badge">-</span>`;

}

function exportCSV() {

  const headers = [

    "Nome",

    "Cognome o soprannome",

    "Partecipa",

    "Registra solo se stesso",

    "Persone",

    "Richieste alimentari",

    "NCC ritorno",

    "Destinazione NCC",

    "Prefisso",

    "Telefono",

    "Data invio"

  ];

  const rows = rsvps.map((item) => [

    item.first_name || "",

    item.last_name_or_nickname || "",

    translateYesNo(item.attendance_status),

    translateYesNo(item.registering_self_only),

    item.guests_count || "",

    item.food_requests || "",

    translateYesNo(item.needs_ncc_return),

    item.ncc_destination || "",

    item.phone_country_code || "",

    item.phone_number || "",

    item.created_at || ""

  ]);

  const csv = [headers, ...rows]

    .map((row) => row.map(csvEscape).join(","))

    .join("\n");

  const blob = new Blob([csv], {

    type: "text/csv;charset=utf-8;"

  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `rsvp-${EVENT_SLUG}.csv`;

  link.click();

  URL.revokeObjectURL(url);

}

function showLogin() {

  loginView.classList.remove("hidden");

  dashboardView.classList.add("hidden");

}

function showDashboard() {

  loginView.classList.add("hidden");

  dashboardView.classList.remove("hidden");

}

function translateYesNo(value) {

  if (value === "yes") return "Sì";

  if (value === "no") return "No";

  return "";

}

function formatDate(value) {

  if (!value) return "";

  return new Date(value).toLocaleString("it-IT");

}

function csvEscape(value) {

  const stringValue = String(value ?? "");

  return `"${stringValue.replaceAll('"', '""')}"`;

}

function escapeHtml(value) {

  return String(value ?? "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}

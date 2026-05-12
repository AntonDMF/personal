const form = document.getElementById("rsvpForm");

const message = document.getElementById("formMessage");

const submitButton = document.getElementById("submitButton");

const nccDetails = document.getElementById("nccDetails");

const nccRadios = document.querySelectorAll('input[name="needs_ncc_return"]');

nccRadios.forEach((radio) => {

  radio.addEventListener("change", handleNccChange);

});

form.addEventListener("submit", (event) => {

  event.preventDefault();

  message.textContent = "";

  message.className = "form-message";

  const formData = new FormData(form);

  const payload = {

    first_name: String(formData.get("first_name") || "").trim(),

    last_name_or_nickname: String(formData.get("last_name_or_nickname") || "").trim(),

    attendance_status: String(formData.get("attendance_status") || ""),

    guests_count: Number(formData.get("guests_count") || 0),

    food_requests: String(formData.get("food_requests") || "").trim() || null,

    needs_ncc_return: String(formData.get("needs_ncc_return") || ""),

    phone_country_code: String(formData.get("phone_country_code") || "").trim() || null,

    phone_number: String(formData.get("phone_number") || "").trim() || null,

    ncc_destination: String(formData.get("ncc_destination") || "").trim() || null

  };

  if (!payload.first_name || !payload.last_name_or_nickname) {

    showMessage("Inserisci nome e cognome/soprannome.", "error");

    return;

  }

  if (!["yes", "no"].includes(payload.attendance_status)) {

    showMessage("Seleziona se partecipi o no.", "error");

    return;

  }

  if (!["yes", "no"].includes(payload.needs_ncc_return)) {

    showMessage("Seleziona se hai bisogno di NCC per il ritorno.", "error");

    return;

  }

  if (payload.needs_ncc_return === "yes") {

    if (!payload.ncc_destination) {

      showMessage("Inserisci la destinazione per il ritorno.", "error");

      return;

    }

    if (!payload.phone_number) {

      showMessage("Inserisci un numero di telefono per essere ricontattato.", "error");

      return;

    }

  }

  console.log("Payload pronto per Supabase:", payload);

  submitButton.disabled = true;

  submitButton.textContent = "Risposta pronta";

  showMessage("Form valido. Prossimo step: collegamento a Supabase.", "success");

});

function handleNccChange() {

  const selected = document.querySelector('input[name="needs_ncc_return"]:checked');

  if (!selected) return;

  if (selected.value === "yes") {

    nccDetails.classList.remove("hidden");

  } else {

    nccDetails.classList.add("hidden");

  }

}

function showMessage(text, type) {

  message.textContent = text;

  message.className = `form-message ${type}`;

}

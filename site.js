(() => {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const dots = [...carousel.querySelectorAll("[data-carousel-to]")];
  const showSlide = (index) => {
    const activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.setAttribute("aria-hidden", String(!active));
      slide.querySelectorAll("a, button").forEach((control) => {
        control.tabIndex = active ? 0 : -1;
      });
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeIndex;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  carousel.querySelector("[data-carousel-prev]").addEventListener("click", () => {
    const currentIndex = slides.findIndex((slide) => slide.getAttribute("aria-hidden") === "false");
    showSlide(currentIndex - 1);
  });
  carousel.querySelector("[data-carousel-next]").addEventListener("click", () => {
    const currentIndex = slides.findIndex((slide) => slide.getAttribute("aria-hidden") === "false");
    showSlide(currentIndex + 1);
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.carouselTo)));
  });
  showSlide(0);
})();

(() => {
  const form = document.querySelector("[data-appointment-form]");
  if (!form) return;

  const clinic = form.querySelector("#clinic");
  const date = form.querySelector("#appointment-date");
  const time = form.querySelector("#appointment-time");
  const phone = form.querySelector("#patient-phone");
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('[type="submit"]');
  const schedules = {
    "iqra-unit-one": { days: [1, 2, 3, 4, 5, 6], label: "6:00 PM – 9:00 PM" },
    "farooq-dha": { days: [2, 4], label: "3:00 PM – 5:00 PM" },
    "farooq-allama-iqbal-town": { days: [1, 3, 6], label: "3:00 PM – 5:00 PM" }
  };

  const localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  date.min = localDate();

  const updateWindow = () => {
    time.replaceChildren(new Option("Select a date and hospital first", ""));
    date.setCustomValidity("");
    const schedule = schedules[clinic.value];
    if (!schedule || !date.value) return;

    const [year, month, day] = date.value.split("-").map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    if (date.value < localDate()) {
      date.setCustomValidity("Choose today or a future date.");
      return;
    }
    if (!schedule.days.includes(weekday)) {
      date.setCustomValidity("This hospital does not have a clinic on the selected day. Choose another date.");
      return;
    }
    time.add(new Option(schedule.label, schedule.label));
    time.value = schedule.label;
  };

  const updatePhone = () => {
    const digits = phone.value.replace(/\D/g, "").length;
    phone.setCustomValidity(phone.value && (digits < 7 || digits > 15)
      ? "Enter a phone number containing 7 to 15 digits."
      : "");
  };

  clinic.addEventListener("change", updateWindow);
  date.addEventListener("change", updateWindow);
  phone.addEventListener("input", updatePhone);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    updateWindow();
    updatePhone();
    if (!form.reportValidity()) return;

    status.textContent = "Sending your request…";
    status.dataset.state = "pending";
    submit.disabled = true;

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      clinic: formData.get("clinic"),
      date: formData.get("date"),
      time: formData.get("time"),
      consent: formData.get("consent") === "on",
      website: formData.get("website")
    };

    try {
      const response = await fetch("/api/request-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "We couldn't send your request. Please try again or call the clinic.");
      }

      status.textContent = result.message;
      status.dataset.state = "success";
      form.reset();
      date.min = localDate();
      updateWindow();
      updatePhone();
      submit.disabled = true;
    } catch (error) {
      status.textContent = error instanceof TypeError
        ? "We couldn't reach the booking service. Please try again or call 0312-4165202."
        : error.message || "We couldn't send your request. Please try again or call 0312-4165202.";
      status.dataset.state = "error";
      submit.disabled = false;
    }
  });
})();

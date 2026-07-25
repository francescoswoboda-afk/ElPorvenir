(function () {
  var translations = {
    en: {
      "nav.home": "Home",
      "nav.about": "About us",
      "nav.farm": "Our farm",
      "nav.pecan": "Pecan nuts",
      "nav.contact": "Contact us",
      "contact.hero.title": "Let's grow something great together.",
      "contact.hero.body": "We are always open to conversations that share our values - quality, responsibility and a long-term vision for the land.",
      "contact.form.title": "Send us a message",
      "contact.form.body": "Whether you have a question about our farm, our pecans, partnership opportunities or anything else, we'd love to hear from you.",
      "contact.form.name": "Full Name",
      "contact.form.email": "Email Address",
      "contact.form.subject": "Subject",
      "contact.form.message": "Message",
      "contact.form.submit": "Send Message",
      "contact.touch.title": "Get in touch",
      "contact.touch.visit": "Visit us",
      "contact.touch.address": "Monte Alverne, Santa Cruz do Sul, Rio Grande do Sul, Brazil",
      "contact.touch.email": "Email",
      "contact.touch.phone": "Phone / WhatsApp",
      "contact.touch.instagram": "Instagram",
      "contact.touch.quote": "We believe the best partnerships start with trust and shared purpose.",
      "contact.footer.kicker": "We'd love to hear from you",
      "contact.footer.title": "Together, we can build a better tomorrow.",
      "contact.footer.body": "Thank you for your interest in El Porvenir Farm."
    },
    es: {
      "nav.home": "Inicio",
      "nav.about": "Nosotros",
      "nav.farm": "Nuestra finca",
      "nav.pecan": "Nueces pecan",
      "nav.contact": "Contacto",
      "contact.hero.title": "Cultivemos algo grande juntos.",
      "contact.hero.body": "Siempre estamos abiertos a conversaciones que compartan nuestros valores: calidad, responsabilidad y una vision de largo plazo para la tierra.",
      "contact.form.title": "Envianos un mensaje",
      "contact.form.body": "Si tienes una pregunta sobre nuestra finca, nuestras pecanas, oportunidades de alianza o cualquier otro tema, nos encantara escucharte.",
      "contact.form.name": "Nombre completo",
      "contact.form.email": "Correo electronico",
      "contact.form.subject": "Asunto",
      "contact.form.message": "Mensaje",
      "contact.form.submit": "Enviar mensaje",
      "contact.touch.title": "Ponte en contacto",
      "contact.touch.visit": "Visitanos",
      "contact.touch.address": "Monte Alverne, Santa Cruz do Sul, Rio Grande do Sul, Brasil",
      "contact.touch.email": "Correo",
      "contact.touch.phone": "Telefono / WhatsApp",
      "contact.touch.instagram": "Instagram",
      "contact.touch.quote": "Creemos que las mejores alianzas comienzan con confianza y un proposito compartido.",
      "contact.footer.kicker": "Nos encantaria saber de ti",
      "contact.footer.title": "Juntos podemos construir un mejor manana.",
      "contact.footer.body": "Gracias por tu interes en El Porvenir Farm."
    }
  };

  function resolveLanguage() {
    var storedLang = null;
    try {
      storedLang = localStorage.getItem("ep-lang");
    } catch (error) {
      storedLang = null;
    }

    if (storedLang && translations[storedLang]) {
      return storedLang;
    }

    return "en";
  }

  function getText(language, key) {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }

    if (translations.en[key]) {
      return translations.en[key];
    }

    return "";
  }

  function applyLanguage(language) {
    var lang = translations[language] ? language : "en";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-i18n");
      var text = getText(lang, key);
      if (text) {
        element.textContent = text;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-placeholder");
      var text = getText(lang, key);
      if (text) {
        element.setAttribute("placeholder", text);
      }
    });

    document.querySelectorAll(".lang-switch [data-lang]").forEach(function (toggle) {
      var isActive = toggle.getAttribute("data-lang") === lang;
      toggle.classList.toggle("active", isActive);
      toggle.setAttribute("aria-current", isActive ? "true" : "false");
    });

    try {
      localStorage.setItem("ep-lang", lang);
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function initializeLanguageSwitcher() {
    var toggles = document.querySelectorAll(".lang-switch [data-lang]");
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        var language = toggle.getAttribute("data-lang") || "en";
        applyLanguage(language);
      });
    });

    applyLanguage(resolveLanguage());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLanguageSwitcher);
  } else {
    initializeLanguageSwitcher();
  }

  window.ElPorvenirI18n = {
    applyLanguage: applyLanguage
  };
})();

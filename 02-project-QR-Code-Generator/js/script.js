function generateQR() {
    if (qrText.value.length > 0) {
        qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(qrText.value);
        imgBox.classList.add("show-img");
        qrText.placeholder = "✓ Generated! Enter new text"; 
        qrText.value = ""; 
    } else {
        qrText.classList.add("error");
        qrText.placeholder = "Please enter something!"; 
        setTimeout(() => {
            qrText.classList.remove("error");
            qrText.placeholder = "Text or Url"; 
        }, 1000);
    }
}

  document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("button").click();
    }
  });
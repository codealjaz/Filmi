
(() => {

    const fileInput = document.getElementById("srtFileInput");
    const dropzone = document.getElementById("srtDropzone");
    const fileInfo = document.getElementById("srtFileInfo");
    const fileName = document.getElementById("srtFileName");
    const fileSize = document.getElementById("srtFileSize");
    const convertBtn = document.getElementById("srtConvertBtn");
    const status = document.getElementById("srtStatus");
    const details = document.getElementById("srtDetails");

    let selectedFile = null;

    function showStatus(message, type = "") {
        status.className = "srt-status " + type;
        status.textContent = message;
    }

    // IZBIRA DATOTEKE

    function loadFile(file) {

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".srt")) {
            showStatus("Izberi SRT datoteko.", "error");
            return;
        }

        selectedFile = file;

        fileName.textContent = file.name;
        fileSize.textContent =
            (file.size / 1024).toFixed(1) + " KB";

        fileInfo.classList.add("active");
        dropzone.classList.add("has-file");

        convertBtn.disabled = false;

        details.textContent = "";

        showStatus("Datoteka je pripravljena za pretvorbo.");
    }

    // KLIK NA POLJE

    dropzone.addEventListener("click", () => {
        fileInput.click();
    });

    dropzone.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", e => {
        if (e.target.files[0]) {
            loadFile(e.target.files[0]);
        }

        // Omogoča ponovno izbiro iste datoteke.
        fileInput.value = "";
    });

    // POVLECI IN SPUSTI

    dropzone.addEventListener("dragover", e => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", e => {
        if (!dropzone.contains(e.relatedTarget)) {
            dropzone.classList.remove("dragover");
        }
    });

    dropzone.addEventListener("drop", e => {
        e.preventDefault();
        dropzone.classList.remove("dragover");

        if (e.dataTransfer.files[0]) {
            loadFile(e.dataTransfer.files[0]);
        }
    });

    // PRETVORBA WINDOWS-1250 -> UTF-8

    convertBtn.addEventListener("click", async () => {

        if (!selectedFile) return;

        convertBtn.disabled = true;

        try {

            showStatus("Pretvarjam podnapise ...");

            const buffer = await selectedFile.arrayBuffer();

            let bytes = new Uint8Array(buffer);

            // Odstrani morebitni UTF-8 BOM.
            if (
                bytes.length >= 3 &&
                bytes[0] === 0xEF &&
                bytes[1] === 0xBB &&
                bytes[2] === 0xBF
            ) {
                bytes = bytes.slice(3);
            }

            const decoder = new TextDecoder("windows-1250");
            const text = decoder.decode(bytes);

            // Preverjanje SRT strukture.
            const cues = (text.match(/-->/g) || []).length;

            if (cues === 0) {
                throw new Error(
                    "SRT časovne oznake niso bile prepoznane."
                );
            }

            const slovene =
                (text.match(/[čšžČŠŽ]/g) || []).length;

            const outputName =
                selectedFile.name.replace(/\.srt$/i, "") +
                "_FIXED.srt";

            const blob = new Blob(
                ["\uFEFF", text],
                {
                    type: "text/plain;charset=utf-8"
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = outputName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 2000);

            details.textContent =
                `Windows-1250 → UTF-8 · ` +
                `Podnapisov: ${cues} · ` +
                `Slovenskih šumnikov: ${slovene}`;

            showStatus(
                "✓ Uspešno pretvorjeno in preneseno!",
                "success"
            );

        } catch (error) {

            showStatus(
                "Napaka: " + error.message,
                "error"
            );

        } finally {

            convertBtn.disabled = false;

        }

    });

})();

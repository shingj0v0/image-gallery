const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const galleryEl = document.getElementById("gallery");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  uploadStatus.textContent = "업로드중...";
  uploadStatus.className = "upload-status";

  try {
    const formData = new FormData();
    formData.append("image", file);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    uploadStatus.textContent = "업로드 성공!";
    uploadStatus.className = "upload-status success";
  } catch (error) {
    console.error("Error uploading file:", error);
    uploadStatus.textContent = "업로드 실패";
    uploadStatus.className = "upload-status error";
  }

  fileInput.value = "";

  setTimeout(() => {
    uploadStatus.textContent = "";
    uploadStatus.className = "upload-status";
  }, 3000);

  loadImages();
});

async function loadImages() {
  loading.style.display = "block";
  galleryEl.innerHTML = "";
  emptyState.style.display = "none";

  try {
    const res = await fetch("/api/images");
    const images = await res.json();

    loading.style.display = "none";

    if (!images || images.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    images.forEach((image) => {
      const item = document.createElement("div");
      item.className = "gallery-item";

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = image.originalName;
      img.loading = "lazy";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "&times;";
      deleteBtn.title = "이미지 삭제";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteImage(image._id, item, deleteBtn);
      });

      item.appendChild(img);
      item.appendChild(deleteBtn);
      galleryEl.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading images:", error);
    loading.style.display = "none";
    emptyState.style.display = "block";
    emptyState.querySelector("p").textContent =
      "이미지를 불러오는 데 실패했습니다, 다시 시도해주세요.";
  }
}

async function deleteImage(id, item, deleteBtn) {
  if (!confirm("정말로 이 이미지를 삭제하시겠어요?")) {
    return;
  }

  item.classList.add("deleting");
  deleteBtn.disabled = true;
  deleteBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const res = await fetch(`/api/images/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete image");
    }

    loadImages();
  } catch (error) {
    console.error("Error deleting image:", error);
    alert("이미지를 삭제하는 데 실패했습니다, 다시 시도해주세요.");

    item.classList.remove("deleting");
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = "&times;";
  }
}

loadImages();

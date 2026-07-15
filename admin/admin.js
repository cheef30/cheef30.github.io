(function () {
  const client = window.supabase.createClient(window.RC_SUPABASE_URL, window.RC_SUPABASE_PUBLISHABLE_KEY);

  const loginPanel = document.getElementById('login-panel');
  const uploadPanel = document.getElementById('upload-panel');
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const uploadForm = document.getElementById('upload-form');
  const uploadMessage = document.getElementById('upload-message');
  const uploadBtn = document.getElementById('upload-btn');
  const categorySelect = document.getElementById('photo-category');

  function setMessage(el, text, type) {
    el.textContent = text || '';
    el.classList.remove('error', 'success');
    if (type) el.classList.add(type);
  }

  function populateCategories() {
    const categories = window.RC_PHOTO_CATEGORIES || [];
    categorySelect.innerHTML = categories
      .map((c) => `<option value="${c.value}">${c.label_en}</option>`)
      .join('');
  }

  // Resizes to a max width and re-encodes via <canvas> before upload, so a
  // 12MP phone photo doesn't land in Storage untouched. Falls back to WebP's
  // JPEG substitute automatically on browsers that can't encode WebP.
  function compressImage(file, { maxWidth = 2000, quality = 0.85 } = {}) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);

        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const width = Math.round(img.naturalWidth * scale);
        const height = Math.round(img.naturalHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
        const mime = supportsWebp ? 'image/webp' : 'image/jpeg';
        const ext = supportsWebp ? 'webp' : 'jpg';

        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Image compression failed')); return; }
          resolve({ blob, ext });
        }, mime, quality);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read the selected image'));
      };

      img.src = url;
    });
  }

  function showLoggedIn() {
    loginPanel.hidden = true;
    uploadPanel.hidden = false;
  }

  function showLoggedOut() {
    loginPanel.hidden = false;
    uploadPanel.hidden = true;
  }

  async function refreshAuthState() {
    const { data } = await client.auth.getSession();
    if (data.session) showLoggedIn();
    else showLoggedOut();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage(loginMessage, '', null);
    loginBtn.disabled = true;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const { error } = await client.auth.signInWithPassword({ email, password });

    loginBtn.disabled = false;

    if (error) {
      setMessage(loginMessage, 'Login failed: ' + error.message, 'error');
      return;
    }

    loginForm.reset();
    showLoggedIn();
  });

  logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
    showLoggedOut();
  });

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage(uploadMessage, '', null);

    const fileInput = document.getElementById('photo-file');
    const file = fileInput.files[0];
    const alt = document.getElementById('photo-alt').value.trim();
    const title = document.getElementById('photo-title').value.trim();
    const seo = document.getElementById('photo-seo').value.trim();
    const category = categorySelect.value;

    if (!file || !alt || !title || !category) {
      setMessage(uploadMessage, 'Please fill in all required fields.', 'error');
      return;
    }

    uploadBtn.disabled = true;
    setMessage(uploadMessage, 'Compressing…', null);

    try {
      let blob = file;
      let ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';

      try {
        const compressed = await compressImage(file);
        blob = compressed.blob;
        ext = compressed.ext;
      } catch (compressErr) {
        console.warn('Compression skipped, uploading original file:', compressErr.message);
      }

      const path = `${category}/${crypto.randomUUID()}.${ext}`;

      setMessage(uploadMessage, 'Uploading…', null);
      const { error: uploadError } = await client.storage.from('photos').upload(path, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: blob.type || file.type,
      });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = client.storage.from('photos').getPublicUrl(path);

      const { error: insertError } = await client.from('photos').insert({
        image_url: publicUrlData.publicUrl,
        storage_path: path,
        alt_text: alt,
        title,
        seo_description: seo || null,
        category,
      });
      if (insertError) throw insertError;

      setMessage(uploadMessage, 'Published!', 'success');
      uploadForm.reset();
      populateCategories();
    } catch (err) {
      setMessage(uploadMessage, 'Upload failed: ' + err.message, 'error');
    } finally {
      uploadBtn.disabled = false;
    }
  });

  populateCategories();
  refreshAuthState();
})();

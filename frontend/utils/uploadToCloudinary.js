export const uploadToCloudinary = async (image) => {
  const cloudName = "dx1libiis"; // ✅ your cloud name
  const presetName = "socialMediaApp"; // ✅ unsigned upload preset
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", {
    uri: image.uri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  formData.append("upload_preset", presetName);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error("❌ Cloudinary Image Upload Failed:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    return null;
  }
};

export const uploadVideoToCloudinary = async (videoUri) => {
  const cloudName = "dx1libiis"; // ✅ your actual cloud name
  const presetName = "socialMediaApp"; // ✅ same or different preset if needed
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  const formData = new FormData();
  formData.append("file", {
    uri: videoUri,
    type: "video/mp4",
    name: "upload.mp4",
  });
  formData.append("upload_preset", presetName);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      console.log("✅ Uploaded Video URL:", data.secure_url);
      return data.secure_url;
    } else {
      console.error("❌ Cloudinary Video Upload Failed:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Video Upload Error:", error);
    return null;
  }
};

export const uploadAudioToCloudinary = async (audio) => {
  const cloudName = "dx1libiis"; 
  const presetName = "socialMediaApp"; 
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  const formData = new FormData();
  formData.append("file", {
    uri: audio.uri,
    type: "audio/mpeg", 
    name: "upload.mp3",
  });
  formData.append("upload_preset", presetName);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      console.log("✅ Uploaded Audio URL:", data.secure_url);
      return data.secure_url;
    } else {
      console.error("❌ Cloudinary Audio Upload Failed:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Audio Upload Error:", error);
    return null;
  }
};

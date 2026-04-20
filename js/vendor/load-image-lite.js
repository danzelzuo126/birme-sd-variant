(function (global) {
  function loadImage(source, callback) {
    const img = new Image();
    img.onload = function () {
      callback(img);
    };
    img.onerror = function () {
      console.error("Failed to load image", source);
    };

    if (source instanceof Blob || source instanceof File) {
      const url = URL.createObjectURL(source);
      img.onload = function () {
        URL.revokeObjectURL(url);
        callback(img);
      };
      img.src = url;
    } else {
      img.src = source;
    }
  }

  global.loadImage = loadImage;
})(window);

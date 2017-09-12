const video = new Whammy.Video();

fetch('http://192.168.1.100:3000/images')
  .then((res) => res.json())
  .then((data) => {
    const promises = data.frames.map((frameData) => frameData.filename).map(getWebp);
    Promise.all(promises)
      .then(() => {
        video.compile(false, (webm) => {
          const url = window.URL.createObjectURL(webm);
          const videoElm = document.getElementById('timelapse-video');
          const progressElm = document.getElementById('progress');
          videoElm.src = url;
          videoElm.style.display = '';   
          progressElm.innerHTML = '';
          progressElm.style.height = '0';
        });
      });
  })
  .catch((e) => {
    console.log(e);
  });

const getWebp = (frame) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.getElementById('timelapse-canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1024, 768);
        video.add(ctx, 500);
        resolve();
      };
      img.src = `./images/${frame}`;
    }
    catch (e) {
      reject(e);
    }
  });
};
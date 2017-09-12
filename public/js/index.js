const video = new Whammy.Video();

fetch(`${url}/images`)
  .then((res) => res.json())
  .then((data) => {
    const promises = data.frames.map(getCanvas);
    Promise.all(promises)
      .then((canvases) => {
        console.log(canvases)
        canvases.forEach(canvas => video.add(canvas, 500));
        video.compile(false, (webm) => {
          const url = window.URL.createObjectURL(webm);
          const videoElm = document.getElementById('timelapse-video');
          const progressElm = document.getElementById('progress');
          videoElm.src = url;
          videoElm.style.display = '';   
          progressElm.innerHTML = '';
        });
      });
  })
  .catch((e) => {
    console.log(e);
  });

const getCanvas = (frame) => {
  return new Promise((resolve, reject) => {
    const template = document.getElementById('timelapse-canvas');
    const canvas = template.cloneNode(true);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 768);
      ctx.font = '20px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(frame.timestamp, 25, 25);
      resolve(ctx);
    };
    img.onerror = () => { 
      console.log('error'); 
      resolve();
    };
    img.src = `./images/${frame.filename}`;
  });
};
let episodeSelect = document.getElementById('episode-select');
let frameSelect = document.getElementById('frame-select');
let episodes;
let slider = document.getElementById('slider');
slider.title = "Drag to compare";
let beforeImage = document.getElementById('before'); 
let afterImage = document.getElementById('after');
let loadingScreen = document.getElementById('loading');
let loadingMessage = document.querySelector('.loading-message');
let loading = false;
let currentImageLoading = null; 
let xhrObjects = []; 
let cancelled = false; 

function updateLoadingMessage(percentage) {
  let message = '';
  if (percentage < 10) {
    message = `Requesting Images from database... (${percentage.toFixed(2)}%)`;
  } else if (percentage < 50) {
    message = `Serving Images... (${percentage.toFixed(2)}%)`;
  } else if (percentage < 90) {
    message = `Processing Images... (${percentage.toFixed(2)}%)`;
  } else if (percentage < 100) {
    message = `Finalizing... (${percentage.toFixed(2)}%)`;
  } else {
    message = `Load complete. Rendering Comparison...`;
  }
  loadingScreen.textContent = message;
}

function updateLayout() {
  let comparisonContainer = document.querySelector('.comparison-container');
  comparisonContainer.style.maxHeight = `${window.innerHeight}px`;
  let images = document.querySelectorAll('.comparison-image');
  images.forEach((image) => {
    image.style.width = `${window.innerWidth}px`;
    image.style.height = `${window.innerHeight}px`;
  });
  let slider = document.getElementById('slider');
  slider.style.height = `${window.innerHeight}px`;
}

episodeSelect.addEventListener('change', () => {
  console.log('Episode Select Changed');
  cancelCurrentLoading();
  setTimeout(() => {
    updateFrames();
    updateImages();
  }, 0);
});
window.addEventListener('popstate', () => {  
  let episode = parseInt(location.hash.replace('#', ''));  
  if (!isNaN(episode) && episodeSelect.querySelector(`option[value="${episode}"]`)) {
    episodeSelect.value = episode;    
    updateFrames();    
  }
});

function populateEpisodes() {
    fetch('getEpisodes.php')
        .then(response => response.json())
        .then(data => {
            episodes = data;
            for (let episode in episodes) {
                let option = document.createElement('option');
                option.value = episode;
                option.text = 'Episode ' + episode;
                episodeSelect.appendChild(option);
            }
            let episode = parseInt(location.hash.replace('#', ''));
            if (!isNaN(episode) && episodeSelect.querySelector(`option[value="${episode}"]`)) {
                episodeSelect.value = episode;
                updateFrames();
            } else {
                updateFrames();
            }
        });
}

window.addEventListener('load', () => {
  populateEpisodes();
  updateLayout();
});

window.addEventListener('resize', updateLayout);

slider.onmousedown = function(event) {
  event.preventDefault(); 
  document.onmousemove = function(event) {
    let rect = afterImage.getBoundingClientRect();
    let x = event.clientX - rect.left; 
    let widthPercentage = (x / rect.width) * 100;
    afterImage.style.clipPath = `inset(0 ${100 - widthPercentage}% 0 0)`;
    slider.style.left = `${widthPercentage}%`;
  }
  document.onmouseup = function() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
};

slider.ondragstart = function() {
  return false;
};

frameSelect.addEventListener('change', () => {
  console.log('Frame Select Changed');
  cancelCurrentLoading();
  setTimeout(updateImages, 0);
  resetLoadingMessage();
});

function updateFrames() {
    let episode = episodeSelect.value;
    let frames = episodes[episode];
    frameSelect.innerHTML = ''; 
    let uniqueFrames = []; 
    for (let frame of frames) {
        if (!uniqueFrames.includes(frame.replace('after', 'before'))) {
            uniqueFrames.push(frame.replace('after', 'before'));
        }
    }
    for (let frame of uniqueFrames) {
        let option = document.createElement('option');
        let frameNumber = frame.replace('after', '').replace('before', '').replace('ep' + episode, '').replace('.png', ''); 
        option.text = 'Frame: ' + frameNumber + '.qc'; 
        option.value = frame.replace('before', 'after');
        frameSelect.appendChild(option);
    }
    updateImages();
}

function cancelLoading() {
  console.log('Cancel Loading Called');  
  cancelled = true;
  xhrObjects.forEach(xhr => xhr.abort());
}

function updateImages() {
  console.log('Update Images Started'); 
  resetLoadingMessage(); 
  if (loading) {
    console.log('Previous Loading Detected. Canceling...'); 
    cancelCurrentLoading();
  }

  loading = true;
  cancelled = false; 

  let episode = episodeSelect.value;
  let frame = frameSelect.value;
  loadingScreen.style.display = 'flex';
  beforeImage.classList.remove('loaded');
  afterImage.classList.remove('loaded');

  let totalBytes = 0;
  let loadedBytes = { before: 0, after: 0 };

  xhrObjects = [];

  function updateProgress(event, imgType) {
    if (event.lengthComputable && !cancelled) {
      loadedBytes[imgType] = event.loaded;
      let totalLoadedBytes = loadedBytes.before + loadedBytes.after;
      let percentage = (totalLoadedBytes / totalBytes) * 100;

      updateLoadingMessage(percentage);
    }
  }

  function getURLSize(url) {
    return new Promise((resolve, reject) => {
      if (cancelled) {
        return;
      }
      let xhr = new XMLHttpRequest();
      xhrObjects.push(xhr);
      xhr.open('HEAD', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(parseInt(xhr.getResponseHeader('Content-Length')));
          } else {
            reject();
          }
        }
      };
      xhr.send(null);
    });
  }

  function loadImage(url, imgElement, imgType) {
    console.log(`Load Image Started: ${imgType}`); 
    return new Promise((resolve, reject) => {
      if (cancelled) {
        console.log(`Loading Cancelled: ${imgType}`); 
        return reject('Loading was cancelled');
      }
      let xhr = new XMLHttpRequest();
      xhrObjects.push(xhr);
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onprogress = function (event) {
        updateProgress(event, imgType);
      };
      xhr.onload = function () {
        if (xhr.status === 200 && !cancelled) {
          let blob = xhr.response;
          let imgUrl = URL.createObjectURL(blob);
          imgElement.onload = function () {
            resolve();
          };
          imgElement.src = imgUrl;
          imgElement.style.opacity = 0;
        } else {
          console.log(`Loading Failed: ${imgType}`); 
          reject();
        }
      };
      xhr.onerror = reject;
      xhr.send(null);
    });
  }

  let beforeImageUrl = episode + '/' + frame.replace('after', 'before');
  let afterImageUrl = episode + '/' + frame;
  beforeImage.style.opacity = 0;
  afterImage.style.opacity = 0;

  currentImageLoading = {
    cancel: cancelLoading,
  };

  Promise.all([
    getURLSize(beforeImageUrl),
    getURLSize(afterImageUrl),
  ])
    .then((sizes) => {
      if (cancelled) {
        console.log('Loading Cancelled Before Sizes Resolved'); 
        throw new Error('Cancelled');
      }
      totalBytes = sizes.reduce((acc, size) => acc + size, 0);
      return Promise.all([
        loadImage(beforeImageUrl, beforeImage, 'before'),
        loadImage(afterImageUrl, afterImage, 'after'),
      ]);
    })
    .then(() => {
      if (!cancelled) {
        loadingScreen.style.display = 'none';
        beforeImage.style.opacity = 1;
        afterImage.style.opacity = 1;
        let comparisonContainer = document.querySelector('.comparison-container');
        comparisonContainer.style.maxHeight = `${window.innerHeight}px`;
        loading = false;
        console.log('All Images Loaded Successfully');
      } else {
        console.log('Loading was cancelled before completion');
        loading = false;
      }
    })
    .catch((error) => {
      console.log('Error occurred while loading images:', error.message);
      loadingScreen.textContent = 'Error loading images';
      loading = false;
    });
}

function resetLoadingMessage() {
  loadingScreen.textContent = '';
}

function cancelCurrentLoading() {
  console.log('Cancel Current Loading Called');
  if (currentImageLoading) {
    currentImageLoading.cancel();
    xhrObjects.forEach(xhr => xhr.abort());
    xhrObjects = [];
    currentImageLoading = null;
  }

  loading = false; 
}